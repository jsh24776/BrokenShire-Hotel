<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $guests = (int) $request->query('guests', 0);

        $checkIn = $request->query('check_in_date');
        $checkOut = $request->query('check_out_date');

        $query = Room::query()
            ->whereNull('archived_at')
            ->orderBy('room_number');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('room_number', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%");
            });
        }

        if ($guests > 0) {
            $query->where('capacity', '>=', $guests);
        }

        $rooms = $query->get([
            'room_number',
            'display_name',
            'type',
            'floor',
            'capacity',
            'size',
            'description',
            'image_url',
            'base_rate_cents',
            'currency',
            'amenities',
        ]);

        $availableRoomNumbers = null;

        if ($checkIn && $checkOut) {
            $checkInDate = Carbon::parse((string) $checkIn)->startOfDay();
            $checkOutDate = Carbon::parse((string) $checkOut)->startOfDay();

            if ($checkOutDate->lessThanOrEqualTo($checkInDate)) {
                return response()->json(['message' => 'Check-out date must be after check-in date.'], 422);
            }

            $booked = Reservation::query()
                ->whereIn('room_number', $rooms->pluck('room_number'))
                ->whereNotIn('status', ['cancelled', 'checked_out'])
                ->where('check_in_date', '<', $checkOutDate->toDateString())
                ->where('check_out_date', '>', $checkInDate->toDateString())
                ->pluck('room_number')
                ->unique()
                ->values();

            $availableRoomNumbers = $rooms
                ->pluck('room_number')
                ->diff($booked)
                ->values()
                ->all();
        }

        $result = $rooms->map(function ($room) use ($availableRoomNumbers) {
            $data = $room->toArray();
            $data['available'] = $availableRoomNumbers === null
                ? true
                : in_array($room->room_number, $availableRoomNumbers, true);

            return $data;
        });

        return response()->json(['rooms' => $result]);
    }
}
