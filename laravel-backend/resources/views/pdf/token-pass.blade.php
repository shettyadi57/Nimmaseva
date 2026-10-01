<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nimma Seva - Digital Token Pass</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', sans-serif; color: #1a1a1a; font-size: 11px; }

  .page { width: 100%; padding: 20px; }

  /* Header */
  .header { text-align: center; border-bottom: 3px solid #065f46; padding-bottom: 12px; margin-bottom: 16px; }
  .header .emblem { font-size: 28px; color: #065f46; }
  .header h1 { font-size: 16px; font-weight: bold; color: #065f46; margin-top: 6px; }
  .header h1 .kn { font-size: 14px; display: block; }
  .header .subtitle { font-size: 10px; color: #555; margin-top: 4px; }

  /* Token card */
  .token-card { border: 2px solid #065f46; border-radius: 10px; padding: 16px; margin-bottom: 14px; background: #f0fdf4; }
  .token-row { display: flex; justify-content: space-between; align-items: flex-start; }
  .token-number-box { text-align: center; background: #065f46; color: white; border-radius: 8px; padding: 10px 20px; }
  .token-number-box .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }
  .token-number-box .number { font-size: 36px; font-weight: bold; line-height: 1; }
  .token-number-box .kn-number { font-size: 12px; margin-top: 4px; }
  .verif-box { text-align: center; border: 1px dashed #065f46; padding: 8px 14px; border-radius: 6px; background: white; }
  .verif-box .label { font-size: 9px; color: #555; text-transform: uppercase; }
  .verif-box .code { font-size: 18px; font-weight: bold; color: #065f46; letter-spacing: 3px; font-family: monospace; }
  .qr-box { text-align: center; }
  .qr-box img { width: 90px; height: 90px; }
  .qr-box .label { font-size: 8px; color: #555; margin-top: 2px; }

  /* Info grid */
  .info-section { margin-bottom: 14px; }
  .info-section h2 { font-size: 11px; font-weight: bold; color: #065f46; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #d1fae5; padding-bottom: 4px; margin-bottom: 8px; }
  .info-grid { display: table; width: 100%; border-collapse: collapse; }
  .info-row { display: table-row; }
  .info-label { display: table-cell; font-weight: bold; color: #374151; width: 40%; padding: 3px 0; font-size: 10px; }
  .info-value { display: table-cell; color: #1a1a1a; padding: 3px 0; font-size: 10px; }

  /* Docs */
  .docs-list { list-style: none; }
  .docs-list li { padding: 3px 0; font-size: 10px; color: #374151; }
  .docs-list li::before { content: "✓ "; color: #059669; font-weight: bold; }

  /* Status badge */
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-priority { background: #ede9fe; color: #5b21b6; }

  /* Footer */
  .footer { border-top: 2px solid #065f46; padding-top: 10px; margin-top: 14px; text-align: center; font-size: 9px; color: #555; }
  .footer .warning { color: #b91c1c; font-weight: bold; margin-bottom: 4px; }

  /* Watermark */
  .watermark { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 80px; color: rgba(6, 95, 70, 0.05); font-weight: bold; z-index: -1; white-space: nowrap; }
</style>
</head>
<body>
<div class="page">

  <div class="watermark">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</div>

  <!-- Header -->
  <div class="header">
    <div class="emblem">🏛️</div>
    <h1>
      Government of Karnataka — Shivamogga District Administration
      <span class="kn">ಕರ್ನಾಟಕ ಸರ್ಕಾರ — ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲಾ ಆಡಳಿತ</span>
    </h1>
    <div class="subtitle">
      Nimma Seva — GramOne / Seva Sindhu Smart Token Management System<br>
      ನಿಮ್ಮ ಸೇವಾ — ಟೋಕನ್ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ
    </div>
  </div>

  <!-- Token Card -->
  <div class="token-card">
    <div class="token-row">
      <div class="token-number-box">
        <div class="label">Token No. / ಟೋಕನ್ ಸಂ.</div>
        <div class="number">{{ $booking->token_number }}</div>
        <div class="kn-number">ಟೋಕನ್</div>
      </div>
      <div>
        <div class="verif-box" style="margin-bottom:8px;">
          <div class="label">Anti-Fraud Code / ಭದ್ರತಾ ಕೋಡ್</div>
          <div class="code">{{ $booking->verification_code }}</div>
        </div>
        <div style="text-align:center;">
          @if($booking->is_priority)
          <span class="status-badge status-priority">⭐ Priority / ಆದ್ಯತೆ</span>
          @else
          <span class="status-badge status-pending">{{ $booking->booking_type }}</span>
          @endif
        </div>
      </div>
      <div class="qr-box">
        <img src="{{ $qr_data_url }}" alt="QR Code">
        <div class="label">Scan to Verify</div>
      </div>
    </div>
  </div>

  <!-- Citizen Info -->
  <div class="info-section">
    <h2>Citizen Information / ಪ್ರಜಾ ವಿವರಗಳು</h2>
    <div class="info-grid">
      <div class="info-row">
        <div class="info-label">Name / ಹೆಸರು</div>
        <div class="info-value">{{ $booking->citizen_name }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Phone / ದೂರವಾಣಿ</div>
        <div class="info-value">{{ $phone ? 'XXXXXX'.substr($phone, -4) : 'N/A' }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Age / Gender / ವಯಸ್ಸು</div>
        <div class="info-value">{{ $booking->age }} years / {{ $booking->gender }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Aadhaar (Masked)</div>
        <div class="info-value">{{ $aadhaar }}</div>
      </div>
      @if($booking->priority_reason)
      <div class="info-row">
        <div class="info-label">Priority Reason</div>
        <div class="info-value">{{ $booking->priority_reason }}</div>
      </div>
      @endif
    </div>
  </div>

  <!-- Appointment Info -->
  <div class="info-section">
    <h2>Appointment Details / ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿವರಗಳು</h2>
    <div class="info-grid">
      <div class="info-row">
        <div class="info-label">Center / ಕೇಂದ್ರ</div>
        <div class="info-value">{{ $office->name }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Address / ವಿಳಾಸ</div>
        <div class="info-value">{{ $office->address }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Phone / ದೂರವಾಣಿ</div>
        <div class="info-value">{{ $office->phone }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Service / ಸೇವೆ</div>
        <div class="info-value">{{ $service->name }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Visit Date / ದಿನಾಂಕ</div>
        <div class="info-value">{{ $booking->visit_date }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Time Slot / ಸಮಯ</div>
        <div class="info-value">{{ $booking->visit_time }}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Working Hours / ಕಾರ್ಯ ಸಮಯ</div>
        <div class="info-value">{{ $office->working_hours }} (Lunch: {{ $office->lunch_break }})</div>
      </div>
      @if($service->fee > 0)
      <div class="info-row">
        <div class="info-label">Statutory Fee / ಶುಲ್ಕ</div>
        <div class="info-value">₹{{ number_format($service->fee, 2) }} (Payable at counter)</div>
      </div>
      @else
      <div class="info-row">
        <div class="info-label">Fee / ಶುಲ್ಕ</div>
        <div class="info-value" style="color:#059669;">Free / ಉಚಿತ</div>
      </div>
      @endif
    </div>
  </div>

  <!-- Required Documents -->
  @if($service->required_documents && count($service->required_documents) > 0)
  <div class="info-section">
    <h2>Required Documents / ಅಗತ್ಯ ದಾಖಲಾತಿಗಳು</h2>
    <ul class="docs-list">
      @foreach($service->required_documents as $doc)
      <li>{{ $doc }}</li>
      @endforeach
    </ul>
  </div>
  @endif

  <!-- Footer -->
  <div class="footer">
    <div class="warning">⚠ This is an official government document. Any alteration or forgery is a criminal offence under IPC Section 463.</div>
    <div>Generated: {{ $print_date }} | Nimma Seva System | Shivamogga District Administration</div>
    <div style="margin-top:4px;">Powered by GramOne / Seva Sindhu Portal | sakala.karnataka.gov.in</div>
  </div>

</div>
</body>
</html>
