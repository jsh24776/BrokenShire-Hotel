<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Invoice;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminRefundRulesTest extends TestCase
{
    use RefreshDatabase;

    private function makeRoom(): Room
    {
        return Room::create([
            'room_number' => 'T-201',
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

    private function actingAsAdmin(): void
    {
        $admin = Admin::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);
    }

    public function test_admin_cannot_refund_if_not_cancelled(): void
    {
        $this->actingAsAdmin();

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

        $invoice = Invoice::create([
            'reservation_id' => $reservation->id,
            'invoice_number' => 'INV-TEST-00001',
            'total_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'paid',
            'payment_method' => 'paypal',
            'payment_reference' => 'PP-TEST',
            'paid_at' => now(),
            'issued_at' => now(),
        ]);

        $res = $this->patchJson("/api/admin/reservations/{$reservation->id}/refund");
        $res->assertStatus(409);
    }

    public function test_admin_can_refund_after_cancel(): void
    {
        $this->actingAsAdmin();

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

        $invoice = Invoice::create([
            'reservation_id' => $reservation->id,
            'invoice_number' => 'INV-TEST-00002',
            'total_cents' => 10000,
            'currency' => 'PHP',
            'payment_status' => 'paid',
            'payment_method' => 'paypal',
            'payment_reference' => 'PP-TEST',
            'paid_at' => now(),
            'issued_at' => now(),
        ]);

        $reservation->status = 'cancelled';
        $reservation->save();

        $res = $this->patchJson("/api/admin/reservations/{$reservation->id}/refund");
        $res->assertOk();

        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'payment_status' => 'refunded',
        ]);
        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'payment_status' => 'refunded',
        ]);
        $this->assertDatabaseHas('payments', [
            'invoice_id' => $invoice->id,
            'status' => 'refunded',
            'amount_cents' => -10000,
        ]);
    }
}

