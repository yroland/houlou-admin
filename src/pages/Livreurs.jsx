import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';

export default function Livreurs() {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('tous');

  const loadLivreurs = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch('livreurs?select=*&order=created_at.desc');
      setLivreurs(data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLivreurs();
  }, []);

  const handleStatusChange = async (livreur, newStatus) => {
    const action = newStatus === 'actif' ? 'valider' : 'refuser';
    if (!window.confirm(`Voulez-vous vraiment ${action} ce livreur ?`)) return;

    try {
      await supabaseFetch(`livreurs?id=eq.${livreur.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return:minimal' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadLivreurs();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  const filtered = livreurs.filter(l => filtre === 'tous' || l.status === filtre);
  const enAttente = livreurs.filter(l => l.status === 'en_attente_validation').length;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des livreurs</h1>
          <p className="text-gray-600 text-sm">
            {enAttente > 0 ? `⚠️ ${enAttente} inscription(s) en attente` : 'Toutes les inscriptions sont traitées'}
          </p>
        </div>
        <button
          onClick={loadLivreurs}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm"
        >
          🔄 Actualiser
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'tous', label: 'Tous' },
          { key: 'en_attente_validation', label: '⏳ En attente' },
          { key: 'actif', label: '✅ Actifs' },
          { key: 'suspendu', label: '🚫 Suspendus' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
              filtre === f.key ? 'bg-[#2E7D32] text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}
          >
            {f.label} ({f.key === 'tous' ? livreurs.length : livreurs.filter(l => l.status === f.key).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">⏳ Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">Aucun livreur trouvé</div>
        ) : (
          filtered.map((l) => (
            <div key={l.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center overflow-hidden">
                  {l.photo ? (
                    <img src={l.photo} alt={l.nom} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🛵</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{l.nom}</h3>
                  <p className="text-xs text-gray-500 truncate">{l.email}</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <div>📞 {l.telephone}</div>
                <div>🛵 {l.type_vehicule} • {l.couleur_vehicule}</div>
                <div>🔢 {l.matricule || '—'}</div>
                <div>💰 Solde : {l.solde?.toLocaleString()} F</div>
              </div>

              <div className="mb-3">
                {l.status === 'en_attente_validation' && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">⏳ En attente</span>
                )}
                {l.status === 'actif' && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">✅ Actif</span>
                )}
                {l.status === 'suspendu' && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">🚫 Suspendu</span>
                )}
              </div>

              {l.status === 'en_attente_validation' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(l, 'actif')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold text-sm transition"
                  >
                    ✅ Valider
                  </button>
                  <button
                    onClick={() => handleStatusChange(l, 'suspendu')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold text-sm transition"
                  >
                    ❌ Refuser
                  </button>
                </div>
              )}

              {l.status === 'actif' && (
                <button
                  onClick={() => handleStatusChange(l, 'suspendu')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold text-sm transition"
                >
                  🚫 Suspendre
                </button>
              )}

              {l.status === 'suspendu' && (
                <button
                  onClick={() => handleStatusChange(l, 'actif')}
                  className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-lg font-semibold text-sm transition"
                >
                  ✅ Réactiver
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}