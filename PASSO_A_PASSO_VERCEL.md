# 🚨 DEBUG: Verificar Variáveis de Ambiente no Vercel

## O Erro Agora

```
fetch failed - getaddrinfo ENOTFOUND
POST /api/supabase - 500 Internal Server Error
```

Significa: **As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` não estão configuradas no Vercel.**

---

## ✅ Passo 1: Verificar Status

Abra esta URL em uma aba nova:
```
https://workshop-ia-gamma.vercel.app/api/test-env
```

**Esperado ver:**
```json
{
  "status": {
    "VITE_SUPABASE_URL": "✅ EXISTE",
    "VITE_SUPABASE_ANON_KEY": "✅ EXISTE",
    ...
  }
}
```

Se VER `❌ AUSENTE`, é porque **as variáveis não foram configuradas**.

---

## 🔧 Passo 2: Configurar Variáveis (Instruções Detalhadas)

### A. Abrir Painel Vercel
1. Acesse [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Faça login se necessário

---

### B. Selecionar Projeto
1. Procure por **`workshop-ia`** na lista de projetos
2. Clique nele

![](https://user-images.githubusercontent.com/xxx.png)

---

### C. Acessar Settings
1. Clique em **Settings** (ícone de engrenagem no topo)
2. Ou clique nos 3 pontos (⋯) e selecione **Settings**

![](https://user-images.githubusercontent.com/xxx.png)

---

### D. Ir para Environment Variables
1. No menu esquerdo, procure por **Environment Variables**
2. Clique nele

**IMPORTANTE**: Não confunde com "Build & Development Settings"

![](https://user-images.githubusercontent.com/xxx.png)

---

### E. Adicionar Primeira Variável

#### Antes: Verificar Variáveis Existentes
- Se houver variáveis antigas ou erradas, **delete-as**
- Procure por qualquer coisa com `SUPABASE` no nome

**Para deletar:** Hover na variável → Clique no X

---

#### Adicionar VITE_SUPABASE_URL

1. Clique em **Add New**
2. Preencha exatamente assim:

| Campo | Valor |
|-------|-------|
| **Name** | `VITE_SUPABASE_URL` |
| **Value** | `https://nccsdktkkortxrthxxzrh.supabase.co` |

3. Scroll down e marque os **Environments**:
   - ✅ **Production**
   - ✅ **Preview** 
   - ✅ **Development**

4. Clique em **Add** (ou **Save**)

✅ **Pronto! Variável 1 adicionada.**

---

#### Adicionar VITE_SUPABASE_ANON_KEY

1. Clique em **Add New** novamente
2. Preencha exatamente assim:

| Campo | Valor |
|-------|-------|
| **Name** | `VITE_SUPABASE_ANON_KEY` |
| **Value** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY3Nka3Rra29ydHhydHh4enJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTMwMTQsImV4cCI6MjA5Mjc4OTAxNH0.7DQje0ppQGdNEhYy6B8gqzc3mt3QX5ngHRoJBbyW3Io` |

3. Scroll down e marque:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**

4. Clique em **Add** (ou **Save**)

✅ **Pronto! Variável 2 adicionada.**

---

## 🚀 Passo 3: Fazer Redeploy

**CRÍTICO**: Depois de adicionar as variáveis, **você PRECISA fazer um redeploy** para elas entrarem em efeito.

### Via Painel (Fácil)
1. Vá em **Deployments** (na barra de navegação superior)
2. Procure pelo **deploy mais recente** (deve estar com status "Ready")
3. Clique nos **3 pontos** (⋯) no final
4. Selecione **Redeploy**
5. Clique em **Redeploy** novamente (na janela que aparecer)

**Aguarde 2-3 minutos até terminar...**

---

## ✅ Verificar se Funcionou

### 1. Checar Endpoint de Teste
Abra em uma aba nova:
```
https://workshop-ia-gamma.vercel.app/api/test-env
```

Deve agora mostrar:
```json
{
  "status": {
    "VITE_SUPABASE_URL": "✅ EXISTE",
    "VITE_SUPABASE_ANON_KEY": "✅ EXISTE"
  },
  "details": {
    "supabaseUrl": "https://nccsdktkkortxrthxxzrh.supabase.co",
    "supabaseKeyLength": 200,
    "urlValid": "SIM"
  }
}
```

### 2. Testar Aplicação
1. Abra [https://workshop-ia-gamma.vercel.app](https://workshop-ia-gamma.vercel.app)
2. DevTools (F12) → Console
3. Preencha o formulário
4. Verifique se:
   - ✅ Não há mais erros `fetch failed`
   - ✅ A requisição `/api/supabase` aparece em Network
   - ✅ Status é **200 OK** (verde)

---

## 🆘 Troubleshooting

### Problema: Cliquei em "Add" mas não aparece

**Solução:**
- Recarregue a página (F5)
- Verifique em "Existing Variables" se foi adicionada
- Se não aparecer, tente novamente

---

### Problema: Fiz tudo mas ainda dá erro

**Solução:**
1. Verifique `/api/test-env` - as variáveis estão lá?
2. Se não:
   - Delete as variáveis
   - Recrie do zero (copie/cola exato)
   - Faça novo redeploy
3. Se sim:
   - Limpe cache do browser (Ctrl+Shift+Delete)
   - Recarregue a página

---

### Problema: Redeploy travou ou deu erro

**Solução:**
1. Espere 5 minutos
2. Clique em Redeploy novamente
3. Se persistir, delete o deploy e crie um novo via Git push

---

## 📋 Checklist Final

- [ ] Acessei Vercel Dashboard
- [ ] Selecionei projeto `workshop-ia`
- [ ] Fui em Settings → Environment Variables
- [ ] Adicionei `VITE_SUPABASE_URL` (copiei exato)
- [ ] Adicionei `VITE_SUPABASE_ANON_KEY` (copiei exato)
- [ ] Ambas têm ✅ Production, ✅ Preview, ✅ Development
- [ ] Fiz Redeploy
- [ ] Aguardei 2-3 minutos (status ficou "Ready")
- [ ] Testei `/api/test-env` - mostra ✅ EXISTE
- [ ] Testei aplicação - não há mais erro `fetch failed`

**Se tudo estiver marcado ✅, o erro está resolvido!**

---

**Faça esses passos e avise quando terminar!**
