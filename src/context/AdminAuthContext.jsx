import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, supabaseFetch } from '../lib/supabaseAdmin';

const AdminAuthContext = createContext(undefined);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============ CHARGER LE PROFIL ADMIN ============
  const loadAdminProfile = async (userId) => {
    try {
      console.log('🔍 Chargement profil admin:', userId);
      const data = await supabaseFetch(
        `admins?select=*&user_id=eq.${userId}&actif=eq.true`
      );

      if (data && data.length > 0) {
        setAdmin(data[0]);
        console.log('✅ Admin chargé:', data[0].nom, '| Role:', data[0].role);
        return true;
      } else {
        console.warn('⚠️ Aucun profil admin trouvé pour cet utilisateur');
        setAdmin(null);
        return false;
      }
    } catch (err) {
      console.error('❌ Erreur chargement profil:', err.message);
      setAdmin(null);
      return false;
    }
  };

  // ============ VÉRIFIER LA SESSION AU DÉMARRAGE ============
  useEffect(() => {
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadAdminProfile(session.user.id);
        } else {
          setAdmin(null);
        }
        setLoading(false);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await loadAdminProfile(session.user.id);
  } else {
    setAdmin(null);
  }
  setLoading(false);
};

  // ============ LOGIN ============
  const signIn = async (email, password) => {
    console.log('🔐 Connexion admin en cours...');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    console.log('✅ Auth OK, chargement du profil...');

    const profileLoaded = await loadAdminProfile(data.user.id);
    if (!profileLoaded) {
      await supabase.auth.signOut();
      throw new Error(
        'Votre compte n\'a pas les droits d\'accès administrateur.'
      );
    }

    console.log('✅ Connexion admin réussie');
  };

  // ============ LOGOUT ============
  const signOut = async () => {
    console.log('🚪 Déconnexion admin...');
    await supabase.auth.signOut();
    setAdmin(null);
  };

  // ============ VÉRIFICATION PERMISSIONS ============
  const canAccess = (section) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions?.[section] === true;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        signIn,
        signOut,
        canAccess,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}