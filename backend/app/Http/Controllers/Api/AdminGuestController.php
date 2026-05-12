<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

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
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:2000'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $guest = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'role' => 'guest',
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['guest' => $guest], 201);
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
