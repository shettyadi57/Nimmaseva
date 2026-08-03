import React, { useState } from 'react';

export const LeaderPortraits: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [cmErr, setCmErr] = useState(false);

  return (
    <div className="flex items-center gap-2.5 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Hon'ble Chief Minister of Karnataka: Sri Siddaramaiah */}
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          {!cmErr ? (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Siddaramaiah_in_2023.jpg/220px-Siddaramaiah_in_2023.jpg"
              alt="Sri Siddaramaiah - Hon'ble Chief Minister of Karnataka"
              onError={() => setCmErr(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover object-top border-2 border-amber-400 shadow"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs border-2 border-amber-400 shadow">
              CM
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border border-slate-950" />
        </div>
        {!compact && (
          <div className="text-left hidden lg:block">
            <div className="text-white font-extrabold text-xs leading-tight">Sri Siddaramaiah</div>
            <div className="text-amber-400 text-[9px] font-bold tracking-wide uppercase">Hon'ble Chief Minister, Karnataka</div>
          </div>
        )}
      </div>
    </div>
  );
};
