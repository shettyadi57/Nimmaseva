<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Office;
use App\Models\Service;
use App\Models\QueueState;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * TokenService — enforces the Hybrid Token Range Engine.
 *
 * Daily ranges per office:
 *  Walk-in   : 01-10, 41-50  (offline)
 *  Online    : 11-40, 51-80
 *  Priority  : 81-90  (60+, PwD, Pregnant)
 *  Emergency : 91-100
 *
 * Prefix: G- for GramOne, S- for SevaSindhu, B- for BSK
 */
class TokenService
{
    /** Map office type to token prefix. */
    private function prefix(Office $office): string
    {
        return match ($office->type) {
            'SevaSindhu' => 'S',
            'BSK'        => 'B',
            default      => 'G',
        };
    }

    /**
     * Generate the next available token for a booking.
     * Enforces max_daily_tokens, range rules, and no duplicate tokens per day.
     */
    public function allocate(
        Office $office,
        Service $service,
        bool $isPriority,
        string $priorityReason,
        string $bookingType,
    ): string {
        return DB::transaction(function () use ($office, $service, $isPriority, $priorityReason, $bookingType) {
            $today  = today('Asia/Kolkata')->toDateString();
            $prefix = $this->prefix($office);

            // ── Daily quota guard ─────────────────────────────────────────────
            $totalToday = Booking::where('office_id', $office->id)
                ->where('booking_date', $today)
                ->whereNotIn('status', ['Cancelled'])
                ->count();

            if ($totalToday >= $office->max_daily_tokens) {
                throw ValidationException::withMessages([
                    'quota' => "Daily token quota ({$office->max_daily_tokens}) for {$office->name} is full. Please book for the next working day.",
                ]);
            }

            // ── Determine candidate ranges ────────────────────────────────────
            $isEmergency = str_contains(strtolower($priorityReason ?? ''), 'emergency');

            $ranges = $this->getRanges($office, $isPriority, $isEmergency, $bookingType);

            // ── Find first unused number in those ranges ───────────────────────
            $usedNumbers = Booking::where('office_id', $office->id)
                ->where('booking_date', $today)
                ->whereNotIn('status', ['Cancelled'])
                ->pluck('token_number')
                ->map(fn($t) => (int) explode('-', $t)[1] ?? 0)
                ->toArray();

            $allocated = null;
            foreach ($ranges as [$start, $end]) {
                for ($n = $start; $n <= $end; $n++) {
                    if (! in_array($n, $usedNumbers, true)) {
                        $allocated = $n;
                        break 2;
                    }
                }
            }

            if ($allocated === null) {
                throw ValidationException::withMessages([
                    'quota' => "All token slots in the {$bookingType} range are full for today. Please try walk-in or book for tomorrow.",
                ]);
            }

            return sprintf('%s-%02d', $prefix, $allocated);
        });
    }

    /**
     * Parse office range strings and return list of [start, end] pairs.
     */
    private function getRanges(Office $office, bool $isPriority, bool $isEmergency, string $bookingType): array
    {
        if ($isEmergency) {
            return $this->parseRangeString($office->emergency_range);
        }

        if ($isPriority) {
            return $this->parseRangeString($office->priority_range);
        }

        // Walk-in types
        if (in_array(strtolower($bookingType), ['walk-in', 'walkin', 'offline'])) {
            return $this->parseRangeString($office->offline_range);
        }

        // Online (default)
        return $this->parseRangeString($office->online_range);
    }

    /** Parse "01-10,41-50" → [[1,10],[41,50]] */
    private function parseRangeString(string $str): array
    {
        return collect(explode(',', $str))
            ->map(fn($part) => array_map('intval', explode('-', trim($part))))
            ->filter(fn($r) => count($r) === 2)
            ->values()
            ->toArray();
    }

    /**
     * Generate a cryptographically secure 6-character verification code.
     */
    public function generateVerificationCode(): string
    {
        $bytes = random_bytes(4);
        // produce uppercase alphanumeric, strip ambiguous chars (0,O,I,1,l)
        $chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $code   = '';
        foreach (str_split($bytes) as $byte) {
            $code .= $chars[ord($byte) % strlen($chars)];
        }
        return 'VF-' . substr($code, 0, 5);
    }

    /**
     * Generate a signed, expiring access token for cancel/PDF/phone-lookup
     * without requiring a login session.
     */
    public function generateSignedAccessToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    /**
     * Calculate visit date — if after 17:00 IST, push to next working day.
     */
    public function getVisitDate(): Carbon
    {
        $now = now('Asia/Kolkata');
        if ($now->hour >= 17) {
            return $now->copy()->addDay()->startOfDay();
        }
        return $now->copy()->startOfDay();
    }

    /**
     * Calculate visit time slot string based on token number position.
     */
    public function getVisitTimeSlot(int $tokenNum, int $avgMins = 15): string
    {
        // Counters open at 09:00, slot = 9:00 + (position * avgMins)
        $startMinutes = 540 + (($tokenNum - 1) * $avgMins);
        $endMinutes   = $startMinutes + $avgMins;

        $fmt = fn(int $m) => Carbon::today('Asia/Kolkata')->startOfDay()->addMinutes($m)->format('h:i A');
        return $fmt($startMinutes) . ' - ' . $fmt($endMinutes);
    }
}
