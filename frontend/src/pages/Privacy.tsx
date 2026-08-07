import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, KeyRound, EyeOff, Server } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const Privacy: React.FC = () => {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <KarnatakaBadge />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 mt-4">
            <Lock className="w-8 h-8 text-emerald-400" />
            {t.privacyPolicy}
          </h1>
          <p className="text-slate-400 text-sm">
            Aadhaar & Citizen Data Protection Policy • Shivamogga District Administration, Government of Karnataka
          </p>
        </div>

        {/* Legal Review Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Legal & Regulatory Review Required</span>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              {t.legalReviewFlagText} This policy explicitly governs Aadhaar data tokenization, OTP authentication, and personal identifiable information (PII) handling for GramOne & Seva Sindhu digital token systems.
            </p>
          </div>
        </div>

        {/* Highlight Banner: Aadhaar & OTP Security */}
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Explicit Aadhaar & OTP Data Handling Disclosure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <EyeOff className="w-4 h-4" /> Zero Storage of Raw Aadhaar
              </div>
              <p className="text-slate-400 leading-relaxed">
                Nimma Seva does <strong>NOT</strong> store complete 12-digit Aadhaar numbers in persistent server databases or browser storage. Only masked tokens (e.g. XXXX-XXXX-1234) are transmitted via encrypted channels.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <KeyRound className="w-4 h-4" /> Ephemeral OTP Sessions
              </div>
              <p className="text-slate-400 leading-relaxed">
                One-Time Passwords (OTPs) sent for authentication are valid for a maximum of 5 minutes. OTPs are cryptographically hashed and automatically destroyed immediately after validation.
              </p>
            </div>
          </div>
        </div>

        {/* Main Detailed Privacy Copy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              1. Information We Collect
            </h2>
            <p>
              To process queue token passes for GramOne and Seva Sindhu centers in Shivamogga, Nimma Seva collects minimal operational data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>Citizen Full Name, Mobile Number, and Age.</li>
              <li>Selected Government Service (e.g. Caste Certificate, RTC Pahani, Pension Scheme).</li>
              <li>Priority Category (Senior Citizen 60+, Person with Disability, Emergency).</li>
              <li>Geographic location (if user permits) to calculate distance to nearest service centers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              2. Data Encryption & Storage Security
            </h2>
            <p>
              All HTTP communications between citizen devices and Nimma Seva backend microservices are encrypted using 256-bit SSL/TLS 1.3 encryption. Backend audit logs track token generation without logging full user credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              3. Data Sharing & Third-Party Restrictions
            </h2>
            <p>
              Nimma Seva does not share, rent, or sell citizen personal data to private entities. Data is accessible solely by authorized staff operators at designated Shivamogga District service centers for identity verification during token fulfillment.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400">UIDAI & IT Act Compliance</h2>
            <p className="text-xs text-slate-400">
              This portal adheres strictly to the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
