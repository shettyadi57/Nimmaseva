import React from 'react';
import { Shield } from 'lucide-react';

export const KarnatakaBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-semibold">
      <Shield className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
      <span>Government of Karnataka • Shivamogga District</span>
    </div>
  );
};
