<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDoubleBookingTest extends TestCase
{
    use RefreshDatabase;

    protected Admin $admin;
    protected User $guest1;
    protected User $guest2;
    protected Room $room;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin manually since AdminFactory doesn't exist
        $this->admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $this->guest1 = User::factory()->create(['role' => 'guest']);
        $this->guest2 = User::factory()->create(['role' => 'guest']);

        $this->room = Room::create([
            'room_number' => 'ROOM-001',
            'display_name' => 'Deluxe Suite',
            'type' => 'Suite',
            'floor' => 1,
            'capacity' => 2,
            'size' => 50,
            'description' => 'A luxury suite',
            'image_url' => 'https://example.com/image.jpg',
            'base_rate_cents' => 10000,
            'currency' => 'PHP',
            'amenities' => json_encode(['WiFi', 'AC']),
        ]);
    }

    /**
     * Test that admin cannot create a booking on already booked dates
     */
    public function test_admin_cannot_create_double_booking()
    {
        $checkIn = Carbon::now()->addDays(5)->toDateString();
        $checkOut = Carbon::now()->addDays(8)->toDateString();

        // First booking by guest1
        Reservation::create([
            'user_id' => $this->guest1->id,
            'room_number' => $this->room->room_number,
            'room_type' => $this->room->type,
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'nights' => 3,
            'amount_cents' => 30000,
            'currency' => 'PHP',
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        // Admin tries to book same dates for guest2 - should fail
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/reservations', [
                'user_id' => $this->guest2->id,
                'room_number' => $this->room->room_number,
                'check_in_date' => $checkIn,
                'check_out_date' => $checkOut,
                'status' => 'confirmed',
            ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'This room is already booked for the selected dates.');

        // Verify only one reservation exists
        $this->assertEquals(1, Reservation::count());
    }

    /**
     * Test that admin can create booking on different dates
     */
    public function test_admin_can_create_booking_on_available_dates()
    {
        $checkIn1 = Carbon::now()->addDays(5)->toDateString();
        $checkOut1 = Carbon::now()->addDays(8)->toDateString();
        $checkIn2 = Carbon::now()->addDays(10)->toDateString();
        $checkOut2 = Carbon::now()->addDays(12)->toDateString();

        // First booking
        Reservation::create([
            'user_id' => $this->guest1->id,
            'room_number' => $this->room->room_number,
            'room_type' => $this->room->type,
            'check_in_date' => $checkIn1,
            'check_out_date' => $checkOut1,
            'nights' => 3,
            'amount_cents' => 30000,
            'currency' => 'PHP',
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        // Admin books for different dates - should succeed
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/reservations', [
                'user_id' => $this->guest2->id,
                'room_number' => $this->room->room_number,
                'check_in_date' => $checkIn2,
                'check_out_date' => $checkOut2,
                'status' => 'confirmed',
            ]);

        $response->assertStatus(201);

        // Verify two reservations exist
        $this->assertEquals(2, Reservation::count());
    }

    /**
     * Test that overlapping bookings are prevented
     */
    public function test_admin_cannot_create_overlapping_booking()
    {
        $checkIn = Carbon::now()->addDays(5)->toDateString();
        $checkOut = Carbon::now()->addDays(8)->toDateString();

        // First booking: May 5-8
        Reservation::create([
            'user_id' => $this->guest1->id,
            'room_number' => $this->room->room_number,
            'room_type' => $this->room->type,
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'nights' => 3,
            'amount_cents' => 30000,
            'currency' => 'PHP',
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        // Admin tries overlapping dates: May 6-9 - should fail
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/reservations', [
                'user_id' => $this->guest2->id,
                'room_number' => $this->room->room_number,
                'check_in_date' => Carbon::now()->addDays(6)->toDateString(),
                'check_out_date' => Carbon::now()->addDays(9)->toDateString(),
                'status' => 'confirmed',
            ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'This room is already booked for the selected dates.');
    }

    /**
     * Test that admin cannot update reservation to create double booking
     */
    public function test_admin_cannot_update_to_create_double_booking()
    {
        $checkIn1 = Carbon::now()->addDays(5)->toDateString();
        $checkOut1 = Carbon::now()->addDays(8)->toDateString();
        $checkIn2 = Carbon::now()->addDays(10)->toDateString();
        $checkOut2 = Carbon::now()->addDays(12)->toDateString();

        // First reservation
        $res1 = Reservation::create([
            'user_id' => $this->guest1->id,
            'room_number' => $this->room->room_number,
            'room_type' => $this->room->type,
            'check_in_date' => $checkIn1,
            'check_out_date' => $checkOut1,
            'nights' => 3,
            'amount_cents' => 30000,
            'currency' => 'PHP',
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        // Second reservation on different dates
        $res2 = Reservation::create([
            'user_id' => $this->guest2->id,
            'room_number' => $this->room->room_number,
            'room_type' => $this->room->type,
            'check_in_date' => $checkIn2,
            'check_out_date' => $checkOut2,
            'nights' => 2,
            'amount_cents' => 20000,
            'currency' => 'PHP',
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        // Admin tries to move res2 to conflict with res1 - should fail
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/admin/reservations/{$res2->id}", [
                'check_in_date' => $checkIn1,
                'check_out_date' => $checkOut1,
            ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'This room is already booked for the selected dates.');

        // Verify res2 dates unchanged
        $res2->refresh();
        $this->assertEquals($checkIn2, $res2->check_in_date->toDateString());
    }
}
