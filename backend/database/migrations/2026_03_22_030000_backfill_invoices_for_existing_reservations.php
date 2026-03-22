<?php

use App\Models\Invoice;
use App\Models\Reservation;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(function () {
            Reservation::query()
                ->whereDoesntHave('invoice')
                ->orderBy('id')
                ->chunkById(200, function ($reservations) {
                    foreach ($reservations as $r) {
                        $invoice = Invoice::create([
                            'reservation_id' => $r->id,
                            'invoice_number' => 'INV-'.now()->format('Y').'-'.str_pad((string) $r->id, 5, '0', STR_PAD_LEFT),
                            'total_cents' => (int) $r->amount_cents,
                            'currency' => $r->currency ?? 'PHP',
                            'payment_status' => $r->payment_status ?? 'unpaid',
                            'payment_method' => $r->payment_method,
                            'payment_reference' => $r->payment_reference,
                            'paid_at' => $r->paid_at,
                            'issued_at' => $r->created_at,
                        ]);
                    }
                });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Keep invoices; no safe rollback without deleting user records.
    }
};

