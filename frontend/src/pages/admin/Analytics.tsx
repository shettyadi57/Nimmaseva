import React, { useEffect, useState } from 'react';
import { fetchAnalyticsCharts } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { BarChart3, TrendingUp, Calendar, Clock, PieChart, Shield } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

export const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<string>('daily');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharts(period);
  }, [period]);

  const loadCharts = async (p: string) => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsCharts(p);
      setChartData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <KarnatakaBadge />
            <h1 className="text-2xl font-black mt-1">SHIVAMOGGA SEVA ANALYTICS & REPORTS</h1>
            <p className="text-xs text-slate-400">Peak hours, service demand breakdown, and weekly token utilization</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  period === p ? 'bg-amber-500 text-emerald-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Peak Hours Traffic Chart */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Peak Hour Traffic Distribution
              </h3>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData?.hourly_traffic || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="online" fill="#047857" name="Online Tokens" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="walkin" fill="#d97706" name="Walk-in Tokens" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Trends Line Chart */}
          <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Weekly Token Volume & Revenue
              </h3>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData?.weekly_trends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={3} name="Total Bookings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Most Requested Services Breakdown */}
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" /> Most Requested Government Services
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData?.service_demand || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={140} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                <Bar dataKey="bookings" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
