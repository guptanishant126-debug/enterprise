import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { initiativeApi } from '../services/api';
import { InitiativeCard } from '../components/initiatives/InitiativeCard';
import { Button } from '../components/common/Button';

export const InitiativesPage = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');

  const fetchInitiatives = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedStage !== 'All') params.stage = selectedStage;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await initiativeApi.getAll(params);
      setInitiatives(res.data.data || []);
    } catch (err) {
      console.error('[InitiativesPage] Error loading initiatives:', err);
      setError('Failed to load enterprise initiatives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitiatives();
  }, [selectedDept, selectedStage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInitiatives();
  };

  const departments = [
    'All',
    'Finance',
    'Engineering',
    'Human_Resources',
    'Legal_Compliance',
    'Operations',
    'Product_Strategy'
  ];

  const stages = [
    'All',
    'Draft',
    'Under_Review',
    'Compliance_Pending',
    'Approved',
    'Rejected',
    'Archived'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Enterprise Initiative Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Searchable catalog of organizational proposals, strategic policies, and AI risk evaluations
          </p>
        </div>

        <Link to="/initiatives/new">
          <Button size="md" variant="primary" icon={Plus}>
            Propose New Initiative
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search titles, summaries, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Filtering enterprise initiatives...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
          {error}
        </div>
      ) : initiatives.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3">
          <FileSpreadsheet className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No matching initiatives found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No organizational proposals matched the current department, stage, or search query.
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedDept('All');
                setSelectedStage('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initiatives.map((init) => (
            <InitiativeCard key={init.id} initiative={init} />
          ))}
        </div>
      )}
    </div>
  );
};

