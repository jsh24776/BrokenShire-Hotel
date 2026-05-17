<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;

class AdminFeedbackController extends Controller
{
    public function index(Request $request)
    {
        $feedbacks = Feedback::query()
            ->with(['user:id,name', 'reservation:id,room_number,check_in_date,check_out_date'])
            ->orderByDesc('created_at')
            ->get(['id', 'user_id', 'reservation_id', 'rating', 'comment', 'created_at']);

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
                'guest_name' => $f->user?->name ?? 'Unknown',
                'reservation_id' => $f->reservation_id,
                'room_name' => $room?->display_name ?? $r?->room_type ?? '—',
                'room_number' => $r?->room_number,
                'check_in_date' => $r ? (string) $r->check_in_date : null,
                'check_out_date' => $r ? (string) $r->check_out_date : null,
                'rating' => $f->rating,
                'comment' => $f->comment,
                'created_at' => $f->created_at?->toISOString(),
            ];
        });

        // Calculate statistics
        $totalReviews = $data->count();
        $avgRating = $totalReviews > 0 ? round($data->avg('rating'), 1) : 0;
        $satisfactionScore = $totalReviews > 0 ? round(($data->where('rating', '>=', 4)->count() / $totalReviews) * 100, 1) : 0;

        // Generate monthly distribution
        $monthlyData = [];
        for ($i = 0; $i < 6; $i++) {
            $month = now()->subMonths($i);
            $monthKey = $month->format('Y-m');
            $monthName = $month->format('M');
            
            $monthlyData[] = [
                'month' => $monthName,
                'rating5' => $data->filter(fn($f) => substr($f['created_at'], 0, 7) === $monthKey && $f['rating'] === 5)->count(),
                'rating4' => $data->filter(fn($f) => substr($f['created_at'], 0, 7) === $monthKey && $f['rating'] === 4)->count(),
                'rating3' => $data->filter(fn($f) => substr($f['created_at'], 0, 7) === $monthKey && $f['rating'] === 3)->count(),
                'rating2' => $data->filter(fn($f) => substr($f['created_at'], 0, 7) === $monthKey && $f['rating'] === 2)->count(),
                'rating1' => $data->filter(fn($f) => substr($f['created_at'], 0, 7) === $monthKey && $f['rating'] === 1)->count(),
            ];
        }
        $monthlyData = array_reverse($monthlyData);

        return response()->json([
            'feedbacks' => $data->take(10),
            'stats' => [
                'total_reviews' => $totalReviews,
                'avg_rating' => $avgRating,
                'satisfaction_score' => $satisfactionScore,
            ],
            'monthly_data' => $monthlyData,
        ]);
    }
}
