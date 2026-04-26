export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Validar variáveis de ambiente obrigatórias
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY não configurada');
    return res.status(500).json({ error: 'Configuração faltando: RESEND_API_KEY não definida' });
  }

  const { nome, email, celular, type = 'confirmation', event_link, event_date } = req.body;

  // Validar campos obrigatórios
  if (!nome || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando: nome e email' });
  }

  let subject = '';
  let html = '';
  let wppText = '';

  if (type === 'inscrição_pendente') {
    // Enviado logo após se inscrever (Passo 1)
    subject = 'Inscrição Recebida - Workshop Claude Jurídico';
    html = `
      <h2>Olá, ${nome}!</h2>
      <p>Sua inscrição no <strong>Workshop "O CLAUDE COMO ASSISTENTE OPERACIONAL E ESTRATÉGICO"</strong> foi recebida com sucesso!</p>
      
      <div style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
        <p><strong>⏳ Próximo Passo: Efetuar Pagamento</strong></p>
        <p>Estamos aguardando a confirmação do seu pagamento de <strong>R$ 39,90</strong>.</p>
        <p>Após o pagamento ser processado, enviaremos:</p>
        <ul style="margin: 10px 0;">
          <li>✅ Confirmação de inscrição</li>
          <li>📅 Detalhes do evento (data, hora, link)</li>
          <li>🔗 Link de acesso ao Workshop</li>
        </ul>
      </div>
      
      <p><strong>📅 Data:</strong> 02 de Maio - Sábado, 10h às 12h</p>
      <p><strong>📍 Formato:</strong> Videoconferência (Zoom/Meet)</p>
      <p><strong>💰 Valor:</strong> R$ 39,90</p>
      
      <p style="margin-top: 20px; color: #666;">Qualquer dúvida, estamos à disposição!</p>
      <p>Atenciosamente,<br/><strong>Equipe Ana Lima</strong></p>
    `;
    wppText = `Olá ${nome}! 👋 Recebemos sua inscrição para o Workshop Claude Jurídico! 

⏳ Agora é só efetuar o pagamento de R$ 39,90 que você está dentro!

Após confirmar o pagamento, enviaremos:
✅ Confirmação de inscrição
📅 Detalhes completos do evento
🔗 Link de acesso

Se tiver qualquer dúvida, é só chamar! 😊`;

  } else if (type === 'pagamento_confirmado') {
    // Enviado após pagamento confirmado
    subject = '✅ Pagamento Confirmado - Workshop Claude Jurídico';
    const linkHTML = event_link ? `
      <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
        <p><strong style="color: #1565c0;">🔗 Link de Acesso do Evento:</strong></p>
        <p style="margin: 10px 0;">
          <a href="${event_link}" style="background-color: #2196f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            👉 CLIQUE AQUI PARA ENTRAR NO EVENTO
          </a>
        </p>
        <p style="color: #1565c0; margin-top: 10px; font-size: 0.9rem;">
          ℹ️ Acesse o link acima para participar do workshop. Recomendamos entrar alguns minutos antes do horário de início.
        </p>
      </div>
    ` : `
      <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
        <p><strong>🔔 Link de Acesso:</strong></p>
        <p>O link do Zoom/Meet será enviado <strong>1 hora antes do evento</strong> por e-mail e WhatsApp.</p>
        <p style="margin-top: 10px; color: #d84315;">⚠️ Não perca! Verifique seu e-mail e WhatsApp na data do workshop.</p>
      </div>
    `;

    html = `
      <h2>Olá, ${nome}! 🎉</h2>
      <p>Sua inscrição no <strong>Workshop "O CLAUDE COMO ASSISTENTE OPERACIONAL E ESTRATÉGICO"</strong> foi confirmada com sucesso!</p>
      
      <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
        <p><strong style="color: #2e7d32;">✅ Pagamento Recebido</strong></p>
        <p>Sua inscrição está garantida! Nos vemos no dia 02 de Maio.</p>
      </div>
      
      <h3 style="margin-top: 20px;">📋 Informações do Workshop</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>📅 Data:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${event_date || '02 de Maio de 2026 - Sábado'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>🕙 Horário:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">10h00 às 12h00 (Horário de Brasília)</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>📍 Formato:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Videoconferência ao vivo</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>👨‍🏫 Instrutor:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Ana Lima - Especialista em Inteligência Jurídica</td>
        </tr>
      </table>
      
      ${linkHTML}
      
      <h3>📚 O que você vai aprender:</h3>
      <ul>
        <li>Como usar o Claude como assistente operacional</li>
        <li>Estratégias de IA para jurídicos</li>
        <li>Casos práticos e exemplos reais</li>
        <li>Dicas exclusivas da Ana Lima</li>
      </ul>
      
      <p style="margin-top: 20px; color: #666;">Qualquer dúvida, estamos à disposição!</p>
      <p>Atenciosamente,<br/><strong>Equipe Ana Lima</strong></p>
    `;
    
    wppText = event_link 
      ? `🎉 ${nome}, ótimo! Sua inscrição foi confirmada com sucesso!

✅ Pagamento recebido
📅 02 de Maio - Sábado, 10h às 12h
📍 Videoconferência ao vivo

🔗 Link de Acesso:
${event_link}

Te vejo no workshop! 💪`
      : `🎉 ${nome}, ótimo! Sua inscrição foi confirmada com sucesso!

✅ Pagamento recebido
📅 02 de Maio - Sábado, 10h às 12h
📍 Videoconferência ao vivo

🔔 O link de acesso será enviado 1 hora antes do evento por aqui.

Te vejo no workshop! 💪`;

  } else if (type === 'confirmation') {
    subject = 'Confirmação de Inscrição - Workshop Claude Jurídico';
    html = `
      <h2>Olá, ${nome}!</h2>
      <p>Sua inscrição no <strong>Workshop Claude Jurídico</strong> foi recebida com sucesso!</p>
      <p>Seu pagamento está sendo processado ou já foi confirmado. Nos vemos no dia 02/05!</p>
      <p>Atenciosamente,<br/>Equipe Ana Lima</p>
    `;
    wppText = `Olá ${nome}! 🎉 Sua inscrição para o Workshop Claude Jurídico foi recebida com sucesso! Em breve enviaremos o link de acesso. Nos vemos no dia 02/05!`;

  } else if (type === 'abandoned') {
    subject = 'Você esqueceu algo? - Workshop Claude Jurídico';
    html = `
      <h2>Oi, ${nome}! Tudo bem?</h2>
      <p>Notamos que você iniciou sua inscrição para o <strong>Workshop Claude Jurídico</strong>, mas não finalizou o pagamento.</p>
      <p>Ainda temos algumas vagas disponíveis. Garanta a sua agora mesmo clicando <a href="https://seudominio.com.br">aqui</a>.</p>
      <p>Se tiver qualquer dúvida, estamos à disposição!</p>
    `;
    wppText = `Oii ${nome}! Aqui é da equipe da Ana Lima. Vi que você não conseguiu concluir a sua inscrição para o Workshop do Claude. Teve alguma dúvida ou problema com o pagamento? Me avisa aqui que eu te ajudo! 😉`;

  } else if (type === 'reminder_1d') {
    subject = 'É AMANHÃ! Workshop Claude Jurídico';
    html = `
      <h2>Olá, ${nome}! É amanhã!</h2>
      <p>Prepare-se, pois amanhã às 10h daremos início ao nosso Workshop.</p>
      <p>O link do Zoom/Meet será enviado 1 hora antes do evento.</p>
    `;
    wppText = `Fala ${nome}! 🚀 Passando pra avisar que nosso Workshop é amanhã às 10h! Já deixa o alarme programado, te mando o link de acesso amanhã cedinho!`;

  } else if (type === 'reminder_1h') {
    subject = 'ESTAMOS AO VIVO EM 1 HORA!';
    html = `
      <h2>Olá, ${nome}! Falta 1 hora!</h2>
      <p>Acesse o link abaixo para entrar na sala:</p>
      <p><a href="LINK_DO_ZOOM">Acessar Workshop</a></p>
    `;
    wppText = `🚨 ${nome}, ESTAMOS QUASE LÁ! Em 1 hora entraremos ao vivo. Pega seu café, seu bloco de notas e clica no link para acessar a sala: [LINK_AQUI]`;
  }

  const results = { email: null, whatsapp: null };
  const errors = [];

  try {
    // 1. Enviar E-mail via Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Workshop Claude <${fromEmail}>`,
        to: [email],
        subject: subject,
        html: html
      })
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('❌ Erro Resend:', emailResponse.status, JSON.stringify(emailData));
      errors.push({ service: 'email', status: emailResponse.status, detail: emailData });
    } else {
      console.log(`✅ E-mail enviado para ${email} | ID: ${emailData.id}`);
      results.email = { success: true, id: emailData.id };
    }
  } catch (error) {
    console.error('❌ Exceção ao enviar e-mail:', error.message);
    errors.push({ service: 'email', detail: error.message });
  }

  // 2. Enviar WhatsApp via Evolution API (somente se celular informado)
  if (celular && process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY) {
    try {
      const numeroLimpo = celular.replace(/\D/g, '');
      const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;

      const whatsappPayload = {
        number: numeroCompleto,
        options: {
          delay: 1200,
          presence: 'composing'
        },
        text: wppText
      };

      const wppResponse = await fetch(process.env.EVOLUTION_API_URL, {
        method: 'POST',
        headers: {
          apikey: process.env.EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whatsappPayload)
      });

      const wppData = await wppResponse.json();

      if (!wppResponse.ok) {
        console.error('❌ Erro WhatsApp:', wppResponse.status, JSON.stringify(wppData));
        errors.push({ service: 'whatsapp', status: wppResponse.status, detail: wppData });
      } else {
        console.log(`✅ WhatsApp enviado para ${numeroCompleto}`);
        results.whatsapp = { success: true };
      }
    } catch (error) {
      console.error('❌ Exceção ao enviar WhatsApp:', error.message);
      errors.push({ service: 'whatsapp', detail: error.message });
    }
  } else if (!celular) {
    console.log('ℹ️ Celular não informado — WhatsApp ignorado');
  } else {
    console.log('ℹ️ EVOLUTION_API_URL ou EVOLUTION_API_KEY não configurados — WhatsApp ignorado');
  }

  console.log(`📬 Notificações processadas para ${nome} (${type}) | erros: ${errors.length}`);

  if (errors.length > 0 && !results.email) {
    // Falha total: e-mail não enviado
    return res.status(500).json({
      error: 'Falha ao enviar notificações',
      details: errors,
      results
    });
  }

  return res.status(200).json({
    message: errors.length > 0 ? 'Notificações enviadas com avisos' : 'Notificações enviadas com sucesso',
    results,
    warnings: errors.length > 0 ? errors : undefined
  });
}
