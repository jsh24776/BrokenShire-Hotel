<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admins are created manually (or via seed) so they can log in to the Admin Portal.
        Admin::updateOrCreate(
            ['email' => 'admin@brokenshire.com'],
            [
                'name' => 'Admin',
                'role' => 'admin',
                'password' => Hash::make('secret123'),
            ]
        );

        $roomMetaByType = [
            'Forest Suite' => [
                'display_name' => 'Forest Suite',
                'size' => '45 sqm',
                'image_url' => 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
                'description' => 'Immerse yourself in nature with our signature suite featuring floor-to-ceiling windows overlooking the ancient pines.',
            ],
            'Garden Villa' => [
                'display_name' => 'Garden Villa',
                'size' => '85 sqm',
                'image_url' => 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
                'description' => 'A peaceful haven with direct access to our botanical gardens. Perfect for families seeking a quiet getaway.',
            ],
            'Canopy Room' => [
                'display_name' => 'Canopy Room',
                'size' => '35 sqm',
                'image_url' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
                'description' => 'Elevated among the treetops with a private deck and stunning views of the forest canopy.',
            ],
            'Standard' => [
                'display_name' => 'Standard Room',
                'size' => '28 sqm',
                'image_url' => 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80',
                'description' => 'A comfortable, practical room designed for restful stays with the essentials you need.',
            ],
        ];

        // Rooms: seed initial inventory so the Admin & Guest Rooms pages are DB-backed immediately.
        $rooms = [
            [
                'room_number' => '101',
                'type' => 'Forest Suite',
                'floor' => 1,
                'capacity' => 2,
                'base_rate_cents' => 12500 * 100,
                'currency' => 'PHP',
                'status' => 'Occupied',
                'housekeeping_status' => 'Clean',
                'amenities' => ['ac', 'wifi', 'tv', 'forest_view', 'mini_bar', 'coffee_maker'],
            ],
            [
                'room_number' => '102',
                'type' => 'Forest Suite',
                'floor' => 1,
                'capacity' => 2,
                'base_rate_cents' => 12500 * 100,
                'currency' => 'PHP',
                'status' => 'Vacant',
                'housekeeping_status' => 'Dirty',
                'amenities' => ['ac', 'wifi', 'tv', 'forest_view', 'mini_bar'],
            ],
            [
                'room_number' => '201',
                'type' => 'Garden Villa',
                'floor' => 2,
                'capacity' => 4,
                'base_rate_cents' => 18000 * 100,
                'currency' => 'PHP',
                'status' => 'Vacant',
                'housekeeping_status' => 'Clean',
                'amenities' => ['ac', 'wifi', 'tv', 'garden_view', 'mini_bar', 'kitchen', 'private_pool'],
            ],
            [
                'room_number' => '202',
                'type' => 'Garden Villa',
                'floor' => 2,
                'capacity' => 4,
                'base_rate_cents' => 18000 * 100,
                'currency' => 'PHP',
                'status' => 'Reserved',
                'housekeeping_status' => 'Clean',
                'amenities' => ['ac', 'wifi', 'tv', 'garden_view', 'mini_bar', 'kitchen'],
            ],
            [
                'room_number' => '301',
                'type' => 'Canopy Room',
                'floor' => 3,
                'capacity' => 2,
                'base_rate_cents' => 8500 * 100,
                'currency' => 'PHP',
                'status' => 'Occupied',
                'housekeeping_status' => 'Clean',
                'amenities' => ['ac', 'wifi', 'tv', 'tree_view', 'coffee_maker'],
            ],
            [
                'room_number' => '302',
                'type' => 'Standard',
                'floor' => 3,
                'capacity' => 2,
                'base_rate_cents' => 4500 * 100,
                'currency' => 'PHP',
                'status' => 'Out of Service',
                'housekeeping_status' => 'Maintenance',
                'amenities' => ['ac', 'wifi', 'tv'],
            ],
        ];

        foreach ($rooms as $room) {
            $meta = $roomMetaByType[$room['type']] ?? [
                'display_name' => $room['type'],
                'size' => null,
                'image_url' => null,
                'description' => null,
            ];

            Room::updateOrCreate(
                ['room_number' => $room['room_number']],
                array_merge($room, $meta),
            );
        }

        // Guests (users) should be created through the /api/register endpoint.
        // Do NOT seed guests here for production-like behavior.
    }
}
