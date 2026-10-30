import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Sparkles,
  BrainCircuit,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { intelligenceApi } from '../../services/api';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const IntelligenceChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to the **NexusAI Enterprise Knowledge Intelligence Engine**. I am indexed across all company initiatives, strategic memos, financial proposals, and automated Gemini risk evaluations.\n\nYou can query me regarding cross-department dependencies, compliance obligations (SOC2, GDPR, EU AI Act), capex exposure, or operational bottlenecks.`,
      confidence: 'High',
      cited_ids: [],
      followups: [
        'What are the primary operational bottlenecks in our engineering initiatives?',
        'Which initiatives have compliance risk scores exceeding 70%?',
        'How does our active budget allocation break down across departments?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await intelligenceApi.query({
        query: textToSend.trim(),
        department_filter: departmentFilter === 'All' ? undefined : departmentFilter
      });

      const aiData = res.data.data;

      const assistantMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: aiData.answer,
        confidence: aiData.confidence_rating || 'High',
        cited_ids: aiData.cited_initiative_ids || [],
        followups: aiData.recommended_followups || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[IntelligenceChat] Query error:', err);
      const errorMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `⚠️ **Intelligence Engine Alert**: Failed to complete contextual inference (${err.response?.data?.message || err.message}). Please verify backend connectivity.`,
        confidence: 'Low',
        cited_ids: [],
        followups: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const departments = [
    'All',
    'Engineering',
    'Finance',
    'Legal_Compliance',
    'Operations',
    'Human_Resources',
    'Product_Strategy'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
              Cross-Department Knowledge Intelligence
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                Gemini 2.5 Flash
              </span>
            </h3>
            <p className="text-xs text-slate-400">Semantic contextual reasoning over approved initiatives & audit logs</p>
          </div>
        </div>

        {/* Scope Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Scope:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold font-mono text-slate-400">
                {msg.role === 'user' ? 'You' : 'NexusAI Systems Auditor'}
              </span>
              <span className="text-[10px] text-slate-500">{msg.timestamp}</span>

              {msg.confidence && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                  msg.confidence === 'High' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  msg.confidence === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  Confidence: {msg.confidence}
                </span>
              )}
            </div>

            <div
              className={`max-w-3xl rounded-2xl p-4 sm:p-5 shadow-lg text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-850 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
              }`}
            >
              {/* Formatted Markdown-like text */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.content}
              </div>

              {/* Citations if available */}
              {msg.cited_ids && msg.cited_ids.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-400" /> Cited Precedents:
                  </span>
                  {msg.cited_ids.map((cid, i) => (
                    <Link
                      key={cid}
                      to={`/initiatives/${cid}`}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-700/40 transition-colors"
                    >
                      <span>Doc #{i + 1}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Followup Chips */}
            {msg.followups && msg.followups.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 max-w-2xl">
                {msg.followups.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-indigo-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-full transition-all text-left"
                  >
                    <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold font-mono text-indigo-400">NexusAI Systems Auditor</span>
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-300 font-mono">
                Synthesizing cross-initiative knowledge & evaluating precedents...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything across enterprise initiatives, budgets, risk vectors, or policies..."
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            disabled={!inputQuery.trim()}
            icon={Send}
            className="rounded-xl px-5"
          >
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

