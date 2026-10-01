<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Office;
use Illuminate\Http\JsonResponse;

class PublicController extends Controller
{
    // ── GET /api/public/stats ─────────────────────────────────────────────────
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_offices'   => Office::where('server_status', 'Active')->count(),
            'total_bookings'  => Booking::count(),
            'today_served'    => Booking::whereDate('booking_date', today('Asia/Kolkata'))
                                        ->where('status', 'Completed')->count(),
            'active_services' => \App\Models\Service::where('is_active', true)->count(),
        ]);
    }

    public function testNotification(): JsonResponse
    {
        return response()->json(['message' => 'Notification feature coming soon.']);
    }
}
