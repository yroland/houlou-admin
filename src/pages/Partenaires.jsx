import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';

export default function Partenaires() {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Formulaire
  const [nom, setNom] = useState('');
  const [logo, setLogo] = useState('🤝');
  const [categorie, setCategorie] = useState('');
  const [description, setDescription] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [offre, setOffre] = useState('');
  const [codePromo, setCodePromo] = useState('');

  // ============ CHARGER ============
  const loadPartenaires = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch('partenaires?select=*&order=ordre.asc');
      setPartenaires(data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartenaires();
  }, []);

  // ============ MODAL ============
  const openAdd = () => {
    setEditing(null);
    setNom(''); setLogo('🤝'); setCategorie('');
    setDescription(''); setTelephone(''); setAdresse(''); setOffre(''); setCodePromo('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setNom(p.nom); setLogo(p.logo || '🤝'); setCategorie(p.categorie || '');
    setDescription(p.description || ''); setTelephone(p.telephone || '');
    setAdresse(p.adresse || ''); setOffre(p.offre || ''); setCodePromo(p.code_promo || '');
    setShowModal(true);
  };

  // ============ SAUVEGARDER ============
  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { 
      nom, 
      logo, 
      categorie, 
      description, 
      telephone, 
      adresse, 
      offre, 
      code_promo: codePromo, 
      actif: true 
    };

    try {
      if (editing) {
        await supabaseFetch(`partenaires?id=eq.${editing.id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' }, // ✅ CORRIGÉ
          body: JSON.stringify(payload),
        });
      } else {
        await supabaseFetch('partenaires', {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' }, // ✅ CORRIGÉ
          body: JSON.stringify([payload]),
        });
      }
      setShowModal(false);
      loadPartenaires();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  // ============ SUPPRIMER ============
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce partenaire ?')) return;
    try {
      await supabaseFetch(`partenaires?id=eq.${id}`, { method: 'DELETE' });
      loadPartenaires();
    } catch (err) {
      alert('Erreur : ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des partenaires</h1>
          <p className="text-gray-600 text-sm">Gérez vos partenaires et leurs offres</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-2 px-4 rounded-lg transition"
        >
          ➕ Ajouter un partenaire
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">⏳ Chargement...</div>
        ) : partenaires.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">Aucun partenaire</div>
        ) : (
          partenaires.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">{p.logo}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{p.nom}</h3>
                  {p.categorie && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{p.categorie}</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description || '—'}</p>
              {p.offre && (
                <div className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded mb-2">
                  🎁 {p.offre}
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
              {editing ? '✏️ Modifier le partenaire' : '➕ Nouveau partenaire'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <div className="w-24">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Logo</label>
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    maxLength="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
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
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Offre exclusive</label>
                <input
                  type="text"
                  value={offre}
                  onChange={(e) => setOffre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Code promo</label>
                <input
                  type="text"
                  value={codePromo}
                  onChange={(e) => setCodePromo(e.target.value)}
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