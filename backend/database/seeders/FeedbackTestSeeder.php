<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Database\Seeder;

class FeedbackTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user if it doesn't exist
        $testUser = User::firstOrCreate(
            ['email' => 'testfeedback@example.com'],
            [
                'name' => 'Test Guest',
                'phone' => '09123456789',
                'address' => '123 Test Street, Manila, Philippines',
                'password' => bcrypt('password123'),
            ]
        );

        // Use an existing room
        $testRoom = Room::whereIn('room_number', ['101', '102', '201'])->first();
        
        if (!$testRoom) {
            $this->command->error('No test room found. Please create a room first.');
            return;
        }

        // Create a completed reservation for the test user
        $now = now();
        $checkInDate = $now->copy()->subDays(10)->toDateString();
        $checkOutDate = $now->copy()->subDays(8)->toDateString();

        Reservation::firstOrCreate(
            [
                'user_id' => $testUser->id,
                'room_number' => $testRoom->room_number,
                'check_in_date' => $checkInDate,
                'check_out_date' => $checkOutDate,
            ],
            [
                'room_type' => $testRoom->type,
                'nights' => 2,
                'amount_cents' => 1000000, // 10000 PHP
                'currency' => 'PHP',
                'payment_status' => 'paid',
                'status' => 'checked_out', // This is the key - makes it eligible for feedback
                'payment_method' => 'credit_card',
                'payment_reference' => 'TEST-PAYMENT-001',
                'paid_at' => $now->subDays(9),
            ]
        );

        $this->command->info('Test user and completed reservation created successfully!');
        $this->command->info("Test user email: {$testUser->email}");
        $this->command->info("Test user password: password123");
        $this->command->info("Completed stay: {$testRoom->display_name} ({$checkInDate} to {$checkOutDate})");
    }
}
