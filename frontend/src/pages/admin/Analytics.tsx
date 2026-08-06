import React, { useEffect, useState } from 'react';
import { fetchAnalyticsCharts } from '../../services/api';
import { AnalyticsChartData } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Clock, PieChart, RefreshCw } from 'lucide-react';
import { KarnatakaBadge } from '../../components/KarnatakaBadge';

// ── Skeleton loader for charts ──────────────────────────────────────────────
const ChartSkeleton: React.FC = () => (
  <div className="h-72 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <RefreshCw className="w-8 h-8 animate-spin text-amber-500/40" />
      <span className="text-xs font-bold uppercase tracking-widest">Loading chart data…</span>
    </div>
  </div>
);

// ── Empty state for charts ───────────────────────────────────────────────────
const EmptyChart: React.FC<{ label: string }> = ({ label }) => (
  <div className="h-72 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-slate-600">
      <BarChart3 className="w-10 h-10" />
      <span className="text-xs font-semibold">{label}</span>
    </div>
  </div>
);

// ── Shared tooltip style ──────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#090d16',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '12px',
  },
};

export const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<string>('daily');
  const [chartData, setChartData] = useState<AnalyticsChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCharts(period);
  }, [period]);

  const loadCharts = async (p: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAnalyticsCharts(p);
      setChartData(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load chart data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <div className="space-y-1">
            <KarnatakaBadge />
            <h1 className="text-3xl font-black text-white mt-1">SHIVAMOGGA SEVA ANALYTICS & REPORTS</h1>
            <p className="text-xs text-slate-400">Peak hours, service demand breakdown, and token utilization analytics</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-red-300 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Peak Hours Traffic Chart */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" /> Peak Hour Traffic Distribution
              </h3>
            </div>

            {loading ? <ChartSkeleton /> : !chartData?.hourly_traffic?.length ? (
              <EmptyChart label="No hourly traffic data available" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.hourly_traffic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    <Bar dataKey="online" fill="#10b981" name="Online Tokens" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="walkin" fill="#f59e0b" name="Walk-in Tokens" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Weekly Trends Line Chart */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Weekly Token Volume & Revenue
              </h3>
            </div>

            {loading ? <ChartSkeleton /> : !chartData?.weekly_trends?.length ? (
              <EmptyChart label="No weekly trend data available" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.weekly_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={3} name="Total Bookings" dot={{ fill: '#f59e0b', r: 4 }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (₹)" dot={{ fill: '#10b981', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Service Demand Breakdown */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" /> Most Requested Government Services
          </h3>

          {loading ? <ChartSkeleton /> : !chartData?.service_demand?.length ? (
            <EmptyChart label="No service demand data available" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.service_demand} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={180} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="bookings" fill="#10b981" radius={[0, 6, 6, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
