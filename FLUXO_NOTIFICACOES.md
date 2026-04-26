# 📧 Novo Fluxo de Notificações - Inscrições Workshop

## 🎯 Como Funciona Agora

### 1️⃣ **Ao se Inscrever (Passo 1)**
Quando a pessoa preenche nome, email e celular:
- ✅ Lead é salvo no Supabase com `status: 'pendente'`
- 📧 **Email de Inscrição** é enviado
- 💬 **WhatsApp de Inscrição** é enviado
- 📋 Mensagem: *"Sua inscrição foi recebida! Estamos aguardando o pagamento"*

---

### 2️⃣ **Ao Responder as Perguntas (Passo 2)**
- ✅ Respostas são salvas
- 📝 Sem notificação (apenas progresso no formulário)

---

### 3️⃣ **Ao Confirmar Pagamento (Passo 3)**

#### Se escolheu **Cartão de Crédito** 💳
- ✅ Status fica: `'pago'`
- 📧 **Email de Confirmação** com detalhes do evento
- 💬 **WhatsApp de Confirmação** com detalhes do evento
- 📋 Mensagem: *"Pagamento confirmado! Aqui estão os detalhes do workshop..."*

#### Se escolheu **Pix/Boleto** 🏦
- ✅ Status fica: `'aguardando'`
- 📧 **Email de Inscrição Pendente** (aguardando confirmação de pagamento)
- 💬 **WhatsApp de Inscrição Pendente** (aguardando confirmação de pagamento)
- 📋 Mensagem: *"Confira o comprovante do pagamento..."*

---

## 📊 Fluxo Visual

```
┌─────────────────────────────────────────────────────────┐
│  VISITANTE ACESSA A PÁGINA                              │
└─────────────────█───────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │   PASSO 1       │
        │ Nome, Email,    │
        │   Celular       │
        └────────┬────────┘
                 │
         ✅ INSCRIÇÃO PENDENTE
         📧 Email: "Inscrição recebida - Aguardando pagamento"
         💬 WhatsApp: "Recebemos sua inscrição - Efetue o pagamento"
                 │
                 ▼
        ┌─────────────────┐
        │   PASSO 2       │
        │  Responda as    │
        │    Perguntas    │
        └────────┬────────┘
                 │
         (Sem notificação)
                 │
                 ▼
        ┌─────────────────┐
        │   PASSO 3       │
        │  Pagamento      │
        └────────┬────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
     ▼                       ▼
 CARTÃO 💳                PIX/BOLETO 🏦
 │                        │
 Status: PAGO             Status: AGUARDANDO
 │                        │
 ✅ PAGAMENTO             ⏳ AGUARDANDO
    CONFIRMADO               CONFIRMAÇÃO
 │                        │
 📧 Email:                📧 Email:
 "Confirmado +            "Aguardando +
  Detalhes"               Instruções"
 │                        │
 💬 WhatsApp:            💬 WhatsApp:
 "Confirmado +            "Aguardando +
  Detalhes"               Instruções"
 │                        │
 ▼                        ▼
FIM DO FLUXO           PENDENTE ATÉ
                       CONFIRMAÇÃO
```

---

## 📝 Modelos de Mensagens

### 📧 Email - Inscrição Pendente
**Assunto:** Inscrição Recebida - Workshop Claude Jurídico

```
Olá [Nome]!

Sua inscrição no Workshop foi recebida com sucesso!

⏳ Próximo Passo: Efetuar Pagamento
Estamos aguardando a confirmação do seu pagamento de R$ 39,90.

Após o pagamento ser processado, enviaremos:
✅ Confirmação de inscrição
📅 Detalhes do evento (data, hora, link)
🔗 Link de acesso ao Workshop

Data: 02 de Maio - Sábado, 10h às 12h
Formato: Videoconferência (Zoom/Meet)
Valor: R$ 39,90

Qualquer dúvida, estamos à disposição!
```

### 💬 WhatsApp - Inscrição Pendente
```
Olá [Nome]! 👋
Recebemos sua inscrição para o Workshop Claude Jurídico! 

⏳ Agora é só efetuar o pagamento de R$ 39,90 que você está dentro!

Após confirmar o pagamento, enviaremos:
✅ Confirmação de inscrição
📅 Detalhes completos do evento
🔗 Link de acesso

Se tiver qualquer dúvida, é só chamar! 😊
```

---

### 📧 Email - Pagamento Confirmado
**Assunto:** ✅ Pagamento Confirmado - Workshop Claude Jurídico

```
Olá, [Nome]! 🎉

Sua inscrição no Workshop foi confirmada com sucesso!

✅ Pagamento Recebido
Sua inscrição está garantida! Nos vemos no dia 02 de Maio.

📋 Informações do Workshop
├ 📅 Data: 02 de Maio de 2026 - Sábado
├ 🕙 Horário: 10h00 às 12h00 (Horário de Brasília)
├ 📍 Formato: Videoconferência ao vivo
└ 👨‍🏫 Instrutor: Ana Lima

🔔 Link de Acesso:
O link do Zoom/Meet será enviado 1 hora antes do evento 
por e-mail e WhatsApp.

📚 O que você vai aprender:
✓ Como usar o Claude como assistente operacional
✓ Estratégias de IA para jurídicos
✓ Casos práticos e exemplos reais
✓ Dicas exclusivas da Ana Lima
```

### 💬 WhatsApp - Pagamento Confirmado
```
🎉 [Nome], ótimo! Sua inscrição foi confirmada com sucesso!

✅ Pagamento recebido
📅 02 de Maio - Sábado, 10h às 12h
📍 Videoconferência ao vivo

🔔 O link de acesso será enviado 1 hora antes do evento por aqui.

Te vejo no workshop! 💪
```

---

## 🔧 Tipos de Notificação (API)

Ao chamar `/api/notify`, use estes valores para `type`:

| Type | Quando? | Email | WhatsApp |
|------|---------|-------|----------|
| `inscrição_pendente` | Passo 1 OU Finalizou sem pagar | ⏳ Aguardando pagamento | ⏳ Aguardando pagamento |
| `pagamento_confirmado` | Finalizou com cartão | ✅ Confirmação + Detalhes | ✅ Confirmação + Detalhes |
| `confirmation` | Fallback (não usado agora) | Genérico | Genérico |
| `abandoned` | Recuperação (manual) | 🛒 Carrinho abandonado | 🛒 Carrinho abandonado |
| `reminder_1d` | 1 dia antes | 📢 Lembrete | 📢 Lembrete |
| `reminder_1h` | 1h antes | 🔔 Link de acesso | 🔔 Link de acesso |

---

## ✅ Checklist - O que foi Mudado

| Item | Antes | Depois |
|------|-------|--------|
| Notificação ao se inscrever | ❌ Não enviava | ✅ Envia convite às perguntas |
| Notificação ao finalizar | ✅ Uma notificação genérica | ✅ Diferenciada por tipo de pagamento |
| Pagamento Cartão | ❌ Sem confirmação | ✅ Confirmação + Detalhes |
| Pagamento Pix/Boleto | ❌ Sem acompanhamento | ✅ Notificação de pendência |

---

## 🚀 Deploy

Faça um novo deploy para ativar as mudanças:
1. Git push das alterações
2. Vercel detecta e faz redeploy automático
3. Teste em produção

---

## 🧪 Como Testar Localmente

```bash
# 1. Certifique-se de ter as vars de env
echo "VITE_SUPABASE_URL=..." >> .env
echo "VITE_SUPABASE_ANON_KEY=..." >> .env
echo "EVOLUTION_API_URL=..." >> .env
echo "EVOLUTION_API_KEY=..." >> .env
echo "RESEND_API_KEY=..." >> .env

# 2. Rode o dev server
npm run dev

# 3. Acesse http://localhost:5173

# 4. DevTools (F12) → Console para ver logs
```

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique os logs no Vercel (Deployments → Logs)
2. Verifique o Console (F12) do navegador
3. Certifique-se que `/api/notify` está recebendo as chamadas corretas
4. Verifique se as variáveis de ambiente estão configuradas
