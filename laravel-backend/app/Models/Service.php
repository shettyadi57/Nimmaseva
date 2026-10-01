<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'category', 'fee',
        'avg_processing_time_mins', 'daily_capacity',
        'is_active', 'server_status', 'required_documents', 'description',
    ];

    protected function casts(): array
    {
        return [
            'fee'                      => 'float',
            'avg_processing_time_mins' => 'integer',
            'daily_capacity'           => 'integer',
            'is_active'                => 'boolean',
            'required_documents'       => 'array',
        ];
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
