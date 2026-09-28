import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../store/authStore.ts';
import { Button } from '../components/ui/Buttons.tsx';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const success = await login(email, password);
        if (!success) setError('Invalid email or password. Try the demo login below.');
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const success = await register(name, email, password);
        if (!success) setError('Registration failed. Email might already exist.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('rakib.edu.bd@gmail.com');
    setPassword('password123');
    setLoading(true);
    await login('rakib.edu.bd@gmail.com', 'password123');
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center min-h-[580px] p-4 max-w-sm mx-auto">
      {/* Brand Logo */}
      <div className="text-center mb-6 space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          QuizPulse
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          High-yield preparation platform for competitive exam aspirants
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 text-xs font-bold text-slate-600 dark:text-slate-400">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setError(null);
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            tab === 'login'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : ''
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('register');
            setError(null);
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            tab === 'register'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : ''
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs p-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {tab === 'register' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rakib Ahmed"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rakib.edu.bd@gmail.com"
              required
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          fullWidth
          size="lg"
          className="mt-2 text-xs py-3.5 shadow-md shadow-emerald-500/20"
        >
          <span>{tab === 'login' ? 'Sign In to Account' : 'Register & Start Learning'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Demo Account Quick Access */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-[11px] text-slate-400 mb-2">
          Want to test instantly without filling credentials?
        </p>
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Demo Scholar: Rakib Ahmed (One-Click)</span>
        </button>
      </div>
    </div>
  );
};
