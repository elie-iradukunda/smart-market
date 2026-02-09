// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { getAuthUser } from '@/utils/apiClient';
import { fetchUser, updateUser, changeUserPassword } from '@/api/apiClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  User,
  Lock,
  ShieldCheck,
  Mail,
  Phone,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SystemSettingsPage() {
  const currentUser = getAuthUser();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (currentUser?.id) {
      setFetching(true);
      fetchUser(currentUser.id)
        .then(data => {
          setProfileForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || ''
          });
        })
        .catch(err => console.error('Failed to load user info', err))
        .finally(() => setFetching(false));
    }
  }, [currentUser?.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUser(currentUser.id, {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone
      });
      setSuccess('Profile updated successfully!');
      // Update local storage too so the sidebar updates
      const updatedUser = { ...currentUser, name: profileForm.name, email: profileForm.email };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await changeUserPassword(currentUser.id, passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Page Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings Hub</h1>
            <p className="text-slate-500 font-medium">Manage your personal account and system-wide configurations.</p>
          </div>

          {/* Glassmorphism Navigation Tabs */}
          <div className="flex p-1 gap-1 bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl shadow-slate-200/50 max-w-fit">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-1 ring-blue-400'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
            >
              <User size={18} />
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-1 ring-indigo-400'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
            >
              <Lock size={18} />
              Security
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
              <AlertCircle className="text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="text-emerald-500 shrink-0" />
              <p className="text-sm font-semibold text-emerald-700">{success}</p>
            </div>
          )}

          {/* Content Area */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-300/40 p-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              {activeTab === 'profile' && <User size={160} />}
              {activeTab === 'security' && <ShieldCheck size={160} />}
            </div>

            {fetching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-slate-400 font-medium">Retrieving your data...</p>
              </div>
            ) : (
              <div className="relative z-10 transition-all">

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleUpdateProfile} className="space-y-8 animate-in fade-in duration-500">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                      <p className="text-slate-500 mt-1">Update your identity and contact details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            placeholder="Your display name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">Email address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            placeholder="e.g. +250 123 456 789"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">Account Role</label>
                        <div className="flex items-center gap-3 px-4 py-5 rounded-2xl bg-slate-100/50 border border-dashed border-slate-200 opacity-70 cursor-not-allowed">
                          <ShieldCheck className="text-slate-400" size={20} />
                          <span className="font-bold text-slate-600 capitalize">
                            {(() => {
                              if (currentUser?.role_id === 1) return 'System Administrator';
                              if (currentUser?.role_id === 2) return 'Sales Representative';
                              if (currentUser?.role_id === 3) return 'Operations Staff';
                              if (currentUser?.role_id === 4 || currentUser?.role_id === 13) return 'Verified Client';
                              return currentUser?.role || 'User';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
                        Update Profile Info
                      </button>
                    </div>
                  </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <form onSubmit={handleChangePassword} className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Security Credentials</h2>
                      <p className="text-slate-500 mt-1">Keep your account secure by rotating your password regularly.</p>
                    </div>

                    <div className="max-w-md space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">Current Password</label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>

                      <div className="h-px bg-slate-100 w-full" />

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest pl-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                          className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="group flex items-center gap-3 bg-slate-900 hover:bg-black text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} className="group-hover:-translate-y-1 transition-transform" />}
                        Apply Security Update
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}