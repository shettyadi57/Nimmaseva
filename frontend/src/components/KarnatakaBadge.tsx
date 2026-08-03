import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const KarnatakaBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg backdrop-blur-md hover:border-emerald-500/60 transition-all duration-300">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
      <span className="tracking-wide">Government of Karnataka <span className="text-slate-500">•</span> Shivamogga District</span>
    </div>
  );
};
