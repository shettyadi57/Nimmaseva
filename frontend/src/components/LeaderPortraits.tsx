import React, { useState } from 'react';

export const LeaderPortraits: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [dksImgError, setDksImgError] = useState(false);
  const [pkImgError, setPkImgError] = useState(false);

  return (
    <div className="flex items-center gap-2.5 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-md">
      {/* D.K. Shivakumar */}
      <div className="flex items-center gap-2 border-r border-slate-800 pr-2.5">
        <div className="relative flex-shrink-0">
          {!dksImgError ? (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/D._K._Shivakumar.jpg/220px-D._K._Shivakumar.jpg"
              alt="Sri D.K. Shivakumar - Deputy Chief Minister of Karnataka"
              onError={() => setDksImgError(true)}
              className="w-9 h-9 rounded-full object-cover object-top border-2 border-amber-400 shadow"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs border-2 border-amber-400 shadow">
              DKS
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-slate-950" />
        </div>
        {!compact && (
          <div className="text-left hidden lg:block">
            <div className="text-white font-extrabold text-[11px] leading-tight">Sri D.K. Shivakumar</div>
            <div className="text-amber-400 text-[9px] font-bold tracking-wide uppercase">Dy. Chief Minister, Kar</div>
          </div>
        )}
      </div>

      {/* Priyank Kharge */}
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          {!pkImgError ? (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Priyank_Kharge.jpg/220px-Priyank_Kharge.jpg"
              alt="Sri Priyank Kharge - IT BT & RDPR Minister"
              onError={() => setPkImgError(true)}
              className="w-9 h-9 rounded-full object-cover object-top border-2 border-emerald-400 shadow"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black text-xs border-2 border-emerald-400 shadow">
              PK
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border border-slate-950" />
        </div>
        {!compact && (
          <div className="text-left hidden lg:block">
            <div className="text-white font-extrabold text-[11px] leading-tight">Sri Priyank Kharge</div>
            <div className="text-emerald-400 text-[9px] font-bold tracking-wide uppercase">IT, BT &amp; RDPR Minister</div>
          </div>
        )}
      </div>
    </div>
  );
};
