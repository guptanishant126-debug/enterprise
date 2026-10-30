import React, { useState, useEffect } from 'react';
import { Sparkles, Filter, Building2, Layers } from 'lucide-react';
import { workflowApi, initiativeApi } from '../services/api';
import { WorkflowBoard } from '../components/workflow/WorkflowBoard';
import { StageTransitionModal } from '../components/workflow/StageTransitionModal';

export const WorkflowBoardPage = () => {
  const [boardData, setBoardData] = useState({ stages: [], columns: {} });
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeInitiative, setActiveInitiative] = useState(null);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept !== 'All') params.department = selectedDept;
      const res = await workflowApi.getBoard(params);
      setBoardData(res.data.data);
    } catch (err) {
      console.error('[WorkflowBoardPage] Error:', err);
      setError('Failed to load workflow kanban board.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [selectedDept]);

  const handleOpenTransition = (initiative) => {
    setActiveInitiative(initiative);
    setIsTransitionOpen(true);
  };

  const handleTransitionSubmit = async ({ to_stage, notes }) => {
    if (!activeInitiative) return;
    setTransitionLoading(true);
    try {
      await initiativeApi.updateStage(activeInitiative.id, { to_stage, notes });
      setIsTransitionOpen(false);
      await fetchBoard();
    } catch (err) {
      console.error('[WorkflowBoardPage] Transition error:', err);
      alert(err.response?.data?.message || 'Failed to update stage.');
    } finally {
      setTransitionLoading(false);
    }
  };

  const departments = [
    'All',
    'Finance',
    'Engineering',
    'Human_Resources',
    'Legal_Compliance',
    'Operations',
    'Product_Strategy'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            Cross-Departmental Workflow Pipeline Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kanban-style stage gating with role-based sign-offs and immutable audit logging
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading workflow stages...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
          {error}
        </div>
      ) : (
        <WorkflowBoard
          stages={boardData.stages}
          columns={boardData.columns}
          onInitiateTransition={handleOpenTransition}
        />
      )}

      {/* Transition Modal */}
      <StageTransitionModal
        isOpen={isTransitionOpen}
        onClose={() => setIsTransitionOpen(false)}
        initiative={activeInitiative}
        onSubmit={handleTransitionSubmit}
        isLoading={transitionLoading}
      />
    </div>
  );
};

