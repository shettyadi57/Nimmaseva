import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  CheckSquare, 
  Square, 
  Copy, 
  Printer, 
  ArrowRight, 
  Clock, 
  Coins, 
  Building2, 
  ShieldCheck, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  AlertOctagon, 
  Check, 
  HelpCircle,
  BookOpen,
  Info
} from 'lucide-react';
import { fetchServices } from '../services/api';
import { Service } from '../types';
import { useLang } from '../context/LanguageContext';
import { KarnatakaBadge } from '../components/KarnatakaBadge';

export const ServiceDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const { t } = useLang();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  // Track checked documents per service: serviceId -> Set of checked doc indices
  const [checkedDocsMap, setCheckedDocsMap] = useState<Record<number, Set<number>>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'popular'>('all');

  React.useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await fetchServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(services.map(s => s.category)));
    return ['All', ...cats];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCat = selectedCategory === 'All' || service.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || 
        service.name.toLowerCase().includes(query) ||
        service.code.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query)) ||
        service.required_documents.some(doc => doc.toLowerCase().includes(query));
      
      const matchesTab = activeTab === 'all' || ['INC-001', 'CST-002', 'ICC-003', 'RAT-006', 'LND-008', 'GLK-014'].includes(service.code);

      return matchesCat && matchesQuery && matchesTab;
    });
  }, [services, selectedCategory, searchQuery, activeTab]);

  const toggleDocCheck = (serviceId: number, docIdx: number) => {
    setCheckedDocsMap(prev => {
      const serviceSet = new Set(prev[serviceId] || []);
      if (serviceSet.has(docIdx)) {
        serviceSet.delete(docIdx);
      } else {
        serviceSet.add(docIdx);
      }
      return { ...prev, [serviceId]: serviceSet };
    });
  };

  const handleCopyChecklist = (service: Service) => {
    const docListText = service.required_documents
      .map((doc, idx) => `${idx + 1}. ${doc}`)
      .join('\n');
    
    const fullText = `📋 Nimma Seva Document Checklist\nService: ${service.name} (${service.code})\nCategory: ${service.category}\nFee: ${service.fee === 0 ? 'FREE' : '₹' + service.fee}\nProcessing Time: ~${service.avg_processing_time_mins} Mins\n\nMandatory Required Documents:\n${docListText}\n\nBook your token pass at: ${window.location.origin}/book?serviceId=${service.id}`;

    navigator.clipboard.writeText(fullText);
    setCopiedId(service.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handlePrintChecklist = (service: Service) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const docListHtml = service.required_documents
      .map((doc, idx) => `<li style="margin-bottom: 8px; font-size: 14px;"><strong>[  ] Step ${idx + 1}:</strong> ${doc}</li>`)
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Document Checklist - ${service.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; color: #0f172a; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
            .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-top: 8px; }
            .meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; }
            ul { list-style-type: none; padding-left: 0; }
            .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Nimma Seva (ನಿಮ್ಮ ಸೇವಾ) — Shivamogga Smart Governance</div>
            <div class="subtitle">GramOne & Seva Sindhu Citizen Document Checklist</div>
          </div>
          <h2>${service.name} (${service.code})</h2>
          <div class="badge">${service.category}</div>
          <div class="meta">
            <p><strong>Official Fee:</strong> ${service.fee === 0 ? 'FREE' : '₹' + service.fee}</p>
            <p><strong>Est. Processing Time:</strong> ~${service.avg_processing_time_mins} Mins</p>
            <p><strong>Service Description:</strong> ${service.description || 'Government certified civic service.'}</p>
          </div>
          <h3>Required Documents Checklist (Bring original + self-attested photocopies):</h3>
          <ul>${docListHtml}</ul>
          <div class="footer">
            Printed from Nimma Seva Portal • Shivamogga District Administration • ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex justify-center">
            <KarnatakaBadge />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-400">
            {t.servicesTitle || 'Services & Required Documents Directory'}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {t.servicesSubtitle || 'Browse comprehensive document checklists, fees, processing times, and eligibility criteria for all GramOne & Seva Sindhu services in Shivamogga district.'}
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by service name (e.g. Income Certificate, Ration Card, Pahani, Caste, Pension)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 text-sm sm:text-base shadow-xl transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'popular'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Most Requested
            </button>
          </div>

          {/* Category Pill Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1">
          <span>
            Showing <strong className="text-amber-400 font-mono">{filteredServices.length}</strong> services
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          <span className="hidden sm:inline text-slate-500">
            Tip: Click checkboxes to track collected documents before visiting the office
          </span>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse h-64" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
            <HelpCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Services Found</h3>
            <p className="text-xs text-slate-400">
              We couldn't find any services matching "{searchQuery}". Try searching for terms like "Income", "Caste", "Ration", or "RTC".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setActiveTab('all'); }}
              className="mt-2 px-4 py-2 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const checkedSet = checkedDocsMap[service.id] || new Set();
              const totalDocs = service.required_documents.length;
              const checkedCount = checkedSet.size;
              const progressPct = totalDocs > 0 ? Math.round((checkedCount / totalDocs) * 100) : 0;
              const isCopied = copiedId === service.id;

              return (
                <div
                  key={service.id}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-lg group hover:shadow-2xl hover:shadow-amber-950/20"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80 inline-block mb-1.5">
                          {service.category}
                        </span>
                        <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors leading-snug">
                          {service.name}
                        </h3>
                      </div>
                      <span className="text-xs font-black text-amber-400 font-mono bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60 shrink-0">
                        {service.fee === 0 ? 'FREE' : `₹${service.fee}`}
                      </span>
                    </div>

                    {/* Description */}
                    {service.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    {/* Stats bar */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>~{service.avg_processing_time_mins} mins</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cap: {service.daily_capacity}/day</span>
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Online</span>
                      </span>
                    </div>

                    {/* Required Documents Interactive List */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span className="flex items-center gap-1.5 text-amber-300">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Required Documents Checklist</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {checkedCount}/{totalDocs} ready
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Document items */}
                      <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {service.required_documents.map((doc, docIdx) => {
                          const isChecked = checkedSet.has(docIdx);
                          return (
                            <button
                              key={docIdx}
                              onClick={() => toggleDocCheck(service.id, docIdx)}
                              className={`w-full text-left p-2 rounded-xl text-xs flex items-start gap-2 transition-colors ${
                                isChecked
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                                  : 'bg-slate-950/40 text-slate-300 hover:bg-slate-800/60 border border-slate-800/40'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                              )}
                              <span className={isChecked ? 'line-through text-emerald-300/80' : ''}>
                                {doc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyChecklist(service)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          isCopied
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title="Copy document checklist to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy List</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handlePrintChecklist(service)}
                        className="py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                        title="Print document checklist"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                        <span>Print</span>
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/book?serviceId=${service.id}`)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all group-hover:scale-[1.01]"
                    >
                      <span>Book Token for this Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
