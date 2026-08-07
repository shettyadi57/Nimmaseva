import React, { useEffect, useState } from 'react';
import { fetchServices, toggleServiceStatus } from '../../services/api';
import { Service } from '../../types';
import { Sliders, CheckCircle2, AlertTriangle, Power, Server, Shield } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const ServicesControl: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (serviceId: number, newServerStatus: string, isActive: boolean) => {
    const srv = services.find((s) => s.id === serviceId);
    try {
      await toggleServiceStatus(serviceId, newServerStatus, isActive);
      setToastMsg(`Server status for '${srv?.name || 'Service'}' updated to '${newServerStatus.toUpperCase()}'. Citizens selecting this service will now see the outage popup notice.`);
      setTimeout(() => setToastMsg(null), 5000);
      loadServices();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-2">
          <KarnatakaBadge />
          <h1 className="text-3xl font-black text-white mt-1">SERVICE SERVER STATUS CONTROL CENTER</h1>
          <p className="text-xs text-slate-400">Toggle individual service availability (Active, Maintenance, Server Down) to instantly control citizen booking slots</p>
        </div>

        {/* Action Toast Feedback Banner */}
        {toastMsg && (
          <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-bold flex items-center justify-between gap-3 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Services Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Service Code</th>
                <th className="p-4">Service Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Fee (₹)</th>
                <th className="p-4">Current Server Status</th>
                <th className="p-4 text-right">Status Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-4 font-mono font-black text-amber-400 text-sm">{srv.code}</td>
                  <td className="p-4 font-bold text-white text-sm">{srv.name}</td>
                  <td className="p-4 text-emerald-400 font-bold">{srv.category}</td>
                  <td className="p-4 font-mono font-bold text-slate-200">₹ {srv.fee}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full font-black text-[10px] ${
                      srv.server_status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      srv.server_status === 'Maintenance' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {srv.server_status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleStatusChange(srv.id, 'Active', true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-xl shadow transition-all"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleStatusChange(srv.id, 'Maintenance', true)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-xl shadow transition-all"
                    >
                      Maintenance
                    </button>
                    <button
                      onClick={() => handleStatusChange(srv.id, 'Down', false)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] rounded-xl shadow transition-all"
                    >
                      Server Down
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
