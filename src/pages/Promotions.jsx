import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';

export default function Promotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  // Formulaire
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('🎁');
  const [type, setType] = useState('promo');
  const [codePromo, setCodePromo] = useState('');
  const [reduction, setReduction] = useState('');
  const [dateFin, setDateFin] = useState('');

  // ============ CHARGER ============
  const loadPromos = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch('promotions?select=*&order=ordre.asc');
      setPromos(data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  // ============ MODAL ============
  const openAdd = () => {
    setEditingPromo(null);
    setTitre(''); setDescription(''); setImage('🎁');
    setType('promo'); setCodePromo(''); setReduction(''); setDateFin('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingPromo(p);
    setTitre(p.titre); setDescription(p.description || '');
    setImage(p.image || '🎁'); setType(p.type || 'promo');
    setCodePromo(p.code_promo || '');
    setReduction(p.reduction_pourcent || '');
    setDateFin(p.date_fin ? p.date_fin.split('T')[0] : '');
    setShowModal(true);
  };

  // ============ SAUVEGARDER ============
  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      titre,
      description,
      image,
      type,
      code_promo: codePromo || null,
      reduction_pourcent: reduction ? parseInt(reduction) : null,
      date_fin: dateFin ? new Date(dateFin).toISOString() : null,
      actif: true,
    };

    try {
      if (editingPromo) {
        await supabaseFetch(`promotions?id=eq.${editingPromo.id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload),
        });
      } else {
        await supabaseFetch('promotions', {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify([payload]),
        });
      }
      setShowModal(false);
      loadPromos();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  // ============ SUPPRIMER ============
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette promotion ?')) return;
    try {
      await supabaseFetch(`promotions?id=eq.${id}`, { method: 'DELETE' });
      loadPromos();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des promotions</h1>
          <p className="text-gray-600 text-sm">Créez des offres et des publicités</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-2 px-4 rounded-lg transition"
        >
          ➕ Ajouter une promotion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">⏳ Chargement...</div>
        ) : promos.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">Aucune promotion</div>
        ) : (
          promos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">{p.image}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{p.titre}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{p.type}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description || '—'}</p>
              {p.code_promo && (
                <div className="font-mono text-sm text-[#FF8C42] font-bold mb-2">
                  Code : {p.code_promo}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => openEdit(p)}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingPromo ? '✏️ Modifier la promotion' : '➕ Nouvelle promotion'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji / Image</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    maxLength="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-xl"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="promo">Promo</option>
                    <option value="pub">Publicité</option>
                    <option value="event">Événement</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Code promo</label>
                  <input
                    type="text"
                    value={codePromo}
                    onChange={(e) => setCodePromo(e.target.value)}
                    placeholder="Ex: HOULOU20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Réduction (%)</label>
                  <input
                    type="number"
                    value={reduction}
                    onChange={(e) => setReduction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg font-bold"
                >
                  💾 Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}