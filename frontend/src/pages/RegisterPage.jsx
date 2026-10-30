import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, ArrowRight, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    department: 'Engineering',
    role: 'Analyst'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom Backend URL state
  const [showEndpointConfig, setShowEndpointConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [configMessage, setConfigMessage] = useState({ type: '', text: '' });

  const { register } = useAuth();
  const navigate = useNavigate();

  const departmentOptions = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Human_Resources', label: 'Human Resources' },
    { value: 'Legal_Compliance', label: 'Legal & Compliance' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Product_Strategy', label: 'Product Strategy' }
  ];

  const roleOptions = [
    { value: 'Analyst', label: 'Analyst (Propose & Draft)' },
    { value: 'Department_Lead', label: 'Department Lead (Approval & Routing)' },
    { value: 'Admin', label: 'Admin (Global Governance & Audit)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long for enterprise security.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('[RegisterPage] Error:', err);
      let serverMsg = 'Registration failed. Please check your credentials and try again.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        serverMsg = err.response.data.errors.map(e => e.message).join(', ');
      } else if (err.response?.data?.message) {
        serverMsg = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        const activeEndpoint = getApiBaseUrl();
        serverMsg = `Cannot connect to backend server (${activeEndpoint}). If your backend is deployed on Render, configure the URL below.`;
        setShowEndpointConfig(true);
      }
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
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
          Enterprise Account Registration
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Provision verified identity with Role-Based Access Controls
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800/90 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
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
              label="Full Name"
              type="text"
              required
              icon={User}
              placeholder="e.g. Sarah Connor"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />

            <Input
              label="Corporate Email"
              type="email"
              required
              icon={Mail}
              placeholder="name@nexusai.corp"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Password (min 8 chars)"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Select
              label="Designated Department"
              required
              options={departmentOptions}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />

            <Select
              label="Enterprise Role (RBAC)"
              required
              options={roleOptions}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full mt-3 font-bold"
              icon={ArrowRight}
            >
              Provision Account
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300">
              Sign in to workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
