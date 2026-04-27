import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import './index.css';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    celular: '',
    q1: '',
    q2: '',
    q3: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [isCopied, setIsCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeField, setShakeField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadId, setLeadId] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let newValue = value;
    if (id === 'celular') {
      newValue = formatPhone(value);
    }
    setFormData({ ...formData, [id]: newValue });
    if (errors[id]) {
      setErrors({ ...errors, [id]: false });
    }
  };

  const formatPhone = (val) => {
    let v = val.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length <= 2) return v.length ? '(' + v : v;
    if (v.length <= 6) return '(' + v.slice(0, 2) + ') ' + v.slice(2);
    if (v.length <= 10) return '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
    return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
  };

  const triggerShake = (id) => {
    setShakeField(id);
    setTimeout(() => setShakeField(null), 1400);
  };

  const goToQuestions = async () => {
    const { nome, email, celular } = formData;
    if (!nome.trim()) { triggerShake('nome'); return; }
    if (!email.trim() || !email.includes('@')) { triggerShake('email'); return; }
    if (celular.replace(/\D/g, '').length < 10) { triggerShake('celular'); return; }
    setStep(2);

    // Salvar o lead IMEDIATAMENTE após o passo 1 (Captura inicial)
    if (!leadId) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert([{
            nome: nome,
            email: email,
            celular: celular,
            q1: '',
            q2: '',
            q3: '',
            method: 'nenhum',
            status: 'pendente'
          }])
          .select();
        
        if (data && data.length > 0) {
          const newLeadId = data[0].id;
          setLeadId(newLeadId);

          // Enviar notificação de inscrição pendente (aguardando pagamento)
          try {
            await fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'inscrição_pendente',
                nome: nome,
                email: email,
                celular: celular
              })
            });
            console.log('✅ Notificação de inscrição enviada para', email);
          } catch (notifyError) {
            console.error('Erro ao enviar notificação de inscrição:', notifyError);
          }
        } else if (error) {
          // Se deu erro de duplicidade, tenta buscar o ID do e-mail existente
          const { data: existingData } = await supabase.from('subscriptions').select('id').eq('email', email).limit(1);
          if (existingData && existingData.length > 0) {
            setLeadId(existingData[0].id);
          } else {
            console.error('Erro no Supabase ao capturar lead inicial:', error);
          }
        }
      } catch (err) {
        console.error('Erro ao salvar lead:', err);
      }
    }
  };

  const goToPayment = async () => {
    const { q1, q2, q3 } = formData;
    if (!q1.trim()) { triggerShake('q1'); return; }
    if (!q2.trim()) { triggerShake('q2'); return; }
    if (!q3.trim()) { triggerShake('q3'); return; }
    setStep(3);

    // Atualiza as perguntas no lead já salvo
    if (leadId) {
      supabase.from('subscriptions').update({ q1, q2, q3 }).eq('id', leadId).then(({error}) => {
        if(error) console.error('Erro ao atualizar perguntas do lead:', error);
      });
    }
  };

  const finalizarInscricao = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        celular: formData.celular,
        q1: formData.q1,
        q2: formData.q2,
        q3: formData.q3,
        method: paymentMethod,
        status: paymentMethod === 'card' ? 'pago' : 'aguardando'
      };

      let error;
      if (leadId) {
        // Atualiza o registro pendente
        const response = await supabase.from('subscriptions').update(payload).eq('id', leadId);
        error = response.error;
      } else {
        // Insere um novo caso não tenha passado pelo salvamento parcial
        const response = await supabase.from('subscriptions').insert([payload]);
        error = response.error;
      }

      if (error) {
        console.error('Error saving to Supabase:', error);
        alert('Houve um erro no banco de dados ao processar sua inscrição. Erro: ' + error.message);
        setIsSubmitting(false);
        return;
      }

      // Enviar notificações (E-mail e WhatsApp) via Vercel Serverless Function
      try {
        // Determinar o tipo de notificação baseado no status do pagamento
        let notificationType = 'confirmation';
        
        if (paymentMethod === 'card' || payload.status === 'pago') {
          // Se pagou com cartão, é confirmação imediata
          notificationType = 'pagamento_confirmado';
        } else if (paymentMethod === 'pix' || paymentMethod === 'boleto') {
          // Se escolheu pix/boleto, ainda está aguardando
          notificationType = 'inscrição_pendente';
        }

        await fetch('/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: notificationType,
            nome: formData.nome,
            email: formData.email,
            celular: formData.celular,
            method: paymentMethod,
            q1: formData.q1,
            q2: formData.q2,
            q3: formData.q3,
          })
        });
        console.log(`✅ Notificação ${notificationType} enviada para ${formData.email}`);
      } catch (notifyError) {
        console.error('Erro ao chamar API de notificação:', notifyError);
        // Não bloqueia o sucesso da inscrição se a notificação falhar
      }

      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Houve um erro ao processar sua inscrição. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText('anamarcelylima28@gmail.com').then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  return (
    <>
      <div className="hero-container">
        <div className="header-section">
          <h2>WORKSHOP:</h2>
          <h1>O CLAUDE COMO ASSISTENTE<br />OPERACIONAL E ESTRATÉGICO</h1>
          <h3>Inteligência Jurídica</h3>
        </div>

        <div className="hero-image-wrap">
          <img src="/banner.jpg" alt="Workshop Claude Jurídico" />
        </div>

        <div className="hero-highlights">
          <div className="highlight-item">
            <span className="icon">📅</span>
            <div><strong>02 de Maio</strong><br />Sábado, 10h às 12h</div>
          </div>
          <div className="highlight-item">
            <span className="icon">💻</span>
            <div><strong>Videoconferência</strong><br />Transmissão ao vivo (Zoom/Meet)</div>
          </div>
          <div className="highlight-item">
            <span className="icon">💎</span>
            <div><strong>R$ 39,90</strong><br />Vagas Limitadas</div>
          </div>
        </div>

        <div className="footer-section">
          <button
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('registration-form').scrollIntoView({ behavior: 'smooth' });
            }}
            className="cta-button"
          >
            INSCREVA-SE AGORA!
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="content-intro">
          <div className="content-alert">
            🚨 <strong>Aviso importante:</strong> Este workshop tem o DNA no Direito, mas serve para QUALQUER PESSOA que queira organizar a vida e a rotina de trabalho usando Inteligência Artificial!
          </div>

          <p>Neste encontro prático, vou te ensinar como eu transformei o Claude na minha secretária premium. Aquela que não tira férias, não toma café e resolve as tarefas chatas enquanto eu respiro.</p>
          <br />
          <p>Você vai aprender, clique a clique, como delegar o trabalho pesado e fazer o Claude atuar nestas frentes principais:</p>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h4>⚖️ Seu Braço Direito no Jurídico</h4>
            <p>Criação de petição inicial, contestação, impugnação de documentos, contratos e procurações. E de quebra? Ele ainda atua como seu assistente de cálculos jurídicos.</p>
          </div>
          <div className="content-card">
            <h4>🎓 Sua Dupla de Estudos</h4>
            <p>Está no mestrado, pós ou faculdade? Vou te mostrar como usar o Claude para pesquisar referências, estruturar materiais e destravar a escrita daquele texto (ou artigo) que não sai do lugar.</p>
          </div>
          <div className="content-card">
            <h4>📂 A Mágica da Organização</h4>
            <p>O tal do MCP - explicado de um jeito muito fácil! Chega de bagunça. Eu vou te ensinar a "plugar" a Inteligência Artificial direto nas ferramentas que você já usa no dia a dia, como os aplicativos do Google (Drive, Docs, Agenda) e até nas pastas do seu próprio computador. O Claude vai ler, classificar e organizar seus documentos direto na fonte.</p>
          </div>
          <div className="content-card">
            <h4>🗓️ Sua Assistente Financeira</h4>
            <p>Organização pessoal para você nunca mais se perder nas contas, estruturar o seu planejamento semanal, otimizar seu tempo e focar no que realmente importa na sua vida e profissão.</p>
          </div>
        </div>

        <div className="content-outro">
          <p>Chega de gastar horas na frente do Word encarando uma tela em branco ou perdendo a paciência tentando organizar PDFs e e-mails perdidos.</p>
        </div>
      </div>

      <div className="speakers-section">
        <h2 style={{ textAlign: 'center', fontFamily: 'Anton', fontSize: '2.5rem', color: '#fff', marginBottom: '30px' }}>CONHEÇA OS INSTRUTORES</h2>

        <div className="speaker-card">
          <h3>VICTOR MEDEIROS</h3>
          <h4>Estrategista de Inovação e Gerente de Desenvolvimento</h4>
          <p>Victor é um empreendedor focado na intersecção entre negócios e tecnologia. Atua como Gerente de Time de Desenvolvimento na <strong>Soluttions</strong>, onde lidera equipes e a estruturação de processos para entrega de soluções de software tanto a nível nacional quanto global. Como sócio-fundador da <strong>Hub ConverseIA</strong>, empresa embarcada no <strong>Porto Digital</strong> (o 2º maior polo tecnológico do Brasil), foi pioneiro no uso de APIs de inteligência artificial para criar agentes autônomos que otimizam operações comerciais e administrativas.</p>
          <ul>
            <li><strong>Expertise:</strong> Especialista em sistemas de IA, automação de processos (RPA) e implantação estratégica de CRMs como Pipedrive e Salesforce.</li>
            <li><strong>Resultados:</strong> Através da ConverseIA, entregou mais de 30 soluções tecnológicas, alcançando uma redução média de 42% no tempo operacional de seus clientes.</li>
          </ul>
        </div>

        <div className="speaker-card">
          <h3>ANA LIMA</h3>
          <h4>Advogada, Fundadora e Pesquisadora em Direito e Tecnologia</h4>
          <p>Ana Marcely é advogada e fundadora do escritório <strong>De Lima Advogados</strong>, com uma trajetória que combina a prática jurídica estratégica com o rigor acadêmico. Atualmente, é mestranda na UFPE, onde pesquisa os impactos da tecnologia e da "Revolução Informacional" no Direito do Trabalho. Sua atuação é focada nas áreas trabalhista empresarial e previdenciária, unindo inovação e conformidade legal para o setor corporativo.</p>
          <ul>
            <li><strong>Atuação Profissional:</strong> Especialista em Direito Trabalhista Empresarial, contencioso, consultivo e planejamento previdenciário, com vasta experiência em audiências e atendimento estratégico.</li>
            <li><strong>Inovação:</strong> Entusiasta da inteligência artificial aplicada ao Direito, dedica-se a entender como as novas tecnologias transformam as relações laborais modernas.</li>
            <li><strong>Formação:</strong> Bacharel em Direito pela UNINASSAU, com especializações em curso nas áreas de Direito do Trabalho e Previdenciário.</li>
          </ul>
        </div>
      </div>

      <div id="registration-form" className="form-section">
        <div className="lights-strip">
          {[...Array(20)].map((_, i) => {
            const types = ['by', 'bwm', 'bw', 'bo'];
            return (
              <div key={i} className={`bulb b${i + 1}`}>
                <div className="bulb-cap"></div>
                <div className={`bulb-glass ${types[i % 4]}`}></div>
              </div>
            );
          })}
        </div>

        <div className="vagas-bar">
          <div className="vagas-text"><div className="vagas-pulse"></div>VAGAS LIMITADAS</div>
          <div className="vagas-bar-track"><div className="vagas-bar-fill"></div></div>
          <div className="vagas-count">🔥 Quase lotado</div>
        </div>

        <div className="steps" id="stepIndicator">
          {[
            { num: '1', label: 'Dados' },
            { num: '2', label: 'Perguntas' },
            { num: '3', label: 'Pagamento' },
            { num: '✓', label: 'Confirmado' }
          ].map((s, i) => {
            const currentStep = i + 1;
            let statusClass = 'inactive';
            let opacity = 0.35;
            if (step > currentStep) {
              statusClass = 'done';
              opacity = 1;
            } else if (step === currentStep) {
              statusClass = 'active';
              opacity = 1;
            }

            return (
              <React.Fragment key={currentStep}>
                <div className={`step ${statusClass}`} style={{ opacity }}>
                  <div className="step-num">{s.num}</div>
                  <div className="step-label">{s.label}</div>
                </div>
                {currentStep < 4 && (
                  <div className={`step-line ${step > currentStep ? 'done' : 'inactive'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="form-card">
          {step === 4 && (
            <div className="success-msg" style={{ display: 'flex' }}>
              <div className="success-icon">🎉</div>
              <div className="success-title">INSCRIÇÃO CONFIRMADA!</div>
              <div className="success-text">
                Perfeito! Recebemos seus dados e seu pagamento está sendo processado.<br /><br />
                Em breve você receberá as informações de acesso no <strong style={{ color: '#ffd700' }}>e-mail e WhatsApp</strong> cadastrados.<br /><br />
                <strong style={{ color: '#ffd700' }}>Nos vemos no dia 02/05! 🚀</strong>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="field-group">
                <div className="field">
                  <label htmlFor="nome">👤 Nome Completo <span className="required">*</span></label>
                  <input
                    type="text"
                    id="nome"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={handleInputChange}
                    style={shakeField === 'nome' ? { animation: 'shake 0.4s ease', borderColor: '#ff6060', boxShadow: '0 0 0 3px rgba(255,96,96,0.2)' } : {}}
                  />
                </div>
                <div className="field">
                  <label htmlFor="email">✉️ E-mail <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={shakeField === 'email' ? { animation: 'shake 0.4s ease', borderColor: '#ff6060', boxShadow: '0 0 0 3px rgba(255,96,96,0.2)' } : {}}
                  />
                  <div className="field-hint">Você receberá o link de acesso neste e-mail</div>
                </div>
                <div className="field">
                  <label htmlFor="celular">📱 Celular / WhatsApp <span className="required">*</span></label>
                  <div className="phone-wrap">
                    <div className="phone-prefix">🇧🇷 +55</div>
                    <input
                      type="tel"
                      id="celular"
                      placeholder="(11) 99999-9999"
                      maxLength="15"
                      value={formData.celular}
                      onChange={handleInputChange}
                      style={shakeField === 'celular' ? { animation: 'shake 0.4s ease', borderColor: '#ff6060', boxShadow: '0 0 0 3px rgba(255,96,96,0.2)' } : {}}
                    />
                  </div>
                  <div className="field-hint">Enviaremos os detalhes também via WhatsApp</div>
                </div>
              </div>
              <button className="btn-next" onClick={goToQuestions}>
                <span>CONTINUAR</span><span>→</span>
              </button>
              <div className="privacy">🔒 Seus dados estão seguros. Não compartilhamos com terceiros.</div>
            </div>
          )}

          {step === 2 && (
            <div>
              <button className="btn-back" onClick={() => setStep(1)}>← Voltar</button>

              <div className="checkout-banner">
                <div className="checkout-icon">🤔</div>
                <div className="checkout-text-wrap">
                  <div className="checkout-title">Antes de finalizar, nos conte um pouco sobre você</div>
                  <div className="checkout-desc">Suas respostas nos ajudam a personalizar o conteúdo do workshop para aproveitar ao máximo! Não há resposta certa ou errada.</div>
                </div>
              </div>

              <div className="field-group" style={{ marginTop: '24px' }}>
                {['q1', 'q2', 'q3'].map((qId, i) => {
                  const labels = [
                    "🎯 O que você espera aprender com o Claude? *",
                    "😤 Qual sua maior dificuldade com IA hoje? *",
                    "🤖 Você usa alguma IA no dia a dia? Se sim, qual e como? *"
                  ];
                  const placeholders = [
                    "Ex: Quero aprender a usar o Claude para redigir petições mais rápido, organizar processos, criar templates jurídicos...",
                    "Ex: Não sei por onde começar, tenho medo de dar respostas erradas, não consigo adaptar para o contexto jurídico...",
                    "Ex: Uso o ChatGPT para resumir documentos e o Google Gemini para pesquisa. Ainda não uso nenhuma IA no trabalho..."
                  ];

                  return (
                    <div className="field" key={qId}>
                      <label htmlFor={qId}>{labels[i]}</label>
                      <textarea
                        id={qId}
                        placeholder={placeholders[i]}
                        maxLength="500"
                        value={formData[qId]}
                        onChange={handleInputChange}
                        style={shakeField === qId ? { animation: 'shake 0.4s ease', borderColor: '#ff6060', boxShadow: '0 0 0 3px rgba(255,96,96,0.2)' } : {}}
                      ></textarea>
                      <div className={`char-counter ${formData[qId].length >= 500 ? 'limit' : (formData[qId].length > 450 ? 'warn' : '')}`}>
                        {formData[qId].length} / 500
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="btn-next" onClick={goToPayment} style={{ background: 'linear-gradient(135deg,#c8960c 0%,#f5c842 50%,#e8a800 100%)', color: '#1a0800', borderColor: '#8b6000', boxShadow: '0 5px 0 #7a5000,0 8px 25px rgba(0,0,0,0.5)' }}>
                <span>IR PARA PAGAMENTO</span><span>→</span>
              </button>
              <div className="privacy">🔒 Suas respostas são confidenciais e usadas apenas para melhorar o workshop.</div>
            </div>
          )}

          {step === 3 && (
            <div className="payment-section" style={{ display: 'block' }}>
              <button className="btn-back" onClick={() => setStep(2)}>← Voltar</button>

              <div className="payment-header">
                <div className="payment-title">ESCOLHA O PAGAMENTO</div>
                <div className="payment-sub">Selecione a forma que preferir para concluir sua inscrição</div>
              </div>

              <div className="pay-tabs">
                <button className={`pay-tab tab-pix ${paymentMethod === 'pix' ? 'active' : ''}`} onClick={() => setPaymentMethod('pix')}>⚡ PIX</button>
                <button className={`pay-tab tab-card ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>💳 Crédito</button>
                <button className={`pay-tab tab-boleto ${paymentMethod === 'boleto' ? 'active' : ''}`} onClick={() => setPaymentMethod('boleto')}>📄 Boleto</button>
              </div>

              {paymentMethod === 'pix' && (
                <div className="pay-panel active">
                  <div className="pix-box">
                    <div className="pix-icon">⚡</div>
                    <div className="pix-label">Chave PIX — E-mail</div>
                    <div className="pix-key-wrap">
                      <div className="pix-key" id="pixKeyText">anamarcelylima28@gmail.com</div>
                      <button className={`btn-copy ${isCopied ? 'copied' : ''}`} onClick={copyPix}>
                        {isCopied ? '✅ Copiado!' : '📋 Copiar'}
                      </button>
                    </div>
                    <div className="pix-amount">Valor a pagar<strong>R$ 39,90</strong></div>
                    <div className="pix-steps">
                      <div className="pix-step-item"><div className="pix-step-num">1</div>Abra o app do seu banco e acesse o PIX</div>
                      <div className="pix-step-item"><div className="pix-step-num">2</div>Escolha "Pagar com chave" e cole o e-mail acima</div>
                      <div className="pix-step-item"><div className="pix-step-num">3</div>Confirme o valor de R$ 39,90 e finalize</div>
                      <div className="pix-step-item"><div className="pix-step-num">4</div>Clique em "Confirmar Inscrição" abaixo</div>
                    </div>
                  </div>
                  <div className="submit-final-wrap">
                    <button className="btn-submit-final" onClick={finalizarInscricao} disabled={isSubmitting}>
                      {isSubmitting ? 'PROCESSANDO...' : '✅ CONFIRMAR INSCRIÇÃO'}
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="pay-panel active">
                  <div className="card-box">
                    <div className="card-icon">💳</div>
                    <div className="card-label">Cartão de Crédito</div>
                    <div className="card-desc">Parcele em até 12x ou pague à vista com segurança.<br />Você será redirecionado para a página de pagamento.</div>
                    <a href="https://www.asaas.com/c/jwj5qw3xyue6ajfb" target="_blank" rel="noreferrer" className="btn-asaas">💳 PAGAR COM CARTÃO</a>
                    <div className="card-badges">
                      <div className="badge">🔒 Seguro</div>
                      <div className="badge">VISA</div>
                      <div className="badge">MASTERCARD</div>
                      <div className="badge">ELO</div>
                      <div className="badge">AMEX</div>
                    </div>
                  </div>
                  <div className="submit-final-wrap">
                    <button className="btn-submit-final" onClick={finalizarInscricao} disabled={isSubmitting}>
                      {isSubmitting ? 'PROCESSANDO...' : '✅ JÁ PAGUEI — CONFIRMAR'}
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'boleto' && (
                <div className="pay-panel active">
                  <div className="boleto-box">
                    <div className="boleto-icon">📄</div>
                    <div className="boleto-label">Boleto Bancário</div>
                    <div className="boleto-desc">Gere seu boleto e pague em qualquer banco ou lotérica.<br /><strong style={{ color: '#e8a0ff' }}>Atenção:</strong> o boleto pode levar até 3 dias úteis para compensar. Sua vaga só é confirmada após o pagamento.</div>
                    <a href="https://www.asaas.com/c/jwj5qw3xyue6ajfb" target="_blank" rel="noreferrer" className="btn-asaas" style={{ background: 'linear-gradient(135deg,#5a3cc0 0%,#8b6cf0 50%,#6a4ce0 100%)', borderColor: '#3a1880', boxShadow: '0 5px 0 #2a1060,0 8px 20px rgba(0,0,0,0.5)' }}>📄 GERAR BOLETO</a>
                    <div className="card-badges">
                      <div className="badge">🔒 Seguro</div>
                      <div className="badge">Vencimento em 3 dias</div>
                    </div>
                  </div>
                  <div className="submit-final-wrap">
                    <button className="btn-submit-final" onClick={finalizarInscricao} disabled={isSubmitting}>
                      {isSubmitting ? 'PROCESSANDO...' : '✅ JÁ PAGUEI — CONFIRMAR'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default App;
