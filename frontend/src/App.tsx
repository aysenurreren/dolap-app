import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import api from './api/axiosInstance';
import { useAuthStore } from './store/authStore';
import WardrobePage from './pages/WardrobePage';

function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const response = await api.post('/auth/refresh');
        const meResponse = await api.get('/auth/me');
        setAuth(response.data.accessToken, meResponse.data);
      } catch {
        // Refresh token yok/geçersiz — kullanıcı zaten çıkmış demektir, sorun değil
      } finally {
        setIsBootstrapping(false);
      }
    }
    bootstrap();
  }, []);

  if (isBootstrapping) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/wardrobe" element={<WardrobePage />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/wardrobe" element={<WardrobePage />} />
    </Routes>
  );
}

export default App;