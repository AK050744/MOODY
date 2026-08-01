import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('moody_token');
    const savedUser = localStorage.getItem('moody_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        // Verify token is still valid
        authAPI.getMe()
          .then(({ data }) => {
            setUser(data.user);
            localStorage.setItem('moody_user', JSON.stringify(data.user));
          })
          .catch(() => logout())
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('moody_token', data.token);
    localStorage.setItem('moody_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    toast.success(data.message || 'Welcome back! 👋');
    return data;
  }, []);

  const signup = useCallback(async (userData) => {
    const { data } = await authAPI.signup(userData);
    localStorage.setItem('moody_token', data.token);
    localStorage.setItem('moody_user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    toast.success(data.message || 'Welcome to Moody! 🌱');
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('moody_token');
    localStorage.removeItem('moody_user');
    setUser(null);
    setIsAuthenticated(false);
    toast('Logged out. Take care! 💙', { icon: '👋' });
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('moody_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
