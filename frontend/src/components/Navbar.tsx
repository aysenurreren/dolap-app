import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

function Navbar() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      clearAuth();
      navigate('/login');
    }
  }

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="flex gap-6">
        <Link to="/wardrobe" className="text-gray-700 hover:text-blue-600 font-medium">
          Dolabım
        </Link>
        <Link to="/outfits/builder" className="text-gray-700 hover:text-blue-600 font-medium">
          Kombin Oluştur
        </Link>
        <Link to="/outfits" className="text-gray-700 hover:text-blue-600 font-medium">
          Kombinlerim
        </Link>
        <Link to="/colors" className="text-gray-700 hover:text-blue-600 font-medium">
        Renk Uyumu
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-gray-500">{user.displayName}</span>}
        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
          Çıkış Yap
        </button>
      </div>
    </nav>
  );
}

export default Navbar;