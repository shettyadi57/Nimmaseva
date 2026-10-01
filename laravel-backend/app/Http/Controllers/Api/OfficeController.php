<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Office;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    // ── GET /api/offices ──────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Office::query();

        if ($taluk = $request->query('taluk')) {
            $query->where('taluk', $taluk);
        }
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $offices = $query->orderBy('name')->get();

        return response()->json($offices->map(fn($o) => $this->format($o)));
    }

    // ── GET /api/offices/nearby?lat=&lng= ─────────────────────────────────────

    public function nearby(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $lat = (float) $request->query('lat');
        $lng = (float) $request->query('lng');

        // Haversine via raw SQL (portable across MySQL / SQLite)
        $offices = Office::selectRaw("
            *,
            (6371 * 2 * ASIN(SQRT(
                POWER(SIN(RADIANS(? - latitude) / 2), 2) +
                COS(RADIANS(latitude)) * COS(RADIANS(?)) *
                POWER(SIN(RADIANS(? - longitude) / 2), 2)
            ))) AS distance_km
        ", [$lat, $lat, $lng])
            ->orderBy('distance_km')
            ->limit(20)
            ->get();

        return response()->json($offices->map(function ($o) {
            $data = $this->format($o);
            $data['distance_km']        = round($o->distance_km, 2);
            $data['est_travel_time_mins'] = max(1, (int) ceil($o->distance_km * 3)); // ~20 km/h avg
            return $data;
        }));
    }

    // ── GET /api/offices/{id} ─────────────────────────────────────────────────

    public function show(int $id): JsonResponse
    {
        $office = Office::findOrFail($id);
        return response()->json($this->format($office));
    }

    // ── PUT /api/offices/{id}/status ──────────────────────────────────────────

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'server_status' => 'required|in:Active,Maintenance,Down',
        ]);

        $office = Office::findOrFail($id);
        $old    = $office->server_status;
        $office->update(['server_status' => $data['server_status']]);

        AuditLog::record('STATUS_CHANGE', $request->user()->full_name, [
            'details'   => "Office '{$office->name}' status: {$old} → {$data['server_status']}",
            'office_id' => $office->id,
            'old_status'=> $old,
            'new_status'=> $data['server_status'],
        ]);

        return response()->json($this->format($office));
    }

    // ── Shape helper (matches OfficeOut schema exactly) ───────────────────────

    private function format(Office $o): array
    {
        return [
            'id'                   => $o->id,
            'name'                 => $o->name,
            'type'                 => $o->type,
            'address'              => $o->address,
            'district'             => $o->district,
            'taluk'                => $o->taluk,
            'village'              => $o->village,
            'latitude'             => $o->latitude,
            'longitude'            => $o->longitude,
            'phone'                => $o->phone,
            'working_hours'        => $o->working_hours,
            'lunch_break'          => $o->lunch_break,
            'max_daily_tokens'     => $o->max_daily_tokens,
            'server_status'        => $o->server_status,
            'offline_range'        => $o->offline_range,
            'online_range'         => $o->online_range,
            'priority_range'       => $o->priority_range,
            'emergency_range'      => $o->emergency_range,
            'current_queue_count'  => $o->current_queue_count,
            'remaining_tokens'     => $o->remaining_tokens,
            'distance_km'          => null,
            'est_travel_time_mins' => null,
        ];
    }
}
