<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\EmailOtpToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ── POST /api/auth/login ──────────────────────────────────────────────────

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email_or_phone' => 'required|string|min:3|max:100',
            'password'       => 'required|string|min:6|max:64',
        ]);

        $loginId = strip_tags(trim($data['email_or_phone']));

        // Find by email or phone
        $user = User::where('email', $loginId)->first()
            ?? User::findByPhone($loginId);

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'detail' => 'Invalid credentials.',
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'detail' => 'Your account has been deactivated. Contact administration.',
            ]);
        }

        // Revoke previous tokens
        $user->tokens()->where('name', 'api-session')->delete();

        $token = $user->createToken('api-session', ['*'], now()->addHours(8))->plainTextToken;

        AuditLog::record('LOGIN', $user->full_name, [
            'details' => "User {$user->email} logged in",
            'ip'      => $request->ip(),
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'user_name'    => $user->full_name,
            'role'         => $user->getRoleNames()->first() ?? 'citizen',
        ]);
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name'     => 'required|string|min:2|max:100',
            'email_or_phone'=> 'required|string|min:5|max:100',
            'password'      => 'required|string|min:8|max:64',
            'employee_id'   => 'nullable|string|max:30',
            'department'    => 'nullable|string|max:100',
            'office_id'     => 'nullable|integer|min:1',
        ]);

        $loginId = strip_tags(trim($data['email_or_phone']));
        $isPhone = preg_match('/^\d+$/', preg_replace('/\D/', '', $loginId)) && strlen(preg_replace('/\D/', '', $loginId)) >= 10;

        // Check uniqueness
        if ($isPhone) {
            $phone = preg_replace('/\D/', '', $loginId);
            if (User::findByPhone($phone)) {
                throw ValidationException::withMessages(['detail' => 'Phone number already registered.']);
            }
        } else {
            if (User::where('email', $loginId)->exists()) {
                throw ValidationException::withMessages(['detail' => 'Email already registered.']);
            }
        }

        $user = new User([
            'full_name'   => strip_tags($data['full_name']),
            'email'       => $isPhone ? null : strtolower($loginId),
            'password'    => $data['password'],
            'employee_id' => $data['employee_id'] ?? null,
            'department'  => $data['department'] ?? 'Revenue & E-Governance',
            'office_id'   => $data['office_id'] ?? null,
        ]);

        if ($isPhone) {
            $user->setPhoneAttribute(preg_replace('/\D/', '', $loginId));
        }

        $user->save();

        // Default role = operator for staff registrations
        $user->assignRole('operator');

        $token = $user->createToken('api-session', ['*'], now()->addHours(8))->plainTextToken;

        AuditLog::record('REGISTER', $user->full_name, [
            'details' => "New operator registered",
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'user_name'    => $user->full_name,
            'role'         => 'operator',
        ], 201);
    }

    // ── POST /api/auth/send-email-otp ─────────────────────────────────────────

    public function sendEmailOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email|max:200',
        ]);

        $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Persist OTP (5 min TTL)
        \App\Models\EmailOtpToken::updateOrCreate(
            ['email' => $data['email']],
            ['otp' => $otp, 'used' => false, 'expires_at' => now()->addMinutes(10)]
        );

        // Send via SMTP (skip in demo if not configured)
        if (config('mail.mailers.smtp.username')) {
            Mail::raw(
                "Your Nimma Seva OTP is: {$otp}. Valid for 10 minutes.",
                fn($msg) => $msg->to($data['email'])->subject('Nimma Seva — Email Verification OTP')
            );
        }

        return response()->json([
            'message' => 'OTP sent to email.',
            'demo_otp'=> config('app.debug') ? $otp : null, // expose only in debug mode
        ]);
    }

    // ── POST /api/auth/verify-email-otp ──────────────────────────────────────

    public function verifyEmailOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $record = \App\Models\EmailOtpToken::where('email', $data['email'])
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (! $record || $record->otp !== $data['otp']) {
            throw ValidationException::withMessages(['detail' => 'Invalid or expired OTP.']);
        }

        $record->update(['used' => true]);

        return response()->json(['verified' => true, 'message' => 'Email verified successfully.']);
    }

    // ── POST /api/auth/send-otp (citizen phone OTP) ───────────────────────────

    public function sendPhoneOtp(Request $request): JsonResponse
    {
        $data    = $request->validate(['phone' => 'required|string|min:10|max:15']);
        $phone   = preg_replace('/\D/', '', $data['phone']);
        $otp     = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $phoneHash = hash_hmac('sha256', $phone, config('app.key'));

        Cache::put("otp:phone:{$phoneHash}", $otp, now()->addMinutes(10));

        // TODO: send via MSG91 when FEATURE_SMS=true
        return response()->json([
            'message'  => 'OTP sent.',
            'demo_otp' => config('app.debug') ? $otp : null,
        ]);
    }

    // ── POST /api/auth/verify-otp ─────────────────────────────────────────────

    public function verifyPhoneOtp(Request $request): JsonResponse
    {
        $data      = $request->validate([
            'phone'    => 'required|string|min:10|max:15',
            'otp'      => 'required|digits:6',
            'full_name'=> 'nullable|string|max:100',
            'age'      => 'nullable|integer|min:1|max:120',
            'gender'   => 'nullable|string|max:20',
            'district' => 'nullable|string|max:100',
            'taluk'    => 'nullable|string|max:100',
            'village_or_address' => 'nullable|string|max:300',
            'aadhaar'  => 'nullable|string|max:20',
        ]);

        $phone     = preg_replace('/\D/', '', $data['phone']);
        $phoneHash = hash_hmac('sha256', $phone, config('app.key'));
        $cached    = Cache::get("otp:phone:{$phoneHash}");

        if (! $cached || $cached !== $data['otp']) {
            throw ValidationException::withMessages(['detail' => 'Invalid or expired OTP.']);
        }

        Cache::forget("otp:phone:{$phoneHash}");

        // Auto-create citizen account
        $user = User::findByPhone($phone);
        $isNew = false;

        if (! $user) {
            $user  = new User(['full_name' => $data['full_name'] ?? 'Citizen', 'is_active' => true]);
            $user->setPhoneAttribute($phone);
            $user->age    = $data['age'] ?? null;
            $user->gender = $data['gender'] ?? null;
            $user->district = $data['district'] ?? null;
            $user->taluk    = $data['taluk'] ?? null;
            $user->village_or_address = $data['village_or_address'] ?? null;
            $user->save();
            $user->assignRole('citizen');
            $isNew = true;
        }

        $token = $user->createToken('citizen-session', ['*'], now()->addHours(24))->plainTextToken;

        return response()->json([
            'access_token'   => $token,
            'token_type'     => 'bearer',
            'is_new_account' => $isNew,
            'citizen_id'     => $user->id,
            'phone'          => $phone,
            'full_name'      => $user->full_name,
            'role'           => 'citizen',
        ]);
    }

    // ── POST /api/auth/citizen-login (demo bypass) ────────────────────────────

    public function citizenDirectLogin(Request $request): JsonResponse
    {
        $data  = $request->validate(['phone' => 'required|string|min:10|max:15']);
        $phone = preg_replace('/\D/', '', $data['phone']);

        $user = User::findByPhone($phone);

        if (! $user) {
            $user = new User([
                'full_name' => $data['full_name'] ?? 'Citizen',
                'age'       => $data['age'] ?? null,
                'gender'    => $data['gender'] ?? null,
            ]);
            $user->setPhoneAttribute($phone);
            $user->save();
            $user->assignRole('citizen');
        }

        $token = $user->createToken('citizen-session', ['*'], now()->addHours(24))->plainTextToken;

        return response()->json([
            'access_token'   => $token,
            'token_type'     => 'bearer',
            'is_new_account' => false,
            'citizen_id'     => $user->id,
            'phone'          => $phone,
            'full_name'      => $user->full_name,
            'role'           => 'citizen',
        ]);
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return response()->json([
            'id'        => $user->id,
            'full_name' => $user->full_name,
            'email'     => $user->email,
            'phone'     => $user->phone,
            'role'      => $user->getRoleNames()->first() ?? 'citizen',
            'is_active' => $user->is_active,
            'created_at'=> $user->created_at?->toIso8601String(),
        ]);
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
