import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Users, ArrowRight, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';

export const InitiativeCard = ({ initiative }) => {
  const {
    id,
    title,
    department,
    initiative_type,
    budget,
    target_date,
    impacted_departments,
    summary,
    current_stage,
    author_name,
    evaluation
  } = initiative;

  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(budget || 0);

  const getVerdictTheme = (verdict) => {
    switch (verdict) {
      case 'Fast_Track_Approval': return 'Fast_Track_Approval';
      case 'Escalate_To_Legal': return 'Escalate_To_Legal';
      case 'Require_Budget_Revision': return 'Require_Budget_Revision';
      case 'Reject': return 'Reject';
      default: return 'Standard_Review';
    }
  };

  return (
    <div className="group bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between hover:translate-y-[-1px]">
      <div>
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={department} size="sm">
              {department.replace('_', ' ')}
            </Badge>
            <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
              {initiative_type.replace('_', ' ')}
            </span>
          </div>

          <Badge variant={current_stage} size="sm">
            {current_stage.replace('_', ' ')}
          </Badge>
        </div>

        {/* Title */}
        <Link to={`/initiatives/${id}`}>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 tracking-tight">
            {title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {summary}
        </p>

        {/* AI Evaluation Pill if present */}
        {evaluation && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Risk Index</span>
                <span className="text-xs font-black font-mono text-slate-200">{evaluation.overall_risk_score}/100</span>
              </div>
            </div>

            <Badge variant={getVerdictTheme(evaluation.executive_action_verdict)} size="sm">
              {evaluation.executive_action_verdict.replace(/_/g, ' ')}
            </Badge>
          </div>
        )}
      </div>

      {/* Footer Metadata */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex flex-col gap-2.5 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-mono font-semibold text-slate-200">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            {formattedBudget}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {target_date}
          </span>
        </div>

        {/* Impacted Stakeholders */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 overflow-hidden">
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-[11px] truncate text-slate-400">
              {Array.isArray(impacted_departments) ? impacted_departments.map(d => d.replace('_', ' ')).join(', ') : 'None'}
            </span>
          </div>

          <Link
            to={`/initiatives/${id}`}
            className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 ml-2 shrink-0 group-hover:translate-x-0.5 transition-transform"
          >
            Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

