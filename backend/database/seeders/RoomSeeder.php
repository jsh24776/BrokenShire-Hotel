<?php

namespace Database\Seeders;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $roomTypes = [
            [
                'name' => 'Forest View Suite',
                'capacity' => 2,
                'base_rate_cents' => 1250 * 100,
                'currency' => 'PHP',
                'amenities' => ['king_bed', 'forest_view', 'wifi', 'breakfast'],
                'description' => 'Wake up to the serene sounds of nature in our spacious suite featuring panoramic forest views and a private balcony.',
                'image_url' => '/src/imgs/istockphoto-157423413-612x612.jpg',
            ],
            [
                'name' => 'Garden Retreat',
                'capacity' => 2,
                'base_rate_cents' => 2480 * 100,
                'currency' => 'PHP',
                'amenities' => ['queen_bed', 'garden_view', 'wifi', 'breakfast'],
                'description' => 'A cozy and elegant room nestled by our botanical gardens, perfect for a peaceful getaway with direct garden access.',
                'image_url' => '/src/imgs/garden-retreat.jpg',
            ],
            [
                'name' => 'Canopy Family Villa',
                'capacity' => 4,
                'base_rate_cents' => 4450 * 100,
                'currency' => 'PHP',
                'amenities' => ['two_king_beds', 'tree_view', 'wifi', 'breakfast'],
                'description' => 'Ideal for families, this expansive villa offers multiple bedrooms, a private lounge, and stunning views of the tree canopy.',
                'image_url' => '/src/imgs/canopy.jpg',
            ],
        ];

        foreach ($roomTypes as $t) {
            RoomType::updateOrCreate(
                ['name' => $t['name']],
                $t,
            );
        }

        $byName = RoomType::query()->get()->keyBy('name');

        $rooms = [
            ['room_number' => '101', 'type' => 'Forest View Suite', 'floor' => 1],
            ['room_number' => '102', 'type' => 'Garden Retreat', 'floor' => 1],
            ['room_number' => '103', 'type' => 'Canopy Family Villa', 'floor' => 2],
        ];

        foreach ($rooms as $room) {
            $type = $byName->get($room['type']);
            if (! $type) {
                continue;
            }

            Room::updateOrCreate(
                ['room_number' => $room['room_number']],
                [
                    'room_type_id' => $type->id,
                    'display_name' => $type->name,
                    'type' => $type->name,
                    'floor' => $room['floor'],
                    'capacity' => (int) $type->capacity,
                    'size' => null,
                    'description' => $type->description,
                    'image_url' => $type->image_url,
                    'base_rate_cents' => (int) $type->base_rate_cents,
                    'currency' => $type->currency ?? 'PHP',
                    'status' => 'Vacant',
                    'housekeeping_status' => 'Clean',
                    'amenities' => $type->amenities ?? [],
                    'archived_at' => null,
                ],
            );
        }

        $protectedRoomNumbers = Reservation::query()
            ->whereNotIn('status', ['cancelled', 'checked_out'])
            ->pluck('room_number')
            ->unique()
            ->values()
            ->all();

        $keep = array_column($rooms, 'room_number');
        $keep = array_values(array_unique(array_merge($keep, $protectedRoomNumbers)));

        Room::query()
            ->whereNotIn('room_number', $keep)
            ->whereNull('archived_at')
            ->update(['archived_at' => now()]);
    }
}