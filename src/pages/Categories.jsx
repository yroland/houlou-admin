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
        // Modification
        await supabaseFetch(`categories?id=eq.${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload),
        });
      } else {
        // Ajout
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
      <div className="flex justify-between items-center mb-6">
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

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                    <button onClick={() => openEditModal(cat)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                      ✏️ Modifier
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 font-semibold text-sm">
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* MODAL AJOUT / EDITION */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
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