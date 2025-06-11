import { useState, useEffect } from 'react';
import LoginView from './views/LoginView';
import type { LoginForm } from './views/LoginView';
import DashboardView from './views/DashboardView';
import UsersView from './views/UsersView';
import UrlsView from './views/UrlsView';
import ForgotPasswordView from './views/ForgotPasswordView';
import ResetPasswordView from './views/ResetPasswordView';
import AuditLogsView from './views/AuditLogsView';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { LoaderProvider } from './contexts/LoaderContext';

function PrivateRoute({ token }: { token: string }) {
  return token ? <Outlet /> : <Navigate to='/login' replace />;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate?.() ?? (() => {});

  const userRole = user?.role || '';

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
      setUser(result.user);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate('/dashboard/urls', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <LoaderProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Routes>
          <Route
            path='/login'
            element={
              <LoginView
                loading={loading}
                error={error}
                onLogin={handleLogin}
              />
            }
          />
          <Route path='/forgot-password' element={<ForgotPasswordView />} />
          <Route path='/reset-password' element={<ResetPasswordView />} />
          <Route element={<PrivateRoute token={token} />}>
            <Route
              path='/dashboard'
              element={
                <DashboardViewRouter
                  token={token}
                  onLogout={handleLogout}
                  userRole={userRole}
                />
              }
            >
              <Route path='urls' element={<UrlsView token={token} />} />
              <Route path='users' element={<UsersView token={token} />} />
              <Route
                path='logs'
                element={
                  <AuditLogsView token={token} isAdmin={userRole === 'admin'} />
                }
              />
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
    </LoaderProvider>
  );
}

function DashboardViewRouter({
  token,
  onLogout,
  userRole,
}: {
  token: string;
  onLogout: () => void;
  userRole: string;
}) {
  const navigate = useNavigate();
  const path = window.location.pathname;
  let dashboardView: 'usuarios' | 'urls' | 'logs' = 'urls';
  if (path.includes('/users')) dashboardView = 'usuarios';
  else if (path.includes('/logs')) dashboardView = 'logs';
  const setDashboardView = (v: 'usuarios' | 'urls' | 'logs') => {
    if (v === 'usuarios') navigate('/dashboard/users');
    else if (v === 'logs') navigate('/dashboard/logs');
    else navigate('/dashboard/urls');
  };
  return (
    <DashboardView
      dashboardView={dashboardView}
      setDashboardView={setDashboardView}
      onLogout={onLogout}
      isAdmin={userRole === 'admin'}
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
