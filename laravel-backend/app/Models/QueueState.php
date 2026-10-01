<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueueState extends Model
{
    protected $fillable = [
        'office_id', 'current_token', 'next_token',
        'active_counters', 'is_paused', 'counter_allocations',
    ];

    protected function casts(): array
    {
        return [
            'is_paused'            => 'boolean',
            'active_counters'      => 'integer',
            'counter_allocations'  => 'array',
        ];
    }

    public function office()
    {
        return $this->belongsTo(Office::class);
    }
}
