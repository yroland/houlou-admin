import React, { useState, useEffect } from 'react';
import { supabase, supabaseFetch } from '../lib/supabaseAdmin';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Formulaire
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('moderateur');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ Voir mot de passe

  // Étape de création
  const [createdUserId, setCreatedUserId] = useState(null);

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

  const openAdd = () => { 
    setEditing(null); setEmail(''); setNom(''); setRole('moderateur'); setPassword(''); setCreatedUserId(null); setShowPassword(false); setShowModal(true); 
  };
  
  const openEdit = (a) => { 
    setEditing(a); setEmail(a.email); setNom(a.nom); setRole(a.role); setPassword(''); setCreatedUserId(null); setShowPassword(false); setShowModal(true); 
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editing) {
        await supabaseFetch(`admins?id=eq.${editing.id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ nom, role }),
        });
        setShowModal(false);
        loadAdmins();
      } else {
        // Création du compte Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

        if (authError) {
          if (authError.message.includes('already registered')) {
            alert('Cet email est déjà utilisé. Si c\'est le vôtre, vous pouvez récupérer l\'UUID dans Supabase et l\'ajouter directement.');
          } else {
            throw authError;
          }
          return;
        }

        if (authData.user) {
          setCreatedUserId(authData.user.id);
        }
      }
    } catch (err) { 
      alert('Erreur : ' + err.message); 
    } finally {
      setSaving(false);
    }
  };

  const handleActivateAdmin = async () => {
    if (!createdUserId) return;
    setSaving(true);
    try {
      const permissions = {
        produits: role === 'manager' || role === 'super_admin',
        commandes: role !== 'marketing',
        coursiers: role !== 'marketing',
        livreurs: role !== 'marketing',
        promotions: role !== 'support',
        partenaires: role !== 'support',
        stats: role !== 'support',
        parametres: role === 'super_admin',
      };

      await supabaseFetch('admins', {
        method: 'POST',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify([{
          user_id: createdUserId,
          email,
          nom,
          role,
          actif: true,
          permissions
        }]),
      });

      alert('🎉 Admin activé avec succès !');
      setShowModal(false);
      loadAdmins();
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet admin ?')) return;
    try {
      await supabaseFetch(`admins?id=eq.${id}`, { method: 'DELETE' });
      loadAdmins();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des administrateurs</h1>
          <p className="text-gray-600 text-sm">Gérez les rôles et accès de votre équipe</p>
        </div>
        <button onClick={openAdd} className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold py-2 px-4 rounded-lg transition">
          ➕ Ajouter un administrateur
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">Nom</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Rôle</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan="4" className="p-8 text-center">⏳ Chargement...</td></tr> : 
             admins.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-semibold text-gray-800">{a.nom}</td>
                <td className="p-4 text-sm text-gray-600">{a.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${a.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {a.role}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEdit(a)} className="text-blue-600 text-sm font-semibold">✏️ Modifier</button>
                  {a.role !== 'super_admin' && (
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 text-sm font-semibold">🗑️ Supprimer</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Modifier l\'admin' : 'Nouvel admin'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="block text-sm font-semibold mb-1">Nom</label><input type="text" value={nom} onChange={e=>setNom(e.target.value)} required className="w-full border rounded-lg p-2" /></div>
              
              {!editing && (
                <>
                  <div><label className="block text-sm font-semibold mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border rounded-lg p-2" /></div>
                  
                  {/* ✅ Champ mot de passe avec bouton voir */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Mot de passe</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={e=>setPassword(e.target.value)} 
                        required 
                        minLength="6" 
                        className="w-full border rounded-lg p-2 pr-10" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1">Rôle</label>
                <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border rounded-lg p-2">
                  <option value="manager">Manager (Presque tout)</option>
                  <option value="moderateur">Modérateur (Commandes, Coursiers, Livreurs)</option>
                  <option value="marketing">Marketing (Promotions, Partenaires)</option>
                  <option value="support">Support (Commandes uniquement)</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Annuler</button>
                
                {createdUserId ? (
                  <button 
                    type="button" 
                    onClick={handleActivateAdmin} 
                    disabled={saving} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"
                  >
                    {saving ? '⏳ Activation...' : '✅ Valider l\'admin'}
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg font-bold disabled:opacity-50"
                  >
                    {saving ? '⏳ Création...' : '💾 Créer le compte'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}