<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_name', 'action', 'details', 'payload', 'hash', 'timestamp',
    ];

    protected function casts(): array
    {
        return [
            'timestamp' => 'datetime',
        ];
    }

    /**
     * Create a tamper-evident audit log entry.
     * hash = sha256(previous_hash + current_payload_json)
     */
    public static function record(string $action, string $actor, array $data): self
    {
        $last    = self::orderByDesc('id')->lockForUpdate()->first();
        $prevHash = $last?->hash ?? '';
        $payload  = json_encode(array_merge(['action' => $action, 'actor' => $actor], $data));
        $hash     = hash('sha256', $prevHash . $payload);

        return self::create([
            'user_name' => $actor,
            'action'    => $action,
            'details'   => $data['details'] ?? json_encode($data),
            'payload'   => $payload,
            'hash'      => $hash,
            'timestamp' => now(),
        ]);
    }
}
