<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminReservationSearchTest extends TestCase
{
    use RefreshDatabase;

    private function makeRoom(): Room
    {
        return Room::create([
            'room_number' => 'T-201',
            'display_name' => 'Test Room',
            'type' => 'Test Room',
            'floor' => 2,
            'capacity' => 2,
            'size' => null,
            'description' => 'Test',
            'image_url' => null,
            'base_rate_cents' => 10000,
            'currency' => 'PHP',
            'status' => 'Vacant',
            'housekeeping_status' => 'Clean',
            'amenities' => ['wifi'],
        ]);
    }

    public function test_admin_reservations_search_filters_by_guest_name(): void
    {
        $admin = Admin::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'role' => 'admin',
            'password' => 'password',
        ]);

        $gabriel = User::factory()->create([
            'name' => 'Gabriel',
            'role' => 'guest',
        ]);
        $other = User::factory()->create([
            'name' => 'Someone Else',
            'role' => 'guest',
        ]);

        $room = $this->makeRoom();

        Reservation::create([
            'user_id' => $gabriel->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => now()->addDays(3)->toDateString(),
            'check_out_date' => now()->addDays(4)->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'unpaid',
            'status' => 'pending',
        ]);

        Reservation::create([
            'user_id' => $other->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => now()->addDays(5)->toDateString(),
            'check_out_date' => now()->addDays(6)->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'unpaid',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $res = $this->getJson('/api/admin/reservations?search=Gabriel&per_page=50');
        $res->assertOk();
        $res->assertJsonCount(1, 'data');
        $res->assertJsonPath('data.0.user.name', 'Gabriel');
    }

    public function test_admin_reservations_search_allows_res_prefix(): void
    {
        $admin = Admin::create([
            'name' => 'Admin',
            'email' => 'admin2@test.com',
            'role' => 'admin',
            'password' => 'password',
        ]);

        $user = User::factory()->create(['role' => 'guest']);
        $room = $this->makeRoom();

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => now()->addDays(3)->toDateString(),
            'check_out_date' => now()->addDays(4)->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'unpaid',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $res = $this->getJson('/api/admin/reservations?search=RES-'.str_pad((string) $reservation->id, 4, '0', STR_PAD_LEFT));
        $res->assertOk();
        $res->assertJsonCount(1, 'data');
        $res->assertJsonPath('data.0.id', $reservation->id);
    }

    public function test_admin_reservations_can_sort_by_date_ascending(): void
    {
        $admin = Admin::create([
            'name' => 'Admin',
            'email' => 'admin3@test.com',
            'role' => 'admin',
            'password' => 'password',
        ]);

        $user = User::factory()->create(['role' => 'guest']);
        $room = $this->makeRoom();

        $early = Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => now()->addDays(2)->toDateString(),
            'check_out_date' => now()->addDays(3)->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'unpaid',
            'status' => 'pending',
        ]);

        $late = Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => now()->addDays(10)->toDateString(),
            'check_out_date' => now()->addDays(11)->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'unpaid',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $res = $this->getJson('/api/admin/reservations?sort_dir=asc&per_page=50');
        $res->assertOk();

        $ids = collect($res->json('data'))->pluck('id')->all();
        $this->assertSame([$early->id, $late->id], $ids);
    }

    public function test_admin_reservations_can_filter_by_status_and_room_type(): void
    {
        $admin = Admin::create([
            'name' => 'Admin',
            'email' => 'admin4@test.com',
            'role' => 'admin',
            'password' => 'password',
        ]);

        $user = User::factory()->create(['role' => 'guest']);
        $room = $this->makeRoom();

        Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => 'Alpha Room',
            'check_in_date' => now()->addDays(2)->toDateString(),
            'check_out_date' => now()->addDays(3)->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'unpaid',
            'status' => 'confirmed',
        ]);

        Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => 'Beta Room',
            'check_in_date' => now()->addDays(5)->toDateString(),
            'check_out_date' => now()->addDays(6)->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'unpaid',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($admin, ['*']);

        $res = $this->getJson('/api/admin/reservations?status=confirmed&room_type=Alpha%20Room&per_page=50');
        $res->assertOk();
        $res->assertJsonCount(1, 'data');
        $res->assertJsonPath('data.0.status', 'confirmed');
        $res->assertJsonPath('data.0.room_type', 'Alpha Room');
    }
}
