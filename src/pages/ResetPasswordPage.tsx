import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Home, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import axios from 'axios';
import { api } from '../lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const token = searchParams.get('token');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const password = String(data.get('password') ?? '');
    const passwordConfirmation = String(data.get('password_confirmation') ?? '');

    if (password !== passwordConfirmation) {
      showToast('Passwords do not match.', 'error');
      setIsLoading(false);
      return;
    }

    if (!token) {
      showToast('Invalid reset link.', 'error');
      setIsLoading(false);
      return;
    }

    const payload = {
      token,
      password,
      password_confirmation: passwordConfirmation,
    };

    try {
      await api.post('/reset-password', payload);
      setResetSuccess(true);
      showToast('Password has been reset successfully!', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as any)?.message ??
          Object.values(((err.response?.data as any)?.errors ?? {}) as Record<string, string[]>)[0]?.[0] ??
          'Failed to reset password.';
        showToast(String(message), 'error');
      } else {
        showToast('Failed to reset password.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-forest-900 mb-4">Invalid Reset Link</h1>
          <p className="text-forest-700/60 mb-8">
            The password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-forest-700 hover:bg-forest-800 text-white px-8 py-3 rounded-2xl font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

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
            <p className="text-forest-700/60 mt-2">Create a new password</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {!resetSuccess ? (
              <>
                <p className="text-forest-700/70 text-center mb-6">
                  Enter a new password for your account.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 ml-1">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                      <input 
                        name="password"
                        type="password" 
                        required
                        placeholder="At least 8 characters with mixed case, numbers, and symbols"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                      />
                    </div>
                    <p className="text-xs text-forest-700/50 ml-1">
                      At least 8 characters with uppercase, lowercase, number, and symbol.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                      <input 
                        name="password_confirmation"
                        type="password" 
                        required
                        placeholder="Confirm your new password"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                      />
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
                        <Lock className="w-5 h-5" />
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-forest-900">Password Reset Successfully</h2>
                <p className="text-forest-700/70">
                  Your password has been reset. You will be redirected to the login page shortly.
                </p>
              </div>
            )}

            {!resetSuccess && (
              <div className="mt-8 text-center">
                <p className="text-sm text-forest-700/60">
                  <button 
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-semibold text-forest-700 hover:text-forest-900 underline underline-offset-4"
                  >
                    Back to login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Link */}
        {!resetSuccess && (
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate('/')}
            className="mt-8 flex items-center gap-2 text-forest-700/70 hover:text-forest-900 mx-auto font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Homepage
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
