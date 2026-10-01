<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid', 'token_number', 'verification_code',
        'citizen_name', 'phone_encrypted', 'phone_hash', 'aadhaar_last4',
        'age', 'gender', 'is_priority', 'priority_reason', 'booking_type',
        'office_id', 'service_id',
        'booking_date', 'visit_date', 'visit_time',
        'status', 'counter_number', 'amount_paid', 'tatkal_probability',
        'signed_access_token', 'reminder_sent', 'acknowledged',
        'no_show_count', 'rating', 'rating_comment', 'rated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_priority'       => 'boolean',
            'reminder_sent'     => 'boolean',
            'acknowledged'      => 'boolean',
            'amount_paid'       => 'float',
            'tatkal_probability'=> 'integer',
            'rated_at'          => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $b) {
            if (empty($b->uuid)) {
                $b->uuid = (string) Str::uuid();
            }
        });
    }

    // ── Phone encryption ──────────────────────────────────────────────────────

    public function setPhoneAttribute(string $phone): void
    {
        $phone = preg_replace('/\D/', '', $phone);
        $this->attributes['phone_encrypted'] = Crypt::encryptString($phone);
        $this->attributes['phone_hash']      = hash_hmac('sha256', $phone, config('app.key'));
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

    public static function findByPhone(string $phone): \Illuminate\Database\Eloquent\Collection
    {
        $phone = preg_replace('/\D/', '', $phone);
        $hash  = hash_hmac('sha256', $phone, config('app.key'));
        return self::where('phone_hash', $hash)->with(['office', 'service'])->orderByDesc('created_at')->get();
    }

    // ── Aadhaar masking ───────────────────────────────────────────────────────

    /**
     * When setting aadhaar, store only last 4 digits.
     */
    public function setAadhaarAttribute(string $aadhaar): void
    {
        $digits = preg_replace('/\D/', '', $aadhaar);
        $this->attributes['aadhaar_last4'] = substr($digits, -4);
    }

    /** Return the masked representation for API output. */
    public function getAadhaarAttribute(): string
    {
        $last4 = $this->attributes['aadhaar_last4'] ?? '0000';
        return "XXXX-XXXX-{$last4}";
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
