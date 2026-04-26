// Endpoint de teste para verificar se as variáveis estão configuradas
export default async function handler(req, res) {
  const envVars = {
    // Frontend / Supabase proxy
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? '✅ EXISTE' : '❌ AUSENTE',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? '✅ EXISTE' : '❌ AUSENTE',
    // E-mail
    RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ EXISTE' : '❌ AUSENTE',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ? '✅ EXISTE' : '⚠️ AUSENTE (usará onboarding@resend.dev)',
    // WhatsApp
    EVOLUTION_API_URL: process.env.EVOLUTION_API_URL ? '✅ EXISTE' : '⚠️ AUSENTE (WhatsApp desabilitado)',
    EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? '✅ EXISTE' : '⚠️ AUSENTE (WhatsApp desabilitado)',
    // Runtime
    NODE_ENV: process.env.NODE_ENV || 'não definido',
    VERCEL_ENV: process.env.VERCEL_ENV || 'não definido',
  };

  const details = {
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'NÃO DEFINIDA',
    supabaseKeyLength: process.env.VITE_SUPABASE_ANON_KEY?.length || 0,
    urlValid: process.env.VITE_SUPABASE_URL?.startsWith('https://') ? 'SIM' : 'NÃO/AUSENTE',
    resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 7) || 'NÃO DEFINIDA',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev (padrão de teste)',
    evolutionUrl: process.env.EVOLUTION_API_URL || 'NÃO DEFINIDA',
  };

  const criticalMissing = [
    !process.env.VITE_SUPABASE_URL && 'VITE_SUPABASE_URL',
    !process.env.VITE_SUPABASE_ANON_KEY && 'VITE_SUPABASE_ANON_KEY',
    !process.env.RESEND_API_KEY && 'RESEND_API_KEY',
  ].filter(Boolean);

  res.json({
    timestamp: new Date().toISOString(),
    message: criticalMissing.length === 0
      ? '✅ Todas as variáveis críticas estão configuradas'
      : `❌ ${criticalMissing.length} variável(is) crítica(s) ausente(s)`,
    critical_missing: criticalMissing,
    status: envVars,
    details,
    help: 'Configure as variáveis em Vercel Dashboard → Settings → Environment Variables'
  });
}
