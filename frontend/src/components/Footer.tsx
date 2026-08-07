import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, MapPin, Mail, Clock, Download, Activity, Heart, 
  ChevronDown, ChevronUp, Shield, ExternalLink 
} from 'lucide-react';
import { KarnatakaBadge } from './KarnatakaBadge';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { t } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mobile accordion state for < 768px screens
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    about: true,
    quick: true,
    policies: true,
    contact: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePwaInstall = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
  };

  // Theme-aware Tailwind styling tokens
  const footerBg = isDark ? 'bg-slate-950 text-slate-400 border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-300';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const linkHover = isDark ? 'hover:text-emerald-400 focus-visible:ring-emerald-500' : 'hover:text-emerald-700 focus-visible:ring-emerald-600';
  const cardBg = isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm';

  return (
    <footer className={`${footerBg} text-xs border-t mt-16 relative overflow-hidden transition-colors duration-300`}>
      {/* Subtle Background Glow Effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        
        {/* Desktop 4-Column Grid / Mobile Collapsible Accordion */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10">

          {/* ── COLUMN 1: About & Branding ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between md:block">
              <div className="space-y-2">
                <KarnatakaBadge />
                <h3 className={`text-lg font-black tracking-tight ${headingColor} mt-2`}>
                  {t.appName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('about')}
                className="md:hidden p-2 rounded-lg border border-slate-700/40 text-slate-400 hover:text-white"
                aria-label="Toggle About Section"
              >
                {openSections.about ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {openSections.about && (
              <div className="space-y-3 transition-all duration-200">
                <p className="leading-relaxed text-xs">
                  {t.portalDescription}
                </p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono ${cardBg}`}>
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold">{t.allSystems}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── COLUMN 2: Quick Links ── */}
          <div className="border-t border-slate-800/40 pt-4 md:border-t-0 md:pt-0">
            <div className="flex items-center justify-between md:block mb-3 md:mb-4">
              <h4 className={`${headingColor} font-bold text-xs sm:text-sm tracking-wide uppercase`}>
                {t.quickLinksTitle}
              </h4>
              <button
                type="button"
                onClick={() => toggleSection('quick')}
                className="md:hidden p-2 rounded-lg border border-slate-700/40 text-slate-400 hover:text-white"
                aria-label="Toggle Quick Links Section"
              >
                {openSections.quick ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {openSections.quick && (
              <ul className="space-y-2.5 transition-all duration-200">
                <li>
                  <Link 
                    to="/book" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.navBookToken}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/queue" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.navTrackQueue}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/schemes" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.navSchemeSearch}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/my-bookings" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.navMyBookings}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/grievance" 
                    className={`${linkHover} font-semibold text-amber-400 transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.navGrievance}
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* ── COLUMN 3: Policies & Compliance ── */}
          <div className="border-t border-slate-800/40 pt-4 md:border-t-0 md:pt-0">
            <div className="flex items-center justify-between md:block mb-3 md:mb-4">
              <h4 className={`${headingColor} font-bold text-xs sm:text-sm tracking-wide uppercase`}>
                {t.policiesTitle}
              </h4>
              <button
                type="button"
                onClick={() => toggleSection('policies')}
                className="md:hidden p-2 rounded-lg border border-slate-700/40 text-slate-400 hover:text-white"
                aria-label="Toggle Policies Section"
              >
                {openSections.policies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {openSections.policies && (
              <ul className="space-y-2.5 transition-all duration-200">
                <li>
                  <Link 
                    to="/terms" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.termsOfService}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/privacy" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/accessibility" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.accessibilityStatement}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/hyperlinking" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.hyperlinkingPolicy}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/sitemap" 
                    className={`${linkHover} transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                  >
                    {t.sitemap}
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* ── COLUMN 4: Contact & Support ── */}
          <div className="border-t border-slate-800/40 pt-4 md:border-t-0 md:pt-0">
            <div className="flex items-center justify-between md:block mb-3 md:mb-4">
              <h4 className={`${headingColor} font-bold text-xs sm:text-sm tracking-wide uppercase`}>
                {t.contactSupportTitle}
              </h4>
              <button
                type="button"
                onClick={() => toggleSection('contact')}
                className="md:hidden p-2 rounded-lg border border-slate-700/40 text-slate-400 hover:text-white"
                aria-label="Toggle Contact Section"
              >
                {openSections.contact ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {openSections.contact && (
              <div className="space-y-3 transition-all duration-200">
                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{t.districtAddress}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <a 
                      href="tel:08182271234" 
                      className={`${linkHover} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                    >
                      {t.supportPhone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <a 
                      href="mailto:support@shivamogga.gov.in" 
                      className={`${linkHover} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md`}
                    >
                      {t.supportEmail}
                    </a>
                  </li>
                  <li className="flex items-start gap-2.5 pt-1">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-300">{t.officeHoursTitle}</div>
                      <div className="text-[11px] text-slate-400">{t.officeHoursSchedule}</div>
                      <div className="text-[11px] text-slate-500">{t.closedHolidays}</div>
                    </div>
                  </li>
                </ul>

                {/* Office Map Link (Reuses Home Leaflet Map Anchor) */}
                <div className="pt-2">
                  <a
                    href="/#office-map"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/60 font-semibold text-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.viewOfficeMap}</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Sub-footer Bar: PWA Link & Dynamic Copyright ── */}
        <div className="border-t border-slate-800/60 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} {t.copyrightGovt}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Reuses PWA install logic cleanly */}
            <button
              onClick={handlePwaInstall}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Install App PWA"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.installAppLabel}</span>
            </button>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <p className="flex items-center gap-1 text-slate-400 text-[11px]">
              <span>Engineered for Shivamogga Citizens</span>
              <Heart className="w-3 h-3 text-amber-500 fill-amber-500" />
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
};
