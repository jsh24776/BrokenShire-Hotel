<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;

class AdminGuestController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(1, min(100, $perPage));

        $query = User::query()
            ->where('role', 'guest')
            ->orderByDesc('created_at');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function show(User $user)
    {
        if ($user->role !== 'guest') {
            return response()->json(['message' => 'Guest not found.'], 404);
        }

        return response()->json(['guest' => $user]);
    }

    public function history(User $user)
    {
        if ($user->role !== 'guest') {
            return response()->json(['message' => 'Guest not found.'], 404);
        }

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
                'payment_status',
                'status',
                'created_at',
            ]);

        return response()->json([
            'guest' => $user,
            'reservations' => $reservations,
        ]);
    }
}
