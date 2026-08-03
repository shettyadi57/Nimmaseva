import React from 'react';
import { Shield, Phone, MapPin, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              <span>Nimma Seva</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Official Progressive Web Application for GramOne and Seva Sindhu centers across Shivamogga District, Government of Karnataka.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-amber-400 transition-colors">Book Online Token</a></li>
              <li><a href="/queue" className="hover:text-amber-400 transition-colors">Live Counter Status</a></li>
              <li><a href="/schemes" className="hover:text-amber-400 transition-colors">Karnataka Scheme Eligibility</a></li>
              <li><a href="/admin/login" className="hover:text-amber-400 transition-colors">Staff / Operator Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Shivamogga Helpline</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Toll Free: 08182-271234</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Mini Vidhana Soudha, Shivamogga</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>shivamogga.nic.in</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Working Hours</h4>
            <p className="text-slate-400 leading-relaxed mb-2">
              Monday - Saturday: 09:00 AM - 05:00 PM<br/>
              Lunch Break: 12:00 PM - 01:00 PM<br/>
              Sundays & Govt Holidays Closed
            </p>
            <div className="inline-block px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-[11px]">
              System Status: ONLINE 🟢
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500">
          <p>© 2026 Government of Karnataka. Shivamogga District Administration.</p>
          <p>Designed for GramOne & Seva Sindhu Public Service Digitalization</p>
        </div>
      </div>
    </footer>
  );
};
