import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  DollarSign,
  Building2,
  Users,
  Clock,
  RotateCw,
  CheckCircle2,
  FileText,
  History,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { initiativeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EvaluationMatrix } from '../components/initiatives/EvaluationMatrix';
import { StageTransitionModal } from '../components/workflow/StageTransitionModal';

export const InitiativeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isDepartmentLeadOrAdmin } = useAuth();

  const [initiative, setInitiative] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reEvaluating, setReEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);

  const fetchInitiative = async () => {
    try {
      setLoading(true);
      const res = await initiativeApi.getById(id);
      setInitiative(res.data.data);
    } catch (err) {
      console.error('[InitiativeDetailPage] Error:', err);
      setError(err.response?.data?.message || 'Initiative not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitiative();
  }, [id]);

  const handleReEvaluate = async () => {
    setReEvaluating(true);
    try {
      const res = await initiativeApi.reEvaluate(id);
      setInitiative((prev) => ({
        ...prev,
        evaluation: res.data.data
      }));
    } catch (err) {
      console.error('[InitiativeDetailPage] Re-evaluate error:', err);
      alert(err.response?.data?.message || 'Failed to re-evaluate initiative.');
    } finally {
      setReEvaluating(false);
    }
  };

  const handleStageTransitionSubmit = async ({ to_stage, notes }) => {
    setTransitionLoading(true);
    try {
      await initiativeApi.updateStage(id, { to_stage, notes });
      setIsTransitionOpen(false);
      await fetchInitiative();
    } catch (err) {
      console.error('[InitiativeDetailPage] Transition error:', err);
      alert(err.response?.data?.message || 'Failed to transition workflow stage.');
    } finally {
      setTransitionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading initiative & AI risk profile...</p>
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto space-y-4">
        <ShieldCheck className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-100">Unable to load initiative</h3>
        <p className="text-xs text-slate-400">{error || 'Record does not exist.'}</p>
        <Link to="/initiatives">
          <Button size="sm" variant="outline" icon={ArrowLeft}>
            Return to Initiatives
          </Button>
        </Link>
      </div>
    );
  }

  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(initiative.budget || 0);

  const canTransition = isDepartmentLeadOrAdmin();

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16 max-w-6xl mx-auto">
      {/* Top Nav Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <Link
          to="/initiatives"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Initiatives
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {canTransition && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReEvaluate}
              isLoading={reEvaluating}
              icon={RotateCw}
            >
              Re-run Gemini Audit
            </Button>
          )}

          {canTransition && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsTransitionOpen(true)}
              icon={CheckCircle2}
            >
              Transition Stage
            </Button>
          )}
        </div>
      </div>

      {/* Main Initiative Header */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={initiative.department} size="md">
              <Building2 className="w-3.5 h-3.5 mr-1 inline" />
              {initiative.department.replace('_', ' ')}
            </Badge>
            <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700/70">
              {initiative.initiative_type.replace('_', ' ')}
            </span>
          </div>

          <Badge variant={initiative.current_stage} size="lg">
            {initiative.current_stage.replace('_', ' ')}
          </Badge>
        </div>

        <h1 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight leading-tight">
          {initiative.title}
        </h1>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Capital Budget</span>
            <span className="text-sm font-black font-mono text-emerald-400 mt-0.5 block">
              {formattedBudget}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Target Completion</span>
            <span className="text-sm font-semibold font-mono text-slate-200 mt-0.5 block">
              {initiative.target_date}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Author</span>
            <span className="text-xs font-semibold text-slate-300 mt-0.5 block truncate">
              {initiative.author_name || 'Enterprise User'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Submitted</span>
            <span className="text-xs font-mono text-slate-400 mt-0.5 block">
              {new Date(initiative.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stakeholder tags */}
        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" /> Impacted Stakeholders:
          </span>
          {Array.isArray(initiative.impacted_departments) && initiative.impacted_departments.map((dept) => (
            <Badge key={dept} variant={dept} size="sm">
              {dept.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Evaluation Matrix Component */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-black text-slate-100 tracking-tight">
            Automated Gemini 2.5 Flash Risk & Impact Matrix
          </h2>
        </div>
        <EvaluationMatrix evaluation={initiative.evaluation} />
      </div>

      {/* Proposal Documentation & Full Context */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/70">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100 tracking-tight">
            Proposal Narrative & Contextual Documentation
          </h3>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Summary</h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {initiative.summary}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Proposal Specifications</h4>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 font-mono whitespace-pre-wrap">
            {initiative.raw_content}
          </div>
        </div>
      </div>

      {/* Workflow Sign-off History Timeline */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/70">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100 tracking-tight">
            Workflow Governance Sign-off History
          </h3>
        </div>

        {(!initiative.workflow_history || initiative.workflow_history.length === 0) ? (
          <p className="text-xs text-slate-400 italic">No formal stage sign-offs recorded yet for this initiative.</p>
        ) : (
          <div className="space-y-4">
            {initiative.workflow_history.map((action, idx) => (
              <div
                key={action.id || idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={action.from_stage} size="sm">{action.from_stage.replace('_', ' ')}</Badge>
                    <span className="text-slate-500 font-mono">→</span>
                    <Badge variant={action.to_stage} size="sm">{action.to_stage.replace('_', ' ')}</Badge>
                  </div>
                  {action.notes && (
                    <p className="text-slate-300 italic text-xs mt-1">"{action.notes}"</p>
                  )}
                </div>

                <div className="text-left sm:text-right space-y-0.5 shrink-0">
                  <span className="font-semibold text-slate-200 block">
                    {action.reviewer_name || 'Department Reviewer'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {new Date(action.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transition Modal */}
      <StageTransitionModal
        isOpen={isTransitionOpen}
        onClose={() => setIsTransitionOpen(false)}
        initiative={initiative}
        onSubmit={handleStageTransitionSubmit}
        isLoading={transitionLoading}
      />
    </div>
  );
};

