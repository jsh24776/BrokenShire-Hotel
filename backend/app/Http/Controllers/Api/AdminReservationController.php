<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminReservationController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(1, min(100, $perPage));

        $query = Reservation::query()
            ->with(['user:id,name,email'])
            ->orderByDesc('check_in_date');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('room_number', 'like', "%{$search}%")
                    ->orWhere('room_type', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'room_number' => ['required', 'string', 'exists:rooms,room_number'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'status' => ['nullable', 'string', 'max:50'],
            'payment_status' => ['nullable', 'string', 'max:50'],
        ]);

        $user = User::findOrFail($validated['user_id']);
        if ($user->role !== 'guest') {
            return response()->json(['message' => 'Selected user is not a guest.'], 422);
        }

        $room = Room::where('room_number', $validated['room_number'])->firstOrFail();
        if ($room->archived_at) {
            return response()->json(['message' => 'Cannot book an archived room.'], 422);
        }

        $checkIn = Carbon::parse($validated['check_in_date'])->startOfDay();
        $checkOut = Carbon::parse($validated['check_out_date'])->startOfDay();
        $nights = max(1, $checkIn->diffInDays($checkOut));

        $amountCents = (int) $room->base_rate_cents * $nights;

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => $checkIn->toDateString(),
            'check_out_date' => $checkOut->toDateString(),
            'nights' => $nights,
            'amount_cents' => $amountCents,
            'currency' => $room->currency ?? 'PHP',
            'payment_status' => $validated['payment_status'] ?? 'unpaid',
            'status' => $validated['status'] ?? 'pending',
        ]);

        $reservation->load(['user:id,name,email']);

        return response()->json(['reservation' => $reservation], 201);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'room_number' => ['sometimes', 'required', 'string', 'exists:rooms,room_number'],
            'check_in_date' => ['sometimes', 'required', 'date'],
            'check_out_date' => ['sometimes', 'required', 'date', 'after:check_in_date'],
            'status' => ['sometimes', 'required', 'string', 'max:50'],
            'payment_status' => ['sometimes', 'required', 'string', 'max:50'],
        ]);

        $room = null;
        if (array_key_exists('room_number', $validated)) {
            $room = Room::where('room_number', $validated['room_number'])->firstOrFail();
            if ($room->archived_at) {
                return response()->json(['message' => 'Cannot assign an archived room.'], 422);
            }
            $reservation->room_number = $room->room_number;
            $reservation->room_type = $room->type;
            $reservation->currency = $room->currency ?? $reservation->currency;
        }

        $checkIn = array_key_exists('check_in_date', $validated)
            ? Carbon::parse($validated['check_in_date'])->startOfDay()
            : Carbon::parse($reservation->check_in_date)->startOfDay();

        $checkOut = array_key_exists('check_out_date', $validated)
            ? Carbon::parse($validated['check_out_date'])->startOfDay()
            : Carbon::parse($reservation->check_out_date)->startOfDay();

        if ($checkOut->lessThanOrEqualTo($checkIn)) {
            return response()->json(['message' => 'Check-out date must be after check-in date.'], 422);
        }

        $reservation->check_in_date = $checkIn->toDateString();
        $reservation->check_out_date = $checkOut->toDateString();
        $reservation->nights = max(1, $checkIn->diffInDays($checkOut));

        $effectiveRoom = $room ?? Room::where('room_number', $reservation->room_number)->first();
        if ($effectiveRoom) {
            $reservation->amount_cents = (int) $effectiveRoom->base_rate_cents * $reservation->nights;
        }

        if (array_key_exists('status', $validated)) {
            $reservation->status = $validated['status'];
        }

        if (array_key_exists('payment_status', $validated)) {
            $reservation->payment_status = $validated['payment_status'];
        }

        $reservation->save();
        $reservation->load(['user:id,name,email']);

        return response()->json(['reservation' => $reservation]);
    }

    public function confirm(Reservation $reservation)
    {
        $reservation->status = 'confirmed';
        $reservation->save();

        return response()->json(['reservation' => $reservation]);
    }

    public function cancel(Reservation $reservation)
    {
        $reservation->status = 'cancelled';
        $reservation->save();

        return response()->json(['reservation' => $reservation]);
    }
}
