import React from 'react';
import { ShieldCheck, PhoneCall, MapPin, Globe, Activity, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-20 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">Nimma Seva</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Official Progressive Web Application for GramOne and Seva Sindhu centers across Shivamogga District, Government of Karnataka. Empowering citizens with seamless digital token allocation.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Core Engine: 99.98% Uptime</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-4 uppercase">Quick Access</h4>
            <ul className="space-y-2.5">
              <li><a href="/" className="hover:text-amber-400 transition-colors">Book Citizen Token Pass</a></li>
              <li><a href="/queue" className="hover:text-amber-400 transition-colors">Live Counter Display Board</a></li>
              <li><a href="/schemes" className="hover:text-amber-400 transition-colors">Karnataka Scheme Eligibility</a></li>
              <li><a href="/admin/login" className="hover:text-amber-400 transition-colors">Staff Operator Login</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-4 uppercase">Shivamogga Helpline</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Toll Free Helpline: 08182-271234</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Mini Vidhana Soudha, Shivamogga</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>shivamogga.karnataka.gov.in</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm tracking-wide mb-4 uppercase">Center Operating Hours</h4>
            <p className="text-slate-400 leading-relaxed mb-3 text-xs">
              <strong className="text-slate-200">Mon - Sat:</strong> 09:00 AM - 05:00 PM<br/>
              <strong className="text-slate-200">Lunch Break:</strong> 12:00 PM - 01:00 PM<br/>
              Sundays & Govt Holidays Closed
            </p>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-amber-400 font-bold">Priority Pass Split:</span> Dedicated slots reserved for Senior Citizens (60+), Persons with Disabilities & Emergency Cases.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
          <p>© 2026 Government of Karnataka. Shivamogga District Administration.</p>
          <p className="flex items-center gap-1">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>for Shivamogga Citizens</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
