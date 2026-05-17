<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CreateCompletedStayForUser extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create user with the provided credentials
        $user = User::firstOrCreate(
            ['email' => 'joshuaregidor57@gmail.com'],
            [
                'name' => 'Joshua Regidor',
                'phone' => '09094762288',
                'address' => 'Manila, Philippines',
                'password' => bcrypt('09094762288Regidor@'),
            ]
        );

        // Get a random existing room or use the first available
        $rooms = Room::whereNull('archived_at')->limit(3)->get();
        
        if ($rooms->isEmpty()) {
            $this->command->error('No available rooms found in database.');
            return;
        }

        $now = now();
        
        // Create multiple completed stays so user has options
        foreach ($rooms as $index => $room) {
            $daysAgo = 10 + ($index * 5); // Stagger the dates
            $checkInDate = $now->copy()->subDays($daysAgo)->toDateString();
            $checkOutDate = $now->copy()->subDays($daysAgo - 2)->toDateString();

            Reservation::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'room_number' => $room->room_number,
                    'check_in_date' => $checkInDate,
                    'check_out_date' => $checkOutDate,
                ],
                [
                    'room_type' => $room->type,
                    'nights' => 2,
                    'amount_cents' => 1000000 + ($index * 500000), // Different prices
                    'currency' => 'PHP',
                    'payment_status' => 'paid',
                    'status' => 'checked_out', // Completed stay
                    'payment_method' => 'credit_card',
                    'payment_reference' => 'PAY-'.Str::random(10),
                    'paid_at' => $now->subDays($daysAgo - 1),
                ]
            );

            $this->command->info("Created completed stay: {$room->display_name} ({$checkInDate} to {$checkOutDate})");
        }

        $this->command->info('✓ Completed stays created successfully!');
        $this->command->info("Account: joshuaregidor57@gmail.com");
        $this->command->info("You can now login and add feedback for these stays.");
    }
}
