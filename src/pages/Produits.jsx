import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';
import ProductForm from '../components/ProductForm';

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProduits = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch('produits?select=*&order=id.desc');
      setProduits(data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProduits(); }, []);

  const handleAdd = () => { setEditingProduct(null); setShowModal(true); };
  const handleEdit = (product) => { setEditingProduct(product); setShowModal(true); };

  const handleToggleStock = async (product) => {
    try {
      await supabaseFetch(`produits?id=eq.${product.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ en_stock: !product.en_stock }),
      });
      loadProduits();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await supabaseFetch(`produits?id=eq.${id}`, { method: 'DELETE' });
      loadProduits();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const filteredProduits = produits.filter((p) =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des produits</h1>
          <p className="text-gray-600 text-sm">Gérez votre catalogue</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input type="text" placeholder="🔍 Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 md:w-64" />
          <button onClick={handleAdd} className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-2 px-4 rounded-lg transition whitespace-nowrap">➕ Ajouter</button>
        </div>
      </div>

      {/* Vue Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-semibold">Image</th>
                <th className="p-4 font-semibold">Nom</th>
                <th className="p-4 font-semibold">Prix</th>
                <th className="p-4 font-semibold">Catégorie</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProduits.map((product) => {
                const isUrl = product.image?.startsWith('http');
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="p-4"><div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">{isUrl ? <img src={product.image} alt={product.nom} className="w-full h-full object-cover" /> : <span className="text-2xl">{product.image || '📦'}</span>}</div></td>
                    <td className="p-4 font-semibold text-gray-800">{product.nom}{product.origine && <div className="text-xs text-gray-500 font-normal">{product.origine}</div>}</td>
                    <td className="p-4 font-bold text-[#2E7D32]">{product.prix}</td>
                    <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{product.categorie || '—'}</span></td>
                    <td className="p-4"><button onClick={() => handleToggleStock(product)} className={`px-3 py-1 rounded-full text-xs font-bold ${product.en_stock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.en_stock !== false ? '✅ En stock' : '❌ Rupture'}</button></td>
                    <td className="p-4 text-right space-x-2"><button onClick={() => handleEdit(product)} className="text-blue-600 text-sm">✏️</button><button onClick={() => handleDelete(product.id)} className="text-red-600 text-sm">🗑️</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue Mobile : Cartes empilées */}
      <div className="md:hidden space-y-3">
        {filteredProduits.map((product) => {
          const isUrl = product.image?.startsWith('http');
          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  {isUrl ? <img src={product.image} alt={product.nom} className="w-full h-full object-cover" /> : <span className="text-3xl">{product.image || '📦'}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{product.nom}</h3>
                  <p className="text-xs text-gray-500 truncate">{product.origine}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-sm font-bold text-[#2E7D32]">{product.prix}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{product.categorie || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 mt-1">
                <button onClick={() => handleToggleStock(product)} className={`px-3 py-1 rounded-full text-xs font-bold ${product.en_stock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.en_stock !== false ? '✅ En stock' : '❌ Rupture'}</button>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(product)} className="text-blue-600 text-lg">✏️</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 text-lg">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <ProductForm product={editingProduct} onClose={() => setShowModal(false)} onSave={loadProduits} />}
    </div>
  );
}