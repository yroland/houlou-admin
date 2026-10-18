import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { admin, signOut } = useAdminAuth();

  const handleLogout = async () => {
    if (!window.confirm('Voulez-vous vraiment vous déconnecter ?')) return;
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Bouton Menu (Mobile uniquement) */}
        <button 
          onClick={onMenuClick}
          className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
          Espace Administrateur
        </h2>
        <h2 className="text-lg font-semibold text-gray-800 sm:hidden">
          Admin
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <span className="text-xs md:text-sm text-gray-600 hidden sm:block">
          {admin?.email}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-red-100 transition text-xs md:text-sm font-semibold"
        >
          🚪 <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}