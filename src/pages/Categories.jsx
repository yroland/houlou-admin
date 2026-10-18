import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Formulaire
  const [nom, setNom] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // ============ CHARGER LES CATÉGORIES ============
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch('categories?select=*&order=ordre.asc');
      setCategories(data || []);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ============ OUVRIR LE MODAL ============
  const openAddModal = () => {
    setEditingCategory(null);
    setNom('');
    setEmoji('📦');
    setDescription('');
    setIsFeatured(false);
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setNom(cat.nom);
    setEmoji(cat.emoji);
    setDescription(cat.description || '');
    setIsFeatured(cat.is_featured);
    setShowModal(true);
  };

  // ============ SAUVEGARDER ============
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const slug = nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = {
        nom,
        slug,
        emoji,
        description,
        is_featured: isFeatured,
        ordre: categories.length + 1,
        actif: true,
      };

      if (editingCategory) {
        await supabaseFetch(`categories?id=eq.${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload),
        });
      } else {
        await supabaseFetch('categories', {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify([payload]),
        });
      }

      setShowModal(false);
      loadCategories();
    } catch (err) {
      alert('Erreur lors de la sauvegarde : ' + err.message);
    }
  };

  // ============ SUPPRIMER ============
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;
    try {
      await supabaseFetch(`categories?id=eq.${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err) {
      alert('Erreur lors de la suppression : ' + err.message);
    }
  };

  return (
    <div>
      {/* Header de page */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des catégories</h1>
          <p className="text-gray-600 text-sm">Organisez les rayons de votre application</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-2 px-4 rounded-lg transition"
        >
          ➕ Ajouter une catégorie
        </button>
      </div>

      {/* Vue Desktop : Tableau */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-semibold">Emoji</th>
                <th className="p-4 font-semibold">Nom</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">À la une</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">⏳ Chargement...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Aucune catégorie</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-2xl">{cat.emoji}</td>
                    <td className="p-4 font-semibold text-gray-800">{cat.nom}</td>
                    <td className="p-4 text-gray-600 text-sm">{cat.description || '—'}</td>
                    <td className="p-4">
                      {cat.is_featured ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">✅ Oui</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Non</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEditModal(cat)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">✏️ Modifier</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 font-semibold text-sm">🗑️ Supprimer</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue Mobile : Cartes empilées */}
      <div className="md:hidden space-y-4 pb-6">
        {loading ? (
          <div className="text-center p-8 text-gray-500">⏳ Chargement...</div>
        ) : categories.length === 0 ? (
          <div className="text-center p-8 text-gray-500">Aucune catégorie</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="text-4xl bg-gray-50 p-2 rounded-lg">{cat.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{cat.nom}</h3>
                  {cat.is_featured ? (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold mt-1 inline-block">✅ À la une</span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">Non</span>
                  )}
                </div>
              </div>
              
              {cat.description && (
                <p className="text-sm text-gray-600 leading-tight">{cat.description}</p>
              )}

              <div className="flex justify-end gap-4 pt-3 mt-1">
                <button onClick={() => openEditModal(cat)} className="text-blue-600 text-sm font-semibold flex items-center gap-1">
                  ✏️ Modifier
                </button>
                <button onClick={() => handleDelete(cat.id)} className="text-red-600 text-sm font-semibold flex items-center gap-1">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL AJOUT / EDITION */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingCategory ? '✏️ Modifier la catégorie' : '➕ Nouvelle catégorie'}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji (1 seul)</label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de la catégorie</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Goûter 16h"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optionnel)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Pour le goûter des enfants"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#2E7D32] rounded"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">
                  Mettre en avant sur la page d'accueil
                </label>
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