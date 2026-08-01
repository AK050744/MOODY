import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Brain, BookOpen, MessageCircle, BarChart2, Heart,
  LogOut, User, Menu, X, Sparkles, AlertTriangle
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/checkin', label: 'Check-in', icon: Brain },
  { path: '/recommendations', label: 'For You', icon: Sparkles },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center shadow-glow-indigo group-hover:scale-110 transition-transform">
                <span className="text-sm font-bold">M</span>
              </div>
              <span className="font-display font-bold text-lg gradient-text">Moody</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link ${location.pathname === path ? 'nav-link-active' : ''}`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Emergency Button */}
              <Link
                to="/calm"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           text-red-400 border border-red-500/30 bg-red-500/10
                           hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
              >
                <AlertTriangle size={12} />
                SOS
              </Link>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-moody-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm text-white/80">{user?.name?.split(' ')[0]}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 glass border border-white/10 rounded-xl shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all">
                      <User size={14} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 border-t border-white/10">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all
                  ${location.pathname === path
                    ? 'bg-moody-600/30 text-white border border-moody-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <Link
              to="/calm"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 mt-2"
            >
              <AlertTriangle size={16} /> Emergency Calm Mode
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
