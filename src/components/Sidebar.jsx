import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const MENU_ITEMS = [
  { section: 'stats', path: '/dashboard', icon: '📊', label: 'Tableau de bord' },
  { section: 'produits', path: '/categories', icon: '📁', label: 'Catégories' },
  { section: 'produits', path: '/produits', icon: '📦', label: 'Produits' },
  { section: 'commandes', path: '/commandes', icon: '📋', label: 'Commandes' },
  { section: 'coursiers', path: '/coursiers', icon: '🏃', label: 'Coursiers' },
  { section: 'livreurs', path: '/livreurs', icon: '🛵', label: 'Livreurs' },
  { section: 'promotions', path: '/promotions', icon: '🎁', label: 'Promotions' },
  { section: 'partenaires', path: '/partenaires', icon: '🤝', label: 'Partenaires' },
  { section: 'parametres', path: '/parametres', icon: '⚙️', label: 'Paramètres' },
];

export default function Sidebar({ onClose }) {
  const { canAccess, admin } = useAdminAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛒</span>
          <div>
            <h1 className="text-xl font-bold text-[#2E7D32]">HOULOU</h1>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
        {/* Bouton fermer (Mobile) */}
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-red-500 text-2xl font-bold">
            &times;
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          if (!canAccess(item.section)) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose} // Ferme le menu au clic sur mobile
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                  isActive
                    ? 'bg-[#2E7D32] text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#2E7D32] rounded-full flex items-center justify-center text-white font-bold shrink-0">
            {admin?.nom?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {admin?.nom}
            </p>
            <p className="text-xs text-gray-500 truncate">{admin?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}