<?php

namespace App\Services;

use App\Models\Booking;
use Carbon\Carbon;

/**
 * PredictionService — Tatkal Wait Prediction Algorithm (matches FastAPI logic).
 *
 * Estimated Wait (mins) = (queue_ahead / active_counters) * avg_processing_time_mins
 * Probability (%)       = max(5, 100 - (wait / mins_remaining * 100))
 */
class PredictionService
{
    /**
     * Enrich a Booking with predictive wait-time fields.
     *
     * @return array{
     *   people_ahead: int,
     *   avg_wait_mins: int,
     *   estimated_wait_mins: int,
     *   estimated_call_time: string,
     *   service_processing_mins: int,
     *   total_estimated_duration_mins: int,
     *   estimated_completion_time: string,
     *   time_saved_by_dynamic_allocation_mins: int,
     *   active_counters_for_service: int,
     *   tatkal_probability: int,
     * }
     */
    public function computeForBooking(Booking $booking): array
    {
        $today         = today('Asia/Kolkata')->toDateString();
        $avgMins       = $booking->service?->avg_processing_time_mins ?? 15;

        // How many tokens are ahead (lower token number, still pending/called)
        $myNum         = (int) explode('-', $booking->token_number)[1];
        $activeCounters = max(1, $booking->office?->queueState?->active_counters ?? 3);

        $peopleAhead   = Booking::where('office_id', $booking->office_id)
            ->where('booking_date', $today)
            ->whereIn('status', ['Pending', 'Called', 'In Progress'])
            ->whereRaw("CAST(SUBSTRING_INDEX(token_number, '-', -1) AS UNSIGNED) < ?", [$myNum])
            ->count();

        $estimatedWait     = (int) ceil(($peopleAhead / $activeCounters) * $avgMins);
        $totalDuration     = $estimatedWait + $avgMins;

        $now               = now('Asia/Kolkata');
        $callTime          = $now->copy()->addMinutes($estimatedWait)->format('h:i A');
        $completionTime    = $now->copy()->addMinutes($totalDuration)->format('h:i A');

        // Probability
        $officeClose       = $now->copy()->setHour(17)->setMinute(0)->setSecond(0);
        $minsRemaining     = max(1, $now->diffInMinutes($officeClose, false));
        $probability       = $minsRemaining <= 0
            ? 5
            : max(5, (int) round(100 - ($estimatedWait / $minsRemaining * 100)));

        // Rough time saved: compare single-counter vs multi-counter scenario
        $timeSaved = max(0, $peopleAhead * $avgMins - $estimatedWait);

        return [
            'people_ahead'                         => $peopleAhead,
            'avg_wait_mins'                        => $avgMins,
            'estimated_wait_mins'                  => $estimatedWait,
            'estimated_call_time'                  => $callTime,
            'service_processing_mins'              => $avgMins,
            'total_estimated_duration_mins'        => $totalDuration,
            'estimated_completion_time'            => $completionTime,
            'time_saved_by_dynamic_allocation_mins'=> $timeSaved,
            'active_counters_for_service'          => $activeCounters,
            'tatkal_probability'                   => $probability,
        ];
    }
}
