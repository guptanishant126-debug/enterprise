import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-indigo-950/70 text-indigo-300 border border-indigo-700/60',
    success: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60',
    warning: 'bg-amber-950/70 text-amber-300 border border-amber-700/60',
    danger: 'bg-rose-950/70 text-rose-300 border border-rose-700/60',
    purple: 'bg-purple-950/70 text-purple-300 border border-purple-700/60',
    cyan: 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/60',
    
    // Stages
    Draft: 'bg-slate-800 text-slate-300 border border-slate-700',
    Under_Review: 'bg-blue-950/70 text-blue-300 border border-blue-700/60',
    Compliance_Pending: 'bg-amber-950/70 text-amber-300 border border-amber-700/60',
    Approved: 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60',
    Rejected: 'bg-rose-950/70 text-rose-300 border border-rose-700/60',
    Archived: 'bg-zinc-900 text-zinc-400 border border-zinc-700',

    // Executive Verdicts
    Fast_Track_Approval: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500 shadow-sm shadow-emerald-900/30',
    Standard_Review: 'bg-blue-950/80 text-blue-300 border border-blue-500',
    Escalate_To_Legal: 'bg-rose-950/80 text-rose-300 border border-rose-500 shadow-sm shadow-rose-900/30',
    Require_Budget_Revision: 'bg-amber-950/80 text-amber-300 border border-amber-500',
    Reject: 'bg-red-950/80 text-red-300 border border-red-500',

    // Priorities
    P1: 'bg-rose-950 text-rose-300 border border-rose-600 font-mono font-bold',
    P2: 'bg-amber-950 text-amber-300 border border-amber-600 font-mono font-bold',
    P3: 'bg-blue-950 text-blue-300 border border-blue-600 font-mono font-bold',

    // Roles
    Admin: 'bg-purple-950/70 text-purple-300 border border-purple-600/70',
    Department_Lead: 'bg-indigo-950/70 text-indigo-300 border border-indigo-600/70',
    Analyst: 'bg-slate-800 text-slate-300 border border-slate-600',

    // Departments
    Finance: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60',
    Engineering: 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60',
    Human_Resources: 'bg-pink-950/60 text-pink-300 border border-pink-800/60',
    Legal_Compliance: 'bg-amber-950/60 text-amber-300 border border-amber-800/60',
    Operations: 'bg-orange-950/60 text-orange-300 border border-orange-800/60',
    Product_Strategy: 'bg-violet-950/60 text-violet-300 border border-violet-800/60'
  };

  const activeClasses = variantClasses[variant] || variantClasses.default;

  return (
    <span className={`inline-flex items-center rounded-full transition-colors ${sizeClasses[size]} ${activeClasses} ${className}`}>
      {children}
    </span>
  );
};

