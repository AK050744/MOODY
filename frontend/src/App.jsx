import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MoodProvider } from './context/MoodContext';
import NavBar from './components/NavBar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MoodCheckin from './pages/MoodCheckin';
import Recommendations from './pages/Recommendations';
import Journal from './pages/Journal';
import Chat from './pages/Chat';
import Analytics from './pages/Analytics';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';

// ---- Protected Route ----
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-moody-500/30 border-t-moody-500 rounded-full animate-spin" />
          <p className="text-white/30 text-sm animate-pulse">Loading Moody...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ---- Public Only Route (redirect if logged in) ----
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ---- App Layout (with NavBar for authenticated pages) ----
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Onboarding (auth required but no navbar) */}
      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />

      {/* Protected App Routes (with NavBar) */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/checkin" element={
        <ProtectedRoute>
          <AppLayout><MoodCheckin /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/recommendations" element={
        <ProtectedRoute>
          <AppLayout><Recommendations /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/journal" element={
        <ProtectedRoute>
          <AppLayout><Journal /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <AppLayout><Chat /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout><Analytics /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/calm" element={
        <ProtectedRoute>
          <AppLayout><Emergency /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MoodProvider>
          <AppRoutes />
        </MoodProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
