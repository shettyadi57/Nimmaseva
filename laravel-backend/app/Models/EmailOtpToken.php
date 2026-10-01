<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailOtpToken extends Model
{
    protected $table = 'email_otp_tokens';

    protected $fillable = ['email', 'otp', 'used', 'expires_at'];

    protected function casts(): array
    {
        return [
            'used'       => 'boolean',
            'expires_at' => 'datetime',
        ];
    }
}
