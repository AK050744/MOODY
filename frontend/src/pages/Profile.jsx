import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Calendar, Shield, Lock, LogOut, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', age: user?.age || '', gender: user?.gender || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated! ✅');
    } catch {
      toast.error('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed! Please log in again.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl gradient-text">My Profile</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Avatar + Info Card */}
      <div className="glass p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-glow-indigo">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-display font-bold text-xl text-white">{user?.name}</p>
          <p className="text-white/50 text-sm flex items-center gap-1.5">
            <Mail size={12} /> {user?.email}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user?.aiMemory?.burnoutRiskLevel === 'high' || user?.aiMemory?.burnoutRiskLevel === 'critical'
                ? 'text-red-400 bg-red-500/20' : 'text-green-400 bg-green-500/20'
            }`}>
              {user?.aiMemory?.burnoutRiskLevel === 'low' ? '✅ Low burnout risk' :
               user?.aiMemory?.burnoutRiskLevel === 'medium' ? '⚠️ Medium risk' : '🔴 High risk'}
            </span>
            {user?.onboardingCompleted && (
              <span className="text-xs px-2 py-0.5 rounded-full text-moody-300 bg-moody-500/20">Onboarded ✓</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Memory Card */}
      {user?.aiMemory?.dominantEmotions?.length > 0 && (
        <div className="glass p-5">
          <p className="text-xs font-semibold text-moody-300 mb-3 uppercase tracking-wider">🤖 AI Memory</p>
          <div className="space-y-2 text-sm text-white/60">
            <p>Dominant emotions: <span className="text-white capitalize">{user.aiMemory.dominantEmotions.join(', ')}</span></p>
            {user.aiMemory.lastMoodSummary && (
              <p className="italic text-white/40 text-xs leading-relaxed">"{user.aiMemory.lastMoodSummary}"</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="glass p-6">
        <h2 className="font-display font-semibold text-lg text-white mb-5 flex items-center gap-2">
          <User size={16} className="text-moody-400" /> Edit Profile
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              id="profile-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm(f => ({ ...f, age: e.target.value }))}
                className="input-field"
                id="profile-age"
                min="10" max="100"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
                className="input-field"
                id="profile-gender"
              >
                <option value="" className="bg-gray-900">Select...</option>
                <option value="male" className="bg-gray-900">Male</option>
                <option value="female" className="bg-gray-900">Female</option>
                <option value="non-binary" className="bg-gray-900">Non-binary</option>
                <option value="prefer-not-to-say" className="bg-gray-900">Prefer not to say</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} id="profile-save" className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={14} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass p-6">
        <button
          onClick={() => setShowPwForm(!showPwForm)}
          className="flex items-center gap-2 font-display font-semibold text-lg text-white w-full text-left"
        >
          <Lock size={16} className="text-moody-400" /> Change Password
        </button>

        {showPwForm && (
          <form onSubmit={handlePasswordChange} className="mt-4 space-y-3 animate-slide-up">
            <input
              type="password"
              placeholder="Current password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="New password (min 8 chars)"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              className="input-field"
              required
            />
            <button type="submit" disabled={changingPw} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
              {changingPw ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔐 Update Password'}
            </button>
          </form>
        )}
      </div>

      {/* Danger Zone */}
      <div className="glass p-5 border border-red-500/20">
        <h3 className="font-semibold text-red-400 flex items-center gap-2 mb-3 text-sm">
          <AlertTriangle size={14} /> Account Actions
        </h3>
        <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary text-sm flex items-center gap-2 text-red-400 hover:text-red-300">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
