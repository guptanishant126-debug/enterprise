import React from 'react';

export const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  trend
}) => {
  const variantStyles = {
    default: {
      card: 'bg-slate-900 border-slate-800/90',
      iconBg: 'bg-slate-800 text-slate-300',
      valueColor: 'text-slate-100'
    },
    indigo: {
      card: 'bg-slate-900 border-indigo-900/40 hover:border-indigo-700/60',
      iconBg: 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/50',
      valueColor: 'text-indigo-200'
    },
    emerald: {
      card: 'bg-slate-900 border-emerald-900/40 hover:border-emerald-700/60',
      iconBg: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50',
      valueColor: 'text-emerald-200'
    },
    amber: {
      card: 'bg-slate-900 border-amber-900/40 hover:border-amber-700/60',
      iconBg: 'bg-amber-950/80 text-amber-400 border border-amber-800/50',
      valueColor: 'text-amber-200'
    },
    rose: {
      card: 'bg-slate-900 border-rose-900/40 hover:border-rose-700/60',
      iconBg: 'bg-rose-950/80 text-rose-400 border border-rose-800/50',
      valueColor: 'text-rose-200'
    }
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`p-5 rounded-2xl border shadow-xl transition-all duration-200 ${style.card}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${style.valueColor}`}>
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-400 line-clamp-1">{subtext}</p>
      )}
    </div>
  );
};

