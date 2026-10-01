import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Download, ExternalLink, QrCode as QrIcon } from 'lucide-react';

interface RealQRCodeProps {
  value: string;
  tokenNumber: string;
  size?: number;
  className?: string;
  showActions?: boolean;
}

export const RealQRCode: React.FC<RealQRCodeProps> = ({
  value,
  tokenNumber,
  size = 200,
  className = '',
  showActions = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Generate real, high-contrast, scannable QR code
    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a', // Deep slate for high contrast
          light: '#ffffff', // Clean white background
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) {
          console.error('QR code generation error:', error);
        } else {
          setQrGenerated(true);
        }
      }
    );
  }, [value, size]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `NimmaSeva_Token_${tokenNumber}_QR.png`;
    a.click();
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* QR Code Container with High Contrast & Visual Framing */}
      <div className="relative p-3.5 bg-white rounded-2xl shadow-xl border-2 border-amber-400/40 group transition-all duration-300 hover:shadow-amber-500/20 hover:scale-[1.02]">
        <canvas
          ref={canvasRef}
          className="rounded-xl block"
          style={{ width: size, height: size }}
        />
        {/* Subtle Karnataka/Seva watermarking dot in center if desired */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-amber-500/90 rounded-lg flex items-center justify-center pointer-events-none shadow-md border-2 border-white">
          <QrIcon className="w-4 h-4 text-slate-950 font-black" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <span className="font-mono text-xs font-black tracking-wider text-amber-400 uppercase">
          COUPON #{tokenNumber}
        </span>
        <p className="text-[10px] text-slate-400 font-medium">
          Scan with any mobile camera to view pass
        </p>
      </div>

      {showActions && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all active:scale-95"
            title="Copy Pass Web Link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={!qrGenerated}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all active:scale-95"
            title="Download QR Image PNG"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Save QR</span>
          </button>
        </div>
      )}
    </div>
  );
};
