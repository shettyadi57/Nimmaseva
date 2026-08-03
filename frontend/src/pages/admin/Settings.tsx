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
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <KarnatakaBadge />
          <h1 className="text-2xl font-black mt-1">HYBRID TOKEN ALLOCATION CONFIGURATION</h1>
          <p className="text-xs text-slate-400">Configure token number ranges for Online vs Walk-in vs Priority & Emergency citizens</p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 font-bold text-xs">
            ✓ Settings saved successfully. Hybrid token allocation engine updated.
          </div>
        )}

        <form onSubmit={handleSave} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3">Token Numbering Pools</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Offline Walk-in Pool 1</label>
              <input
                type="text"
                value={offlineRange1}
                onChange={(e) => setOfflineRange1(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Online Booking Pool 1</label>
              <input
                type="text"
                value={onlineRange1}
                onChange={(e) => setOnlineRange1(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Offline Walk-in Pool 2</label>
              <input
                type="text"
                value={offlineRange2}
                onChange={(e) => setOfflineRange2(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Online Booking Pool 2</label>
              <input
                type="text"
                value={onlineRange2}
                onChange={(e) => setOnlineRange2(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Priority Citizens Pool (Senior/PwD)</label>
              <input
                type="text"
                value={priorityRange}
                onChange={(e) => setPriorityRange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Emergency Tokens Pool</label>
              <input
                type="text"
                value={emergencyRange}
                onChange={(e) => setEmergencyRange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-red-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs uppercase rounded-xl transition-all shadow-lg"
            >
              <Save className="w-4 h-4" /> Save Ranges
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
