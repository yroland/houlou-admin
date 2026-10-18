import { createClient } from '@supabase/supabase-js';

// ✅ Réutilise les mêmes clés que l'app mobile
const SUPABASE_URL = 'https://xfhdqtjudccfkhonyple.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5VELnIk7dpWR1GcCtjvhGg_A3flMCnS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'houlou-admin-auth',
  },
});

// Helper fetch manuel (comme dans l'app mobile)
export const supabaseFetch = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const text = await response.text();
  if (!text || text.trim() === '') return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('⚠️ Impossible de parser la réponse:', text);
    return null;
  }
};

console.log('🔑 Supabase Admin:', SUPABASE_URL);