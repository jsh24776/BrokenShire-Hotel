<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $reservations = Reservation::query()
            ->where('user_id', $user->id)
            ->orderByDesc('check_in_date')
            ->get([
                'id',
                'room_number',
                'room_type',
                'check_in_date',
                'check_out_date',
                'nights',
                'amount_cents',
                'currency',
                'payment_method',
                'payment_reference',
                'paid_at',
                'payment_status',
                'status',
                'created_at',
            ]);

        $roomNumbers = $reservations->pluck('room_number')->unique()->values();
        $roomsByNumber = Room::query()
            ->whereIn('room_number', $roomNumbers)
            ->get(['room_number', 'display_name', 'type', 'image_url'])
            ->keyBy('room_number');

        $data = $reservations->map(function ($r) use ($roomsByNumber) {
            $room = $roomsByNumber->get($r->room_number);

            return [
                'id' => $r->id,
                'reference' => 'RES-'.str_pad((string) $r->id, 4, '0', STR_PAD_LEFT),
                'room_number' => $r->room_number,
                'room_name' => $room?->display_name ?? $r->room_type,
                'room_type' => $r->room_type,
                'image_url' => $room?->image_url,
                'check_in_date' => (string) $r->check_in_date,
                'check_out_date' => (string) $r->check_out_date,
                'nights' => $r->nights,
                'amount_cents' => $r->amount_cents,
                'currency' => $r->currency,
                'payment_method' => $r->payment_method,
                'payment_reference' => $r->payment_reference,
                'paid_at' => $r->paid_at?->toISOString(),
                'payment_status' => $r->payment_status,
                'status' => $r->status,
                'created_at' => $r->created_at?->toISOString(),
            ];
        });

        return response()->json(['bookings' => $data]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'room_number' => ['required', 'string', 'exists:rooms,room_number'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'guests' => ['required', 'integer', 'min:1', 'max:50'],
            'payment_method' => ['nullable', 'in:hotel,paypal'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
        ]);

        $room = Room::where('room_number', $validated['room_number'])->firstOrFail();

        if ($room->archived_at) {
            return response()->json(['message' => 'This room is not available.'], 422);
        }

        if ($validated['guests'] > (int) $room->capacity) {
            return response()->json(['message' => 'Guest count exceeds room capacity.'], 422);
        }

        $checkIn = Carbon::parse($validated['check_in_date'])->startOfDay();
        $checkOut = Carbon::parse($validated['check_out_date'])->startOfDay();
        $nights = max(1, $checkIn->diffInDays($checkOut));

        $conflictExists = Reservation::query()
            ->where('room_number', $room->room_number)
            ->whereNotIn('status', ['cancelled', 'checked_out'])
            ->where('check_in_date', '<', $checkOut->toDateString())
            ->where('check_out_date', '>', $checkIn->toDateString())
            ->exists();

        if ($conflictExists) {
            return response()->json(['message' => 'Selected dates are no longer available for this room.'], 409);
        }

        $amountCents = (int) $room->base_rate_cents * $nights;

        $paymentMethod = $validated['payment_method'] ?? 'hotel';
        $paymentReference = $validated['payment_reference'] ?? null;

        // NOTE: This is a student-project placeholder. Real PayPal integration must verify webhooks/server-side.
        $paymentStatus = $paymentMethod === 'paypal' ? 'paid' : 'unpaid';
        $reservationStatus = $paymentMethod === 'paypal' ? 'confirmed' : 'pending';

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'room_number' => $room->room_number,
            'room_type' => $room->type,
            'check_in_date' => $checkIn->toDateString(),
            'check_out_date' => $checkOut->toDateString(),
            'nights' => $nights,
            'amount_cents' => $amountCents,
            'currency' => $room->currency ?? 'PHP',
            'payment_method' => $paymentMethod,
            'payment_reference' => $paymentReference,
            'paid_at' => $paymentStatus === 'paid' ? now() : null,
            'payment_status' => $paymentStatus,
            'status' => $reservationStatus,
        ]);

        return response()->json([
            'booking' => [
                'id' => $reservation->id,
                'reference' => 'RES-'.str_pad((string) $reservation->id, 4, '0', STR_PAD_LEFT),
                'room_number' => $reservation->room_number,
                'room_name' => $room->display_name ?? $room->type,
                'room_type' => $reservation->room_type,
                'image_url' => $room->image_url,
                'check_in_date' => (string) $reservation->check_in_date,
                'check_out_date' => (string) $reservation->check_out_date,
                'nights' => $reservation->nights,
                'amount_cents' => $reservation->amount_cents,
                'currency' => $reservation->currency,
                'payment_method' => $reservation->payment_method,
                'payment_reference' => $reservation->payment_reference,
                'paid_at' => $reservation->paid_at?->toISOString(),
                'payment_status' => $reservation->payment_status,
                'status' => $reservation->status,
                'created_at' => $reservation->created_at?->toISOString(),
            ],
        ], 201);
    }

    public function show(Request $request, Reservation $reservation)
    {
        $user = $request->user();

        if ((int) $reservation->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $room = Room::where('room_number', $reservation->room_number)
            ->first(['room_number', 'display_name', 'type', 'image_url']);

        return response()->json([
            'booking' => [
                'id' => $reservation->id,
                'reference' => 'RES-'.str_pad((string) $reservation->id, 4, '0', STR_PAD_LEFT),
                'room_number' => $reservation->room_number,
                'room_name' => $room?->display_name ?? $reservation->room_type,
                'room_type' => $reservation->room_type,
                'image_url' => $room?->image_url,
                'check_in_date' => (string) $reservation->check_in_date,
                'check_out_date' => (string) $reservation->check_out_date,
                'nights' => $reservation->nights,
                'amount_cents' => $reservation->amount_cents,
                'currency' => $reservation->currency,
                'payment_method' => $reservation->payment_method,
                'payment_reference' => $reservation->payment_reference,
                'paid_at' => $reservation->paid_at?->toISOString(),
                'payment_status' => $reservation->payment_status,
                'status' => $reservation->status,
                'created_at' => $reservation->created_at?->toISOString(),
            ],
        ]);
    }

    public function cancel(Request $request, Reservation $reservation)
    {
        $user = $request->user();

        if ((int) $reservation->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (in_array($reservation->status, ['checked_out', 'cancelled'], true)) {
            return response()->json(['message' => 'This booking can no longer be cancelled.'], 409);
        }

        $reservation->status = 'cancelled';
        $reservation->save();

        return response()->json(['message' => 'Booking cancelled.']);
    }

    public function pay(Request $request, Reservation $reservation)
    {
        $user = $request->user();

        if ((int) $reservation->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if (in_array($reservation->status, ['checked_out', 'cancelled'], true)) {
            return response()->json(['message' => 'This booking can no longer be paid.'], 409);
        }

        if ($reservation->payment_status === 'paid') {
            return response()->json(['message' => 'This booking is already paid.'], 409);
        }

        $validated = $request->validate([
            'payment_method' => ['required', Rule::in(['paypal'])],
            'payment_reference' => ['nullable', 'string', 'max:255'],
        ]);

        // NOTE: Student-project placeholder: real PayPal requires server-side verification/webhooks.
        $reservation->payment_method = 'paypal';
        $reservation->payment_reference = $validated['payment_reference'] ?? ('PP-'.now()->timestamp.'-'.$reservation->id);
        $reservation->paid_at = now();
        $reservation->payment_status = 'paid';
        $reservation->status = $reservation->status === 'pending' ? 'confirmed' : $reservation->status;
        $reservation->save();

        $room = Room::where('room_number', $reservation->room_number)
            ->first(['room_number', 'display_name', 'type', 'image_url']);

        return response()->json([
            'booking' => [
                'id' => $reservation->id,
                'reference' => 'RES-'.str_pad((string) $reservation->id, 4, '0', STR_PAD_LEFT),
                'room_number' => $reservation->room_number,
                'room_name' => $room?->display_name ?? $reservation->room_type,
                'room_type' => $reservation->room_type,
                'image_url' => $room?->image_url,
                'check_in_date' => (string) $reservation->check_in_date,
                'check_out_date' => (string) $reservation->check_out_date,
                'nights' => $reservation->nights,
                'amount_cents' => $reservation->amount_cents,
                'currency' => $reservation->currency,
                'payment_method' => $reservation->payment_method,
                'payment_reference' => $reservation->payment_reference,
                'paid_at' => $reservation->paid_at?->toISOString(),
                'payment_status' => $reservation->payment_status,
                'status' => $reservation->status,
                'created_at' => $reservation->created_at?->toISOString(),
            ],
        ]);
    }
}