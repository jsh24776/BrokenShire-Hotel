<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminRoomController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $perPage = (int) $request->query('per_page', 50);
        $perPage = max(1, min(100, $perPage));

        $includeArchived = (string) $request->query('include_archived', '0');
        $includeArchived = $includeArchived === '1' || $includeArchived === 'true';

        $query = Room::query()->orderBy('room_number');

        if (! $includeArchived) {
            $query->whereNull('archived_at');
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('room_number', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => ['required', 'string', 'max:50', 'unique:rooms,room_number'],
            'type' => ['required', 'string', 'max:255'],
            'floor' => ['required', 'integer', 'min:0', 'max:200'],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
            'base_rate_cents' => ['required', 'integer', 'min:0', 'max:2000000000'],
            'currency' => ['nullable', 'string', 'size:3'],
            'status' => ['nullable', 'string', 'max:50'],
            'housekeeping_status' => ['nullable', 'string', 'max:50'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string', 'max:100'],
        ]);

        $room = Room::create([
            'room_number' => $validated['room_number'],
            'type' => $validated['type'],
            'floor' => $validated['floor'],
            'capacity' => $validated['capacity'],
            'base_rate_cents' => $validated['base_rate_cents'],
            'currency' => $validated['currency'] ?? 'PHP',
            'status' => $validated['status'] ?? 'Vacant',
            'housekeeping_status' => $validated['housekeeping_status'] ?? 'Clean',
            'amenities' => $validated['amenities'] ?? [],
        ]);

        return response()->json(['room' => $room], 201);
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'type' => ['sometimes', 'required', 'string', 'max:255'],
            'floor' => ['sometimes', 'required', 'integer', 'min:0', 'max:200'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1', 'max:50'],
            'base_rate_cents' => ['sometimes', 'required', 'integer', 'min:0', 'max:2000000000'],
            'currency' => ['sometimes', 'nullable', 'string', 'size:3'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'housekeeping_status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'amenities' => ['sometimes', 'nullable', 'array'],
            'amenities.*' => ['string', 'max:100'],
        ]);

        $room->fill($validated);
        $room->save();

        return response()->json(['room' => $room]);
    }

    public function archive(Room $room)
    {
        if ($room->archived_at) {
            return response()->json(['room' => $room]);
        }

        $activeReservationExists = Reservation::query()
            ->where('room_number', $room->room_number)
            ->whereNotIn('status', ['cancelled', 'checked_out'])
            ->exists();

        if ($activeReservationExists) {
            return response()->json([
                'message' => "Cannot archive Room {$room->room_number}: Active reservations found.",
            ], 409);
        }

        $room->archived_at = now();
        $room->save();

        return response()->json(['room' => $room]);
    }

    public function unarchive(Room $room)
    {
        $room->archived_at = null;
        $room->save();

        return response()->json(['room' => $room]);
    }
}
