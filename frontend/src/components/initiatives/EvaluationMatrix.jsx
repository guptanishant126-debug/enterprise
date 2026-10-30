import React from 'react';
import {
  ShieldAlert,
  GitBranch,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { RiskRadar } from '../common/RiskRadar';

export const EvaluationMatrix = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-pulse" />
        <h4 className="text-base font-bold text-slate-200">Awaiting AI Systems Evaluation</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          This initiative has not yet been processed by the Gemini 2.5 Flash risk engine. Trigger a re-evaluation to synthesize cross-department dependencies and compliance flags.
        </p>
      </div>
    );
  }

  const {
    overall_risk_score,
    financial_impact_score,
    operational_friction_score,
    compliance_risk_score,
    strategic_alignment_summary,
    cross_departmental_dependencies = [],
    identified_bottlenecks = [],
    recommended_mitigations = [],
    executive_action_verdict,
    model_version,
    created_at
  } = evaluation;

  const dependenciesList = Array.isArray(cross_departmental_dependencies)
    ? cross_departmental_dependencies
    : (typeof cross_departmental_dependencies === 'string' ? JSON.parse(cross_departmental_dependencies || '[]') : []);

  const bottlenecksList = Array.isArray(identified_bottlenecks)
    ? identified_bottlenecks
    : (typeof identified_bottlenecks === 'string' ? JSON.parse(identified_bottlenecks || '[]') : []);

  const mitigationsList = Array.isArray(recommended_mitigations)
    ? recommended_mitigations
    : (typeof recommended_mitigations === 'string' ? JSON.parse(recommended_mitigations || '[]') : []);

  const getVerdictDetails = (verdict) => {
    switch (verdict) {
      case 'Fast_Track_Approval':
        return {
          title: 'Fast Track Approval Recommended',
          desc: 'High strategic alignment with minimal cross-departmental friction and low capital exposure.',
          border: 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300'
        };
      case 'Escalate_To_Legal':
        return {
          title: 'Mandatory Legal & Compliance Review',
          desc: 'Significant regulatory or data privacy constraints identified. General Counsel sign-off required.',
          border: 'border-rose-600/60 bg-rose-950/40 text-rose-300'
        };
      case 'Require_Budget_Revision':
        return {
          title: 'Capital Budget Revision Required',
          desc: 'Financial exposure exceeds standard threshold. Requires multi-year ROI verification from Finance.',
          border: 'border-amber-600/60 bg-amber-950/40 text-amber-300'
        };
      case 'Reject':
        return {
          title: 'Proposal Rejection Advised',
          desc: 'Disproportionate risk-to-value ratio, excessive friction across multiple stakeholder divisions.',
          border: 'border-red-600/60 bg-red-950/40 text-red-300'
        };
      default:
        return {
          title: 'Standard Review Protocol',
          desc: 'Proceed through standard cross-departmental review and steering committee sign-off.',
          border: 'border-blue-600/60 bg-blue-950/40 text-blue-300'
        };
    }
  };

  const verdictMeta = getVerdictDetails(executive_action_verdict);

  return (
    <div className="space-y-6">
      {/* Executive Action Verdict Banner */}
      <div className={`p-5 rounded-2xl border ${verdictMeta.border} shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-indigo-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-80">AI Executive Verdict</span>
              <span className="text-[10px] font-mono opacity-60">({model_version || 'gemini-2.5-flash'})</span>
            </div>
            <h4 className="text-base font-black tracking-tight mt-0.5">{verdictMeta.title}</h4>
            <p className="text-xs opacity-90 mt-1 leading-relaxed">{verdictMeta.desc}</p>
          </div>
        </div>

        <Badge variant={executive_action_verdict} size="lg" className="shrink-0 font-mono">
          {executive_action_verdict.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Grid: 4 Core AI Risk Vectors & Strategic Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskRadar
          overall={overall_risk_score}
          financial={financial_impact_score}
          operational={operational_friction_score}
          compliance={compliance_risk_score}
        />

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800/60">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-200 tracking-tight">Strategic Alignment Summary</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {strategic_alignment_summary}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Evaluated via Deterministic Schema</span>
            <span>{created_at ? new Date(created_at).toLocaleDateString() : 'Active'}</span>
          </div>
        </div>
      </div>

      {/* Cross-Departmental Dependencies */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/60">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200 tracking-tight">Cross-Departmental Dependencies</h4>
          <span className="text-xs text-slate-500 font-mono ml-auto">{dependenciesList.length} stakeholder requirements</span>
        </div>

        {dependenciesList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No external department dependencies flagged by AI synthesis.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Target Department</th>
                  <th className="py-2.5 px-3">Dependency Requirement</th>
                  <th className="py-2.5 px-3 text-right">Friction Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dependenciesList.map((dep, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-200 whitespace-nowrap">
                      <Badge variant={dep.department} size="sm">
                        {dep.department.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-300 leading-relaxed max-w-md">
                      {dep.dependency_description}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        dep.friction_level === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        dep.friction_level === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {dep.friction_level} Friction
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Identified Bottlenecks & Recommended Mitigations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bottlenecks */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/60">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-bold text-slate-200 tracking-tight">Identified Operational Bottlenecks</h4>
          </div>

          {bottlenecksList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No acute operational bottlenecks identified.</p>
          ) : (
            <div className="space-y-3">
              {bottlenecksList.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      {item.stage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Mitigations */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-200 tracking-tight">Governance Mitigations (P1 - P3)</h4>
          </div>

          {mitigationsList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No mitigations currently recorded.</p>
          ) : (
            <div className="space-y-3">
              {mitigationsList.map((mit, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <Badge variant={mit.priority} size="sm" className="mt-0.5 shrink-0">
                    {mit.priority}
                  </Badge>
                  <p className="text-xs text-slate-200 leading-relaxed flex-1">
                    {mit.action_item}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

