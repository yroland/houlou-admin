import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Formulaire
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('moderateur');
  const [password, setPassword] = useState('');

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await supabaseFetch('admins?select=*&order=created_at.desc');
      setAdmins(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const openAdd = () => { setEditing(null); setEmail(''); setNom(''); setRole('moderateur'); setPassword(''); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setEmail(a.email); setNom(a.nom); setRole(a.role); setPassword(''); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await supabaseFetch(`admins?id=eq.${editing.id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ nom, role }),
        });
      } else {
        // ⚠️ Pour créer un admin, il faut d'abord créer le compte Auth
        alert('Pour créer un nouvel admin, créez d\'abord le compte dans Supabase Auth, puis ajoutez son UUID dans la table admins.');
      }
      setShowModal(false); loadAdmins();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet admin ?')) return;
    try {
      await supabaseFetch(`admins?id=eq.${id}`, { method: 'DELETE' });
      loadAdmins();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const filtered = admins.filter(a => a.role !== 'super_admin'); // On ne modifie pas le super_admin

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des administrateurs</h1>
          <p className="text-gray-600 text-sm">Gérez les rôles de votre équipe</p>
        </div>
        <button onClick={openAdd} className="bg-[#2E7D32] text-white font-bold py-2 px-4 rounded-lg">➕ Ajouter un admin</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-full text-center p-8">⏳ Chargement...</div> :
         filtered.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-lg">{a.nom?.[0] || 'A'}</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{a.nom}</h3>
                <p className="text-xs text-gray-500">{a.email}</p>
              </div>
            </div>
            <div className="mb-3">
              <span className={`px-2 py-1 rounded text-xs font-bold ${a.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : a.role === 'manager' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.role}</span>
            </div>
            {a.role !== 'super_admin' && (
              <div className="flex justify-end gap-2 mt-3 border-t pt-3">
                <button onClick={() => openEdit(a)} className="text-blue-600 text-sm font-semibold">✏️ Modifier</button>
                <button onClick={() => handleDelete(a.id)} className="text-red-600 text-sm font-semibold">🗑️</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Modifier l\'admin' : 'Nouvel admin'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="block text-sm font-semibold mb-1">Nom</label><input type="text" value={nom} onChange={e=>setNom(e.target.value)} required className="w-full border rounded-lg p-2" /></div>
              <div><label className="block text-sm font-semibold mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} disabled={!!editing} required className="w-full border rounded-lg p-2 disabled:bg-gray-100" /></div>
              <div>
                <label className="block text-sm font-semibold mb-1">Rôle</label>
                <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border rounded-lg p-2">
                  <option value="manager">Manager</option>
                  <option value="moderateur">Modérateur</option>
                  <option value="marketing">Marketing</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg font-bold">💾 Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}