<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();

            $table->unsignedSmallInteger('capacity')->default(2);
            $table->unsignedInteger('base_rate_cents')->default(0);
            $table->string('currency', 3)->default('PHP');

            $table->json('amenities')->nullable();
            $table->text('description')->nullable();
            $table->text('image_url')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};

