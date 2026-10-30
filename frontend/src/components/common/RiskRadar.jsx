import React from 'react';
import { ShieldAlert, DollarSign, Activity, Scale } from 'lucide-react';

export const RiskRadar = ({
  overall = 0,
  financial = 0,
  operational = 0,
  compliance = 0,
  compact = false
}) => {
  const getRiskColor = (score) => {
    if (score < 40) return { text: 'text-emerald-400', bg: 'bg-emerald-500', track: 'bg-emerald-950/60', label: 'Low Risk' };
    if (score < 70) return { text: 'text-amber-400', bg: 'bg-amber-500', track: 'bg-amber-950/60', label: 'Moderate' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', track: 'bg-rose-950/60', label: 'Critical' };
  };

  const overallTheme = getRiskColor(overall);
  const financialTheme = getRiskColor(financial);
  const operationalTheme = getRiskColor(operational);
  const complianceTheme = getRiskColor(compliance);

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Risk:</span>
          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${overallTheme.bg}/20 ${overallTheme.text} border border-${overallTheme.bg}/30`}>
            {overall}/100
          </span>
        </div>
        <div className="flex gap-1.5 items-center">
          <div title={`Financial: ${financial}/100`} className={`w-2 h-4 rounded-sm ${financialTheme.bg}`} />
          <div title={`Operational: ${operational}/100`} className={`w-2 h-4 rounded-sm ${operationalTheme.bg}`} />
          <div title={`Compliance: ${compliance}/100`} className={`w-2 h-4 rounded-sm ${complianceTheme.bg}`} />
        </div>
      </div>
    );
  }

  const vectors = [
    { name: 'Financial Exposure', score: financial, theme: financialTheme, icon: DollarSign, weight: '35%' },
    { name: 'Operational Friction', score: operational, theme: operationalTheme, icon: Activity, weight: '30%' },
    { name: 'Compliance & Legal', score: compliance, theme: complianceTheme, icon: Scale, weight: '35%' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/60">
        <div>
          <h4 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            AI Risk Vector Matrix
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Automated synthesis via Gemini 2.5 Flash</p>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Composite Risk</span>
          <div className="flex items-baseline justify-end gap-1">
            <span className={`text-2xl font-black font-mono ${overallTheme.text}`}>{overall}</span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
        </div>
      </div>

      {/* Progress Bars for each Vector */}
      <div className="space-y-4">
        {vectors.map((vec) => {
          const Icon = vec.icon;
          return (
            <div key={vec.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {vec.name}
                  <span className="text-[10px] text-slate-500">({vec.weight})</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${vec.theme.text}`}>{vec.score}%</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${vec.theme.bg}/20 ${vec.theme.text}`}>
                    {vec.theme.label}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${vec.theme.bg}`}
                  style={{ width: `${Math.min(100, Math.max(5, vec.score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

