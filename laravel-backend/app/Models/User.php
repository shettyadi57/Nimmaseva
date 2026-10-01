<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Crypt;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'full_name',
        'email',
        'phone_encrypted',
        'phone_hash',
        'password',
        'aadhaar_last4',
        'age',
        'gender',
        'district',
        'taluk',
        'village_or_address',
        'employee_id',
        'department',
        'office_id',
        'must_change_password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'phone_encrypted',
        'phone_hash',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'   => 'datetime',
            'password'            => 'hashed',
            'must_change_password'=> 'boolean',
            'is_active'           => 'boolean',
        ];
    }

    // ── Phone encryption helpers ──────────────────────────────────────────────

    /**
     * Store phone as AES-256 encrypted; also store HMAC for lookup.
     */
    public function setPhoneAttribute(string $phone): void
    {
        $phone = preg_replace('/\D/', '', $phone);
        $this->attributes['phone_encrypted'] = Crypt::encryptString($phone);
        $this->attributes['phone_hash']      = self::hashPhone($phone);
    }

    public function getPhoneAttribute(): ?string
    {
        if (empty($this->attributes['phone_encrypted'])) {
            return null;
        }
        try {
            return Crypt::decryptString($this->attributes['phone_encrypted']);
        } catch (\Exception) {
            return null;
        }
    }

    public static function hashPhone(string $phone): string
    {
        return hash_hmac('sha256', $phone, config('app.key'));
    }

    public static function findByPhone(string $phone): ?self
    {
        $phone = preg_replace('/\D/', '', $phone);
        return self::where('phone_hash', self::hashPhone($phone))->first();
    }

    // ── Role shorthand ────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->hasRole(['district_admin', 'office_admin']);
    }

    public function isOperator(): bool
    {
        return $this->hasRole('operator');
    }
}
