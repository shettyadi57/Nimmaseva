<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Office;
use App\Models\Service;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Cache;

/**
 * PdfService — generates the official Karnataka Digital Token Pass PDF.
 *
 * Layout:
 *   - Government of Karnataka header (bilingual)
 *   - QR code + verification code
 *   - Citizen info, token, center, service, time slot
 *   - Required documents checklist
 *   - Footer: statutory disclaimer + Sakala SLA
 */
class PdfService
{
    /**
     * Generate and return PDF binary content for a booking.
     */
    public function generate(Booking $booking): string
    {
        $booking->load(['office', 'service']);

        $qrDataUrl = $this->buildQrCode($booking);

        $data = [
            'booking'    => $booking,
            'office'     => $booking->office,
            'service'    => $booking->service,
            'qr_data_url'=> $qrDataUrl,
            'phone'      => $booking->phone,     // decrypted in model
            'aadhaar'    => $booking->aadhaar,   // masked XXXX-XXXX-XXXX
            'print_date' => now('Asia/Kolkata')->format('d-m-Y H:i:s') . ' IST',
        ];

        $pdf = Pdf::loadView('pdf.token-pass', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled'      => false,
                'defaultFont'          => 'DejaVu Sans',
                'dpi'                  => 150,
            ]);

        return $pdf->output();
    }

    /**
     * Build a Base64-encoded PNG QR code for the booking URL.
     */
    private function buildQrCode(Booking $booking): string
    {
        $verifyUrl = url("/verify/{$booking->token_number}/{$booking->verification_code}");

        $result = Builder::create()
            ->writer(new PngWriter())
            ->writerOptions([])
            ->data($verifyUrl)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(200)
            ->margin(10)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->build();

        return 'data:image/png;base64,' . base64_encode($result->getString());
    }

    /**
     * Return a cached QR code data URL for use in API responses.
     */
    public function getQrDataUrl(Booking $booking): string
    {
        return Cache::remember(
            "qr_booking_{$booking->id}",
            now()->addHours(24),
            fn() => $this->buildQrCode($booking)
        );
    }
}
