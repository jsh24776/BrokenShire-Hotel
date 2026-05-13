import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Lock, ArrowRight, Home, UserPlus, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import axios from 'axios';
import { api } from '../lib/api';
import { setAuth } from '../lib/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      phone: String(data.get('phone') ?? ''),
      address: String(data.get('address') ?? ''),
      password: String(data.get('password') ?? ''),
      password_confirmation: String(data.get('password_confirmation') ?? ''),
    };

    if (payload.password !== payload.password_confirmation) {
      showToast('Passwords do not match.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post('/register', payload);
      setAuth(res.data.token, 'user');
      showToast('Account created successfully! Welcome to Brokenshire Hotel.', 'success');
      navigate('/user');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          (err.response?.data as any)?.message ??
          Object.values(((err.response?.data as any)?.errors ?? {}) as Record<string, string[]>)[0]?.[0] ??
          'Registration failed.';
        showToast(String(message), 'error');
      } else {
        showToast('Registration failed.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-forest-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-earth-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-earth-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-4 text-center border-b border-earth-50">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-forest-50 rounded-xl text-forest-700 mb-4">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-forest-900">Create Your Account</h1>
            <p className="text-forest-700/60 mt-1">Join Brokenshire Hotel for a personalized experience</p>
          </div>

          <form onSubmit={handleRegister} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-[10px]">01</span>
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                      <input 
                        name="name"
                        type="text" 
                        required
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                      <input 
                        name="email"
                        type="email" 
                        required
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                      <input 
                        name="phone"
                        type="tel" 
                        required
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 ml-1">Home Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                      <input 
                        name="address"
                        type="text" 
                        required
                        placeholder="123 Nature Lane, Forest City"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-[10px]">02</span>
                  Account Credentials
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                      <input 
                        name="password"
                        type="password" 
                        required
                        placeholder="********"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 ml-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-300 group-focus-within:text-forest-500 transition-colors" />
                      <input 
                        name="password_confirmation"
                        type="password" 
                        required
                        placeholder="********"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100">
                      <p className="text-[11px] text-forest-700/70 leading-relaxed">
                        By creating an account, you agree to Brokenshire Hotel's 
                        <span className="text-forest-900 font-semibold mx-1">Terms of Service</span> 
                        and 
                        <span className="text-forest-900 font-semibold ml-1">Privacy Policy</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-6">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full max-w-md bg-forest-700 hover:bg-forest-800 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-forest-900/10 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create My Account
                  </>
                )}
              </button>

              <p className="text-sm text-forest-700/60">
                Already have an account? {' '}
                <button 
                  type="button" 
                  onClick={() => navigate('/login')}
                  className="font-semibold text-forest-700 hover:text-forest-900 underline underline-offset-4"
                >
                  Sign In
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

