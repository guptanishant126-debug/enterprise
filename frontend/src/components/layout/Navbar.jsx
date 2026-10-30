import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/dashboard') return 'Executive Dashboard & KPI Aggregator';
    if (pathname === '/initiatives') return 'Enterprise Initiative Repository';
    if (pathname === '/initiatives/new') return 'Ingest Initiative & Corporate Strategy Memo';
    if (pathname.startsWith('/initiatives/')) return 'Initiative Impact Matrix & AI Governance Audit';
    if (pathname === '/workflows') return 'Cross-Departmental Workflow Board';
    if (pathname === '/intelligence') return 'Enterprise Knowledge Intelligence Engine';
    if (pathname === '/audit-log') return 'Immutable Governance & Compliance Audit Trail';
    return 'NexusAI Enterprise Platform';
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            {getPageTitle(location.pathname)}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-850 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Gemini 2.5 Flash</span>
          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-700/50">
            Audit Mode
          </span>
        </div>

        {/* Ingest Action CTA */}
        {location.pathname !== '/initiatives/new' && (
          <Link to="/initiatives/new">
            <Button size="sm" variant="primary" icon={Plus}>
              <span className="hidden sm:inline">New Proposal</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

