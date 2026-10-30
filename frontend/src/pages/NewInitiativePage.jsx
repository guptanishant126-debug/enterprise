import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { initiativeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';

export const NewInitiativePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    department: user?.department || 'Engineering',
    initiative_type: 'Infrastructure_Change',
    budget: '',
    target_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    impacted_departments: ['Finance', 'Legal_Compliance'],
    summary: '',
    raw_content: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const allDepartments = [
    'Finance',
    'Engineering',
    'Human_Resources',
    'Legal_Compliance',
    'Operations',
    'Product_Strategy'
  ];

  const initiativeTypes = [
    { value: 'Infrastructure_Change', label: 'Infrastructure Change' },
    { value: 'Strategic_Roadmap', label: 'Strategic Roadmap' },
    { value: 'Policy_Update', label: 'Policy Update' },
    { value: 'Budget_Allocation', label: 'Budget Allocation' },
    { value: 'Vendor_Procurement', label: 'Vendor Procurement' }
  ];

  const handleImpactedToggle = (dept) => {
    setFormData((prev) => {
      const exists = prev.impacted_departments.includes(dept);
      const updated = exists
        ? prev.impacted_departments.filter((d) => d !== dept)
        : [...prev.impacted_departments, dept];
      return { ...prev, impacted_departments: updated };
    });
  };

  const loadSampleTemplate = (type) => {
    if (type === 'cloud') {
      setFormData({
        title: 'Global Database Sharding & EU Privacy Safe Harbor Isolation',
        department: 'Engineering',
        initiative_type: 'Infrastructure_Change',
        budget: 520000,
        target_date: '2027-04-15',
        impacted_departments: ['Finance', 'Legal_Compliance', 'Operations'],
        summary: 'Architect isolated European database cluster partitions with localized KMS encryption keys to achieve zero-telemetry export compliance under GDPR and Swiss-US Data Privacy Framework.',
        raw_content: 'Technical Proposal Specification: This initiative restructures our primary relational persistence layer. All customer PII belonging to EMEA tenants will be routed to localized AWS frankfurt nodes. Data encryption keys will be strictly held within the local HSM. Finance will reconcile regional AWS egress charges ($12,000/mo estimated variance). Legal will review localized terms of service and audit log retention schemas.'
      });
    } else if (type === 'ai_policy') {
      setFormData({
        title: 'Enterprise Vendor AI Procurement Standards & SOC2 Third-Party Audit Guidelines',
        department: 'Legal_Compliance',
        initiative_type: 'Policy_Update',
        budget: 95000,
        target_date: '2026-12-31',
        impacted_departments: ['Engineering', 'Finance', 'Operations'],
        summary: 'Establish rigorous procurement criteria prohibiting third-party software vendors from utilizing enterprise data streams for machine learning model training without explicit Board indemnity.',
        raw_content: 'Corporate Policy Framework: Every software vendor contract exceeding $25,000 ARR must provide an audited SOC2 Type II report and a formal Machine Learning Data Addendum. The addendum explicitly forbids training retention, weight caching, or cross-tenant contamination. Procurement and Legal teams will execute automated compliance checks on renewal agreements.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (formData.impacted_departments.length === 0) {
      setError('At least one impacted stakeholder department must be designated.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget) || 0
      };

      const res = await initiativeApi.create(payload);
      const createdId = res.data.data.id;
      navigate(`/initiatives/${createdId}`);
    } catch (err) {
      console.error('[NewInitiativePage] Submission error:', err);
      if (err.response?.data?.errors) {
        const errorMap = {};
        err.response.data.errors.forEach((e) => {
          errorMap[e.field] = e.message;
        });
        setFieldErrors(errorMap);
      } else {
        setError(err.response?.data?.message || 'Failed to submit initiative.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            Ingest Initiative & Corporate Strategy Memo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deterministic ingestion pipeline with automatic Gemini 2.5 Flash risk synthesis
          </p>
        </div>

        {/* Quick Sample Preset Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => loadSampleTemplate('cloud')}
            icon={BookOpen}
          >
            Sample: Cloud Sharding
          </Button>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => loadSampleTemplate('ai_policy')}
            icon={BookOpen}
          >
            Sample: Vendor AI Policy
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Title */}
        <Input
          label="Initiative Title (min 5, max 150 chars)"
          required
          placeholder="e.g. Multi-Cloud Zero-Trust Kubernetes Infrastructure Hardening"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={fieldErrors.title}
        />

        {/* Department & Initiative Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Proposing Department"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={allDepartments.map((d) => ({ value: d, label: d.replace('_', ' ') }))}
            error={fieldErrors.department}
          />

          <Select
            label="Initiative Classification"
            required
            value={formData.initiative_type}
            onChange={(e) => setFormData({ ...formData, initiative_type: e.target.value })}
            options={initiativeTypes}
            error={fieldErrors.initiative_type}
          />
        </div>

        {/* Budget & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Estimated Capital Allocation (USD)"
            type="number"
            step="1000"
            min="0"
            required
            icon={DollarSign}
            placeholder="e.g. 450000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            error={fieldErrors.budget}
          />

          <Input
            label="Target Completion Date (YYYY-MM-DD)"
            type="date"
            required
            icon={Calendar}
            value={formData.target_date}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            error={fieldErrors.target_date}
          />
        </div>

        {/* Impacted Stakeholders (Multi-Select Pills) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Impacted Stakeholder Departments <span className="text-rose-400">*</span>
          </label>
          <p className="text-xs text-slate-400">
            Select all divisions whose operations, budgets, or compliance obligations will be affected:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {allDepartments.map((dept) => {
              const isSelected = formData.impacted_departments.includes(dept);
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => handleImpactedToggle(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950 font-bold'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {dept.replace('_', ' ')}
                </button>
              );
            })}
          </div>
          {fieldErrors.impacted_departments && (
            <p className="text-xs text-rose-400 font-medium">{fieldErrors.impacted_departments}</p>
          )}
        </div>

        {/* Executive Summary */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Executive Summary (min 30, max 2000 chars) <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {formData.summary.length}/2000
            </span>
          </div>
          <textarea
            rows={3}
            required
            placeholder="Concise high-level overview explaining the strategic objective, timeline, and core rationale..."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className={`block w-full rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-xs sm:text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              fieldErrors.summary ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {fieldErrors.summary && (
            <p className="text-xs text-rose-400 font-medium">{fieldErrors.summary}</p>
          )}
        </div>

        {/* Detailed Proposal / Policy Context */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Detailed Proposal / Policy Context (min 50 chars) <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {formData.raw_content.length} chars
            </span>
          </div>
          <textarea
            rows={7}
            required
            placeholder="Paste complete memo, implementation specifications, cross-system dependencies, compliance commitments, vendor contracts, or architectural designs..."
            value={formData.raw_content}
            onChange={(e) => setFormData({ ...formData, raw_content: e.target.value })}
            className={`block w-full rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-xs sm:text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              fieldErrors.raw_content ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-indigo-500'
            }`}
          />
          {fieldErrors.raw_content && (
            <p className="text-xs text-rose-400 font-medium">{fieldErrors.raw_content}</p>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Automatic Gemini 2.5 Flash impact evaluation will run on save.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/initiatives')}
              disabled={loading}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              icon={CheckCircle2}
              className="flex-1 sm:flex-initial font-bold"
            >
              Submit & Dispatch AI Pipeline
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

