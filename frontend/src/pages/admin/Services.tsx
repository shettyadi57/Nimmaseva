import React, { useEffect, useState } from 'react';
import { fetchServices, toggleServiceStatus } from '../../services/api';
import { Service } from '../../types';
import { Sliders, CheckCircle2, AlertTriangle, Power, Server, Shield } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const ServicesControl: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await toggleServiceStatus(serviceId, newServerStatus, isActive);
      loadServices();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <KarnatakaBadge />
          <h1 className="text-2xl font-black mt-1">SERVICE SERVER STATUS CONTROL</h1>
          <p className="text-xs text-slate-400">Toggle service availability, set Maintenance or Down status to block user bookings</p>
        </div>

        {/* Services Table */}
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Service Code</th>
                <th className="p-4">Service Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Fee (₹)</th>
                <th className="p-4">Server Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-750">
                  <td className="p-4 font-mono font-bold text-amber-400">{srv.code}</td>
                  <td className="p-4 font-bold text-white text-sm">{srv.name}</td>
                  <td className="p-4 text-emerald-300 font-semibold">{srv.category}</td>
                  <td className="p-4 font-mono font-bold text-slate-200">₹ {srv.fee}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      srv.server_status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                      srv.server_status === 'Maintenance' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {srv.server_status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleStatusChange(srv.id, 'Active', true)}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleStatusChange(srv.id, 'Maintenance', true)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded-lg"
                    >
                      Maintenance
                    </button>
                    <button
                      onClick={() => handleStatusChange(srv.id, 'Down', false)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] rounded-lg"
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
