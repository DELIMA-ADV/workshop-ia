// Arquivo de teste para debug do Supabase
// Coloque este código no console do navegador para testar a conexão

console.log('%c🔍 Debug Supabase', 'color: blue; font-weight: bold; font-size: 14px;');

// Teste 1: Verificar variáveis de ambiente
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Teste 2: Importar e testar conexão
import { supabase } from './src/lib/supabase.js';

// Teste 3: Verificar estado da conexão
console.log('Supabase client criado:', !!supabase);

// Teste 4: Tentar buscar um projeto simples
supabase.from('subscriptions')
  .select('count')
  .then(({ data, error }) => {
    if (error) {
      console.error('%c❌ Erro ao conectar:', 'color: red; font-weight: bold;', error);
    } else {
      console.log('%c✅ Conexão OK!', 'color: green; font-weight: bold;', data);
    }
  })
  .catch(err => {
    console.error('%c❌ Erro de rede:', 'color: red; font-weight: bold;', err);
  });
