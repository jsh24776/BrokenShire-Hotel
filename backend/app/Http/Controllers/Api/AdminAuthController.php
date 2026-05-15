<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Mail\PasswordResetMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::where('email', $validated['email'])->first();

        if (! $admin || ! Hash::check($validated['password'], $admin->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = $admin->createToken('admin')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'admin' => $admin,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    private function strongPasswordRule(): Password
    {
        // At least 8 chars, with uppercase, lowercase, number, and symbol.
        return Password::min(8)->mixedCase()->letters()->numbers()->symbols();
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $admin = Admin::where('email', $validated['email'])->first();

        if (!$admin) {
            // For security, don't reveal if email exists
            return response()->json(['message' => 'If that email address is in our system, we have sent a password reset link.']);
        }

        // Generate a unique token
        $token = Str::random(64);

        // Store the token in password_reset_tokens table with admin prefix
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => 'admin:' . $validated['email']],
            [
                'token' => $token,
                'created_at' => now(),
            ]
        );

        // Send password reset email
        try {
            Mail::to($validated['email'])->send(new PasswordResetMail($validated['email'], $token, $admin->name ?? 'Admin'));
        } catch (\Exception $e) {
            // Log the error but still return success to avoid revealing email issues
            \Log::error('Admin password reset email failed: ' . $e->getMessage());
        }

        return response()->json(['message' => 'If that email address is in our system, we have sent a password reset link.']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', $this->strongPasswordRule()],
        ]);

        // Find the password reset token record for admin (search all admin tokens)
        $resetToken = DB::table('password_reset_tokens')
            ->where('email', 'like', 'admin:%')
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

        // Extract email from 'admin:email' format
        $email = str_replace('admin:', '', $resetToken->email);

        // Find the admin and update password
        $admin = Admin::where('email', $email)->first();

        if (!$admin) {
            return response()->json(['message' => 'Admin not found.'], 422);
        }

        $admin->password = Hash::make($validated['password']);
        $admin->save();

        // Delete the used token
        DB::table('password_reset_tokens')->where('email', $resetToken->email)->delete();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }
}

