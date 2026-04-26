# 🚀 Configuração de Variáveis de Ambiente no Vercel

## Problema Corrigido
O erro `net::ERR_NAME_NOT_RESOLVED` foi causado por **falta de variáveis de ambiente** em produção. A aplicação estava usando credenciais hardcoded que causavam conflitos.

## ✅ Solução Implementada
- ✅ Consolidada configuração do Supabase em `src/lib/supabase.js`
- ✅ Removido arquivo com credenciais hardcoded (`src/supabase.js`)
- ✅ Atualizado `App.jsx` e `Admin.jsx` para usar variáveis de ambiente

## 📋 Variáveis de Ambiente Necessárias

Para produção no **Vercel**, adicione estas variáveis no painel:

```
VITE_SUPABASE_URL=https://nccsdktkkortxrthxxzrh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY3Nka3Rra29ydHhydHh4enJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTMwMTQsImV4cCI6MjA5Mjc4OTAxNH0.7DQje0ppQGdNEhYy6B8gqzc3mt3QX5ngHRoJBbyW3Io
```

## 🔧 Como Configurar no Vercel

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Settings** → **Environment Variables**
3. Clique em **Add New**
4. Preencha:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://nccsdktkkortxrthxxzrh.supabase.co`
   - **Environments**: Selecione `Production`, `Preview` e `Development`
5. Clique em **Save**
6. Repita para `VITE_SUPABASE_ANON_KEY`
7. **Redeploy** sua aplicação (Settings → Deployments → Redeploy)

## 💻 Para Desenvolvimento Local

Crie um arquivo `.env` na raiz do projeto:

```bash
VITE_SUPABASE_URL=https://nccsdktkkortxrthxxzrh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY3Nka3Rra29ydHhydHh4enJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTMwMTQsImV4cCI6MjA5Mjc4OTAxNH0.7DQje0ppQGdNEhYy6B8gqzc3mt3QX5ngHRoJBbyW3Io
```

**NÃO commit** este arquivo (está no `.gitignore`)

## 🔒 Considerações de Segurança

- **Nunca** commit a `.env` no repositório
- A `VITE_SUPABASE_ANON_KEY` é pública (exposta no client-side), isso é normal
- Para operações sensíveis (deletar dados), use Row Level Security (RLS) no Supabase
- Configure as políticas de RLS na tabela `subscriptions`

## ✨ Próximos Passos

1. Configure as variáveis no Vercel
2. Faça um redeploy
3. Teste a aplicação em produção
4. Verifique o console do navegador para erros

O erro shouldered ser resolvido!
