import React, { useState, useEffect } from 'react';
import { searchSchemes } from '../services/api';
import { Scheme } from '../types';
import { Search, Sparkles, CheckCircle2, FileText, ExternalLink, Filter, ShieldCheck, RefreshCw, BookOpen } from 'lucide-react';
import { KarnatakaBadge } from '../components/KarnatakaBadge';
import { useLang } from '../context/LanguageContext';

const CATEGORIES = [
  'All',
  'Karnataka 5 Guarantees',
  'Education & Farmers',
  'Senior Citizens',
  'Healthcare & Medical',
  'Social Welfare & Inclusion',
  'Health & Nutrition',
  'Business & Entrepreneurship'
];

export const SchemeSearch: React.FC = () => {
  const { t } = useLang();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('All');
  const [income, setIncome] = useState<number | ''>('');
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

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setAge('');
    setGender('All');
    setIncome('');
    setOccupation('All');
    handleSearch();
  };

  // Filter local results by search keyword and category tab
  const filteredSchemes = schemes.filter((sc) => {
    const matchesSearch =
      sc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || sc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Explore all current Karnataka Government Welfare &amp; 5 Guarantee Schemes (Gruha Lakshmi, Gruha Jyothi, Yuva Nidhi, Shakti, Anna Bhagya, Raita Vidya Nidhi, Sandhya Suraksha, Arogya Karnataka &amp; more). Check instant eligibility, required documents, and direct application links.
          </p>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'All' ? '⚡ All Schemes' : cat}
            </button>
          ))}
        </div>

        {/* Search & Criteria Filter Box */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs tracking-widest uppercase">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Smart Citizen Eligibility Engine</span>
            </div>

            {/* Keyword Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search scheme name (e.g. Gruha Lakshmi, Pension...)"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Citizen Age (Years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 25"
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
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Max Annual Family Income (₹)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 200000"
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
                <option value="Senior Citizen">Senior Citizen</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-xl border border-slate-800 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>

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
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-400" />
              <span>Karnataka State Schemes ({filteredSchemes.length})</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Showing active welfare programs</span>
          </div>

          {filteredSchemes.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Matching Schemes Found</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Try resetting your income or age filter to view all 12 government schemes available in Karnataka.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow"
              >
                Show All Schemes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSchemes.map((sc) => (
                <div key={sc.id} className="glass-panel rounded-3xl p-7 border border-slate-800 space-y-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl relative overflow-hidden group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-3 py-1 rounded-full font-extrabold text-[11px] border ${
                        sc.category.includes('5 Guarantees')
                          ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-900 border-slate-700 text-emerald-400'
                      }`}>
                        {sc.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Occupation: <b className="text-slate-200">{sc.target_occupation}</b></span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
                      {sc.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{sc.description}</p>

                    <div className="bg-emerald-950/80 border border-emerald-800/80 p-4 rounded-2xl text-xs space-y-1">
                      <span className="font-extrabold text-amber-400 block uppercase tracking-wider text-[10px]">Scheme Benefits:</span>
                      <p className="text-emerald-300 font-bold">{sc.benefits}</p>
                    </div>

                    <div className="text-xs space-y-2 pt-1">
                      <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">Required Documents:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sc.required_documents.map((doc, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{doc}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Max Income: <b className="text-slate-200">₹{sc.max_income.toLocaleString()}</b>
                    </span>
                    {sc.apply_link && (
                      <a
                        href={sc.apply_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                      >
                        <span>Apply on Seva Sindhu</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
