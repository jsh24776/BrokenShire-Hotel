import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Shield, Save, X, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Pine Street, Seattle, WA 98101',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast("Profile updated successfully!", "success");
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleUpdatePassword = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast("Password updated successfully!", "success");
    setIsSaving(false);
    setShowPasswordModal(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">Account Profile</h1>
        <p className="text-forest-700/70 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-32 h-32 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 text-4xl font-serif border-4 border-white shadow-md overflow-hidden">
                JD
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-forest-900">{formData.fullName}</h2>
            <p className="text-sm text-forest-700/70 mt-1">Guest Member since 2023</p>
            
            <div className="w-full mt-6 pt-6 border-t border-earth-100">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900 hover:bg-earth-50 py-2 rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
            <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
              <h3 className="text-lg font-semibold text-forest-900">Personal Information</h3>
              <button 
                onClick={() => setIsEditing(!isEditing)}
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
                    <Mail className="w-4 h-4 text-forest-700/50" /> Email Address
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
                    <Phone className="w-4 h-4 text-forest-700/50" /> Phone Number
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
              </div>
              
              <div className="space-y-1.5">
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
      {/* Change Password Modal */}
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
                      <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
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
