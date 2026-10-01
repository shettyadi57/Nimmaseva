<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // ── GET /api/services ─────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Service::query();

        if ($cat = $request->query('category')) {
            $query->where('category', $cat);
        }
        if ($request->query('active_only') === 'true') {
            $query->where('is_active', true)->where('server_status', 'Active');
        }

        return response()->json(
            $query->orderBy('category')->orderBy('name')->get()->map(fn($s) => $this->format($s))
        );
    }

    // ── GET /api/services/{id} ────────────────────────────────────────────────

    public function show(int $id): JsonResponse
    {
        return response()->json($this->format(Service::findOrFail($id)));
    }

    // ── PUT /api/services/{id}/server-status ──────────────────────────────────

    public function updateServerStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'server_status' => 'required|in:Active,Maintenance,Down',
        ]);

        $service = Service::findOrFail($id);
        $old     = $service->server_status;
        $service->update(['server_status' => $data['server_status']]);

        AuditLog::record('STATUS_CHANGE', $request->user()->full_name, [
            'details'    => "Service '{$service->name}' server status: {$old} → {$data['server_status']}",
            'service_id' => $service->id,
            'old_status' => $old,
            'new_status' => $data['server_status'],
        ]);

        return response()->json($this->format($service));
    }

    // ── Shape helper (matches ServiceOut schema exactly) ──────────────────────

    private function format(Service $s): array
    {
        return [
            'id'                       => $s->id,
            'name'                     => $s->name,
            'code'                     => $s->code,
            'category'                 => $s->category,
            'fee'                      => $s->fee,
            'avg_processing_time_mins' => $s->avg_processing_time_mins,
            'daily_capacity'           => $s->daily_capacity,
            'is_active'                => $s->is_active,
            'server_status'            => $s->server_status,
            'required_documents'       => $s->required_documents ?? [],
            'description'              => $s->description,
        ];
    }
}
