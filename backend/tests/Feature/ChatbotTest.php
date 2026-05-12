<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatbotTest extends TestCase
{
    use RefreshDatabase;

    public function test_chat_endpoint_returns_json_shape(): void
    {
        Http::fake([
            'https://api.groq.com/openai/v1/chat/completions' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => json_encode([
                                'reply' => 'Hello! Based on your budget, I recommend Forest View Suite.',
                                'recommendation' => [
                                    'room_type' => 'Forest View Suite',
                                    'fit_score' => 0.9,
                                    'estimated_nights' => 2,
                                    'estimated_per_night_php' => 1250,
                                    'estimated_total_php' => 2500,
                                    'why' => ['Great value', 'Forest view'],
                                    'tradeoffs' => ['Limited capacity'],
                                ],
                            ]),
                        ],
                    ],
                ],
            ], 200),
        ]);

        config()->set('services.groq.key', 'test-key');
        config()->set('services.groq.base_url', 'https://api.groq.com/openai/v1');
        config()->set('services.groq.model', 'llama-3.1-8b-instant');

        $user = User::factory()->create(['role' => 'guest']);
        Sanctum::actingAs($user, ['*']);

        $res = $this->postJson('/api/chat', [
            'message' => 'Recommend a room under 3000 PHP for 2 nights.',
            'budget_pesos' => 3000,
        ]);

        $res->assertOk();
        $res->assertJsonStructure([
            'reply',
            'recommendation',
        ]);
    }
}
