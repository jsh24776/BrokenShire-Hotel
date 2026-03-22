<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->unique()->constrained('reservations')->cascadeOnDelete();

            $table->string('invoice_number')->unique();

            $table->unsignedInteger('total_cents');
            $table->string('currency', 3)->default('PHP');

            $table->string('payment_status')->default('unpaid'); // unpaid|paid|refunded|refund_pending
            $table->string('payment_method')->nullable(); // hotel|paypal
            $table->string('payment_reference')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamp('issued_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};

