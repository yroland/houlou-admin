import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';

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
  
  // État pour le modal
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [commandeItems, setCommandeItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch('commandes?select=*&order=created_at.desc&limit=100');
      setCommandes(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadCommandes(); }, []);

  // Ouvrir le modal
  const handleViewDetails = async (commande) => {
    setSelectedCommande(commande);
    setLoadingItems(true);
    try {
      const items = await supabaseFetch(`items_commande?select=*,produits(nom,prix)&commande_id=eq.${commande.id}`);
      setCommandeItems(items || []);
    } catch (err) { console.error(err); setCommandeItems([]); }
    setLoadingItems(false);
  };

  const filteredCommandes = commandes.filter((c) => {
    const matchStatus = filtreStatut === 'tous' || c.status === filtreStatut;
    const matchSearch = c.reference?.toLowerCase().includes(searchTerm.toLowerCase()) || c.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) || c.telephone?.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des commandes</h1>
          <p className="text-gray-600 text-sm">Suivez l'état de toutes les commandes</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input type="text" placeholder="🔍 Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 md:w-64" />
          <button onClick={loadCommandes} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap">🔄 Actualiser</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFiltreStatut('tous')} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${filtreStatut === 'tous' ? 'bg-[#2E7D32] text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>Toutes ({commandes.length})</button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = commandes.filter(c => c.status === key).length;
          if (count === 0) return null;
          return (
            <button key={key} onClick={() => setFiltreStatut(key)} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${filtreStatut === key ? 'bg-[#2E7D32] text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>{config.label} ({count})</button>
          );
        })}
      </div>

      {/* Vue Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-semibold">N°</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Adresse</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCommandes.map((cmd) => {
                const status = STATUS_CONFIG[cmd.status] || STATUS_CONFIG.en_attente;
                return (
                  <tr key={cmd.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono text-sm font-semibold text-gray-700">{cmd.reference || `#${cmd.id}`}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(cmd.created_at)}</td>
                    <td className="p-4 text-sm text-gray-800">📍 {cmd.adresse}</td>
                    <td className="p-4 font-bold text-[#2E7D32]">{cmd.total?.toLocaleString()} F</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span></td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleViewDetails(cmd)} className="text-blue-600 text-sm font-semibold">👁️ Voir</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue Mobile */}
      <div className="md:hidden space-y-4 pb-6">
        {filteredCommandes.map((cmd) => {
          const status = STATUS_CONFIG[cmd.status] || STATUS_CONFIG.en_attente;
          return (
            <div key={cmd.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-sm font-bold text-gray-700">{cmd.reference || `#${cmd.id}`}</span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${status.color}`}>{status.label}</span>
              </div>
              <div className="text-xs text-gray-500 mb-2">📅 {formatDate(cmd.created_at)}</div>
              <div className="text-sm text-gray-800 mb-3">📍 {cmd.adresse}</div>
              <div className="flex justify-between items-center border-t pt-3 mt-3">
                <button onClick={() => handleViewDetails(cmd)} className="text-blue-600 text-sm font-semibold">👁️ Détails</button>
                <div className="text-lg font-bold text-[#2E7D32]">{cmd.total?.toLocaleString()} F</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DÉTAILS */}
      {selectedCommande && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Commande {selectedCommande.reference || `#${selectedCommande.id}`}</h2>
              <button onClick={() => setSelectedCommande(null)} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-semibold text-gray-800">{selectedCommande.telephone}</p>
                <p className="text-sm text-gray-600">📍 {selectedCommande.adresse}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">🛒 Articles</p>
                {loadingItems ? <p className="text-gray-500 text-sm">⏳ Chargement...</p> : (
                  <div className="space-y-2">
                    {commandeItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                        <span>{item.produits?.nom} x {item.quantite}</span>
                        <span className="font-semibold">{item.prix_unitaire}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-[#2E7D32] text-lg">{selectedCommande.total?.toLocaleString()} F</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}