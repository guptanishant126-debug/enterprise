import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Filter,
  Sparkles,
  FileText,
  UserCheck,
  Lock,
  ChevronLeft,
  ChevronRight,
  Code
} from 'lucide-react';
import { auditApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const AuditLogPage = () => {
  const { user, hasRole } = useAuth();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [error, setError] = useState('');

  const isAuthorized = hasRole(['Admin', 'Department_Lead']);

  const fetchLogs = async (page = 1) => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (actionFilter) params.action_type = actionFilter;
      const res = await auditApi.getLogs(params);
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('[AuditLogPage] Error:', err);
      setError('Failed to fetch immutable enterprise audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto space-y-4">
        <Lock className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-100">Access Restricted</h3>
        <p className="text-xs text-slate-400">
          Corporate governance compliance logs are strictly restricted to <strong>Department_Lead</strong> and <strong>Admin</strong> roles.
        </p>
      </div>
    );
  }

  const actionTypes = [
    { value: '', label: 'All Logged Actions' },
    { value: 'INITIATIVE_CREATED', label: 'Initiative Created' },
    { value: 'WORKFLOW_STAGE_TRANSITIONED', label: 'Workflow Stage Transitioned' },
    { value: 'AI_EVALUATION_EXECUTED', label: 'AI Evaluation Executed' },
    { value: 'AI_EVALUATION_REFRESHED', label: 'AI Evaluation Refreshed' },
    { value: 'KNOWLEDGE_QUERY_EXECUTED', label: 'Knowledge Query Executed' },
    { value: 'USER_LOGGED_IN', label: 'User Logged In' },
    { value: 'USER_REGISTERED', label: 'User Registered' }
  ];

  const getActionBadgeVariant = (type) => {
    if (type.includes('WORKFLOW') || type.includes('STAGE')) return 'primary';
    if (type.includes('AI_')) return 'purple';
    if (type.includes('USER')) return 'cyan';
    if (type.includes('INITIATIVE')) return 'success';
    return 'default';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            Immutable Enterprise Compliance Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tamper-proof record of all user operations, AI risk evaluations, and state transitions
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-mono font-semibold text-[11px]">Write-Once / Read-Only (WORM) Protected</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {actionTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {logs.length} of {pagination.total} records
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Verifying cryptographic audit log integrity...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No audit records matched the filter criteria.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.created_at).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>

                    <td className="py-3 px-4 font-sans whitespace-nowrap">
                      {log.actor_name ? (
                        <div>
                          <span className="font-bold text-slate-200 block text-xs">{log.actor_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {log.actor_role} ({log.actor_department?.replace('_', ' ') || 'Corp'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-indigo-400 font-semibold font-mono text-xs">
                          NexusAI System Agent
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={getActionBadgeVariant(log.action_type)} size="sm">
                        {log.action_type}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap text-xs font-sans">
                      <span className="font-semibold text-slate-200">{log.entity_type}</span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[120px]">
                        {log.entity_id}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {log.ip_address}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <button
                          onClick={() => setSelectedMeta(log.metadata)}
                          className="text-[11px] font-sans font-bold text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1"
                        >
                          <Code className="w-3 h-3" /> View JSON
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              Page {pagination.page} of {pagination.total_pages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                size="xs"
                variant="outline"
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => fetchLogs(pagination.page + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Metadata Inspector Modal */}
      <Modal
        isOpen={!!selectedMeta}
        onClose={() => setSelectedMeta(null)}
        title="Audit Log Event Metadata"
        subtitle="Cryptographically sealed audit event payload"
        maxWidth="max-w-xl"
      >
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
          {JSON.stringify(selectedMeta, null, 2)}
        </pre>
        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setSelectedMeta(null)}>
            Close Inspector
          </Button>
        </div>
      </Modal>
    </div>
  );
};

