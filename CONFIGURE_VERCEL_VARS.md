# 🚨 VERIFICAÇÃO: Erro `Invalid supabaseUrl`

## O Problema

O servidor está recebendo a mensagem:
```
❌ CONFIGURAÇÃO FALTANTE: Variáveis de ambiente não definidas no Vercel
```

Isso significa: **As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` não foram configuradas no painel do Vercel.**

---

## ✅ Solução em 3 Passos

### 1️⃣ Acesse o Dashboard do Vercel
Abra: [https://vercel.com/dashboard](https://vercel.com/dashboard)

![image](https://user-images.githubusercontent.com/1234567/1234567-image.png)

---

### 2️⃣ Configure as Variáveis de Ambiente

1. Selecione seu projeto: **workshop-ia**
2. Vá em **Settings** (ícone de engrenagem)
3. No menu esquerdo, clique em **Environment Variables**

![image](https://user-images.githubusercontent.com/1234567/1234567-env.png)

---

### 3️⃣ Adicione as Duas Variáveis

#### 🔹 Variável 1: VITE_SUPABASE_URL

| Campo | Valor |
|-------|-------|
| **Name** | `VITE_SUPABASE_URL` |
| **Value** | `https://nccsdktkkortxrthxxzrh.supabase.co` |
| **Environments** | ✅ Production, ✅ Preview, ✅ Development |

Clique em **Add**

---

#### 🔹 Variável 2: VITE_SUPABASE_ANON_KEY

| Campo | Valor |
|-------|-------|
| **Name** | `VITE_SUPABASE_ANON_KEY` |
| **Value** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY3Nka3Rra29ydHhydHh4enJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTMwMTQsImV4cCI6MjA5Mjc4OTAxNH0.7DQje0ppQGdNEhYy6B8gqzc3mt3QX5ngHRoJBbyW3Io` |
| **Environments** | ✅ Production, ✅ Preview, ✅ Development |

Clique em **Add**

---

### 4️⃣ Fazer o Redeploy

1. Vá em **Deployments** (ou a página inicial)
2. Clique no **deploy mais recente**
3. Clique nos **3 pontos** (⋯) no canto
4. Selecione **Redeploy**

Aguard 2-3 minutos para terminar...

---

## ✨ Verificar se Funcionou

### No Vercel (Logs)
1. Vá em **Deployments**
2. Clique no **deploy mais recente**
3. Vá em **Logs** e procure por:
```
✅ VITE_SUPABASE_URL: ✅ Existe
✅ VITE_SUPABASE_ANON_KEY: ✅ Existe
📍 Action: insert | Table: subscriptions
✅ INSERT OK: 1 registros
```

### No Navegador
1. Abra a aplicação: [https://workshop-ia-gamma.vercel.app](https://workshop-ia-gamma.vercel.app)
2. DevTools (F12) → Network
3. Preencha o formulário
4. Procure por requisição `/api/supabase`
5. Status deve ser **200 OK** (verde)
6. Response deve ter `{"data": [...], "timestamp": ...}`

---

## ⚠️ Checklist

- [ ] Variáveis adicionadas no Vercel
- [ ] Production + Preview + Development selecionados
- [ ] Redeploy executado
- [ ] Status do deploy é "Ready" (verde)
- [ ] Testado na URL de produção
- [ ] Logs mostram "✅ VITE_SUPABASE_URL: ✅ Existe"

---

## 🆘 Ainda Não Funciona?

### Problema: "Cannot read property of undefined"
**Solução:** Limpe o cache do navegador (Ctrl+Shift+Delete ou Cmd+Shift+Delete)

### Problema: Redeploy marcado como "Error"
**Solução:** 
1. Clique em Redeploy novamente
2. Aguarde concluir

### Problema: Variáveis não aparecem nos Logs
**Solução:**
1. Verifique se digitou corretamente: `VITE_SUPABASE_URL` (com underscore)
2. Apague e recrie as variáveis
3. Faça novo Redeploy

### Problema: "500 Internal Server Error"
**Solução:**
1. Vá em Logs e procure por erros
2. Se disser "variáveis não definidas", repita os passos acima
3. Aguarde ~5 minutos após adicionar as variáveis

---

## 📋 Resumo

| Etapa | Status |
|-------|--------|
| 1. Adicionar `VITE_SUPABASE_URL` | ⏳ Você fazer! |
| 2. Adicionar `VITE_SUPABASE_ANON_KEY` | ⏳ Você fazer! |
| 3. Redeploy | ⏳ Você fazer! |
| 4. Esperar 2-3 min | ⏳ Automático |
| 5. Testar | ⏳ Você fazer! |
| Erro resolvido ✅ | Depende de você! |

---

**Próxima mensagem que receber será do seu lado. Configure as variáveis e redeploy, depois teste novamente!**
