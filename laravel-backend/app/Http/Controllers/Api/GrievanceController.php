<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grievance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GrievanceController extends Controller
{
    // ── POST /api/grievances ──────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'citizen_name' => 'required|string|min:2|max:100',
            'mobile'       => 'required|string|min:10|max:15',
            'token_number' => 'nullable|string|max:20',
            'center_name'  => 'required|string|max:150',
            'category'     => 'required|string|max:100',
            'description'  => 'required|string|min:20|max:2000',
        ]);

        $ticketId = 'GRV-' . strtoupper(Str::random(6));

        $grievance = Grievance::create(array_merge($data, [
            'ticket_id'    => $ticketId,
            'status'       => 'Submitted',
            'submitted_at' => now(),
        ]));

        return response()->json([
            'ticket_id'  => $grievance->ticket_id,
            'message'    => 'Grievance submitted successfully. Track with ticket ID: ' . $ticketId,
            'status'     => 'Submitted',
            'submitted_at'=> $grievance->submitted_at?->toIso8601String(),
        ], 201);
    }

    // ── GET /api/grievances/{ticketId} ────────────────────────────────────────
    public function show(string $ticketId): JsonResponse
    {
        $g = Grievance::where('ticket_id', strtoupper($ticketId))->firstOrFail();
        return response()->json($this->format($g));
    }

    // ── GET /api/grievances (admin) ───────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $q = Grievance::latest('submitted_at');

        if ($center = $request->query('center_name')) {
            $q->where('center_name', 'like', "%{$center}%");
        }
        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        return response()->json($q->paginate(50)->map(fn($g) => $this->format($g)));
    }

    // ── PUT /api/grievances/{id}/status (admin) ───────────────────────────────
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status'           => 'required|in:Submitted,Under Review,Investigation in Progress,Resolved,Rejected',
            'resolution_notes' => 'nullable|string|max:2000',
        ]);

        $g = Grievance::findOrFail($id);
        $g->update(array_merge($data, [
            'resolved_at' => in_array($data['status'], ['Resolved', 'Rejected']) ? now() : $g->resolved_at,
        ]));

        return response()->json($this->format($g->fresh()));
    }

    private function format(Grievance $g): array
    {
        return [
            'id'               => $g->id,
            'ticket_id'        => $g->ticket_id,
            'citizen_name'     => $g->citizen_name,
            'mobile'           => $g->mobile,
            'token_number'     => $g->token_number,
            'center_name'      => $g->center_name,
            'category'         => $g->category,
            'description'      => $g->description,
            'status'           => $g->status,
            'resolution_notes' => $g->resolution_notes,
            'submitted_at'     => $g->submitted_at?->toIso8601String(),
            'resolved_at'      => $g->resolved_at?->toIso8601String(),
        ];
    }
}
