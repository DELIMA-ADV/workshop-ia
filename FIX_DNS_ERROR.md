# 🚀 SOLUÇÃO COMPLETA - Erro DNS do Supabase em Produção

## ❌ O Problema

O erro `net::ERR_NAME_NOT_RESOLVED` ocorre porque:
1. O navegador tenta acessar `https://nccsdktkkortxrthxxzrh.supabase.co` diretamente
2. As **variáveis de ambiente NÃO estão carregadas** no Vercel
3. O cliente Supabase recebe valores inválidos e falha

## ✅ Solução Implementada

### 1. **Criei um Proxy API** (`api/supabase.js`)
- Todas as requisições ao Supabase passam pelo servidor (Vercel backend)
- O servidor valida as variáveis de ambiente no backend
- Elimina problemas de CORS e DNS

### 2. **Atualizei o Cliente** (`src/lib/supabase.js*)
- Novo cliente que usa o proxy ao invés de conectar direto
- Mantém a mesma API para compatibilidade com `App.jsx`

### 3. **Removi configuração insegura**
- Deletado `src/supabase.js` com hardcoding
- Tudo agora usa variáveis de ambiente

## 🔧 PRÓXIMAS AÇÕES (Crítico!)

### Passo 1️⃣: Criar Tabela no Supabase
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Entre no seu projeto `nccsdktkkortxrthxxzrh`
3. Vá em **SQL Editor**
4. Copie todo o conteúdo de `SUPABASE_SETUP.sql` deste repo
5. Cole e execute
6. ✅ Verifique se a tabela foi criada em **Table Editor**

### Passo 2️⃣: Configurar Variáveis de Ambiente no Vercel (OBRIGATÓRIO!)
1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto: `workshop-ia`
3. Vá em **Settings** → **Environment Variables**
4. **Importante**: Delete qualquer variável antiga ou incorreta
5. Clique em **Add New** e configure EXATAMENTE assim:

**Variável 1:**
```
Name:  VITE_SUPABASE_URL
Value: https://nccsdktkkortxrthxxzrh.supabase.co
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**Variável 2:**
```
Name:  VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY3Nka3Rra29ydHhydHh4enJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTMwMTQsImV4cCI6MjA5Mjc4OTAxNH0.7DQje0ppQGdNEhYy6B8gqzc3mt3QX5ngHRoJBbyW3Io
Environments: ✅ Production, ✅ Preview, ✅ Development
```

### Passo 3️⃣: Redeploy no Vercel (CRÍTICO!)
1. Em **Deployments**, clique no deploy mais recente
2. Clique em **Redeploy** no menu (3 pontos)
3. Selecione **Redeploy with existing Build Cache**
4. Espere terminar (deve levar ~2-3 minutos)
5. Teste a aplicação

## 🧪 Como Verificar se Funcionou

### No Vercel (Servidor)
1. Clique em um deploy recente
2. Vá em **Logs** 
3. Procure por mensagens como:
```
✅ http://localhost:3000/api/supabase - 200 OK
🔹 [2026-04-26T...] Action: insert | Table: subscriptions | Select: *
✅ INSERT sucesso: 1 registros
```

### No Navegador (DevTools)
1. Abra `DevTools` (F12)
2. Vá em **Network**
3. Teste preenchendo o formulário
4. Procure por requisições para `/api/supabase` (não mais para `supabase.co`)
5. A resposta deve ser `200 OK` com `{data: [...], timestamp: ...}`

### Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|--------|
| `net::ERR_NAME_NOT_RESOLVED` | Variáveis não carregadas | Redeploy + limpar cache do navegador |
| `400 Bad Request` | Email duplicado | Usar outro email ou deletar registro |
| `500 Error: Variáveis não configuradas` | Vars não setadas no Vercel | Configurar no painel do Vercel |
| `404 Not Found /api/supabase` | Arquivo da API não existe | Verificar se `api/supabase.js` existe |

## 💻 Para Testar Localmente

```bash
# 1. Criar arquivo .env na raiz
echo "VITE_SUPABASE_URL=https://nccsdktkkortxrthxxzrh.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY3Nka3Rra29ydHhydHh4enJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTMwMTQsImV4cCI6MjA5Mjc4OTAxNH0.7DQje0ppQGdNEhYy6B8gqzc3mt3QX5ngHRoJBbyW3Io" >> .env

# 2. Instalar dependências (se needed)
npm install

# 3. Iniciar dev server (roda Vite + API)
npm run dev

# 4. Teste em http://localhost:5173
```

## 🔐 Segurança

- ✅ A chave `VITE_SUPABASE_ANON_KEY` é pública (exposta no frontend, é normal)
- ✅ Row Level Security (RLS) está ativado na tabela
- ✅ Nunca faça commit do `.env` (está no `.gitignore`)
- ✅ Para operações sensíveis, implemente RLS policies no Supabase

## 📝 Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `api/supabase.js` | ✨ **NOVO** - Proxy para requisições ao Supabase |
| `src/lib/supabase.js` | 🔄 Reescrito para usar proxsy |
| `src/App.jsx` | ✅ Atualizado import para `./lib/supabase` |
| `src/pages/Admin.jsx` | ✅ Atualizado import para `./lib/supabase` |
| `src/supabase.js` | ❌ **DELETADO** - Não precisa mais |
| `.env.example` | 📋 Atualizado com instruções |

## 🆘 Se Ainda Não Funcionar

1. **Verifique o Vercel:**
   - Settings → Environment Variables → Copia exata das variables?
   - As vars aparecem no deploy mais recente?
   - Fez um Redeploy recentemente?

2. **Verifique o Supabase:**
   - Projeto `nccsdktkkortxrthxxzrh` existe?
   - Tabela `subscriptions` foi criada?
   - Row Level Security está habilitado?

3. **Verifique Localmente:**
   - `.env` tem as variáveis?
   - `npm run dev` executou sem erros?
   - Teste com `curl -X POST http://localhost:3000/api/supabase -H "Content-Type: application/json" -d '{"action":"select", "table":"subscriptions"}'`

4. **Logs para Debug:**
   - Vercel: Deployments → Funções → Logs de `api/supabase`
   - Navegador: DevTools → Console e Network
   - Backend local: npm run dev → terminal output

---

**Data:** 26/04/2026  
**Status:** Solução Implementada ✅  
**Próximo Passo:** Execute a Passo 1️⃣, 2️⃣ e 3️⃣ acima
