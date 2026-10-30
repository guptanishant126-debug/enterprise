import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Badge } from '../common/Badge';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const StageTransitionModal = ({
  isOpen,
  onClose,
  initiative,
  onSubmit,
  isLoading
}) => {
  const [toStage, setToStage] = useState('Under_Review');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!initiative) return null;

  const stageOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Under_Review', label: 'Under Review' },
    { value: 'Compliance_Pending', label: 'Compliance Pending' },
    { value: 'Approved', label: 'Approved (Production)' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Archived', label: 'Archived' }
  ].filter(opt => opt.value !== initiative.current_stage);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Corporate audit standards require review commentary before transitioning stages.');
      return;
    }
    setError('');
    onSubmit({ to_stage: toStage, notes });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Governance Workflow Sign-off"
      subtitle={`Initiative: ${initiative.title}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Stage Change Visual */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stage</span>
            <Badge variant={initiative.current_stage} size="md">
              {initiative.current_stage.replace('_', ' ')}
            </Badge>
          </div>

          <ArrowRight className="w-5 h-5 text-indigo-400" />

          <div className="space-y-1 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Stage</span>
            <Badge variant={toStage} size="md">
              {toStage.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Target Stage Select */}
        <Select
          label="Select Target Workflow Stage"
          required
          value={toStage}
          onChange={(e) => setToStage(e.target.value)}
          options={stageOptions}
        />

        {/* Review Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Reviewer Governance Notes <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (error) setError('');
            }}
            placeholder="Document technical validation, risk clearance, steering committee sign-off, or rejection rationale..."
            className={`block w-full rounded-lg bg-slate-900 border text-slate-100 placeholder-slate-500 text-xs sm:text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700/80 hover:border-slate-600 focus:border-indigo-500'
            }`}
          />
          {error ? (
            <p className="text-xs text-rose-400 font-medium">{error}</p>
          ) : (
            <p className="text-[11px] text-slate-400">
              This note is permanently recorded in the immutable enterprise audit trail.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} icon={CheckCircle2}>
            Confirm Stage Transition
          </Button>
        </div>
      </form>
    </Modal>
  );
};

