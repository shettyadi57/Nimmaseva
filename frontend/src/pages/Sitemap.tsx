import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Home, Ticket, Activity, Search, BookmarkCheck, FileText, Shield, PhoneCall, KeyRound, HelpCircle } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const Sitemap: React.FC = () => {
  const { t } = useLang();

  const sections = [
    {
      title: 'Citizen Portal Services',
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5',
      links: [
        { name: t.navHome, path: '/', icon: Home, desc: 'Interactive Shivamogga center map & overview' },
        { name: t.navBookToken, path: '/book', icon: Ticket, desc: 'Book GramOne & Seva Sindhu appointments' },
        { name: t.navTrackQueue, path: '/queue', icon: Activity, desc: 'Live counter display & token status' },
        { name: t.navSchemeSearch, path: '/schemes', icon: Search, desc: 'Karnataka welfare scheme eligibility finder' },
        { name: t.navMyBookings, path: '/my-bookings', icon: BookmarkCheck, desc: 'View active passes & booking history' },
        { name: t.navGrievance, path: '/grievance', icon: HelpCircle, desc: 'Submit complaints & track resolution' },
      ],
    },
    {
      title: 'Policies & Legal Compliance',
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/5',
      links: [
        { name: t.termsOfService, path: '/terms', icon: FileText, desc: 'Token booking terms & fair use limits' },
        { name: t.privacyPolicy, path: '/privacy', icon: Shield, desc: 'Aadhaar masking & OTP security rules' },
        { name: t.accessibilityStatement, path: '/accessibility', icon: FileText, desc: 'WCAG 2.1 AA accessibility commitment' },
        { name: t.hyperlinkingPolicy, path: '/hyperlinking', icon: FileText, desc: 'Govt website linking guidelines' },
        { name: t.sitemap, path: '/sitemap', icon: Map, desc: 'Complete visual site directory' },
      ],
    },
    {
      title: 'Administrative Modules',
      color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5',
      links: [
        { name: t.staffLogin, path: '/admin/login', icon: KeyRound, desc: 'Operator login for Shivamogga centers' },
        { name: t.adminPanel, path: '/admin/dashboard', icon: Activity, desc: 'Queue dispatch & counter management' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <KarnatakaBadge />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 mt-4">
            <Map className="w-8 h-8 text-emerald-400" />
            {t.sitemap}
          </h1>
          <p className="text-slate-400 text-sm">
            Complete navigation directory of the Nimma Seva Smart Governance Portal.
          </p>
        </div>

        {/* Sitemap Sections Grid */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${section.color}`}>
                <span>{section.title}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {section.links.map(({ name, path, icon: Icon, desc }) => (
                  <Link
                    key={path}
                    to={path}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {name}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
