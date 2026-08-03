import React, { useState, useEffect } from 'react';
import { searchSchemes } from '../services/api';
import { Scheme } from '../types';
import { Search, Sparkles, CheckCircle2, FileText, ExternalLink, Filter, ShieldCheck } from 'lucide-react';
import { KarnatakaBadge } from '../components/KarnatakaBadge';
import { useLang } from '../context/LanguageContext';

export const SchemeSearch: React.FC = () => {
  const { t } = useLang();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <KarnatakaBadge />
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {t.schemesTitle}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Enter citizen age, family income, and occupation to automatically filter eligible state welfare schemes like Gruha Lakshmi, Yuva Nidhi, Raita Vidya Nidhi & Sandhya Suraksha Pension.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-widest uppercase">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Filter Citizen Criteria</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Citizen Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="Age in years"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-bold focus:border-amber-400 focus:outline-none"
              >
                <option value="All">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Annual Family Income (₹)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value ? Number(e.target.value) : '')}
                placeholder="Annual income"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-bold focus:border-amber-400 focus:outline-none"
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
              className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Evaluating Eligibility...' : 'Filter Eligible Schemes'}</span>
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Eligible State Schemes ({schemes.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemes.map((sc) => (
              <div key={sc.id} className="glass-panel rounded-3xl p-7 border border-slate-800 space-y-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-400 font-bold text-[11px]">
                      {sc.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Target: {sc.target_occupation}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white">{sc.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{sc.description}</p>

                  <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-2xl text-xs space-y-1">
                    <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[10px]">Scheme Benefits:</span>
                    <p className="text-emerald-300 font-bold">{sc.benefits}</p>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">Required Documents:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                      {sc.required_documents.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Max Income: ₹{sc.max_income}</span>
                  {sc.apply_link && (
                    <a
                      href={sc.apply_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
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
