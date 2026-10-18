import React, { useState, useEffect } from 'react';
import { supabaseFetch } from '../lib/supabaseAdmin';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Dashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({
    chiffreAffaires: 0,
    totalCommandes: 0,
    commandesEnCours: 0,
    totalClients: 0,
    totalCoursiers: 0,
    totalLivreurs: 0,
    totalProduits: 0,
  });
  const [recentCommandes, setRecentCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // 1. Commandes
        const commandes = await supabaseFetch('commandes?select=total,status&order=created_at.desc');
        const totalCommandes = commandes?.length || 0;
        const chiffreAffaires = commandes
          ?.filter(c => c.status === 'livré')
          .reduce((sum, c) => sum + (Number(c.total) || 0), 0) || 0;
        const commandesEnCours = commandes
          ?.filter(c => ['en_attente', 'confirmee', 'en_cours', 'en_livraison'].includes(c.status))
          .length || 0;

        // 2. 5 dernières commandes
        const recent = await supabaseFetch('commandes?select=id,reference,adresse,total,status,created_at&order=created_at.desc&limit=5');
        setRecentCommandes(recent || []);

        // 3. Utilisateurs
        const clients = await supabaseFetch('auth/users?select=id'); // Note: on va approximer
        const coursiers = await supabaseFetch('coursiers?select=id&status=eq.actif');
        const livreurs = await supabaseFetch('livreurs?select=id&status=eq.actif');
        const produits = await supabaseFetch('produits?select=id');

        setStats({
          chiffreAffaires,
          totalCommandes,
          commandesEnCours,
          totalClients: clients?.length || 0,
          totalCoursiers: coursiers?.length || 0,
          totalLivreurs: livreurs?.length || 0,
          totalProduits: produits?.length || 0,
        });

      } catch (err) {
        console.error('Erreur stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Badge statut
  const getStatusBadge = (status) => {
    const map = {
      en_attente: { label: '⏳', color: 'bg-orange-100 text-orange-700' },
      confirmee: { label: '✅', color: 'bg-blue-100 text-blue-700' },
      en_cours: { label: '🛒', color: 'bg-orange-100 text-orange-700' },
      en_livraison: { label: '🛵', color: 'bg-purple-100 text-purple-700' },
      livré: { label: '📦', color: 'bg-green-100 text-green-700' },
      annulé: { label: '❌', color: 'bg-red-100 text-red-700' },
    };
    return map[status] || map.en_attente;
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  if (loading) {
    return <div className="text-center p-10 text-gray-500">⏳ Chargement des statistiques...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">👋 Bonjour, {admin?.nom}</h1>
        <p className="text-gray-600 mt-1">Voici l'état de HOULOU aujourd'hui.</p>
      </div>

      {/* CARTES STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon="💰" label="Chiffre d'Affaires" 
          value={`${stats.chiffreAffaires.toLocaleString()} F`} 
          color="bg-green-50 text-green-700" 
        />
        <StatCard 
          icon="📋" label="Commandes" 
          value={stats.totalCommandes} 
          subtitle={`${stats.commandesEnCours} en cours`}
          color="bg-blue-50 text-blue-700" 
        />
        <StatCard 
          icon="📦" label="Produits" 
          value={stats.totalProduits} 
          color="bg-purple-50 text-purple-700" 
        />
        <StatCard 
          icon="🏃" label="Équipe" 
          value={`${stats.totalCoursiers + stats.totalLivreurs}`} 
          subtitle={`${stats.totalCoursiers} coursiers · ${stats.totalLivreurs} livreurs`}
          color="bg-orange-50 text-orange-700" 
        />
      </div>

      {/* DERNIÈRES COMMANDES */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">📋 Dernières commandes</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">N°</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Adresse</th>
              <th className="p-4 font-semibold">Total</th>
              <th className="p-4 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentCommandes.map((cmd) => {
              const badge = getStatusBadge(cmd.status);
              return (
                <tr key={cmd.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-sm font-semibold text-gray-700">
                    {cmd.reference || `#${cmd.id}`}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {formatDate(cmd.created_at)}
                  </td>
                  <td className="p-4 text-sm text-gray-800">📍 {cmd.adresse}</td>
                  <td className="p-4 font-bold text-[#2E7D32]">
                    {cmd.total?.toLocaleString()} F
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-3`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}