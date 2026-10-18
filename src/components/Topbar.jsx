import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Topbar() {
  const navigate = useNavigate();
  const { admin, signOut } = useAdminAuth();

  const handleLogout = async () => {
    if (!window.confirm('Voulez-vous vraiment vous déconnecter ?')) return;
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Espace Administrateur
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {admin?.email}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm font-semibold"
        >
          🚪 Déconnexion
        </button>
      </div>
    </header>
  );
}