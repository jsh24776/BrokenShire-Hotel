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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();

            $table->string('room_number')->unique();
            $table->string('type');
            $table->unsignedSmallInteger('floor');
            $table->unsignedSmallInteger('capacity');

            $table->unsignedInteger('base_rate_cents');
            $table->string('currency', 3)->default('PHP');

            $table->string('status')->default('Vacant');
            $table->string('housekeeping_status')->default('Clean');

            $table->json('amenities')->nullable();
            $table->timestamp('archived_at')->nullable()->index();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
