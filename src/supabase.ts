import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('Supabase não configurado. Copie .env.example para .env e preencha as chaves.')
}

export const supabase = createClient(url || 'https://example.supabase.co', anonKey || 'demo-key')
export const supabaseConfigured = Boolean(url && anonKey)
