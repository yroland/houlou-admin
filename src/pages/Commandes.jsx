import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';

// Couleurs et labels selon le statut
const STATUS_CONFIG = {
  en_attente: { label: '⏳ En attente', color: 'bg-orange-100 text-orange-700' },
  confirmee: { label: '✅ Confirmée', color: 'bg-blue-100 text-blue-700' },
  en_cours: { label: '🛒 En cours', color: 'bg-orange-100 text-orange-700' },
  en_livraison: { label: '🛵 En livraison', color: 'bg-purple-100 text-purple-700' },
  livré: { label: '📦 Livrée', color: 'bg-green-100 text-green-700' },
  annulé: { label: '❌ Annulée', color: 'bg-red-100 text-red-700' },
};

export default function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');

  // ============ CHARGER LES COMMANDES ============
  const loadCommandes = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch(
        'commandes?select=*&order=created_at.desc&limit=100'
      );
      setCommandes(data || []);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommandes();
  }, []);

  // ============ FILTRES ============
  const filteredCommandes = commandes.filter((c) => {
    const matchStatus = filtreStatut === 'tous' || c.status === filtreStatut;
    const matchSearch = 
      c.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telephone?.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  // ============ FORMAT DATE ============
  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des commandes</h1>
          <p className="text-gray-600 text-sm">Suivez l'état de toutes les commandes</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Rechercher (N°, adresse...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
          />
          <button
            onClick={loadCommandes}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFiltreStatut('tous')}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
            filtreStatut === 'tous' ? 'bg-[#2E7D32] text-white' : 'bg-white text-gray-600 border border-gray-300'
          }`}
        >
          Toutes ({commandes.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = commandes.filter(c => c.status === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFiltreStatut(key)}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                filtreStatut === key ? 'bg-[#2E7D32] text-white' : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-semibold">N°</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Adresse</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold">Livreur / Coursier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">⏳ Chargement...</td></tr>
              ) : filteredCommandes.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Aucune commande trouvée</td></tr>
              ) : (
                filteredCommandes.map((cmd) => {
                  const status = STATUS_CONFIG[cmd.status] || STATUS_CONFIG.en_attente;
                  return (
                    <tr key={cmd.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono text-sm font-semibold text-gray-700">
                        {cmd.reference || `#${cmd.id}`}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(cmd.created_at)}
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        📍 {cmd.adresse}
                      </td>
                      <td className="p-4 font-bold text-[#2E7D32]">
                        {cmd.total?.toLocaleString()} F
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {cmd.coursier_nom && (
                          <div className="text-xs text-blue-600">🏃 {cmd.coursier_nom}</div>
                        )}
                        {cmd.livreur_id && (
                          <div className="text-xs text-purple-600">🛵 Assigné</div>
                        )}
                        {!cmd.coursier_nom && !cmd.livreur_id && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}