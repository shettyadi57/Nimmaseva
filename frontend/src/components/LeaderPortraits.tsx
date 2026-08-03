import React, { useState } from 'react';

export const LeaderPortraits: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [cmErr, setCmErr] = useState(false);
  const [dksErr, setDksErr] = useState(false);
  const [pkErr, setPkErr] = useState(false);

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-md">
      
      {/* 1. Chief Minister: Sri Siddaramaiah */}
      <div className="flex items-center gap-2 border-r border-slate-800 pr-2 sm:pr-3">
        <div className="relative flex-shrink-0">
          {!cmErr ? (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Siddaramaiah_in_2023.jpg/220px-Siddaramaiah_in_2023.jpg"
              alt="Sri Siddaramaiah - Hon'ble Chief Minister of Karnataka"
              onError={() => setCmErr(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover object-top border-2 border-amber-400 shadow"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs border-2 border-amber-400 shadow">
              CM
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border border-slate-950" />
        </div>
        {!compact && (
          <div className="text-left hidden 2xl:block">
            <div className="text-white font-extrabold text-[11px] leading-tight">Sri Siddaramaiah</div>
            <div className="text-amber-400 text-[9px] font-bold tracking-wide uppercase">Hon'ble Chief Minister</div>
          </div>
        )}
      </div>

      {/* 2. Deputy Chief Minister: Sri D.K. Shivakumar */}
      <div className="flex items-center gap-2 border-r border-slate-800 pr-2 sm:pr-3">
        <div className="relative flex-shrink-0">
          {!dksErr ? (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/D._K._Shivakumar.jpg/220px-D._K._Shivakumar.jpg"
              alt="Sri D.K. Shivakumar - Hon'ble Deputy Chief Minister of Karnataka"
              onError={() => setDksErr(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover object-top border-2 border-emerald-400 shadow"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black text-xs border-2 border-emerald-400 shadow">
              DKS
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
        </div>
        {!compact && (
          <div className="text-left hidden 2xl:block">
            <div className="text-white font-extrabold text-[11px] leading-tight">Sri D.K. Shivakumar</div>
            <div className="text-emerald-400 text-[9px] font-bold tracking-wide uppercase">Hon'ble Dy. Chief Minister</div>
          </div>
        )}
      </div>

      {/* 3. Minister for IT, BT & RDPR: Sri Priyank Kharge */}
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          {!pkErr ? (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Priyank_Kharge.jpg/220px-Priyank_Kharge.jpg"
              alt="Sri Priyank Kharge - Minister for IT, BT & RDPR"
              onError={() => setPkErr(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover object-top border-2 border-indigo-400 shadow"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-xs border-2 border-indigo-400 shadow">
              PK
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-400 rounded-full border border-slate-950" />
        </div>
        {!compact && (
          <div className="text-left hidden 2xl:block">
            <div className="text-white font-extrabold text-[11px] leading-tight">Sri Priyank Kharge</div>
            <div className="text-indigo-300 text-[9px] font-bold tracking-wide uppercase">IT, BT &amp; RDPR Minister</div>
          </div>
        )}
      </div>

    </div>
  );
};
