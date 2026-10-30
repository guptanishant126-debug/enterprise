import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
        const targetUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        serverMsg = `Cannot connect to backend server (${targetUrl}). Please ensure the backend server is running and accessible.`;
      }
      setError(serverMsg);
    } finally {
      setLoading(false);
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
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

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
