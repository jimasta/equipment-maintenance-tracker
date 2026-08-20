import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { AppShell } from './layout/AppShell';
import { AtivoDetailPage } from './pages/ativos/AtivoDetailPage';
import { AtivosPage } from './pages/ativos/AtivosPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PendenciasPage } from './pages/pendencias/PendenciasPage';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="ativos" element={<AtivosPage />} />
          <Route path="ativos/:id" element={<AtivoDetailPage />} />
          <Route path="pendencias" element={<PendenciasPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
