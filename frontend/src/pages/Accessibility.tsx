import React from 'react';
import { Eye, AlertTriangle, CheckCircle2, Monitor, Keyboard, Contrast } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const Accessibility: React.FC = () => {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <KarnatakaBadge />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 mt-4">
            <Eye className="w-8 h-8 text-indigo-400" />
            {t.accessibilityStatement}
          </h1>
          <p className="text-slate-400 text-sm">
            Equal Access Commitment • Shivamogga District Administration, Government of Karnataka
          </p>
        </div>

        {/* Legal Review Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Legal & Accessibility Audit Required</span>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              {t.legalReviewFlagText} Nimma Seva is designed to comply with Guidelines for Indian Government Websites (GIGW) and WCAG 2.1 Level AA standards.
            </p>
          </div>
        </div>

        {/* Key Accessibility Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <Keyboard className="w-6 h-6 text-emerald-400" />
            <h3 className="text-white font-bold text-sm">Keyboard Navigable</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              All interactive controls, links, and forms feature prominent focus rings and key sequence order.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <Contrast className="w-6 h-6 text-amber-400" />
            <h3 className="text-white font-bold text-sm">High Contrast Themes</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Tested against 4.5:1 text-to-background contrast thresholds in both Light and Dark modes.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <Monitor className="w-6 h-6 text-indigo-400" />
            <h3 className="text-white font-bold text-sm">Screen Reader Friendly</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Semantic HTML5 tags, ARIA labels, and live region announcers for queue status updates.
            </p>
          </div>
        </div>

        {/* Detailed Copy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Our Commitment
            </h2>
            <p>
              Shivamogga District Administration is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Conformance Status
            </h2>
            <p>
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. Nimma Seva aims for WCAG 2.1 Level AA conformance.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400">Feedback & Accessibility Officer Contact</h2>
            <p className="text-xs text-slate-400">
              If you experience any accessibility barriers while using Nimma Seva, please contact our Nodal Accessibility Officer at <strong>accessibility@shivamogga.gov.in</strong> or helpline <strong>08182-271234</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
