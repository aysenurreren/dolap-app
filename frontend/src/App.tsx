import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import WardrobePage from './pages/WardrobePage';
import OutfitBuilderPage from './pages/OutfitBuilderPage';
import OutfitsListPage from './pages/OutfitsListPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import api from './api/axiosInstance';
import { useAuthStore } from './store/authStore';
import ColorWheelPage from './pages/ColorWheelPage';

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
        // sorun değil, kullanıcı zaten çıkmış
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
      <Route path="/colors" element={<ColorWheelPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/outfits/builder" element={<OutfitBuilderPage />} />
          <Route path="/outfits" element={<OutfitsListPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;