import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import qrcode
import io

def generate_token_pdf(booking_data: dict) -> bytes:
    """Generates an official Karnataka GramOne / Seva Sindhu Token PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor('#065f46'),  # Deep Karnataka Green
        alignment=1,  # Center
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'HeaderSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#d97706'),  # Saffron
        alignment=1,
        spaceAfter=15
    )
    token_num_style = ParagraphStyle(
        'TokenNumber',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=28,
        textColor=colors.HexColor('#1e3a8a'),
        alignment=1,
        spaceAfter=6
    )
    normal_style = styles['Normal']

    story = []

    # Title Banner
    story.append(Paragraph("GOVERNMENT OF KARNATAKA", subtitle_style))
    story.append(Paragraph("SHIVAMOGGA SMART SEVA TOKEN PASS", title_style))
    story.append(Paragraph(f"<b>Office:</b> {booking_data.get('office_name', 'GramOne Center Shivamogga')}", ParagraphStyle('Center', alignment=1, fontSize=11)))
    story.append(Spacer(1, 15))

    # Big Token Box
    story.append(Paragraph(f"TOKEN NUMBER: <b>{booking_data.get('token_number')}</b>", token_num_style))
    story.append(Paragraph(f"Verification Code: <b>{booking_data.get('verification_code')}</b>", ParagraphStyle('Center', alignment=1, fontSize=12, textColor=colors.HexColor('#374151'))))
    story.append(Spacer(1, 15))

    # Generate QR Image for PDF
    qr = qrcode.QRCode(version=1, box_size=4, border=1)
    qr.add_data(f"TOKEN:{booking_data.get('token_number')}|VERIFY:{booking_data.get('verification_code')}")
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#065f46", back_color="white")
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    
    rl_qr = RLImage(qr_buffer, width=100, height=100)

    # Details Table
    data = [
        [Paragraph("<b>Citizen Name:</b>", normal_style), Paragraph(str(booking_data.get('citizen_name')), normal_style)],
        [Paragraph("<b>Phone Number:</b>", normal_style), Paragraph(str(booking_data.get('phone')), normal_style)],
        [Paragraph("<b>Aadhaar Number:</b>", normal_style), Paragraph(f"XXXX-XXXX-{booking_data.get('aadhaar', '')[-4:]}", normal_style)],
        [Paragraph("<b>Service Requested:</b>", normal_style), Paragraph(str(booking_data.get('service_name')), normal_style)],
        [Paragraph("<b>Visit Date & Slot:</b>", normal_style), Paragraph(f"{booking_data.get('visit_date')} @ {booking_data.get('visit_time')}", normal_style)],
        [Paragraph("<b>Priority Category:</b>", normal_style), Paragraph(str(booking_data.get('priority_reason') or 'General Normal'), normal_style)],
        [Paragraph("<b>Amount Paid / Due:</b>", normal_style), Paragraph(f"₹ {booking_data.get('amount_paid', 0.0):.2f}", normal_style)],
        [Paragraph("<b>Tatkal Completion Chance:</b>", normal_style), Paragraph(f"{booking_data.get('tatkal_probability', 90)}% High", normal_style)],
    ]

    t = Table(data, colWidths=[150, 250])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    # Wrap Table and QR side by side
    main_table = Table([[t, rl_qr]], colWidths=[400, 130])
    main_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
    ]))

    story.append(main_table)
    story.append(Spacer(1, 20))

    # Instructions Footer
    instructions = """
    <b>Important Instructions for Citizens:</b><br/>
    1. Please arrive 10 minutes prior to your allocated slot time.<br/>
    2. Carry original supporting documents along with one set of photocopies.<br/>
    3. Show this digital or printed token pass at Counter Entry.<br/>
    4. For queue status updates, scan the QR code or visit the Shivamogga Smart Seva Portal.
    """
    story.append(Paragraph(instructions, ParagraphStyle('Inst', parent=normal_style, fontSize=9, textColor=colors.HexColor('#4b5563'), leading=13)))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
