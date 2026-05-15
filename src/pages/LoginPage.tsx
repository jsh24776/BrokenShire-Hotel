import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, User, Shield, Lock, Mail, ArrowRight, Home } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import axios from 'axios';
import { api } from '../lib/api';
import { setAuth } from '../lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const payload = {
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    };

    try {
      const endpoint = role === 'admin' ? '/admin/login' : '/login';
      const res = await api.post(endpoint, payload);
      setAuth(res.data.token, role);
      showToast("Welcome back! Logged in as " + (role === 'admin' ? 'Administrator' : 'Guest') + ".", 'success');

      navigate(role === 'admin' ? '/admin' : '/user');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as any)?.message ??
          Object.values(((err.response?.data as any)?.errors ?? {}) as Record<string, string[]>)[0]?.[0] ??
          'Login failed.';
        showToast(String(message), 'error');
      } else {
        showToast('Login failed.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-forest-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-earth-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-earth-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-0 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-forest-50 rounded-2xl text-forest-700 mb-6">
              <Home className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-forest-900">Brokenshire Hotel</h1>
            <p className="text-forest-700/60 mt-2">Experience nature in luxury</p>
          </div>

          {/* Role Selector */}
          <div className="p-8 pb-0">
            <div className="bg-earth-50 p-1.5 rounded-2xl flex gap-1 border border-earth-100">
              <button 
                onClick={() => setRole('user')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  role === 'user' ? 'bg-white text-forest-900 shadow-sm border border-earth-100' : 'text-forest-700/50 hover:text-forest-700'
                }`}
              >
                <User className="w-4 h-4" />
                Guest Portal
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  role === 'admin' ? 'bg-white text-forest-900 shadow-sm border border-earth-100' : 'text-forest-700/50 hover:text-forest-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Portal
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-forest-800 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                  <input 
                    name="email"
                    type="email" 
                    required
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-forest-800">Password</label>
                  <button 
                    type="button" 
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs font-medium text-forest-600 hover:text-forest-800"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                  <input 
                    name="password"
                    type="password" 
                    required
                    placeholder="********"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest-700 hover:bg-forest-800 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-forest-900/10 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to {role === 'admin' ? 'Admin' : 'Guest'} Portal
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-forest-700/60">
                Don't have an account? {' '}
                <button 
                  type="button" 
                  onClick={() => navigate('/register')}
                  className="font-semibold text-forest-700 hover:text-forest-900 underline underline-offset-4"
                >
                  Create one
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
          className="mt-8 flex items-center gap-2 text-forest-700/70 hover:text-forest-900 mx-auto font-medium transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Homepage
        </motion.button>
      </motion.div>
    </div>
  );
}

