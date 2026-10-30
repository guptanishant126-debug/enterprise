import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
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
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

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

