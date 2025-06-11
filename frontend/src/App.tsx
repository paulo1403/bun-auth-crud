import { useState, useEffect } from 'react';
import LoginView from './views/LoginView';
import type { LoginForm } from './views/LoginView';
import DashboardView from './views/DashboardView';
import UsersView from './views/UsersView';
import UrlsView from './views/UrlsView';
import ForgotPasswordView from './views/ForgotPasswordView';
import ResetPasswordView from './views/ResetPasswordView';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

function PrivateRoute({ token }: { token: string }) {
  return token ? <Outlet /> : <Navigate to='/login' replace />;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const navigate = useNavigate?.() ?? (() => {});

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Login failed');
      setToken(result.token);
      localStorage.setItem('token', result.token);
      navigate('/dashboard/urls', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Routes>
        <Route
          path='/login'
          element={
            <LoginView loading={loading} error={error} onLogin={handleLogin} />
          }
        />
        <Route path='/forgot-password' element={<ForgotPasswordView />} />
        <Route path='/reset-password' element={<ResetPasswordView />} />
        <Route element={<PrivateRoute token={token} />}>
          {' '}
          {/* Protected routes */}
          <Route
            path='/dashboard'
            element={
              <DashboardViewRouter token={token} onLogout={handleLogout} />
            }
          >
            <Route path='urls' element={<UrlsView token={token} />} />
            <Route path='users' element={<UsersView token={token} />} />
            <Route index element={<Navigate to='urls' replace />} />
          </Route>
        </Route>
        <Route
          path='*'
          element={
            <Navigate to={token ? '/dashboard/urls' : '/login'} replace />
          }
        />
        <Route path='/:shortCode' element={<RedirectShortUrl />} />
      </Routes>
    </SnackbarProvider>
  );
}

function DashboardViewRouter({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const path = window.location.pathname;
  const dashboardView = path.includes('/users') ? 'usuarios' : 'urls';
  const setDashboardView = (v: 'usuarios' | 'urls') => {
    navigate(v === 'usuarios' ? '/dashboard/users' : '/dashboard/urls');
  };
  return (
    <DashboardView
      dashboardView={dashboardView}
      setDashboardView={setDashboardView}
      onLogout={onLogout}
    >
      <Outlet />
    </DashboardView>
  );
}

export function RedirectShortUrl() {
  const { shortCode } = useParams();
  useEffect(() => {
    if (shortCode) {
      window.location.href = `http://localhost:3000/${shortCode}`;
    }
  }, [shortCode]);
  return null;
}

export default App;
