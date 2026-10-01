<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Office extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'type', 'address', 'district', 'taluk', 'village',
        'latitude', 'longitude', 'phone', 'working_hours', 'lunch_break',
        'max_daily_tokens', 'server_status',
        'offline_range', 'online_range', 'priority_range', 'emergency_range',
    ];

    protected function casts(): array
    {
        return [
            'latitude'         => 'float',
            'longitude'        => 'float',
            'max_daily_tokens' => 'integer',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function queueState(): HasOne
    {
        return $this->hasOne(QueueState::class);
    }

    /**
     * Count of today's pending bookings (current queue).
     */
    public function getCurrentQueueCountAttribute(): int
    {
        return $this->bookings()
            ->whereDate('booking_date', today())
            ->whereIn('status', ['Pending', 'Called', 'In Progress', 'Approaching Counter'])
            ->count();
    }

    /**
     * Remaining tokens for today.
     */
    public function getRemainingTokensAttribute(): int
    {
        $used = $this->bookings()
            ->whereDate('booking_date', today())
            ->whereNotIn('status', ['Cancelled'])
            ->count();
        return max(0, $this->max_daily_tokens - $used);
    }
}
