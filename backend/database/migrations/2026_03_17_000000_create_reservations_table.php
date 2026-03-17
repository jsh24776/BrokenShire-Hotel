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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('room_number');
            $table->string('room_type');

            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->unsignedSmallInteger('nights');

            $table->unsignedInteger('amount_cents')->default(0);
            $table->string('currency', 3)->default('PHP');
            $table->string('payment_status')->default('unpaid');
            $table->string('status')->default('confirmed');

            $table->timestamps();

            $table->index(['user_id', 'check_in_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
