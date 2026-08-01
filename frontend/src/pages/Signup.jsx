import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all required fields');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await signup(form);
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="bg-orb w-96 h-96 bg-purple-600 top-0 left-0 -translate-y-1/2 -translate-x-1/2" />
      <div className="bg-orb w-72 h-72 bg-moody-600 bottom-0 right-0 translate-y-1/3 translate-x-1/3" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center shadow-glow-indigo">
            <span className="font-bold text-lg">M</span>
          </div>
          <span className="font-display font-bold text-2xl gradient-text">Moody</span>
        </Link>

        <div className="glass p-8 shadow-card">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl text-white mb-2">Create your account 🌱</h1>
            <p className="text-white/50 text-sm">Your emotional wellness journey starts here. Free forever.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="signup-name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field pl-9"
                autoComplete="name"
              />
            </div>

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="signup-email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-9"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 8 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-9 pr-10"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="signup-age"
                  type="number"
                  placeholder="Age"
                  min="10" max="100"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="input-field pl-8 text-sm"
                />
              </div>
              <select
                id="signup-gender"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="input-field text-sm"
              >
                <option value="" className="bg-gray-900">Gender (optional)</option>
                <option value="male" className="bg-gray-900">Male</option>
                <option value="female" className="bg-gray-900">Female</option>
                <option value="non-binary" className="bg-gray-900">Non-binary</option>
                <option value="prefer-not-to-say" className="bg-gray-900">Prefer not to say</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="signup-submit"
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-white/30 text-xs text-center mt-4">
            By signing up, you agree to our privacy policy. Your data is encrypted and never shared.
          </p>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-moody-400 hover:text-moody-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
        <p className="text-center text-white/30 text-xs mt-4">
          <Sparkles size={10} className="inline mr-1" />
          Works with mock AI even without API keys
        </p>
      </div>
    </div>
  );
}
