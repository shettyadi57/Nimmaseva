import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const Terms: React.FC = () => {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <KarnatakaBadge />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 mt-4">
            <FileText className="w-8 h-8 text-amber-500" />
            {t.termsOfService}
          </h1>
          <p className="text-slate-400 text-sm">
            Effective Date: August 2026 • Shivamogga District Administration, Government of Karnataka
          </p>
        </div>

        {/* Legal Review Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Legal Review Required Before Launch</span>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              {t.legalReviewFlagText} This document outlines standard terms of service for the Nimma Seva token allocation and queue management system operated for GramOne and Seva Sindhu centers in Shivamogga.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the Nimma Seva portal (shivamogga.karnataka.gov.in), citizens agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, you should refrain from booking online tokens.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              2. Token Booking Fair Use & Limits
            </h2>
            <p>
              Tokens issued through Nimma Seva are intended strictly for individual citizens seeking government services at GramOne and Seva Sindhu centers in Shivamogga. Commercial automated scraping, bulk token hoarding, or unauthorized resale of queue tokens is strictly prohibited and subject to legal action under the Information Technology Act.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>Maximum 2 active tokens per Aadhaar / Mobile number per day.</li>
              <li>Tokens are non-transferable and valid only for the booked service & office.</li>
              <li>Priority slot abuse (falsifying Senior Citizen or PWD status) will lead to token cancellation.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              3. Service Center Etiquette & SLAs
            </h2>
            <p>
              Citizens are requested to report to the selected service center at least 10 minutes prior to their estimated slot time. While Nimma Seva strives for real-time queue synchronization, processing times may vary based on verification complexity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              4. Service Availability & Modifications
            </h2>
            <p>
              The Shivamogga District Administration reserves the right to modify, suspend, or terminate service availability without prior notice during unforeseen administrative exigencies or system maintenance.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400">Jurisdiction</h2>
            <p className="text-xs text-slate-400">
              These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Shivamogga, Karnataka.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
