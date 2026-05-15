<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\PasswordResetMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    private function phoneRules(): array
    {
        // PH mobile format: 11 digits, starts with 09 (e.g. 09171234567)
        return ['required', 'string', 'regex:/^09\\d{9}$/'];
    }

    private function strongPasswordRule(): Password
    {
        // At least 8 chars, with uppercase, lowercase, number, and symbol.
        return Password::min(8)->mixedCase()->letters()->numbers()->symbols();
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => $this->phoneRules(),
            'address' => ['required', 'string', 'max:2000'],
            'password' => ['required', 'confirmed', $this->strongPasswordRule()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'role' => 'guest',
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('guest')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = $user->createToken('guest')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    public function profile(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
    public function updateProfile(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => $this->phoneRules(),
            'address' => ['required', 'string', 'max:2000'],
        ]);

        $user->fill($validated);
        $user->save();

        return response()->json(['user' => $user]);
    }

    public function updatePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', $this->strongPasswordRule()],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json(['message' => 'Password updated.']);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            // For security, don't reveal if email exists
            return response()->json(['message' => 'If that email address is in our system, we have sent a password reset link.']);
        }

        // Generate a unique token
        $token = Str::random(64);

        // Store the token in password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            [
                'token' => $token,
                'created_at' => now(),
            ]
        );

        // Send password reset email
        try {
            Mail::to($validated['email'])->send(new PasswordResetMail($validated['email'], $token, $user->name));
        } catch (\Exception $e) {
            // Log the error but still return success to avoid revealing email issues
            \Log::error('Password reset email failed: ' . $e->getMessage());
        }

        return response()->json(['message' => 'If that email address is in our system, we have sent a password reset link.']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', $this->strongPasswordRule()],
        ]);

        // Find the password reset token record
        $resetToken = DB::table('password_reset_tokens')
            ->where('token', $validated['token'])
            ->first();

        if (!$resetToken) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        // Check if token is not expired (24 hours)
        if (now()->diffInHours($resetToken->created_at) > 24) {
            DB::table('password_reset_tokens')->where('email', $resetToken->email)->delete();
            return response()->json(['message' => 'Password reset token has expired.'], 422);
        }

        // Find the user and update password
        $user = User::where('email', $resetToken->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 422);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $resetToken->email)->delete();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }
}

