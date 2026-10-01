<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // ── GET /api/admin/audit-logs ─────────────────────────────────────────────
    public function auditLogs(Request $request): JsonResponse
    {
        $q = AuditLog::latest('timestamp');

        if ($action = $request->query('action')) {
            $q->where('action', $action);
        }
        if ($actor = $request->query('actor')) {
            $q->where('user_name', 'like', "%{$actor}%");
        }

        $logs = $q->paginate(100);

        return response()->json([
            'items' => $logs->map(fn($l) => [
                'id'        => $l->id,
                'user_name' => $l->user_name,
                'action'    => $l->action,
                'details'   => $l->details,
                'timestamp' => $l->timestamp?->toIso8601String(),
            ]),
            'total' => $logs->total(),
        ]);
    }

    // ── GET /api/admin/users ──────────────────────────────────────────────────
    public function users(Request $request): JsonResponse
    {
        $users = User::with('roles')
            ->when($request->query('role'), fn($q, $role) => $q->role($role))
            ->orderBy('full_name')
            ->paginate(50);

        return response()->json([
            'items' => $users->map(fn($u) => [
                'id'        => $u->id,
                'full_name' => $u->full_name,
                'email'     => $u->email,
                'role'      => $u->getRoleNames()->first() ?? 'citizen',
                'is_active' => $u->is_active,
                'office_id' => $u->office_id,
                'created_at'=> $u->created_at?->toIso8601String(),
            ]),
            'total' => $users->total(),
        ]);
    }

    // ── PUT /api/admin/users/{id}/role ────────────────────────────────────────
    public function updateRole(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'role' => 'required|in:citizen,operator,office_admin,district_admin,auditor',
        ]);

        $user = User::findOrFail($id);
        $user->syncRoles([$data['role']]);

        AuditLog::record('ROLE_CHANGE', $request->user()->full_name, [
            'details'     => "User {$user->full_name} role → {$data['role']}",
            'target_user' => $user->id,
            'new_role'    => $data['role'],
        ]);

        return response()->json(['message' => 'Role updated.', 'role' => $data['role']]);
    }
}
