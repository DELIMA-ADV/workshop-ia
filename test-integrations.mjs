/**
 * Script de teste local das integrações Supabase + Resend.
 * Executa com: node test-integrations.mjs
 *
 * Lê as variáveis diretamente do arquivo .env (sem precisar de vercel dev).
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Carregar .env manualmente (sem dependência extra) ────────────
function loadDotenv() {
  try {
    const content = readFileSync(resolve('.env'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
    console.log('✅ .env carregado\n');
  } catch {
    console.error('❌ Arquivo .env não encontrado. Crie a partir do .env.example\n');
    process.exit(1);
  }
}

loadDotenv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const RESEND_KEY   = process.env.RESEND_API_KEY;

// ── 1. Verificar variáveis ───────────────────────────────────────
console.log('=== STATUS DAS VARIÁVEIS ===');
const vars = {
  VITE_SUPABASE_URL:    SUPABASE_URL    ? '✅ OK' : '❌ AUSENTE',
  VITE_SUPABASE_ANON_KEY: SUPABASE_KEY ? '✅ OK' : '❌ AUSENTE',
  RESEND_API_KEY:       RESEND_KEY      ? '✅ OK' : '❌ AUSENTE',
  RESEND_FROM_EMAIL:    process.env.RESEND_FROM_EMAIL ? `✅ ${process.env.RESEND_FROM_EMAIL}` : '⚠️  não definido (usará onboarding@resend.dev)',
  EVOLUTION_API_URL:    process.env.EVOLUTION_API_URL  ? '✅ OK' : '⚠️  não definido (WhatsApp desabilitado)',
  EVOLUTION_API_KEY:    process.env.EVOLUTION_API_KEY  ? '✅ OK' : '⚠️  não definido (WhatsApp desabilitado)',
};
for (const [k, v] of Object.entries(vars)) console.log(`  ${k}: ${v}`);
console.log('');

// ── 2. Testar Supabase ───────────────────────────────────────────
async function testSupabase() {
  console.log('=== TESTE SUPABASE ===');
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('  ⏭️  Pulado — variáveis não definidas\n');
    return;
  }

  try {
    // Faz uma query simples na tabela de inscrições
    const url = `${SUPABASE_URL}/rest/v1/subscriptions?select=id&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`  ✅ Supabase conectado! Registros encontrados: ${data.length}`);
    } else {
      const body = await res.json();
      console.error(`  ❌ Erro ${res.status}:`, JSON.stringify(body));
    }
  } catch (err) {
    // DNS/rede pode falhar localmente — o proxy em /api/supabase resolve isso no Vercel
    if (err.cause?.code === 'ENOTFOUND' || err.message.includes('fetch failed')) {
      console.log('  ⚠️  Conexão direta falhou (DNS local) — isso é esperado em algumas redes.');
      console.log('  ℹ️  No Vercel/produção, o proxy /api/supabase resolve o problema automaticamente.');
      console.log(`  ℹ️  URL configurada: ${SUPABASE_URL}`);
    } else {
      console.error('  ❌ Falha de conexão:', err.message);
    }
  }
  console.log('');
}

// ── 3. Testar Resend ─────────────────────────────────────────────
async function testResend() {
  console.log('=== TESTE RESEND ===');
  if (!RESEND_KEY) {
    console.log('  ⏭️  Pulado — RESEND_API_KEY não definida\n');
    return;
  }

  try {
    // Tenta listar domínios; chaves com escopo restrito retornam 401 com mensagem específica
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${RESEND_KEY}` },
    });

    if (res.ok) {
      const data = await res.json();
      const domains = data.data ?? data;
      if (Array.isArray(domains) && domains.length > 0) {
        console.log('  ✅ Resend autenticado! Domínios verificados:');
        domains.forEach(d => console.log(`     - ${d.name} (${d.status})`));
        console.log(`\n  ℹ️  Use um desses domínios em RESEND_FROM_EMAIL para produção.`);
      } else {
        console.log('  ✅ Resend autenticado (sem domínio verificado — use onboarding@resend.dev para testes)');
      }
    } else {
      const body = await res.json();
      // Chave com escopo restrito a "send emails only" ainda funciona para envio
      if (res.status === 401 && body.message?.includes('restricted')) {
        console.log('  ✅ Resend autenticado! Chave com escopo restrito (send-only) — perfeito para produção.');
        console.log(`  ℹ️  Esta chave pode enviar e-mails mas não listar domínios. Configure RESEND_FROM_EMAIL com um domínio verificado.`);
      } else {
        console.error(`  ❌ Erro ${res.status}:`, JSON.stringify(body));
        if (res.status === 401) console.error('     → Chave API inválida ou expirada');
      }
    }
  } catch (err) {
    console.error('  ❌ Falha de conexão:', err.message);
  }
  console.log('');
}

// ── 4. Testar Evolution API (WhatsApp) ───────────────────────────
async function testEvolution() {
  console.log('=== TESTE EVOLUTION API (WhatsApp) ===');
  if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY) {
    console.log('  ⏭️  Pulado — variáveis não definidas\n');
    return;
  }

  // Deriva a URL base a partir de EVOLUTION_API_URL (remove o path de envio)
  try {
    const apiUrl = new URL(process.env.EVOLUTION_API_URL);
    const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`;

    const res = await fetch(`${baseUrl}/instance/fetchInstances`, {
      headers: {
        apikey: process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const instances = Array.isArray(data) ? data : [data];
      console.log(`  ✅ Evolution API conectada! Instâncias: ${instances.length}`);
      instances.forEach(i => {
        const name   = i.instance?.instanceName ?? i.instanceName ?? i.name ?? '?';
        const state  = i.instance?.connectionStatus ?? i.instance?.state ?? i.connectionStatus ?? i.state ?? '?';
        console.log(`     - ${name} | status: ${state}`);
      });
    } else {
      const body = await res.text();
      console.error(`  ❌ Erro ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error('  ❌ Falha de conexão:', err.message);
  }
  console.log('');
}

// ── Executar todos os testes ─────────────────────────────────────
await testSupabase();
await testResend();
await testEvolution();
console.log('=== FIM DOS TESTES ===');
