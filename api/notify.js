export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { nome, email, celular, type = 'confirmation' } = req.body;

  let subject = '';
  let html = '';
  let wppText = '';

  if (type === 'confirmation') {
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

  try {
    // 1. Enviar E-mail via Resend
    // Usando fetch nativo para evitar precisar instalar o pacote 'resend'
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Workshop Claude <onboarding@resend.dev>', 
        to: [email],
        subject: subject,
        html: html
      })
    });

    // 2. Enviar WhatsApp via Evolution API
    const numeroLimpo = celular.replace(/\D/g, ''); 
    const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`; 

    const whatsappPayload = {
      "number": numeroCompleto,
      "options": { 
        "delay": 1200, 
        "presence": "composing" 
      },
      "text": wppText
    };

    const wppResponse = await fetch(process.env.EVOLUTION_API_URL, {
      method: 'POST',
      headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whatsappPayload)
    });

    return res.status(200).json({ message: 'Notificações enviadas com sucesso' });
  } catch (error) {
    console.error('Erro nas notificações:', error);
    return res.status(500).json({ error: error.message });
  }
}
