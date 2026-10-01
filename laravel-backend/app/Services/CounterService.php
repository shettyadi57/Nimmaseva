<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Office;
use App\Models\QueueState;
use App\Models\Service;
use Illuminate\Support\Facades\DB;

class CounterService
{
    private const DEFAULT_OPERATORS = [
        "Ramesh Kumar (Senior Operator)",
        "Sunita Patil (Govt Service Specialist)",
        "Anand Rao (Queue Coordinator)",
        "Pooja Hegde (Dynamic Support Desk)",
        "Manjunath B. (Express Counter Lead)"
    ];

    /**
     * Retrieve or initialize smart counter allocations for an office.
     */
    public function getOrInitCounterAllocations(int $officeId): array
    {
        $state = QueueState::firstOrCreate(
            ['office_id' => $officeId],
            [
                'current_token'    => 'None',
                'next_token'       => 'None',
                'active_counters'  => 4,
                'is_paused'        => false,
                'counter_allocations' => []
            ]
        );

        $allocations = $state->counter_allocations;
        if (!empty($allocations) && is_array($allocations)) {
            return $allocations;
        }

        $services = Service::where('is_active', true)->get();
        $serviceIds = $services->pluck('id')->toArray();
        $serviceMap = $services->pluck('name', 'id')->toArray();

        $s1 = array_values(array_filter($serviceIds, fn($id) => str_contains($serviceMap[$id] ?? '', 'Aadhaar') || str_contains($serviceMap[$id] ?? '', 'RTC')));
        if (empty($s1)) $s1 = array_slice($serviceIds, 0, 2);

        $s2 = array_values(array_filter($serviceIds, fn($id) => str_contains($serviceMap[$id] ?? '', 'Caste') || str_contains($serviceMap[$id] ?? '', 'Income')));
        if (empty($s2)) $s2 = array_slice($serviceIds, 2, 2);

        $s3 = array_values(array_filter($serviceIds, fn($id) => !in_array($id, $s1) && !in_array($id, $s2)));
        if (empty($s3)) $s3 = array_slice($serviceIds, 4, 2);

        $allocations = [
            [
                "counter_number"         => 1,
                "counter_name"           => "Counter 01 - Fast-Track Revenue & Identity",
                "operator_name"          => self::DEFAULT_OPERATORS[0],
                "status"                 => "Active",
                "mode"                   => "Dynamic Auto-Balance",
                "assigned_service_ids"   => $s1 ?: array_slice($serviceIds, 0, 2),
                "assigned_service_names" => array_map(fn($id) => $serviceMap[$id] ?? "Service #{$id}", $s1 ?: array_slice($serviceIds, 0, 2)),
                "is_overflow"            => false
            ],
            [
                "counter_number"         => 2,
                "counter_name"           => "Counter 02 - Certificates & Social Welfare",
                "operator_name"          => self::DEFAULT_OPERATORS[1],
                "status"                 => "Active",
                "mode"                   => "Dynamic Auto-Balance",
                "assigned_service_ids"   => $s2 ?: array_slice($serviceIds, 2, 2),
                "assigned_service_names" => array_map(fn($id) => $serviceMap[$id] ?? "Service #{$id}", $s2 ?: array_slice($serviceIds, 2, 2)),
                "is_overflow"            => false
            ],
            [
                "counter_number"         => 3,
                "counter_name"           => "Counter 03 - Utility & General Services",
                "operator_name"          => self::DEFAULT_OPERATORS[2],
                "status"                 => "Active",
                "mode"                   => "Dynamic Auto-Balance",
                "assigned_service_ids"   => $s3 ?: array_slice($serviceIds, 0, 1),
                "assigned_service_names" => array_map(fn($id) => $serviceMap[$id] ?? "Service #{$id}", $s3 ?: array_slice($serviceIds, 0, 1)),
                "is_overflow"            => false
            ],
            [
                "counter_number"         => 4,
                "counter_name"           => "Counter 04 - Smart Dynamic Overflow",
                "operator_name"          => self::DEFAULT_OPERATORS[3],
                "status"                 => "Active",
                "mode"                   => "Dynamic Auto-Balance",
                "assigned_service_ids"   => $serviceIds,
                "assigned_service_names" => ["All High-Demand Services (Auto-Balancing)"],
                "is_overflow"            => true
            ]
        ];

        $state->update([
            'counter_allocations' => $allocations,
            'active_counters'     => count($allocations),
        ]);

        return $allocations;
    }

    /**
     * Dynamically allocates an optimal active counter for a booking.
     * Balances citizen load across counters instead of burdening Counter 1.
     */
    public function allocateCounterForBooking(Office $office, Service $service, bool $isPriority): int
    {
        $allocations = $this->getOrInitCounterAllocations($office->id);
        $activeCounters = array_values(array_filter($allocations, fn($c) => ($c['status'] ?? 'Active') === 'Active'));

        if (empty($activeCounters)) {
            return 1;
        }

        $today = today('Asia/Kolkata')->toDateString();
        $pendingBookings = Booking::where('office_id', $office->id)
            ->where('booking_date', $today)
            ->whereIn('status', ['Pending', 'Skipped'])
            ->get();

        $loadPerCounter = [];
        foreach ($activeCounters as $c) {
            $cNum = (int) ($c['counter_number'] ?? 1);
            $loadPerCounter[$cNum] = 0;
        }

        foreach ($pendingBookings as $b) {
            $bCounter = (int) $b->counter_number;
            if (isset($loadPerCounter[$bCounter])) {
                $loadPerCounter[$bCounter]++;
            }
        }

        // 1. Priority citizen: route to Priority/Express or overflow counter
        if ($isPriority) {
            $overflow = array_filter($activeCounters, fn($c) => !empty($c['is_overflow']));
            if (!empty($overflow)) {
                $firstOverflow = reset($overflow);
                return (int) ($firstOverflow['counter_number'] ?? 4);
            }
            asort($loadPerCounter);
            return (int) array_key_first($loadPerCounter);
        }

        // 2. Match counter by assigned service ID
        $matching = array_filter($activeCounters, function ($c) use ($service) {
            $assigned = $c['assigned_service_ids'] ?? [];
            return in_array($service->id, $assigned);
        });

        if (!empty($matching)) {
            usort($matching, fn($a, $b) => ($loadPerCounter[$a['counter_number']] ?? 0) <=> ($loadPerCounter[$b['counter_number']] ?? 0));
            return (int) $matching[0]['counter_number'];
        }

        // 3. Fallback to Dynamic Auto-Balance / Overflow counters
        $autoBalance = array_filter($activeCounters, function ($c) {
            return ($c['mode'] ?? '') === 'Dynamic Auto-Balance' || !empty($c['is_overflow']);
        });

        if (!empty($autoBalance)) {
            $autoBalance = array_values($autoBalance);
            usort($autoBalance, fn($a, $b) => ($loadPerCounter[$a['counter_number']] ?? 0) <=> ($loadPerCounter[$b['counter_number']] ?? 0));
            return (int) $autoBalance[0]['counter_number'];
        }

        asort($loadPerCounter);
        return (int) array_key_first($loadPerCounter);
    }

    /**
     * Returns full dynamic counter matrix with queue congestion analytics and AI recommendations.
     */
    public function getDynamicCounterMatrix(int $officeId): array
    {
        $today = today('Asia/Kolkata')->toDateString();
        $office = Office::find($officeId);
        $officeName = $office ? $office->name : "Office #{$officeId}";

        $allocations = $this->getOrInitCounterAllocations($officeId);
        $services = Service::where('is_active', true)->get();
        $serviceMap = $services->keyBy('id');

        $pendingBookings = Booking::where('office_id', $officeId)
            ->where('booking_date', $today)
            ->whereIn('status', ['Pending', 'Skipped', 'Called', 'In Progress', 'Approaching Counter'])
            ->get();

        $serviceQueueCounts = [];
        $counterCurrentTokens = [];

        foreach ($pendingBookings as $b) {
            if (in_array($b->status, ['Pending', 'Skipped'])) {
                $serviceQueueCounts[$b->service_id] = ($serviceQueueCounts[$b->service_id] ?? 0) + 1;
            }
            if (in_array($b->status, ['Called', 'In Progress', 'Approaching Counter']) && $b->counter_number) {
                $counterCurrentTokens[$b->counter_number] = $b->token_number;
            }
        }

        $congestionList = [];
        $congestedServices = [];

        foreach ($services as $s) {
            $pCount = $serviceQueueCounts[$s->id] ?? 0;
            $allocatedCount = 0;

            foreach ($allocations as $c) {
                if (($c['status'] ?? 'Active') === 'Active') {
                    $assigned = $c['assigned_service_ids'] ?? [];
                    $mode = $c['mode'] ?? '';
                    if (in_array($s->id, $assigned) || in_array($mode, ['Dynamic Auto-Balance', 'Universal'])) {
                        $allocatedCount++;
                    }
                }
            }
            $allocatedCount = max(1, $allocatedCount);
            $totalWait = (int) ceil(($pCount / $allocatedCount) * ($s->avg_processing_time_mins ?: 15));

            $level = 'Normal';
            if ($pCount >= 5 || $totalWait >= 40) {
                $level = 'High Congestion';
                $congestedServices[] = [$s, $pCount, $totalWait];
            } elseif ($pCount >= 2) {
                $level = 'Moderate';
            }

            $congestionList[] = [
                'service_id'         => $s->id,
                'service_name'       => $s->name,
                'pending_count'      => $pCount,
                'avg_processing_mins'=> $s->avg_processing_time_mins ?: 15,
                'total_wait_mins'    => $totalWait,
                'allocated_counters' => $allocatedCount,
                'congestion_level'   => $level,
            ];
        }

        $counterItems = [];
        foreach ($allocations as $c) {
            $cNum = (int) ($c['counter_number'] ?? 1);
            $assignedSids = $c['assigned_service_ids'] ?? [];

            $cQueue = 0;
            if (($c['mode'] ?? '') === 'Dynamic Auto-Balance' && !empty($c['is_overflow'])) {
                $cQueue = array_sum($serviceQueueCounts);
            } else {
                foreach ($assignedSids as $sid) {
                    $cQueue += ($serviceQueueCounts[$sid] ?? 0);
                }
            }

            $cWait = (int) (($cQueue * 15) / max(1, count($assignedSids)));
            $assignedNames = [];
            foreach ($assignedSids as $sid) {
                if (isset($serviceMap[$sid])) {
                    $assignedNames[] = $serviceMap[$sid]->name;
                }
            }
            if (!empty($c['is_overflow'])) {
                $assignedNames = ["Dynamic Overflow (Auto-Balances Congested Queues)"];
            }

            $counterItems[] = [
                'counter_number'        => $cNum,
                'counter_name'          => $c['counter_name'] ?? "Counter 0{$cNum}",
                'operator_name'         => $c['operator_name'] ?? "Operator #{$cNum}",
                'status'                => $c['status'] ?? 'Active',
                'mode'                  => $c['mode'] ?? 'Dynamic Auto-Balance',
                'assigned_service_ids'  => $assignedSids,
                'assigned_service_names'=> $assignedNames,
                'current_token'         => $counterCurrentTokens[$cNum] ?? 'Ready / Idle',
                'queue_count'           => $cQueue,
                'estimated_wait_mins'   => $cWait,
                'is_overflow'           => !empty($c['is_overflow']),
            ];
        }

        $totalSaved = 15;
        if (!empty($congestedServices)) {
            usort($congestedServices, fn($a, $b) => $b[1] <=> $a[1]);
            $worst = $congestedServices[0];
            $worstS = $worst[0];
            $worstCount = $worst[1];
            $worstWait = $worst[2];
            $aiRec = "⚡ CONGESTION ALERT: '{$worstS->name}' has {$worstCount} citizens waiting (~{$worstWait} mins). Dynamic Auto-Balancing allocates Counter 04 & overflow lanes to cut citizen wait time by up to 65%!";
            $totalSaved = $worstCount * 25;
        } else {
            $aiRec = "🟢 ALL COUNTERS BALANCED: Citizen flow is optimal across all services with low wait times.";
        }

        usort($congestionList, fn($a, $b) => $b['pending_count'] <=> $a['pending_count']);

        return [
            'office_id'                   => $officeId,
            'office_name'                 => $officeName,
            'total_active_counters'       => count(array_filter($counterItems, fn($c) => $c['status'] === 'Active')),
            'total_pending_queue'         => array_sum($serviceQueueCounts),
            'counters'                    => $counterItems,
            'service_congestion'          => $congestionList,
            'ai_recommendation'           => $aiRec,
            'total_time_saved_today_mins' => $totalSaved,
        ];
    }

    /**
     * Updates configuration for a single counter.
     */
    public function updateCounterAllocation(int $officeId, int $counterNumber, array $data, string $userName): array
    {
        $state = QueueState::where('office_id', $officeId)->first();
        $allocations = $this->getOrInitCounterAllocations($officeId);
        $services = Service::where('is_active', true)->get()->keyBy('id');

        $updated = false;
        foreach ($allocations as &$c) {
            if (($c['counter_number'] ?? null) == $counterNumber) {
                if (isset($data['counter_name'])) $c['counter_name'] = $data['counter_name'];
                if (isset($data['operator_name'])) $c['operator_name'] = $data['operator_name'];
                if (isset($data['status'])) $c['status'] = $data['status'];
                if (isset($data['mode'])) $c['mode'] = $data['mode'];
                if (isset($data['assigned_service_ids'])) {
                    $c['assigned_service_ids'] = $data['assigned_service_ids'];
                    $c['assigned_service_names'] = array_map(fn($id) => $services[$id]->name ?? "Service #{$id}", $data['assigned_service_ids']);
                }
                $updated = true;
                break;
            }
        }

        if ($updated && $state) {
            $state->update(['counter_allocations' => $allocations]);
            AuditLog::record('COUNTER_REALLOCATED', $userName, [
                'details'        => "Office #{$officeId} Counter {$counterNumber} reconfigured",
                'office_id'      => $officeId,
                'counter_number' => $counterNumber,
            ]);
        }

        return $this->getDynamicCounterMatrix($officeId);
    }

    /**
     * One-click AI Dynamic Auto-Balancing across counters.
     */
    public function autoBalanceCounters(int $officeId, string $userName): array
    {
        $today = today('Asia/Kolkata')->toDateString();
        $state = QueueState::where('office_id', $officeId)->first();
        $allocations = $this->getOrInitCounterAllocations($officeId);
        $services = Service::where('is_active', true)->get();
        $serviceMap = $services->keyBy('id');

        $pendingBookings = Booking::where('office_id', $officeId)
            ->where('booking_date', $today)
            ->whereIn('status', ['Pending', 'Skipped'])
            ->get();

        $counts = [];
        foreach ($pendingBookings as $b) {
            $counts[$b->service_id] = ($counts[$b->service_id] ?? 0) + 1;
        }

        $sortedServices = $services->sortByDesc(fn($s) => $counts[$s->id] ?? 0)->values();
        $reallocatedCount = 0;

        if ($sortedServices->isNotEmpty() && array_sum($counts) > 0) {
            $heaviestS = $sortedServices[0];
            $secondS = $sortedServices->count() > 1 ? $sortedServices[1] : $heaviestS;

            $allocations[0]['assigned_service_ids'] = [$heaviestS->id];
            $allocations[0]['assigned_service_names'] = [$heaviestS->name];
            $allocations[0]['mode'] = 'Dynamic Focus';
            $allocations[0]['status'] = 'Active';

            if (count($allocations) > 1) {
                $allocations[1]['assigned_service_ids'] = [$secondS->id];
                $allocations[1]['assigned_service_names'] = [$secondS->name];
                $allocations[1]['mode'] = 'Dynamic Focus';
                $allocations[1]['status'] = 'Active';
            }

            if (count($allocations) > 2) {
                $remaining = $sortedServices->slice(2)->pluck('id')->toArray();
                if (empty($remaining)) $remaining = $services->pluck('id')->toArray();
                $allocations[2]['assigned_service_ids'] = $remaining;
                $allocations[2]['assigned_service_names'] = array_map(fn($id) => $serviceMap[$id]->name ?? "Service #{$id}", $remaining);
                $allocations[2]['mode'] = 'Dynamic Auto-Balance';
                $allocations[2]['status'] = 'Active';
            }

            if (count($allocations) > 3) {
                $allocations[3]['assigned_service_ids'] = [$heaviestS->id, $secondS->id];
                $allocations[3]['assigned_service_names'] = ["⚡ Dynamic Overflow Support: {$heaviestS->name}"];
                $allocations[3]['mode'] = 'Dynamic Auto-Balance';
                $allocations[3]['status'] = 'Active';
                $allocations[3]['is_overflow'] = true;
            }

            $reallocatedCount = count($allocations);
        }

        if ($state) {
            $state->update(['counter_allocations' => $allocations]);
        }

        $office = Office::find($officeId);
        // Rebalance pending bookings across newly configured counters
        foreach ($pendingBookings as $b) {
            if ($office && $b->service) {
                $b->update([
                    'counter_number' => $this->allocateCounterForBooking($office, $b->service, (bool) $b->is_priority)
                ]);
            }
        }

        $savedEstimate = array_sum($counts) * 20;

        AuditLog::record('DYNAMIC_COUNTERS_AUTO_BALANCED', $userName, [
            'details'   => "Office #{$officeId} dynamically rebalanced across {$reallocatedCount} counters. Est. saved: {$savedEstimate} mins.",
            'office_id' => $officeId,
        ]);

        $matrix = $this->getDynamicCounterMatrix($officeId);

        return [
            'office_id'               => $officeId,
            'message'                 => "Successfully rebalanced {$reallocatedCount} counters dynamically to eliminate service bottlenecks!",
            'estimated_minutes_saved' => $savedEstimate,
            'counters'                => $matrix['counters'],
            'reallocated_count'       => $reallocatedCount,
        ];
    }
}
