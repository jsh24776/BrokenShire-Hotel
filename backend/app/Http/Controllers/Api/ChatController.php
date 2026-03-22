<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomType;
use App\Services\GroqChatService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function chat(Request $request, GroqChatService $groq)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['nullable', 'array', 'max:12'],
            'history.*.role' => ['required_with:history', 'in:user,assistant'],
            'history.*.content' => ['required_with:history', 'string', 'max:2000'],
            'budget_pesos' => ['nullable', 'numeric', 'min:0', 'max:10000000'],
            'check_in_date' => ['nullable', 'date'],
            'check_out_date' => ['nullable', 'date', 'after:check_in_date'],
            'preferences' => ['nullable', 'array', 'max:20'],
            'preferences.*' => ['string', 'max:50'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $user = $request->user();

        $roomTypes = RoomType::query()
            ->orderBy('base_rate_cents')
            ->get(['name', 'capacity', 'base_rate_cents', 'currency', 'amenities'])
            ->map(fn ($rt) => [
                'name' => $rt->name,
                'capacity' => (int) ($rt->capacity ?? 0),
                'rate_per_night_php' => (int) round(((int) ($rt->base_rate_cents ?? 0)) / 100),
                'currency' => $rt->currency ?? 'PHP',
                'amenities' => $rt->amenities ?? [],
            ])
            ->values()
            ->all();

        $checkIn = isset($validated['check_in_date']) ? Carbon::parse($validated['check_in_date'])->startOfDay() : null;
        $checkOut = isset($validated['check_out_date']) ? Carbon::parse($validated['check_out_date'])->startOfDay() : null;
        $nights = null;
        $availabilityByType = null;

        if ($checkIn && $checkOut) {
            $nights = max(1, (int) $checkIn->diffInDays($checkOut));

            $activeReservations = Reservation::query()
                ->whereNotIn('status', ['cancelled', 'checked_out'])
                ->where('check_in_date', '<', $checkOut->toDateString())
                ->where('check_out_date', '>', $checkIn->toDateString())
                ->get(['room_number']);

            $blockedRoomNumbers = $activeReservations->pluck('room_number')->filter()->unique()->values();

            $rooms = Room::query()
                ->whereNull('archived_at')
                ->get(['room_number', 'type']);

            $totalByType = $rooms->groupBy('type')->map->count();
            $availableRooms = $rooms->whereNotIn('room_number', $blockedRoomNumbers)->groupBy('type')->map->count();

            $availabilityByType = $totalByType->map(function ($total, $type) use ($availableRooms) {
                $available = (int) ($availableRooms[$type] ?? 0);

                return [
                    'type' => (string) $type,
                    'total_rooms' => (int) $total,
                    'available_rooms' => $available,
                ];
            })->values()->all();
        }

        $systemPrompt = implode("\n", [
            'You are Brokenshire Hotel AI Concierge.',
            'You help guests with booking issues and recommend the best room type based on budget and preferences.',
            'Return ONLY valid JSON (no markdown, no code fences).',
            'Use Philippine Peso (PHP) amounts.',
            'Be concise, friendly, and practical.',
            '',
            'JSON schema:',
            '{',
            '  "reply": string,',
            '  "recommendation": null | {',
            '     "room_type": string,',
            '     "fit_score": number,',
            '     "estimated_nights": number | null,',
            '     "estimated_per_night_php": number | null,',
            '     "estimated_total_php": number | null,',
            '     "why": string[],',
            '     "tradeoffs": string[]',
            '  }',
            '}',
        ]);

        $context = [
            'guest' => [
                'name' => $user?->name,
                'email' => $user?->email,
            ],
            'budget_pesos' => $validated['budget_pesos'] ?? null,
            'guests' => $validated['guests'] ?? null,
            'check_in_date' => $checkIn?->toDateString(),
            'check_out_date' => $checkOut?->toDateString(),
            'nights' => $nights,
            'preferences' => $validated['preferences'] ?? [],
            'room_types' => $roomTypes,
            'availability_by_type' => $availabilityByType,
        ];

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'system', 'content' => 'Context JSON: '.json_encode($context)],
        ];

        foreach (($validated['history'] ?? []) as $h) {
            $messages[] = ['role' => $h['role'], 'content' => $h['content']];
        }

        $messages[] = ['role' => 'user', 'content' => $validated['message']];

        $result = $groq->chatJson($messages);

        return response()->json($result);
    }
}