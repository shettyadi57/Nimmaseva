<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Office;
use App\Models\Service;
use App\Services\PdfService;
use App\Services\PredictionService;
use App\Services\TokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function __construct(
        private readonly TokenService      $tokens,
        private readonly PredictionService $prediction,
        private readonly PdfService        $pdf,
        private readonly CounterService    $counters,
    ) {}

    // ── POST /api/bookings ────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'citizen_name'   => 'required|string|min:2|max:100',
            'phone'          => 'required|string|min:10|max:15',
            'aadhaar'        => 'required|string|min:12|max:20',
            'age'            => 'required|integer|min:1|max:120',
            'gender'         => 'required|string|max:20',
            'is_priority'    => 'boolean',
            'priority_reason'=> 'nullable|string|max:100',
            'booking_type'   => 'string|max:20',
            'office_id'      => 'required|integer|min:1',
            'service_id'     => 'required|integer|min:1',
        ]);

        $office  = Office::findOrFail($data['office_id']);
        $service = Service::findOrFail($data['service_id']);

        // Operating hours guard (IST)
        $this->enforceHours($office);

        // Service availability guard
        if ($service->server_status === 'Down') {
            return response()->json([
                'detail' => "Service '{$service->name}' is currently down. Please visit again later.",
            ], 503);
        }

        $isPriority    = (bool) ($data['is_priority'] ?? false);
        $priorityReason= $data['priority_reason'] ?? '';
        $bookingType   = $data['booking_type'] ?? 'Online';

        // Auto-detect priority: age 60+ → Senior Citizen
        if ($data['age'] >= 60 && ! $isPriority) {
            $isPriority     = true;
            $priorityReason = 'Senior Citizen (60+)';
        }

        // Allocate token (inside DB transaction)
        $tokenNumber = $this->tokens->allocate($office, $service, $isPriority, $priorityReason, $bookingType);
        $tokenNum    = (int) explode('-', $tokenNumber)[1];

        $visitDate   = $this->tokens->getVisitDate();
        $visitTime   = $this->tokens->getVisitTimeSlot($tokenNum, $service->avg_processing_time_mins);
        $verifCode   = $this->tokens->generateVerificationCode();
        $signedToken = $this->tokens->generateSignedAccessToken();

        $phone = preg_replace('/\D/', '', $data['phone']);

        // Allocate counter dynamically across active desks
        $allocatedCounter = $this->counters->allocateCounterForBooking($office, $service, $isPriority);

        $booking = new Booking([
            'token_number'        => $tokenNumber,
            'verification_code'   => $verifCode,
            'citizen_name'        => strip_tags($data['citizen_name']),
            'age'                 => $data['age'],
            'gender'              => $data['gender'],
            'is_priority'         => $isPriority,
            'priority_reason'     => $priorityReason ?: null,
            'booking_type'        => $bookingType,
            'office_id'           => $office->id,
            'service_id'          => $service->id,
            'booking_date'        => today('Asia/Kolkata')->toDateString(),
            'visit_date'          => $visitDate->toDateString(),
            'visit_time'          => $visitTime,
            'counter_number'      => $allocatedCounter,
            'status'              => 'Pending',
            'amount_paid'         => $service->fee,
            'signed_access_token' => $signedToken,
        ]);

        $booking->setPhoneAttribute($phone);
        $booking->setAadhaarAttribute($data['aadhaar']);
        $booking->save();

        $booking->load(['office', 'service']);

        $prediction = $this->prediction->computeForBooking($booking);
        $booking->update(['tatkal_probability' => $prediction['tatkal_probability']]);

        $qrUrl = $this->pdf->getQrDataUrl($booking);

        return response()->json($this->format($booking, $prediction, $qrUrl), 201);
    }

    // ── GET /api/bookings (operator: list for office + date) ─────────────────

    public function index(Request $request): JsonResponse
    {
        $q = Booking::with(['office', 'service'])->latest();

        if ($officeId = $request->query('office_id')) {
            $q->where('office_id', $officeId);
        }
        if ($date = $request->query('date')) {
            $q->where('booking_date', $date);
        } elseif ($request->query('today') === 'true') {
            $q->whereDate('booking_date', today('Asia/Kolkata'));
        }
        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        $bookings = $q->paginate(50);

        return response()->json([
            'items' => $bookings->map(fn($b) => $this->format($b)),
            'total' => $bookings->total(),
            'page'  => $bookings->currentPage(),
            'pages' => $bookings->lastPage(),
        ]);
    }

    // ── GET /api/bookings/token/{tokenNumber} ─────────────────────────────────

    public function showByToken(string $tokenNumber): JsonResponse
    {
        $booking = Booking::with(['office', 'service'])
            ->where('token_number', strtoupper($tokenNumber))
            ->whereDate('booking_date', today('Asia/Kolkata'))
            ->latest()
            ->firstOrFail();

        $pred  = $this->prediction->computeForBooking($booking);
        $qrUrl = $this->pdf->getQrDataUrl($booking);

        return response()->json($this->format($booking, $pred, $qrUrl));
    }

    // ── GET /api/bookings/citizen/phone/{phone} ───────────────────────────────

    public function byPhone(string $phone): JsonResponse
    {
        $bookings = Booking::findByPhone($phone);
        return response()->json($bookings->map(fn($b) => $this->format($b)));
    }

    // ── GET /api/bookings/{id}/pdf ────────────────────────────────────────────

    public function downloadPdf(int $id): Response
    {
        $booking  = Booking::with(['office', 'service'])->findOrFail($id);
        $pdfBytes = $this->pdf->generate($booking);

        $filename = "Nimma-Seva-Token-{$booking->token_number}.pdf";

        return response($pdfBytes, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$filename}\"",
        ]);
    }

    // ── POST /api/bookings/{id}/cancel ────────────────────────────────────────

    public function cancel(Request $request, int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        if (! in_array($booking->status, ['Pending', 'Called'])) {
            return response()->json(['detail' => 'Booking cannot be cancelled in its current state.'], 400);
        }

        $booking->update(['status' => 'Cancelled']);

        return response()->json(['message' => 'Booking cancelled successfully.', 'id' => $id]);
    }

    // ── POST /api/bookings/{id}/rating ────────────────────────────────────────

    public function submitRating(Request $request, int $id): JsonResponse
    {
        $data    = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);
        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'Completed') {
            return response()->json(['detail' => 'You can only rate completed bookings.'], 400);
        }

        $booking->update([
            'rating'         => $data['rating'],
            'rating_comment' => $data['comment'] ?? null,
            'rated_at'       => now(),
        ]);

        return response()->json(['message' => 'Thank you for your feedback!']);
    }

    // ── POST /api/bookings/{id}/acknowledge-reminder ──────────────────────────

    public function acknowledgeReminder(int $id): JsonResponse
    {
        Booking::findOrFail($id)->update(['acknowledged' => true]);
        return response()->json(['acknowledged' => true]);
    }

    // ── Shape helper (matches BookingOut exactly) ─────────────────────────────

    private function format(Booking $b, ?array $pred = null, ?string $qrUrl = null): array
    {
        return [
            'id'                                   => $b->id,
            'token_number'                         => $b->token_number,
            'verification_code'                    => $b->verification_code,
            'citizen_name'                         => $b->citizen_name,
            'phone'                                => $b->phone,
            'aadhaar'                              => $b->aadhaar,  // masked XXXX-XXXX-XXXX
            'age'                                  => $b->age,
            'gender'                               => $b->gender,
            'is_priority'                          => $b->is_priority,
            'priority_reason'                      => $b->priority_reason,
            'booking_type'                         => $b->booking_type,
            'office_id'                            => $b->office_id,
            'service_id'                           => $b->service_id,
            'booking_date'                         => $b->booking_date,
            'visit_date'                           => $b->visit_date,
            'visit_time'                           => $b->visit_time,
            'status'                               => $b->status,
            'counter_number'                       => $b->counter_number,
            'amount_paid'                          => $b->amount_paid,
            'tatkal_probability'                   => $b->tatkal_probability,
            'created_at'                           => $b->created_at?->toIso8601String(),
            'office_name'                          => $b->office?->name,
            'service_name'                         => $b->service?->name,
            'people_ahead'                         => $pred['people_ahead'] ?? 0,
            'avg_wait_mins'                        => $pred['avg_wait_mins'] ?? 15,
            'estimated_wait_mins'                  => $pred['estimated_wait_mins'] ?? 15,
            'estimated_call_time'                  => $pred['estimated_call_time'] ?? null,
            'service_processing_mins'              => $pred['service_processing_mins'] ?? 15,
            'total_estimated_duration_mins'        => $pred['total_estimated_duration_mins'] ?? 30,
            'estimated_completion_time'            => $pred['estimated_completion_time'] ?? null,
            'time_saved_by_dynamic_allocation_mins'=> $pred['time_saved_by_dynamic_allocation_mins'] ?? 0,
            'active_counters_for_service'          => $pred['active_counters_for_service'] ?? 1,
            'qr_code_data_url'                     => $qrUrl,
        ];
    }

    // ── Hours enforcement ─────────────────────────────────────────────────────

    private function enforceHours(Office $office): void
    {
        if ($office->server_status === 'Down' || $office->server_status === 'Maintenance' || $office->server_status === 'Unavailable') {
            abort(503, "Office '{$office->name}' is currently under maintenance or offline. Please try another center.");
        }
    }
}
