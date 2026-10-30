import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  ArrowRightCircle,
  Building2
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const WorkflowBoard = ({
  columns = {},
  stages = [],
  onInitiateTransition
}) => {
  const { user } = useAuth();

  const stageTitles = {
    Draft: { name: 'Draft', color: 'border-slate-700 bg-slate-900/40 text-slate-300' },
    Under_Review: { name: 'Under Review', color: 'border-blue-700/60 bg-blue-950/20 text-blue-300' },
    Compliance_Pending: { name: 'Compliance Pending', color: 'border-amber-700/60 bg-amber-950/20 text-amber-300' },
    Approved: { name: 'Approved', color: 'border-emerald-700/60 bg-emerald-950/20 text-emerald-300' },
    Rejected: { name: 'Rejected', color: 'border-rose-700/60 bg-rose-950/20 text-rose-300' },
    Archived: { name: 'Archived', color: 'border-zinc-700 bg-zinc-950/40 text-zinc-400' }
  };

  const canUserTransition = (item) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Department_Lead') {
      const isAuthorDept = item.department === user.department;
      const isImpacted = Array.isArray(item.impacted_departments) && item.impacted_departments.includes(user.department);
      return isAuthorDept || isImpacted;
    }
    return false;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 select-none min-h-[calc(100vh-230px)]">
      {stages.map((stageKey) => {
        const items = columns[stageKey] || [];
        const meta = stageTitles[stageKey] || { name: stageKey, color: 'border-slate-800' };

        return (
          <div
            key={stageKey}
            className="w-80 shrink-0 flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800/90 shadow-xl overflow-hidden"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b flex items-center justify-between ${meta.color}`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-tight">{meta.name}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-950/70 border border-slate-700/50">
                  {items.length}
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3.5 max-h-[calc(100vh-280px)]">
              {items.length === 0 ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs">
                  No initiatives
                </div>
              ) : (
                items.map((item) => {
                  const formattedBudget = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                  }).format(item.budget || 0);

                  const userCanSignOff = canUserTransition(item);

                  return (
                    <div
                      key={item.id}
                      className="group bg-slate-850 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-md transition-all duration-150 space-y-3"
                    >
                      {/* Department & Type */}
                      <div className="flex items-center justify-between gap-1">
                        <Badge variant={item.department} size="sm">
                          {item.department.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                          {item.initiative_type.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Title */}
                      <Link to={`/initiatives/${item.id}`}>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                      </Link>

                      {/* AI Risk Score Pill if present */}
                      {item.evaluation && (
                        <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-950/80 border border-slate-800/90">
                          <span className="flex items-center gap-1 text-slate-300 font-mono font-bold">
                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                            Risk: {item.evaluation.overall_risk_score}/100
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold truncate max-w-[110px]">
                            {item.evaluation.executive_action_verdict.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}

                      {/* Budget and Target Date */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                        <span className="text-emerald-400 font-bold">{formattedBudget}</span>
                        <span>{item.target_date}</span>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1">
                        <Link
                          to={`/initiatives/${item.id}`}
                          className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                          View Details
                        </Link>

                        {userCanSignOff && (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => onInitiateTransition(item)}
                            icon={ArrowRightCircle}
                            className="text-[11px]"
                          >
                            Transition
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

