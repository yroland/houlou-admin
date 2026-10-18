import React, { useState, useEffect } from 'react';
import { supabase, supabaseFetch } from '../lib/supabaseAdmin';

export default function ProductForm({ product, onClose, onSave }) {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [image, setImage] = useState('📦');
  const [origine, setOrigine] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('');
  const [enStock, setEnStock] = useState(true);
  
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ============ INITIALISATION ============
  useEffect(() => {
    // Charger les catégories
    const loadCategories = async () => {
      const data = await supabaseFetch('categories?select=nom&actif=eq.true&order=ordre.asc');
      setCategories(data || []);
    };
    loadCategories();

    // Si on modifie, remplir les champs
    if (product) {
      setNom(product.nom || '');
      setPrix(product.prix ? product.prix.replace(' FCFA', '').replace('FCFA', '').trim() : '');
      setImage(product.image || '📦');
      setOrigine(product.origine || '');
      setDescription(product.description || '');
      setCategorie(product.categorie || '');
      setEnStock(product.en_stock !== false);
    }
  }, [product]);

  // ============ UPLOAD IMAGE ============
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('produits')
        .upload(fileName, file);

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('produits')
        .getPublicUrl(fileName);

      setImage(urlData.publicUrl);
      console.log('✅ Image uploadée:', urlData.publicUrl);
    } catch (err) {
      alert('Erreur upload image : ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ============ SAUVEGARDER ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
  nom,
  prix: prix ? `${prix} FCFA` : '0 FCFA', // ✅ Ajoute FCFA automatiquement
  image,
  origine: origine || null,
  description: description || null,
  categorie: categorie || null,
  en_stock: enStock,
};

      if (product) {
        // Modifier
        await supabaseFetch(`produits?id=eq.${product.id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload),
        });
      } else {
        // Ajouter
        await supabaseFetch('produits', {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify([payload]),
        });
      }

      onSave();
      onClose();
    } catch (err) {
      alert('Erreur sauvegarde : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const isUrl = image?.startsWith('http');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 pb-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {product ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {isUrl ? (
                <img src={image} alt="Produit" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{image || '📦'}</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Image (Emoji ou Upload)
              </label>
              <input
                type="text"
                value={isUrl ? '' : image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Ex: 🍅"
                maxLength="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="text-sm"
              />
              {uploading && <p className="text-xs text-blue-600 mt-1">⏳ Upload...</p>}
            </div>
          </div>

          {/* Nom */}
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

          {/* Prix */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">Prix *</label>
  <div className="flex items-center">
    <input
      type="number"
      value={prix}
      onChange={(e) => setPrix(e.target.value)}
      placeholder="Ex: 500"
      required
      className="w-full px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
    />
    <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 font-semibold">
      FCFA
    </div>
  </div>
</div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">-- Aucune --</option>
              {categories.map((cat) => (
                <option key={cat.nom} value={cat.nom}>{cat.nom}</option>
              ))}
            </select>
          </div>

          {/* Origine */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Origine</label>
            <input
              type="text"
              value={origine}
              onChange={(e) => setOrigine(e.target.value)}
              placeholder="Ex: Côte d'Ivoire"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* En Stock */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enstock"
              checked={enStock}
              onChange={(e) => setEnStock(e.target.checked)}
              className="w-4 h-4 text-[#2E7D32]"
            />
            <label htmlFor="enstock" className="text-sm text-gray-700">
              En stock (visible côté client)
            </label>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-2 pt-4 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg font-bold disabled:opacity-50"
            >
              {saving ? '⏳...' : '💾 Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}