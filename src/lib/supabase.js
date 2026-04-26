import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação em tempo de build para avisar se as variáveis estão faltando
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!')
  console.error('Adicione ao arquivo .env (ou às variáveis do Vercel):')
  console.error('  VITE_SUPABASE_URL=https://seu-projeto.supabase.co')
  console.error('  VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)
