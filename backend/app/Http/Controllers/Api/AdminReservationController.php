<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminReservationController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $roomType = trim((string) $request->query('room_type', ''));
        $sortDir = strtolower(trim((string) $request->query('sort_dir', 'desc')));
        $sortDir = in_array($sortDir, ['asc', 'desc'], true) ? $sortDir : 'desc';

        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(1, min(100, $perPage));

        $query = Reservation::query()
            ->with(['user:id,name,email', 'invoice:id,reservation_id,invoice_number,payment_status,payment_method,payment_reference,paid_at'])
            ->orderBy('check_in_date', $sortDir);

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($roomType !== '') {
            $query->where('room_type', $roomType);
        }

        if ($search !== '') {
            $searchReservationId = null;
            $normalized = preg_replace('/^RES-?/i', '', $search) ?? $search;
            $normalized = ltrim($normalized);
            if ($normalized !== '' && ctype_digit($normalized)) {
                $searchReservationId = (int) ltrim($normalized, '0');
                if ($searchReservationId === 0 && $normalized !== '0') {
                    $searchReservationId = null;
                }
            }

            $query->where(function ($q) use ($search) {
                $q->where('room_number', 'like', "%{$search}%")
                    ->orWhere('room_type', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });

            if ($searchReservationId !== null) {
                $query->orWhere('id', $searchReservationId);
            }
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

        // Check for double-booking: prevent overlapping reservations
        $conflictExists = DB::table('reservations')
            ->where('room_number', $room->room_number)
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->where('check_out_date', '>', $checkIn->toDateString())
                    ->where('check_in_date', '<', $checkOut->toDateString());
            })
            ->lockForUpdate()
            ->exists();

        if ($conflictExists) {
            return response()->json(['message' => 'The room is taken.'], 409);
        }

        $amountCents = (int) $room->base_rate_cents * $nights;

        $reservation = DB::transaction(function () use ($user, $room, $checkIn, $checkOut, $nights, $amountCents, $validated) {
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

            Invoice::create([
                'reservation_id' => $reservation->id,
                'invoice_number' => 'INV-'.now()->format('Y').'-'.str_pad((string) $reservation->id, 5, '0', STR_PAD_LEFT),
                'total_cents' => (int) $reservation->amount_cents,
                'currency' => $reservation->currency ?? 'PHP',
                'payment_status' => $reservation->payment_status ?? 'unpaid',
                'issued_at' => now(),
            ]);

            return $reservation;
        });

        $reservation->load(['user:id,name,email', 'invoice']);

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

        // Check for double-booking when dates or room changes
        $hasDateChange = array_key_exists('check_in_date', $validated) || array_key_exists('check_out_date', $validated);
        $hasRoomChange = array_key_exists('room_number', $validated);

        if ($hasDateChange || $hasRoomChange) {
            $roomToCheck = $room ? $room->room_number : $reservation->room_number;
            
            $conflictExists = DB::table('reservations')
                ->where('room_number', $roomToCheck)
                ->where('id', '!=', $reservation->id) // Exclude current reservation
                ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
                ->where(function ($query) use ($checkIn, $checkOut) {
                    $query->where('check_out_date', '>', $checkIn->toDateString())
                        ->where('check_in_date', '<', $checkOut->toDateString());
                })
                ->lockForUpdate()
                ->exists();

            if ($conflictExists) {
                return response()->json(['message' => 'The room is taken.'], 409);
            }
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

        // Keep invoice totals in sync.
        $invoice = $reservation->invoice;
        if ($invoice) {
            $invoice->total_cents = (int) $reservation->amount_cents;
            $invoice->currency = $reservation->currency ?? $invoice->currency;
            $invoice->save();
        }

        $reservation->load(['user:id,name,email', 'invoice']);

        return response()->json(['reservation' => $reservation]);
    }

    public function confirm(Reservation $reservation)
    {
        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Only pending reservations can be confirmed.'], 409);
        }

        $reservation->status = 'confirmed';
        $reservation->save();

        $reservation->load(['user:id,name,email', 'invoice']);

        return response()->json(['reservation' => $reservation]);
    }

    public function checkIn(Reservation $reservation)
    {
        if (!in_array($reservation->status, ['confirmed', 'pending'], true)) {
            return response()->json([
                'message' => 'Only confirmed or pending reservations can be checked in.',
            ], 409);
        }

        $reservation->status = 'checked_in';
        $reservation->save();

        $reservation->load(['user:id,name,email', 'invoice']);

        return response()->json(['reservation' => $reservation]);
    }

    public function cancel(Reservation $reservation)
    {
        if (in_array($reservation->status, ['checked_out', 'cancelled'], true)) {
            return response()->json(['message' => 'This reservation can no longer be cancelled.'], 409);
        }

        $reservation = DB::transaction(function () use ($reservation) {
            $reservation->status = 'cancelled';
            $reservation->save();

            $invoice = $reservation->invoice;
            if ($invoice && $invoice->payment_status === 'paid') {
                $invoice->payment_status = 'refund_pending';
                $invoice->save();
            }

            return $reservation;
        });

        $reservation->load(['user:id,name,email', 'invoice']);

        return response()->json(['reservation' => $reservation]);
    }

    public function recordPayment(Request $request, Reservation $reservation)
    {
        if (in_array($reservation->status, ['cancelled', 'checked_out'], true)) {
            return response()->json(['message' => 'Cannot record payment for this reservation.'], 409);
        }

        if ($reservation->payment_status === 'paid') {
            return response()->json(['message' => 'This reservation is already marked as paid.'], 409);
        }

        $validated = $request->validate([
            'payment_method' => ['required', Rule::in(['hotel', 'paypal'])],
            'payment_reference' => ['nullable', 'string', 'max:255'],
        ]);

        $reservation = DB::transaction(function () use ($reservation, $validated) {
            $reservation->payment_method = $validated['payment_method'];
            $reservation->payment_reference = $validated['payment_reference'] ?? $reservation->payment_reference;
            $reservation->paid_at = now();
            $reservation->payment_status = 'paid';

            if ($reservation->status === 'pending') {
                $reservation->status = 'confirmed';
            }

            $reservation->save();

            $invoice = $reservation->invoice ?: Invoice::create([
                'reservation_id' => $reservation->id,
                'invoice_number' => 'INV-'.now()->format('Y').'-'.str_pad((string) $reservation->id, 5, '0', STR_PAD_LEFT),
                'total_cents' => (int) $reservation->amount_cents,
                'currency' => $reservation->currency ?? 'PHP',
                'issued_at' => $reservation->created_at ?? now(),
            ]);

            $invoice->total_cents = (int) $reservation->amount_cents;
            $invoice->currency = $reservation->currency ?? $invoice->currency;
            $invoice->payment_status = 'paid';
            $invoice->payment_method = $reservation->payment_method;
            $invoice->payment_reference = $reservation->payment_reference;
            $invoice->paid_at = $reservation->paid_at;
            $invoice->save();

            Payment::create([
                'invoice_id' => $invoice->id,
                'method' => $reservation->payment_method ?? 'hotel',
                'reference' => $reservation->payment_reference,
                'amount_cents' => (int) $reservation->amount_cents,
                'currency' => $reservation->currency ?? 'PHP',
                'status' => 'paid',
                'paid_at' => $reservation->paid_at,
            ]);

            return $reservation;
        });

        $reservation->load(['user:id,name,email', 'invoice']);

        return response()->json(['reservation' => $reservation]);
    }

    public function refund(Reservation $reservation)
    {
        $invoice = $reservation->invoice;
        $invoiceStatus = $invoice?->payment_status ?? $reservation->payment_status;

        if (! $invoice || ! in_array($invoiceStatus, ['paid', 'refund_pending'], true)) {
            return response()->json(['message' => 'Only paid reservations can be refunded.'], 409);
        }

        if ($reservation->status !== 'cancelled') {
            return response()->json(['message' => 'Cancel the reservation before refunding.'], 409);
        }

        $reservation = DB::transaction(function () use ($reservation, $invoice) {
            $invoice->payment_status = 'refunded';
            $invoice->save();

            $reservation->payment_status = 'refunded';
            $reservation->save();

            Payment::create([
                'invoice_id' => $invoice->id,
                'method' => $invoice->payment_method ?? ($reservation->payment_method ?? 'hotel'),
                'reference' => $invoice->payment_reference,
                'amount_cents' => -1 * (int) $invoice->total_cents,
                'currency' => $invoice->currency ?? 'PHP',
                'status' => 'refunded',
                'paid_at' => now(),
            ]);

            return $reservation;
        });

        $reservation->load(['user:id,name,email', 'invoice']);

        return response()->json(['reservation' => $reservation]);
    }
}
