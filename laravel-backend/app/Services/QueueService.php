<?php

namespace App\Services;

use App\Events\QueueUpdated;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Office;
use App\Models\QueueState;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * QueueService — handles all counter queue state transitions and broadcasts.
 *
 * Priority call order:
 *  1. Emergency  (91-100)
 *  2. Priority   (81-90)
 *  3. Online / Walk-in in token-number order
 */
class QueueService
{
    public function __construct(private readonly PredictionService $prediction) {}

    // ── State helpers ──────────────────────────────────────────────────────────

    public function getState(int $officeId): QueueState
    {
        return QueueState::firstOrCreate(
            ['office_id' => $officeId],
            ['active_counters' => 3, 'is_paused' => false]
        );
    }

    public function getStatePayload(int $officeId): array
    {
        $state = $this->getState($officeId);

        $totalWaiting = Booking::where('office_id', $officeId)
            ->whereDate('booking_date', today('Asia/Kolkata'))
            ->whereIn('status', ['Pending', 'Called', 'In Progress', 'Approaching Counter'])
            ->count();

        $completedToday = Booking::where('office_id', $officeId)
            ->whereDate('booking_date', today('Asia/Kolkata'))
            ->where('status', 'Completed')
            ->count();

        return [
            'office_id'             => $state->office_id,
            'current_token'         => $state->current_token ?? 'None',
            'next_token'            => $state->next_token    ?? 'None',
            'active_counters'       => $state->active_counters,
            'is_paused'             => $state->is_paused,
            'total_waiting'         => $totalWaiting,
            'total_completed_today' => $completedToday,
            'updated_at'            => $state->updated_at?->toIso8601String(),
        ];
    }

    // ── Priority-aware next booking selector ───────────────────────────────────

    private function nextPendingBooking(int $officeId): ?Booking
    {
        $today = today('Asia/Kolkata')->toDateString();

        // 1. Emergency tokens (91-100 range)
        $emergency = Booking::where('office_id', $officeId)
            ->where('booking_date', $today)
            ->where('status', 'Pending')
            ->where(fn($q) => $q->where('priority_reason', 'like', '%Emergency%')
                               ->orWhere('is_priority', true))
            ->orderByRaw("CAST(SUBSTRING_INDEX(token_number, '-', -1) AS UNSIGNED)")
            ->first();

        if ($emergency) {
            return $emergency;
        }

        // 2. All pending by token number order
        return Booking::where('office_id', $officeId)
            ->where('booking_date', $today)
            ->where('status', 'Pending')
            ->orderByRaw("CAST(SUBSTRING_INDEX(token_number, '-', -1) AS UNSIGNED)")
            ->first();
    }

    // ── Queue actions ──────────────────────────────────────────────────────────

    public function callNext(int $officeId, int $counter, string $actor): array
    {
        return DB::transaction(function () use ($officeId, $counter, $actor) {
            $state = $this->getState($officeId);

            if ($state->is_paused) {
                throw ValidationException::withMessages(['queue' => 'Queue is paused. Resume first.']);
            }

            $next = $this->nextPendingBooking($officeId);

            if (! $next) {
                throw ValidationException::withMessages(['queue' => 'No pending tokens in queue.']);
            }

            // Mark previous token as completed if still "Called"
            if ($state->current_token && $state->current_token !== 'None') {
                Booking::where('office_id', $officeId)
                    ->where('token_number', $state->current_token)
                    ->whereIn('status', ['Called', 'In Progress'])
                    ->update(['status' => 'Completed', 'counter_number' => $counter]);
            }

            $next->update(['status' => 'Called', 'counter_number' => $counter]);

            // Peek next-next
            $afterNext = Booking::where('office_id', $officeId)
                ->where('booking_date', today('Asia/Kolkata')->toDateString())
                ->where('status', 'Pending')
                ->where('id', '!=', $next->id)
                ->orderByRaw("CAST(SUBSTRING_INDEX(token_number, '-', -1) AS UNSIGNED)")
                ->first();

            $state->update([
                'current_token' => $next->token_number,
                'next_token'    => $afterNext?->token_number ?? 'None',
            ]);

            AuditLog::record('CALL_TOKEN', $actor, [
                'details'        => "Called token {$next->token_number} at counter {$counter}",
                'office_id'      => $officeId,
                'token_number'   => $next->token_number,
                'counter_number' => $counter,
            ]);

            $payload = $this->getStatePayload($officeId);
            broadcast(new QueueUpdated($officeId, $payload));

            return $payload;
        });
    }

    public function skip(int $officeId, string $targetToken, string $actor): array
    {
        return DB::transaction(function () use ($officeId, $targetToken, $actor) {
            $booking = Booking::where('office_id', $officeId)
                ->where('token_number', $targetToken)
                ->whereIn('status', ['Pending', 'Called'])
                ->firstOrFail();

            $booking->update(['status' => 'Skipped']);

            AuditLog::record('SKIP_TOKEN', $actor, [
                'details'      => "Skipped token {$targetToken}",
                'office_id'    => $officeId,
                'token_number' => $targetToken,
            ]);

            $payload = $this->getStatePayload($officeId);
            broadcast(new QueueUpdated($officeId, $payload));
            return $payload;
        });
    }

    public function recall(int $officeId, string $actor): array
    {
        $state = $this->getState($officeId);
        AuditLog::record('RECALL_TOKEN', $actor, [
            'details'  => "Recalled current token {$state->current_token}",
            'office_id'=> $officeId,
        ]);

        $payload = $this->getStatePayload($officeId);
        broadcast(new QueueUpdated($officeId, $payload));
        return $payload;
    }

    public function complete(int $officeId, string $targetToken, string $actor): array
    {
        return DB::transaction(function () use ($officeId, $targetToken, $actor) {
            $booking = Booking::where('office_id', $officeId)
                ->where('token_number', $targetToken)
                ->firstOrFail();

            $booking->update(['status' => 'Completed']);

            AuditLog::record('COMPLETE_TOKEN', $actor, [
                'details'      => "Completed token {$targetToken}",
                'office_id'    => $officeId,
                'token_number' => $targetToken,
            ]);

            $payload = $this->getStatePayload($officeId);
            broadcast(new QueueUpdated($officeId, $payload));
            return $payload;
        });
    }

    public function pause(int $officeId, bool $pause, string $actor): array
    {
        $state = $this->getState($officeId);
        $state->update(['is_paused' => $pause]);

        AuditLog::record($pause ? 'PAUSE_QUEUE' : 'RESUME_QUEUE', $actor, [
            'details'  => $pause ? 'Queue paused' : 'Queue resumed',
            'office_id'=> $officeId,
        ]);

        $payload = $this->getStatePayload($officeId);
        broadcast(new QueueUpdated($officeId, $payload));
        return $payload;
    }

    public function cancelToken(int $officeId, string $targetToken, string $reason, string $actor): array
    {
        return DB::transaction(function () use ($officeId, $targetToken, $reason, $actor) {
            $booking = Booking::where('office_id', $officeId)
                ->where('token_number', $targetToken)
                ->firstOrFail();

            $booking->update(['status' => 'Cancelled']);

            AuditLog::record('CANCEL_TOKEN', $actor, [
                'details'      => "Cancelled token {$targetToken}. Reason: {$reason}",
                'office_id'    => $officeId,
                'token_number' => $targetToken,
                'reason'       => $reason,
            ]);

            $payload = $this->getStatePayload($officeId);
            broadcast(new QueueUpdated($officeId, $payload));
            return $payload;
        });
    }

    public function transfer(int $officeId, string $targetToken, int $toOfficeId, string $actor): array
    {
        return DB::transaction(function () use ($officeId, $targetToken, $toOfficeId, $actor) {
            $booking = Booking::where('office_id', $officeId)
                ->where('token_number', $targetToken)
                ->firstOrFail();

            $booking->update(['status' => 'Transferred', 'office_id' => $toOfficeId]);

            AuditLog::record('TRANSFER_TOKEN', $actor, [
                'details'        => "Transferred token {$targetToken} to office {$toOfficeId}",
                'from_office_id' => $officeId,
                'to_office_id'   => $toOfficeId,
                'token_number'   => $targetToken,
            ]);

            $payload = $this->getStatePayload($officeId);
            broadcast(new QueueUpdated($officeId, $payload));
            return $payload;
        });
    }
}
