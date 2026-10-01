<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Broadcast over Reverb WebSocket channel ws/queue/{officeId}
 * This is equivalent to the FastAPI WebSocket manager broadcast.
 */
class QueueUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int   $officeId,
        public readonly array $payload,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("queue.{$this->officeId}");
    }

    public function broadcastAs(): string
    {
        return 'QUEUE_UPDATE';
    }

    public function broadcastWith(): array
    {
        return array_merge($this->payload, [
            'type'      => 'QUEUE_UPDATE',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
