<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $feedbacks = Feedback::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get(['id', 'reservation_id', 'rating', 'comment', 'created_at']);

        $reservationIds = $feedbacks->pluck('reservation_id')->unique()->values();
        $reservations = Reservation::query()
            ->whereIn('id', $reservationIds)
            ->get(['id', 'room_number', 'room_type', 'check_in_date', 'check_out_date']);

        $roomNumbers = $reservations->pluck('room_number')->unique()->values();
        $roomsByNumber = Room::query()
            ->whereIn('room_number', $roomNumbers)
            ->get(['room_number', 'display_name', 'type'])
            ->keyBy('room_number');

        $reservationsById = $reservations->keyBy('id');

        $data = $feedbacks->map(function ($f) use ($reservationsById, $roomsByNumber) {
            $r = $reservationsById->get($f->reservation_id);
            $room = $r ? $roomsByNumber->get($r->room_number) : null;

            return [
                'id' => $f->id,
                'reservation_id' => $f->reservation_id,
                'reservation_ref' => 'RES-'.str_pad((string) $f->reservation_id, 4, '0', STR_PAD_LEFT),
                'room_name' => $room?->display_name ?? $r?->room_type ?? '—',
                'room_number' => $r?->room_number,
                'check_in_date' => $r ? (string) $r->check_in_date : null,
                'check_out_date' => $r ? (string) $r->check_out_date : null,
                'rating' => $f->rating,
                'comment' => $f->comment,
                'created_at' => $f->created_at?->toISOString(),
            ];
        });

        return response()->json(['feedbacks' => $data]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'reservation_id' => ['required', 'integer', 'exists:reservations,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'max:2000'],
        ]);

        $reservation = Reservation::query()
            ->where('id', $validated['reservation_id'])
            ->where('user_id', $user->id)
            ->first();

        if (! $reservation) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        if ($reservation->status !== 'checked_out') {
            return response()->json(['message' => 'You can only review a completed stay.'], 409);
        }

        $already = Feedback::query()
            ->where('user_id', $user->id)
            ->where('reservation_id', $reservation->id)
            ->exists();

        if ($already) {
            return response()->json(['message' => 'You already submitted feedback for this reservation.'], 409);
        }

        $feedback = Feedback::create([
            'user_id' => $user->id,
            'reservation_id' => $reservation->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        $room = Room::where('room_number', $reservation->room_number)
            ->first(['room_number', 'display_name', 'type']);

        return response()->json([
            'feedback' => [
                'id' => $feedback->id,
                'reservation_id' => $feedback->reservation_id,
                'reservation_ref' => 'RES-'.str_pad((string) $feedback->reservation_id, 4, '0', STR_PAD_LEFT),
                'room_name' => $room?->display_name ?? $reservation->room_type,
                'room_number' => $reservation->room_number,
                'check_in_date' => (string) $reservation->check_in_date,
                'check_out_date' => (string) $reservation->check_out_date,
                'rating' => $feedback->rating,
                'comment' => $feedback->comment,
                'created_at' => $feedback->created_at?->toISOString(),
            ],
        ], 201);
    }
}