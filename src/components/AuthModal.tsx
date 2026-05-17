import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { api } from '../lib/api';
import { setAuth } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; role: 'user' | 'admin' }) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'admin' | 'forgot_password'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isStrongPassword = (value: string) => {
    if (value.length < 8) return false;
    if (!/[A-Z]/.test(value)) return false;
    if (!/[a-z]/.test(value)) return false;
    if (!/[0-9]/.test(value)) return false;
    if (!/[^A-Za-z0-9]/.test(value)) return false;
    return true;
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setName('');
      setPhone('');
      setAddress('');
      setEmail('');
      setPassword('');
      setPasswordConfirmation('');
      setAuthMode('login');
      setResetSent(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'forgot_password') {
      if (!email) {
        setError('Please enter your email address.');
        return;
      }
      setIsLoading(true);
      try {
        await api.post('/forgot-password', { email });
        setResetSent(true);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? 'Failed to send reset email. Please try again.';
        setError(String(msg));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (
      !email ||
      !password ||
      (authMode === 'signup' && (!name || !phone || !address || !passwordConfirmation))
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'admin') {
        const res = await api.post('/admin/login', { email, password });
        setAuth(res.data.token, 'admin');
        onLogin({ name: res.data.admin?.name ?? 'Admin', role: 'admin' });
        return;
      }

      if (authMode === 'signup') {
        if (!email.includes('@')) {
          setError('Please enter a valid email address (must include "@").');
          return;
        }

        const normalizedPhone = phone.replace(/\D/g, '');
        if (!/^09\d{9}$/.test(normalizedPhone)) {
          setError('Phone number must be 11 digits and start with 09 (e.g. 09171234567).');
          return;
        }

        if (!isStrongPassword(password)) {
          setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
          return;
        }

        if (password !== passwordConfirmation) {
          setError('Passwords do not match.');
          return;
        }

        await api.post('/register', {
          name,
          email,
          phone: normalizedPhone,
          address,
          password,
          password_confirmation: passwordConfirmation,
        });

        setPassword('');
        setPasswordConfirmation('');
        setAuthMode('login');
        setError('Account created. Please sign in to continue.');
        return;
      }

      const res = await api.post('/login', { email, password });
      setAuth(res.data.token, 'user');
      onLogin({ name: res.data.user?.name ?? email.split('@')[0], role: 'user' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as any)?.message ??
          Object.values(((err.response?.data as any)?.errors ?? {}) as Record<string, string[]>)[0]?.[0] ??
          'Authentication failed.';
        setError(String(message));
      } else {
        setError('Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getHeaderText = () => {
    if (authMode === 'admin') return 'Admin Portal';
    if (authMode === 'forgot_password') return 'Reset Password';
    if (authMode === 'login') return 'Welcome Back';
    return 'Join Brokenshire';
  };

  const getSubHeaderText = () => {
    if (authMode === 'admin') return 'Sign in with any credentials to access the dashboard.';
    if (authMode === 'forgot_password') return 'Enter your email to receive reset instructions.';
    if (authMode === 'login') return 'Sign in to manage your reservations.';
    return 'Create an account for exclusive nature retreats.';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest-900/40 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-forest-800/50 hover:text-forest-900 hover:bg-forest-50 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className={`px-8 py-10 text-center relative overflow-hidden ${authMode === 'admin' ? 'bg-earth-100' : 'bg-forest-50'}`}>
                <div className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 ${authMode === 'admin' ? 'bg-earth-300/30' : 'bg-forest-200/30'}`}></div>
                
                {authMode === 'admin' && (
                  <div className="mx-auto w-12 h-12 bg-forest-900 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg">
                    <Shield className="w-6 h-6 text-earth-400" />
                  </div>
                )}
                
                <h2 className="text-3xl font-serif text-forest-900 relative z-10">
                  {getHeaderText()}
                </h2>
                <p className="text-forest-700/70 mt-2 relative z-10 text-sm">
                  {getSubHeaderText()}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}
                
                {resetSent && authMode === 'forgot_password' && (
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm text-center border border-emerald-100">
                    <p className="font-medium mb-1">Reset link sent!</p>
                    <p>Please check your email for instructions to reset your password.</p>
                  </div>
                )}

                {(!resetSent || authMode !== 'forgot_password') && (
                  <>
                    <AnimatePresence mode="wait">
                      {authMode === 'signup' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1 overflow-hidden"
                        >
                          <div className="space-y-5 pt-1">
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-forest-800 ml-1">Full Name</label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
                                <input
                                  type="text"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="John Doe"
                                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-forest-800 ml-1">Phone Number</label>
                              <div className="relative">
                                  <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    inputMode="numeric"
                                    pattern="^09\\d{9}$"
                                    placeholder="09171234567"
                                    className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
                                  />
                                </div>
                              </div>

                            <div className="space-y-1">
                              <label className="text-sm font-medium text-forest-800 ml-1">Home Address</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  placeholder="123 Nature Lane, Forest City"
                                  className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={authMode === 'admin' ? "admin@brokenshire.com" : "you@example.com"}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {authMode !== 'forgot_password' && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-sm font-medium text-forest-800">Password</label>
                          {authMode === 'login' && (
                            <button 
                              type="button"
                              onClick={() => {
                                setAuthMode('forgot_password');
                                setError('');
                              }}
                              className="text-xs text-earth-600 hover:text-earth-700"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            minLength={8}
                            className="w-full pl-10 pr-11 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-800/40 hover:text-forest-800/70 transition-colors focus:outline-none"
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {authMode === 'signup' && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-forest-800 ml-1">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="********"
                            className="w-full pl-10 pr-11 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-800/40 hover:text-forest-800/70 transition-colors focus:outline-none"
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 ${
                        authMode === 'admin' ? 'bg-forest-900 hover:bg-black' : 'bg-forest-700 hover:bg-forest-800'
                      }`}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : authMode === 'forgot_password' ? 'Send Reset Link' : 'Login to Dashboard'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </>
                )}

                <div className="text-center pt-4 border-t border-earth-100 mt-6 flex flex-col gap-3">
                  {authMode === 'forgot_password' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setResetSent(false);
                      }}
                      className="text-sm text-earth-600 hover:text-earth-700 font-medium transition-colors"
                    >
                      Back to Sign In
                    </button>
                  ) : authMode !== 'admin' ? (
                    <>
                      <p className="text-sm text-forest-800/70">
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                          type="button"
                          onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                          className="text-earth-600 hover:text-earth-700 font-medium transition-colors"
                        >
                          {authMode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                      </p>
                      <button
                        type="button"
                        onClick={() => setAuthMode('admin')}
                        className="text-xs text-forest-800/50 hover:text-forest-800 flex items-center justify-center gap-1 mx-auto transition-colors"
                      >
                        <Shield className="w-3 h-3" />
                        Admin Access
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-sm text-earth-600 hover:text-earth-700 font-medium transition-colors"
                    >
                      Return to Guest Login
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

