import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Sliders, Shield } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const AdminSettings: React.FC = () => {
  const [offlineRange1, setOfflineRange1] = useState('1-10');
  const [onlineRange1, setOnlineRange1] = useState('11-40');
  const [offlineRange2, setOfflineRange2] = useState('41-50');
  const [onlineRange2, setOnlineRange2] = useState('51-80');
  const [priorityRange, setPriorityRange] = useState('81-90');
  const [emergencyRange, setEmergencyRange] = useState('91-100');

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-2">
          <KarnatakaBadge />
          <h1 className="text-3xl font-black text-white mt-1">HYBRID TOKEN ALLOCATION CONFIGURATION</h1>
          <p className="text-xs text-slate-400">Configure token number ranges for Online vs Walk-in vs Priority & Emergency citizens</p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-2xl text-emerald-400 font-extrabold text-xs">
            ✓ System settings saved successfully. Hybrid token allocation engine updated.
          </div>
        )}

        <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <h2 className="text-xl font-extrabold text-white border-b border-slate-800 pb-4">Token Numbering Pools</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Offline Walk-in Pool 1</label>
              <input
                type="text"
                value={offlineRange1}
                onChange={(e) => setOfflineRange1(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Online Booking Pool 1</label>
              <input
                type="text"
                value={onlineRange1}
                onChange={(e) => setOnlineRange1(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Offline Walk-in Pool 2</label>
              <input
                type="text"
                value={offlineRange2}
                onChange={(e) => setOfflineRange2(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Online Booking Pool 2</label>
              <input
                type="text"
                value={onlineRange2}
                onChange={(e) => setOnlineRange2(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Priority Citizens Pool (Senior/PwD)</label>
              <input
                type="text"
                value={priorityRange}
                onChange={(e) => setPriorityRange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-indigo-400 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Emergency Tokens Pool</label>
              <input
                type="text"
                value={emergencyRange}
                onChange={(e) => setEmergencyRange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-red-400 focus:border-red-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Range Configurations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
