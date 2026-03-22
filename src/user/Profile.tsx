import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Camera, Shield, Save, X, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

type ProfileUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  created_at?: string | null;
};

function initialsFromName(name: string) {
  const parts = String(name || '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return 'G';
  return parts.map((p) => p[0]?.toUpperCase()).join('');
}

function formatDateShort(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(d);
}

export default function Profile() {
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<ProfileUser | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const memberSince = useMemo(() => {
    const d = user?.created_at ? new Date(user.created_at) : null;
    if (!d || Number.isNaN(d.getTime())) return null;
    return d.getFullYear();
  }, [user?.created_at]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await api.get('/profile', { signal: controller.signal });
        const u = res.data?.user as ProfileUser | undefined;
        if (!u) throw new Error('Missing profile');
        setUser(u);
        setFormData({
          fullName: u.name ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          address: u.address ?? '',
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ?? 'Failed to load profile.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await api.patch('/profile', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      const updated = res.data?.user as ProfileUser | undefined;
      if (updated) {
        setUser(updated);
        setFormData({
          fullName: updated.name ?? formData.fullName,
          email: updated.email ?? formData.email,
          phone: updated.phone ?? formData.phone,
          address: updated.address ?? formData.address,
        });
      }
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        Object.values(((axios.isAxiosError(err) ? (err.response?.data as any)?.errors : {}) ?? {}) as Record<
          string,
          string[]
        >)[0]?.[0] ??
        'Failed to update profile.';
      showToast(String(message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setIsSaving(true);
    try {
      await api.patch('/profile/password', {
        current_password: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword,
      });
      showToast('Password updated successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        Object.values(((axios.isAxiosError(err) ? (err.response?.data as any)?.errors : {}) ?? {}) as Record<
          string,
          string[]
        >)[0]?.[0] ??
        'Failed to update password.';
      showToast(String(message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        fullName: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">Account Profile</h1>
        <p className="text-forest-700/70 mt-1">Manage your personal information and security settings.</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-forest-700/70">
          Loading your profile...
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-32 h-32 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 text-4xl font-serif border-4 border-white shadow-md overflow-hidden">
                  {initialsFromName(formData.fullName || user?.name || 'Guest')}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-forest-900">{formData.fullName || user?.name}</h2>
              <p className="text-sm text-forest-700/70 mt-1">
                Guest Member{memberSince ? ` since ${memberSince}` : ''}
              </p>

              <div className="w-full mt-6 pt-6 border-t border-earth-100 space-y-2">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900 hover:bg-earth-50 py-2 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Change Password
                </button>
                <div className="text-[10px] text-forest-700/60">
                  Last updated: {formatDateShort(user?.created_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h3 className="text-lg font-semibold text-forest-900">Personal Information</h3>
                <button
                  onClick={() => (isEditing ? cancelEdit() : setIsEditing(true))}
                  className="text-sm font-medium text-forest-700 hover:text-forest-900 bg-white border border-earth-200 px-4 py-1.5 rounded-lg transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-forest-700/50" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent disabled:bg-earth-50 disabled:text-forest-800/70"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-forest-700/50" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent disabled:bg-earth-50 disabled:text-forest-800/70"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-forest-800 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-forest-700/50" /> Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent disabled:bg-earth-50 disabled:text-forest-800/70"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-forest-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-forest-700/50" /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent disabled:bg-earth-50 disabled:text-forest-800/70"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-forest-700 hover:bg-forest-800 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={isSaving}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

