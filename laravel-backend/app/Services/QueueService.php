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
    public function __construct(
        private readonly PredictionService $prediction,
        private readonly CounterService $counters
    ) {}

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
            'updated_at'            => $state->updated_at?->toIso8601String() ?? now()->toIso8601String(),
        ];
    }

    // ── Dynamic Counter & Priority Next Booking Selector ────────────────────────

    private function nextPendingBooking(int $officeId, int $counter = 1, ?string $targetToken = null): ?Booking
    {
        $today = today('Asia/Kolkata')->toDateString();

        // 0. If specific target token requested
        if ($targetToken) {
            $target = Booking::where('office_id', $officeId)
                ->where('token_number', $targetToken)
                ->where('booking_date', $today)
                ->whereIn('status', ['Pending', 'Skipped'])
                ->first();
            if ($target) return $target;
        }

        // Fetch counter allocation configuration
        $allocations = $this->counters->getOrInitCounterAllocations($officeId);
        $counterConf = collect($allocations)->firstWhere('counter_number', $counter);
        $assignedServices = $counterConf['assigned_service_ids'] ?? [];
        $isOverflow = !empty($counterConf['is_overflow']);

        // 1. Pending booking explicitly pre-allocated to this counter
        $allocatedBooking = Booking::where('office_id', $officeId)
            ->where('booking_date', $today)
            ->where('status', 'Pending')
            ->where('counter_number', $counter)
            ->orderBy('is_priority', 'desc')
            ->orderByRaw("CAST(SUBSTRING_INDEX(token_number, '-', -1) AS UNSIGNED)")
            ->first();

        if ($allocatedBooking) {
            return $allocatedBooking;
        }

        // 2. Pending booking matching this counter's assigned services
        if (!empty($assignedServices) && !$isOverflow) {
            $serviceBooking = Booking::where('office_id', $officeId)
                ->where('booking_date', $today)
                ->where('status', 'Pending')
                ->whereIn('service_id', $assignedServices)
                ->orderBy('is_priority', 'desc')
                ->orderByRaw("CAST(SUBSTRING_INDEX(token_number, '-', -1) AS UNSIGNED)")
                ->first();

            if ($serviceBooking) {
                return $serviceBooking;
            }
        }

        // 3. Fallback: Emergency & Priority
        $priorityBooking = Booking::where('office_id', $officeId)
            ->where('booking_date', $today)
            ->where('status', 'Pending')
            ->where(fn($q) => $q->where('priority_reason', 'like', '%Emergency%')
                               ->orWhere('is_priority', true))
            ->orderByRaw("CAST(SUBSTRING_INDEX(token_number, '-', -1) AS UNSIGNED)")
            ->first();

        if ($priorityBooking) {
            return $priorityBooking;
        }

        // 4. Any pending booking in order
        return Booking::where('office_id', $officeId)
            ->where('booking_date', $today)
            ->where('status', 'Pending')
            ->orderByRaw("CAST(SUBSTRING_INDEX(token_number, '-', -1) AS UNSIGNED)")
            ->first();
    }

    // ── Queue actions ──────────────────────────────────────────────────────────

    public function callNext(int $officeId, int $counter, string $actor, ?string $targetToken = null): array
    {
        return DB::transaction(function () use ($officeId, $counter, $actor, $targetToken) {
            $state = $this->getState($officeId);

            if ($state->is_paused) {
                throw ValidationException::withMessages(['queue' => 'Queue is paused. Resume first.']);
            }

            $next = $this->nextPendingBooking($officeId, $counter, $targetToken);

            if (! $next) {
                throw ValidationException::withMessages(['queue' => 'No pending tokens in queue for this counter.']);
            }

            // Mark previous token as completed if still "Called"
            if ($state->current_token && $state->current_token !== 'None') {
                Booking::where('office_id', $officeId)
                    ->where('token_number', $state->current_token)
                    ->whereIn('status', ['Called', 'In Progress'])
                    ->update(['status' => 'Completed', 'counter_number' => $counter]);
            }

            $next->update(['status' => 'Called', 'counter_number' => $counter]);

            // Peek next-next candidate
            $afterNext = $this->nextPendingBooking($officeId, $counter);

            $state->update([
                'current_token' => $next->token_number,
                'next_token'    => ($afterNext && $afterNext->id !== $next->id) ? $afterNext->token_number : 'None',
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

    /**
     * Unified controller action executor matching FastAPI POST /queue/{office_id}/control
     */
    public function executeControlAction(int $officeId, array $data, string $actor): array
    {
        $action = $data['action'] ?? 'call_next';
        $counter = (int) ($data['counter_number'] ?? 1);
        $targetToken = $data['target_token'] ?? null;
        $transferOfficeId = isset($data['transfer_office_id']) ? (int) $data['transfer_office_id'] : null;

        return match ($action) {
            'call_next' => $this->callNext($officeId, $counter, $actor, $targetToken),
            'complete'  => $this->complete($officeId, $targetToken ?? ($this->getState($officeId)->current_token ?? ''), $actor),
            'skip'      => $this->skip($officeId, $targetToken ?? ($this->getState($officeId)->current_token ?? ''), $actor),
            'recall'    => $this->callNext($officeId, $counter, $actor, $targetToken ?? ($this->getState($officeId)->current_token ?? '')),
            'pause'     => $this->pause($officeId, true, $actor),
            'resume'    => $this->pause($officeId, false, $actor),
            'cancel'    => $this->cancelToken($officeId, $targetToken ?? '', $data['reason'] ?? 'Cancelled by operator', $actor),
            'transfer'  => $transferOfficeId && $targetToken ? $this->transfer($officeId, $targetToken, $transferOfficeId, $actor) : $this->getStatePayload($officeId),
            default     => $this->getStatePayload($officeId),
        };
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
