import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Server, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Backend URL state
  const [showEndpointConfig, setShowEndpointConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [configMessage, setConfigMessage] = useState({ type: '', text: '' });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      let errMsg = 'Authentication failed. Please verify credentials.';
      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        const activeEndpoint = getApiBaseUrl();
        errMsg = `Cannot connect to backend server (${activeEndpoint}). If your backend is deployed on Render, configure the URL below.`;
        setShowEndpointConfig(true);
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  const handleTestAndSaveEndpoint = async () => {
    if (!customUrl || !customUrl.trim()) {
      setConfigMessage({ type: 'error', text: 'Please enter a valid backend API URL.' });
      return;
    }

    setTestingConnection(true);
    setConfigMessage({ type: '', text: '' });

    const trimmedUrl = customUrl.trim().replace(/\/$/, '');
    const probeUrl = trimmedUrl.endsWith('/api') ? `${trimmedUrl}/health` : `${trimmedUrl}/api/health`;

    try {
      const response = await fetch(probeUrl, { method: 'GET' });
      if (response.ok) {
        const normalizedBase = trimmedUrl.endsWith('/api') ? trimmedUrl : `${trimmedUrl}/api`;
        setApiBaseUrl(normalizedBase);
        setConfigMessage({
          type: 'success',
          text: `Successfully connected to backend (${normalizedBase})!`
        });
        setError('');
      } else {
        setConfigMessage({
          type: 'error',
          text: `Server responded with HTTP ${response.status}. Verify endpoint path.`
        });
      }
    } catch (fetchErr) {
      setConfigMessage({
        type: 'error',
        text: `Unable to reach ${probeUrl}. Make sure your Render backend is deployed and CORS is enabled.`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-white">
          NexusAI Enterprise
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enterprise AI Orchestrator & Knowledge Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800/90 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">
          {isExpired && (
            <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Session expired for security. Please re-authenticate.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Backend Connection Config Drawer */}
          <div className="border border-slate-800/80 rounded-2xl p-3 bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowEndpointConfig(!showEndpointConfig)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Backend Target: <strong className="text-slate-300 truncate max-w-[180px] sm:max-w-[220px] inline-block align-bottom">{getApiBaseUrl()}</strong></span>
              </div>
              <span className="text-[10px] text-indigo-400 underline ml-2">
                {showEndpointConfig ? 'Hide' : 'Configure'}
              </span>
            </button>

            {showEndpointConfig && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                <label className="block text-[11px] font-medium text-slate-300">
                  Render / Remote Backend URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://nexus-enterprise-backend.onrender.com/api"
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    isLoading={testingConnection}
                    onClick={handleTestAndSaveEndpoint}
                    className="shrink-0 text-xs py-1.5 px-3"
                  >
                    Connect
                  </Button>
                </div>

                {configMessage.text && (
                  <div className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                    configMessage.type === 'success'
                      ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/70 border border-rose-800 text-rose-300'
                  }`}>
                    {configMessage.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{configMessage.text}</span>
                  </div>
                )}
                
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Enter your deployed Render backend URL or configure <code className="text-slate-400">VITE_API_BASE_URL</code> in Vercel project settings.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Corporate Email"
              type="email"
              required
              icon={Mail}
              placeholder="e.g. name@nexusai.corp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full mt-2 font-bold"
              icon={ArrowRight}
            >
              Sign In to Enterprise Workspace
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800/80">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              Instant Demo Access (Preset Roles)
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@nexusai.corp', 'EnterpriseAdmin#2026!')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-slate-200 block truncate">Dr. Elena Vance</span>
                  <span className="text-[10px] text-purple-400">Admin (Legal & Governance)</span>
                </div>
                <UserCheck className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('marcus.lead@nexusai.corp', 'NexusLead#2026!')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-slate-200 block truncate">Marcus Sterling</span>
                  <span className="text-[10px] text-indigo-400">Department Lead (Engineering)</span>
                </div>
                <UserCheck className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex.analyst@nexusai.corp', 'NexusAnalyst#2026!')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-slate-200 block truncate">Alex Rivera</span>
                  <span className="text-[10px] text-cyan-400">Analyst (Engineering)</span>
                </div>
                <UserCheck className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Need an enterprise account?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
