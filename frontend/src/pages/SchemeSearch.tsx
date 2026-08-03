import React, { useState, useEffect } from 'react';
import { searchSchemes } from '../services/api';
import { Scheme } from '../types';
import { Search, Sparkles, CheckCircle2, FileText, ExternalLink, Filter } from 'lucide-react';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const SchemeSearch: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [age, setAge] = useState<number | ''>(25);
  const [gender, setGender] = useState('All');
  const [income, setIncome] = useState<number | ''>(150000);
  const [occupation, setOccupation] = useState('All');

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchSchemes({
        age: age !== '' ? Number(age) : undefined,
        gender,
        income: income !== '' ? Number(income) : undefined,
        occupation
      });
      setSchemes(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-8 shadow-xl border border-emerald-800 space-y-3">
          <KarnatakaBadge />
          <h1 className="text-3xl font-black tracking-tight">Karnataka Government Scheme Finder</h1>
          <p className="text-emerald-200 text-xs sm:text-sm max-w-2xl">
            Enter your age, income, and occupation to find eligible state schemes like Gruha Lakshmi, Yuva Nidhi, Raita Vidya Nidhi & Sandhya Suraksha Pension.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Filter Eligibility Criteria</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Citizen Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="Age in years"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
              >
                <option value="All">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Annual Family Income (₹)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value ? Number(e.target.value) : '')}
                placeholder="Annual income"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
              >
                <option value="All">All Occupations</option>
                <option value="Farmer">Farmer</option>
                <option value="Student">Student</option>
                <option value="Unemployed">Unemployed Youth</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Find Eligible Schemes'}</span>
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Eligible Schemes ({schemes.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemes.map((sc) => (
              <div key={sc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                      {sc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Target: {sc.target_occupation}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{sc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{sc.description}</p>

                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-emerald-900 block">Benefits:</span>
                    <p className="text-emerald-800 font-semibold">{sc.benefits}</p>
                  </div>

                  <div className="text-xs space-y-1 pt-2">
                    <span className="font-bold text-slate-700 block">Required Documents:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                      {sc.required_documents.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Max Income: ₹{sc.max_income}</span>
                  {sc.apply_link && (
                    <a
                      href={sc.apply_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-800"
                    >
                      <span>Apply on Seva Sindhu</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
