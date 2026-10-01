<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\QueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QueueController extends Controller
{
    public function __construct(private readonly QueueService $queue) {}

    // ── GET /api/queue/state/{officeId} ───────────────────────────────────────
    public function state(int $officeId): JsonResponse
    {
        return response()->json($this->queue->getStatePayload($officeId));
    }

    // ── POST /api/queue/{officeId}/control ────────────────────────────────────
    public function controlAction(Request $request, int $officeId): JsonResponse
    {
        $actor = $request->user()?->full_name ?? 'Admin Operator';
        $result = $this->queue->executeControlAction($officeId, $request->all(), $actor);
        return response()->json($result);
    }

    // ── POST /api/queue/call-next ─────────────────────────────────────────────
    public function callNext(Request $request): JsonResponse
    {
        $data = $request->validate([
            'office_id'      => 'required|integer|min:1',
            'counter_number' => 'required|integer|min:1|max:50',
        ]);
        $result = $this->queue->callNext(
            $data['office_id'],
            $data['counter_number'],
            $request->user()->full_name
        );
        return response()->json($result);
    }

    // ── POST /api/queue/skip ──────────────────────────────────────────────────
    public function skip(Request $request): JsonResponse
    {
        $data = $request->validate([
            'office_id'    => 'required|integer|min:1',
            'target_token' => 'required|string|max:20',
        ]);
        return response()->json(
            $this->queue->skip($data['office_id'], $data['target_token'], $request->user()->full_name)
        );
    }

    // ── POST /api/queue/recall ────────────────────────────────────────────────
    public function recall(Request $request): JsonResponse
    {
        $data = $request->validate(['office_id' => 'required|integer|min:1']);
        return response()->json($this->queue->recall($data['office_id'], $request->user()->full_name));
    }

    // ── POST /api/queue/complete ──────────────────────────────────────────────
    public function complete(Request $request): JsonResponse
    {
        $data = $request->validate([
            'office_id'    => 'required|integer|min:1',
            'target_token' => 'required|string|max:20',
        ]);
        return response()->json(
            $this->queue->complete($data['office_id'], $data['target_token'], $request->user()->full_name)
        );
    }

    // ── POST /api/queue/pause ─────────────────────────────────────────────────
    public function pause(Request $request): JsonResponse
    {
        $data = $request->validate([
            'office_id' => 'required|integer|min:1',
            'pause'     => 'required|boolean',
        ]);
        return response()->json(
            $this->queue->pause($data['office_id'], $data['pause'], $request->user()->full_name)
        );
    }

    // ── POST /api/queue/cancel ────────────────────────────────────────────────
    public function cancelToken(Request $request): JsonResponse
    {
        $data = $request->validate([
            'office_id'    => 'required|integer|min:1',
            'target_token' => 'required|string|max:20',
            'reason'       => 'nullable|string|max:200',
        ]);
        return response()->json(
            $this->queue->cancelToken(
                $data['office_id'],
                $data['target_token'],
                $data['reason'] ?? 'No reason provided',
                $request->user()->full_name
            )
        );
    }

    // ── POST /api/queue/transfer ──────────────────────────────────────────────
    public function transfer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'office_id'         => 'required|integer|min:1',
            'target_token'      => 'required|string|max:20',
            'transfer_office_id'=> 'required|integer|min:1',
        ]);
        return response()->json(
            $this->queue->transfer(
                $data['office_id'],
                $data['target_token'],
                $data['transfer_office_id'],
                $request->user()->full_name
            )
        );
    }
}
