import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Kanban,
  BrainCircuit,
  ShieldCheck,
  LogOut,
  Building2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export const Sidebar = ({ onClose }) => {
  const { user, logout, hasRole } = useAuth();

  const navigation = [
    { name: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Initiative Repository', href: '/initiatives', icon: FileSpreadsheet },
    { name: 'Ingest New Proposal', href: '/initiatives/new', icon: PlusCircle },
    { name: 'Workflow Kanban', href: '/workflows', icon: Kanban },
    { name: 'Knowledge Intelligence', href: '/intelligence', icon: BrainCircuit, highlight: true },
    ...(hasRole(['Admin', 'Department_Lead'])
      ? [{ name: 'Compliance Audit Trail', href: '/audit-log', icon: ShieldCheck }]
      : [])
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80 bg-slate-900/80">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
            NexusAI <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Enterprise</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Orchestrator & Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Enterprise Systems
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-current" />
              <span className="flex-1 truncate">{item.name}</span>
              {item.highlight && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Profile Footer */}
      {user && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'US'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out of enterprise session"
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
              <Badge variant={user.department} size="sm">
                <Building2 className="w-3 h-3 mr-1 inline" />
                {user.department.replace('_', ' ')}
              </Badge>
              <Badge variant={user.role} size="sm">
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

