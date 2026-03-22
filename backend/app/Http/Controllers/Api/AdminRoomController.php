<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminRoomController extends Controller
{
    private function parseBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if ($value === null) {
            return false;
        }

        $normalized = strtolower(trim((string) $value));

        return in_array($normalized, ['1', 'true', 'yes', 'y', 'on'], true);
    }

    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $perPage = (int) $request->query('per_page', 50);
        $perPage = max(1, min(100, $perPage));

        $includeArchived = $this->parseBoolean($request->query('include_archived', '0'));

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

        $roomType = RoomType::updateOrCreate(
            ['name' => $validated['type']],
            [
                'name' => $validated['type'],
                'capacity' => $validated['capacity'],
                'base_rate_cents' => $validated['base_rate_cents'],
                'currency' => $validated['currency'] ?? 'PHP',
                'amenities' => $validated['amenities'] ?? [],
            ],
        );

        $room = Room::create([
            'room_type_id' => $roomType->id,
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

        if (
            array_key_exists('type', $validated)
            || array_key_exists('capacity', $validated)
            || array_key_exists('base_rate_cents', $validated)
            || array_key_exists('amenities', $validated)
            || array_key_exists('currency', $validated)
        ) {
            $typeName = $validated['type'] ?? $room->type;

            $roomType = RoomType::updateOrCreate(
                ['name' => $typeName],
                [
                    'name' => $typeName,
                    'capacity' => $validated['capacity'] ?? $room->capacity,
                    'base_rate_cents' => $validated['base_rate_cents'] ?? $room->base_rate_cents,
                    'currency' => $validated['currency'] ?? $room->currency ?? 'PHP',
                    'amenities' => $validated['amenities'] ?? $room->amenities ?? [],
                ],
            );

            $room->room_type_id = $roomType->id;
        }

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

    public function availability(Request $request)
    {
        $validated = $request->validate([
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'include_archived' => ['nullable', 'boolean'],
        ]);

        $includeArchived = $this->parseBoolean($request->query('include_archived', null));

        $checkIn = Carbon::parse($validated['check_in_date'])->startOfDay();
        $checkOut = Carbon::parse($validated['check_out_date'])->startOfDay();

        $roomsQuery = Room::query()->orderBy('room_number');
        if (! $includeArchived) {
            $roomsQuery->whereNull('archived_at');
        }

        $rooms = $roomsQuery->get([
            'room_number',
            'display_name',
            'type',
            'floor',
            'capacity',
            'base_rate_cents',
            'currency',
            'status',
            'housekeeping_status',
            'amenities',
            'archived_at',
        ]);

        $reservations = Reservation::query()
            ->with(['user:id,name,email'])
            ->whereIn('room_number', $rooms->pluck('room_number'))
            ->whereNotIn('status', ['cancelled', 'checked_out'])
            ->where('check_in_date', '<', $checkOut->toDateString())
            ->where('check_out_date', '>', $checkIn->toDateString())
            ->orderBy('check_in_date')
            ->get([
                'id',
                'user_id',
                'room_number',
                'check_in_date',
                'check_out_date',
                'status',
                'payment_status',
            ]);

        $blockedByRoom = $reservations->groupBy('room_number')->map(function ($items) {
            $r = $items->first();

            return [
                'reservation_id' => $r->id,
                'reference' => 'RES-'.str_pad((string) $r->id, 4, '0', STR_PAD_LEFT),
                'guest_name' => $r->user?->name,
                'guest_email' => $r->user?->email,
                'check_in_date' => (string) $r->check_in_date,
                'check_out_date' => (string) $r->check_out_date,
                'status' => $r->status,
                'payment_status' => $r->payment_status,
            ];
        });

        $data = $rooms->map(function ($room) use ($blockedByRoom) {
            $blocked = $blockedByRoom->get($room->room_number);

            return [
                'room_number' => $room->room_number,
                'display_name' => $room->display_name,
                'type' => $room->type,
                'floor' => $room->floor,
                'capacity' => $room->capacity,
                'base_rate_cents' => $room->base_rate_cents,
                'currency' => $room->currency,
                'amenities' => $room->amenities ?? [],
                'archived_at' => $room->archived_at,
                'available' => $blocked ? false : true,
                'blocked_by' => $blocked,
            ];
        })->values();

        $availableCount = $data->where('available', true)->count();

        return response()->json([
            'check_in_date' => $checkIn->toDateString(),
            'check_out_date' => $checkOut->toDateString(),
            'total_rooms' => $data->count(),
            'available_rooms' => $availableCount,
            'booked_rooms' => $data->count() - $availableCount,
            'rooms' => $data,
        ]);
    }

    public function availabilityCalendar(Request $request)
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'include_archived' => ['nullable', 'boolean'],
        ]);

        $includeArchived = $this->parseBoolean($request->query('include_archived', null));

        $start = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth()->startOfDay();
        $end = $start->copy()->addMonth()->startOfDay();

        $roomsQuery = Room::query();
        if (! $includeArchived) {
            $roomsQuery->whereNull('archived_at');
        }
        $roomNumbers = $roomsQuery->pluck('room_number')->values();
        $totalRooms = $roomNumbers->count();

        $reservations = Reservation::query()
            ->whereIn('room_number', $roomNumbers)
            ->whereNotIn('status', ['cancelled', 'checked_out'])
            ->where('check_in_date', '<', $end->toDateString())
            ->where('check_out_date', '>', $start->toDateString())
            ->get(['room_number', 'check_in_date', 'check_out_date']);

        /** @var array<string, array<string,bool>> $bookedByDate */
        $bookedByDate = [];

        foreach ($reservations as $r) {
            $from = Carbon::parse($r->check_in_date)->startOfDay();
            $to = Carbon::parse($r->check_out_date)->startOfDay();

            if ($from->lessThan($start)) {
                $from = $start->copy();
            }
            if ($to->greaterThan($end)) {
                $to = $end->copy();
            }

            for ($d = $from->copy(); $d->lessThan($to); $d->addDay()) {
                $key = $d->toDateString();
                $bookedByDate[$key] = $bookedByDate[$key] ?? [];
                $bookedByDate[$key][$r->room_number] = true;
            }
        }

        $days = [];
        for ($d = $start->copy(); $d->lessThan($end); $d->addDay()) {
            $key = $d->toDateString();
            $booked = isset($bookedByDate[$key]) ? count($bookedByDate[$key]) : 0;
            $available = max(0, $totalRooms - $booked);
            $days[] = [
                'date' => $key,
                'total_rooms' => $totalRooms,
                'available_rooms' => $available,
                'booked_rooms' => $booked,
            ];
        }

        return response()->json([
            'month' => $validated['month'],
            'days' => $days,
        ]);
    }
}