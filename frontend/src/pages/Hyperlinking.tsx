import React from 'react';
import { ExternalLink, AlertTriangle, Link2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const Hyperlinking: React.FC = () => {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <KarnatakaBadge />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 mt-4">
            <Link2 className="w-8 h-8 text-amber-400" />
            {t.hyperlinkingPolicy}
          </h1>
          <p className="text-slate-400 text-sm">
            Government Linking Protocol & Rules • Shivamogga District Administration, Government of Karnataka
          </p>
        </div>

        {/* Legal Review Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Legal Review Required Before Launch</span>
            <p className="text-amber-200/80 text-xs leading-relaxed">
              {t.legalReviewFlagText} This policy governs external links originating from or pointing to the Nimma Seva official portal.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-emerald-400" />
              1. Links to External Websites & Portals
            </h2>
            <p>
              At many places in this website, you shall find links to other websites/portals (e.g. Seva Sindhu, GramOne Karnataka, Nadakacheri, and KPTCL). These links have been placed for citizen convenience. Nimma Seva is not responsible for the contents and reliability of the linked websites and does not necessarily endorse the views expressed in them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              2. Links to Nimma Seva by Other Websites
            </h2>
            <p>
              We do not object to you linking directly to the information that is hosted on this website and no prior permission is required for that. However, we do not permit our pages to be loaded into frames on your site. The pages belonging to this website must load into a newly opened browser window of the user.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              3. Linking Permission Request
            </h2>
            <p>
              Prior authorization is mandatory if any external commercial entity or application seeks to embed Nimma Seva API token interfaces into third-party software. Requests can be routed to the Shivamogga District e-Governance Cell.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400">Contact for Link Approvals</h2>
            <p className="text-xs text-slate-400">
              Email: <strong>dio-smg@nic.in</strong> • Shivamogga District Administration, District Centre, NIC.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
