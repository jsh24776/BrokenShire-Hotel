<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GroqChatService
{
    public function chatJson(array $messages): array
    {
        $key = (string) config('services.groq.key');
        $baseUrl = rtrim((string) config('services.groq.base_url', ''), '/');
        $model = (string) config('services.groq.model', 'llama-3.1-8b-instant');

        if ($key === '' || $baseUrl === '') {
            Log::warning('Groq chat is not configured (missing key or base_url).');

            return [
                'reply' => 'AI assistant is not configured yet. Please add GROQ_API_KEY in backend/.env.',
                'recommendation' => null,
            ];
        }

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'temperature' => 0.2,
            'max_tokens' => 700,
        ];

        try {
            $res = Http::baseUrl($baseUrl)
                ->withToken($key)
                ->acceptJson()
                ->asJson()
                ->timeout(20)
                ->post('/chat/completions', $payload);
        } catch (\Throwable $e) {
            Log::warning('Groq chat request failed (exception).', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);

            return [
                'reply' => 'AI assistant is temporarily unavailable. Please try again in a minute.',
                'recommendation' => null,
            ];
        }

        if (! $res->successful()) {
            Log::warning('Groq chat request failed (non-2xx).', [
                'status' => $res->status(),
                'body' => Str::limit((string) $res->body(), 500),
            ]);

            return [
                'reply' => 'AI assistant is temporarily unavailable. Please try again later.',
                'recommendation' => null,
            ];
        }

        $content = (string) data_get($res->json(), 'choices.0.message.content', '');
        $parsed = $this->parseJsonObject($content);

        if (! is_array($parsed)) {
            return [
                'reply' => trim($content) !== '' ? trim($content) : 'Sorry, I could not generate a response right now.',
                'recommendation' => null,
            ];
        }

        $reply = (string) ($parsed['reply'] ?? '');
        $recommendation = $parsed['recommendation'] ?? null;

        if ($reply === '') {
            $reply = "Here's what I found based on your request.";
        }

        return [
            'reply' => $reply,
            'recommendation' => $recommendation,
        ];
    }

    private function parseJsonObject(string $text): ?array
    {
        $t = trim($text);

        if (Str::startsWith($t, '```')) {
            $t = preg_replace('/^```[a-zA-Z0-9_-]*\s*/', '', $t) ?? $t;
            $t = preg_replace('/\s*```\s*$/', '', $t) ?? $t;
            $t = trim($t);
        }

        $start = strpos($t, '{');
        $end = strrpos($t, '}');
        if ($start === false || $end === false || $end <= $start) {
            return null;
        }

        $candidate = substr($t, $start, $end - $start + 1);
        $decoded = json_decode($candidate, true);

        return is_array($decoded) ? $decoded : null;
    }
}