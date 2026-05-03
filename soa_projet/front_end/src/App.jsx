import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import JuryPage from './pages/JuryPage';
import StudentPage from './pages/StudentPage';

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.roles?.includes('ADMIN')) return <Navigate to="/admin" replace />;
  if (user.roles?.includes('JURY_MEMBER') || user.roles?.includes('SUPERVISOR')) return <Navigate to="/jury" replace />;
  if (user.roles?.includes('STUDENT')) return <Navigate to="/student" replace />;

  return <Navigate to="/forbidden" replace />;
}

function ForbiddenPage() {
  return (
    <div className="screen-center">
      <div className="card narrow">
        <h2>Accès refusé</h2>
        <p>Votre rôle ne permet pas d'accéder à cette page.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/admin"
            element={(
              <ProtectedRoute roles={['ADMIN']}>
                <AppLayout>
                  <AdminPage />
                </AppLayout>
              </ProtectedRoute>
            )}
          />

          <Route
            path="/jury"
            element={(
              <ProtectedRoute roles={['JURY_MEMBER', 'SUPERVISOR']}>
                <AppLayout>
                  <JuryPage />
                </AppLayout>
              </ProtectedRoute>
            )}
          />

          <Route
            path="/student"
            element={(
              <ProtectedRoute roles={['STUDENT']}>
                <AppLayout>
                  <StudentPage />
                </AppLayout>
              </ProtectedRoute>
            )}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
