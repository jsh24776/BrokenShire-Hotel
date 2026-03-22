<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingCancellationTest extends TestCase
{
    use RefreshDatabase;

    private function makeRoom(): Room
    {
        return Room::create([
            'room_number' => 'T-101',
            'display_name' => 'Test Room',
            'type' => 'Test Room',
            'floor' => 1,
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

    public function test_guest_can_cancel_unpaid_booking_before_cutoff(): void
    {
        $user = User::factory()->create();
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
            'payment_method' => 'hotel',
            'payment_status' => 'unpaid',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($user);

        $res = $this->patchJson("/api/bookings/{$reservation->id}/cancel");
        $res->assertOk();

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_guest_cannot_cancel_paid_booking(): void
    {
        $user = User::factory()->create();
        $room = $this->makeRoom();

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => now()->addDays(5)->toDateString(),
            'check_out_date' => now()->addDays(6)->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_method' => 'paypal',
            'payment_reference' => 'PP-TEST',
            'paid_at' => now(),
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($user);

        $res = $this->patchJson("/api/bookings/{$reservation->id}/cancel");
        $res->assertStatus(409);
    }

    public function test_guest_cannot_cancel_within_24_hours_of_check_in(): void
    {
        $user = User::factory()->create();
        $room = $this->makeRoom();

        // Check-in today triggers cutoff (24h before 2PM today is yesterday 2PM).
        $reservation = Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => now()->toDateString(),
            'check_out_date' => now()->addDay()->toDateString(),
            'nights' => 1,
            'amount_cents' => 10000,
            'currency' => 'PHP',
            'payment_method' => 'hotel',
            'payment_status' => 'unpaid',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($user);

        $res = $this->patchJson("/api/bookings/{$reservation->id}/cancel");
        $res->assertStatus(409);
    }
}

