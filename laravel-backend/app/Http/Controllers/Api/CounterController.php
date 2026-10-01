<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CounterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CounterController extends Controller
{
    public function __construct(private readonly CounterService $counters) {}

    /**
     * GET /api/counters/{officeId}
     * Returns dynamic counter allocation matrix, queue congestion, and AI recommendations.
     */
    public function show(int $officeId): JsonResponse
    {
        return response()->json($this->counters->getDynamicCounterMatrix($officeId));
    }

    /**
     * POST /api/counters/{officeId}/allocate
     * Manually updates a counter's assigned services, operational mode, or status.
     */
    public function allocate(Request $request, int $officeId): JsonResponse
    {
        $data = $request->validate([
            'counter_number'        => 'required|integer|min:1|max:50',
            'counter_name'          => 'nullable|string|max:100',
            'operator_name'         => 'nullable|string|max:100',
            'status'                => 'nullable|string|in:Active,Break,Maintenance,Closed',
            'mode'                  => 'nullable|string|max:50',
            'assigned_service_ids'  => 'nullable|array',
            'assigned_service_ids.*'=> 'integer|min:1',
        ]);

        $userName = $request->user()?->full_name ?? 'Admin Operator';

        $matrix = $this->counters->updateCounterAllocation(
            $officeId,
            (int) $data['counter_number'],
            $data,
            $userName
        );

        return response()->json($matrix);
    }

    /**
     * POST /api/counters/{officeId}/auto-balance
     * One-click AI Dynamic Auto-Balancing: redistributes counters & pending queue to eliminate bottlenecks.
     */
    public function autoBalance(Request $request, int $officeId): JsonResponse
    {
        $userName = $request->user()?->full_name ?? 'Admin Dynamic Allocator';

        $result = $this->counters->autoBalanceCounters($officeId, $userName);

        return response()->json($result);
    }
}
