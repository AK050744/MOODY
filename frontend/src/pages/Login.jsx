import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const data = await login(form);
      navigate(data.user.onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="bg-orb w-96 h-96 bg-moody-600 top-0 right-0 -translate-y-1/2 translate-x-1/2" />
      <div className="bg-orb w-72 h-72 bg-purple-600 bottom-0 left-0 translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center shadow-glow-indigo">
            <span className="font-bold text-lg">M</span>
          </div>
          <span className="font-display font-bold text-2xl gradient-text">Moody</span>
        </Link>

        <div className="glass p-8 shadow-card">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl text-white mb-2">Welcome back 👋</h1>
            <p className="text-white/50 text-sm">We've missed you. Let's check in on how you're doing.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="login-email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-9"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-9 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-moody-400 hover:text-moody-300 font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <p className="text-center text-white/30 text-xs mt-4">
          <Sparkles size={10} className="inline mr-1" />
          Works with mock AI even without API keys
        </p>
      </div>
    </div>
  );
}
