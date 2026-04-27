// Endpoint de teste para verificar se as variáveis estão configuradas
export default async function handler(req, res) {
  // Suporte a nomes com e sem prefixo VITE_
  const supabaseUrl = process.env.SUPABASE_URL  || process.env.VITE_SUPABASE_URL  || null;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || null;
  const resendKey   = process.env.RESEND_API_KEY || null;
  const fromEmail   = process.env.RESEND_FROM_EMAIL || null;
  const evoUrl      = process.env.EVOLUTION_API_URL || null;
  const evoKey      = process.env.EVOLUTION_API_KEY || null;

  const CORRECT_URL = 'https://nccsdktkkortxrtxxzrh.supabase.co';
  const urlOk = supabaseUrl === CORRECT_URL;

  const status = {
    SUPABASE_URL_efetiva: supabaseUrl  ? `✅ ${supabaseUrl}` : '❌ AUSENTE',
    SUPABASE_URL_correta: urlOk ? '✅ URL correta' : `❌ ERRADA — esperado: ${CORRECT_URL}`,
    SUPABASE_ANON_KEY:    supabaseKey  ? `✅ (${supabaseKey.length} chars)` : '❌ AUSENTE',
    RESEND_API_KEY:       resendKey    ? '✅ EXISTE' : '❌ AUSENTE',
    RESEND_FROM_EMAIL:    fromEmail    ? `✅ ${fromEmail}` : '⚠️ AUSENTE',
    EVOLUTION_API_URL:    evoUrl       ? '✅ EXISTE' : '⚠️ AUSENTE',
    EVOLUTION_API_KEY:    evoKey       ? '✅ EXISTE' : '⚠️ AUSENTE',
    NODE_ENV:             process.env.NODE_ENV || 'não definido',
    VERCEL_ENV:           process.env.VERCEL_ENV || 'não definido',
  };

  const criticalIssues = [
    (!supabaseUrl) && 'VITE_SUPABASE_URL ausente',
    (!supabaseKey) && 'VITE_SUPABASE_ANON_KEY ausente',
    (!resendKey)   && 'RESEND_API_KEY ausente',
    (supabaseUrl && !urlOk) && `VITE_SUPABASE_URL errada (atual: ${supabaseUrl} | correto: ${CORRECT_URL})`,
  ].filter(Boolean);

  res.json({
    timestamp: new Date().toISOString(),
    message: criticalIssues.length === 0
      ? '✅ Todas as variáveis críticas estão corretas'
      : `❌ ${criticalIssues.length} problema(s) encontrado(s)`,
    critical_issues: criticalIssues,
    status,
    fix: criticalIssues.length > 0
      ? 'Vercel Dashboard → Settings → Environment Variables → corrija os itens acima → Redeploy'
      : 'Nenhuma ação necessária',
  });
}
