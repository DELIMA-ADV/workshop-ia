// Endpoint de teste para verificar se as variáveis estão configuradas
export default async function handler(req, res) {
  // Mostrar todas as variáveis de ambiente (apenas DEBUG)
  const envVars = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? '✅ EXISTE' : '❌ AUSENTE',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? '✅ EXISTE' : '❌ AUSENTE',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  const actual = {
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'NÃO DEFINIDA',
    supabaseKeyLength: process.env.VITE_SUPABASE_ANON_KEY?.length || 0,
    urlValid: process.env.VITE_SUPABASE_URL?.startsWith('https://') ? 'SIM' : 'NÃO/AUSENTE'
  };

  res.json({
    timestamp: new Date().toISOString(),
    message: '🔍 Status das variáveis de ambiente',
    status: envVars,
    details: actual,
    help: 'Se VIR ❌ AUSENTE, configure as variáveis em Vercel Dashboard → Settings → Environment Variables'
  });
}
