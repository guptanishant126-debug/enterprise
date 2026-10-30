import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  DollarSign,
  AlertOctagon,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Building2,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { metricsApi } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await metricsApi.getDashboard();
        setMetrics(res.data.data);
      } catch (err) {
        console.error('[DashboardPage] Error loading metrics:', err);
        setError('Failed to aggregate dashboard intelligence metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400 font-mono">Aggregating enterprise telemetry and risk metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  const {
    summary = {},
    stage_counts = {},
    risk_distribution = {},
    department_budgets = {},
    bottlenecks = [],
    recent_initiatives = []
  } = metrics || {};

  const formattedTotalBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(summary.total_budget || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Enterprise Intelligence & Governance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time cross-departmental impact evaluations, stage progression, and capital exposure
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/initiatives/new">
            <Button size="sm" variant="primary">
              Submit Initiative
            </Button>
          </Link>
          <Link to="/workflows">
            <Button size="sm" variant="outline">
              View Kanban Board
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Active Initiatives"
          value={summary.total_initiatives || 0}
          subtext="Under management & pipeline"
          icon={Layers}
          variant="indigo"
        />

        <MetricCard
          title="Capital Allocated"
          value={formattedTotalBudget}
          subtext="Across active proposals"
          icon={DollarSign}
          variant="emerald"
        />

        <MetricCard
          title="Pending Approvals"
          value={summary.pending_approvals || 0}
          subtext="Review & Compliance gates"
          icon={Clock}
          variant="amber"
        />

        <MetricCard
          title="Avg Enterprise Risk"
          value={`${summary.avg_risk_score || 0}/100`}
          subtext="Gemini weighted composite"
          icon={ShieldAlert}
          variant={summary.avg_risk_score > 65 ? 'rose' : 'default'}
        />
      </div>

      {/* Second Row: Stage Pipeline Breakdown & Risk Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage Counts */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Stage Progression Pipeline
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {summary.total_initiatives} items
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { key: 'Draft', label: 'Draft Stage', count: stage_counts.Draft || 0, color: 'bg-slate-700' },
              { key: 'Under_Review', label: 'Under Review', count: stage_counts.Under_Review || 0, color: 'bg-blue-500' },
              { key: 'Compliance_Pending', label: 'Compliance Pending', count: stage_counts.Compliance_Pending || 0, color: 'bg-amber-500' },
              { key: 'Approved', label: 'Approved (Production)', count: stage_counts.Approved || 0, color: 'bg-emerald-500' },
              { key: 'Rejected', label: 'Rejected', count: stage_counts.Rejected || 0, color: 'bg-rose-500' },
              { key: 'Archived', label: 'Archived', count: stage_counts.Archived || 0, color: 'bg-zinc-600' }
            ].map((st) => (
              <div key={st.key} className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${st.color}`} />
                  {st.label}
                </span>
                <span className="font-mono font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {st.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution Gauge */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Risk Index Distribution
            </h3>
            <span className="text-xs text-slate-500 font-mono">Audited</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-medium">Low Risk (&lt;40)</span>
                <span className="font-mono font-bold text-slate-200">{risk_distribution.low || 0} initiatives</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((risk_distribution.low || 0) / (summary.total_initiatives || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300 font-medium">Moderate Risk (40-69)</span>
                <span className="font-mono font-bold text-slate-200">{risk_distribution.medium || 0} initiatives</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((risk_distribution.medium || 0) / (summary.total_initiatives || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-300 font-medium">High / Critical Risk (70+)</span>
                <span className="font-mono font-bold text-slate-200">{risk_distribution.high || 0} initiatives</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((risk_distribution.high || 0) / (summary.total_initiatives || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
            Automated escalations triggered for scores exceeding 70.
          </div>
        </div>

        {/* Department Capital Allocation */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Departmental Capital Exposure
            </h3>
            <span className="text-xs text-slate-500 font-mono">USD</span>
          </div>

          <div className="space-y-3">
            {Object.entries(department_budgets).length === 0 ? (
              <p className="text-xs text-slate-400">No active budgets allocated.</p>
            ) : (
              Object.entries(department_budgets).map(([dept, amount]) => (
                <div key={dept} className="flex items-center justify-between text-xs">
                  <Badge variant={dept} size="sm">
                    {dept.replace('_', ' ')}
                  </Badge>
                  <span className="font-mono font-bold text-slate-200">
                    ${Number(amount).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Third Row: Cross-Department Bottlenecks & Recent Initiatives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Bottlenecks */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-200 tracking-tight">
                Active Cross-Departmental Bottlenecks
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
              {bottlenecks.length} Identified
            </span>
          </div>

          {bottlenecks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No cross-departmental bottlenecks flagged.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {bottlenecks.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300">
                      {b.stage}
                    </span>
                    <Badge variant={b.department} size="sm">
                      {b.department.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {b.description}
                  </p>
                  <Link
                    to={`/initiatives/${b.initiative_id}`}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    View Initiative: {b.initiative_title} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Initiatives */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              Recent Organizational Initiatives
            </h3>
            <Link to="/initiatives" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </div>

          {recent_initiatives.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No initiatives submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {recent_initiatives.map((item) => (
                <Link
                  key={item.id}
                  to={`/initiatives/${item.id}`}
                  className="block p-3.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/90 transition-all duration-150"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {item.title}
                    </h4>
                    <Badge variant={item.current_stage} size="sm">
                      {item.current_stage.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">
                      ${Number(item.budget).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

