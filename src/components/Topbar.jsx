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
        
        {/* ✅ NOUVEAU BOUTON DÉCONNEXION BIEN VISIBLE */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-red-100 border border-red-200 transition text-xs md:text-sm font-semibold"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Se déconnecter</span>
        </button>
      </div>
    </header>
  );
}