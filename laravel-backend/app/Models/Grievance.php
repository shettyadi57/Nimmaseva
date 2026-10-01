<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grievance extends Model
{
    protected $fillable = [
        'ticket_id', 'citizen_name', 'mobile', 'token_number',
        'center_name', 'category', 'description',
        'status', 'resolution_notes', 'submitted_at', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'resolved_at'  => 'datetime',
        ];
    }
}
