import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const SENHA = 'Ana368410';

const DEFAULT_TEMPLATES = {
  confirmation: {
    label: '✅ Confirmação de Pagamento',
    color: '#50e890',
    trigger: 'Automático (Cartão) ou botão abaixo (Pix/Boleto)',
    email: 'Olá [Nome]!\n\nSua inscrição no Workshop Claude Jurídico foi recebida com sucesso! Seu pagamento está confirmado e estamos te esperando no dia 02/05 às 10h.\n\nNos vemos lá!\nEquipe Ana Lima',
    wpp: 'Olá [Nome]! 🎉 Sua inscrição para o Workshop Claude Jurídico foi confirmada! Em breve enviaremos o link de acesso. Nos vemos no dia 02/05! 🚀'
  },
  abandoned: {
    label: '🛒 Recuperação de Carrinho',
    color: '#ff4040',
    trigger: 'Manual (botão "Recuperar")',
    email: 'Oi, [Nome]! Tudo bem?\n\nNotamos que você iniciou sua inscrição para o Workshop Claude Jurídico, mas não finalizou o pagamento.\n\nAinda temos algumas vagas disponíveis. Garanta a sua agora mesmo!\n\nQualquer dúvida, estamos à disposição.\nEquipe Ana Lima',
    wpp: 'Oii [Nome]! Aqui é da equipe da Ana Lima. Vi que você não conseguiu concluir a sua inscrição para o Workshop do Claude. Teve alguma dúvida ou problema com o pagamento? Me avisa aqui que eu te ajudo! 😉'
  },
  reminder_1d: {
    label: '📅 Lembrete 1 DIA Antes',
    color: '#4080ff',
    trigger: 'Manual (botão "Lembrete Dia")',
    email: 'Olá, [Nome]! É amanhã!\n\nPrepare-se, pois amanhã às 10h daremos início ao nosso Workshop Claude Jurídico.\n\nO link de acesso será enviado 1 hora antes do evento. Fique de olho!\n\nNos vemos amanhã 🚀\nEquipe Ana Lima',
    wpp: 'Fala [Nome]! 🚀 Passando pra avisar que nosso Workshop é AMANHÃ às 10h! Já deixa o alarme programado. Te mando o link de acesso amanhã cedinho! 😊'
  },
  reminder_1h: {
    label: '🚨 Lembrete 1 HORA Antes',
    color: '#E5C07B',
    trigger: 'Manual (botão "Lembrete Hora")',
    email: 'Olá, [Nome]! Falta 1 hora!\n\nEstamos quase lá! Em 1 hora daremos início ao Workshop Claude Jurídico.\n\nClique no link abaixo para acessar a sala:\n👉 [COLE O LINK DO ZOOM/MEET AQUI]\n\nNos vemos em breve!\nEquipe Ana Lima',
    wpp: '🚨 [Nome], ESTAMOS QUASE LÁ! Em 1 hora entramos ao vivo no Workshop. Pega seu café, seu bloco de notas e entra na sala:\n👉 [COLE O LINK DO ZOOM/MEET AQUI]'
  }
};

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'templates' | 'logs'

  useEffect(() => {
    if (isAuthenticated) fetchSubscriptions();
  }, [isAuthenticated]);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('id', { ascending: false });
    if (!error) setSubscriptions(data || []);
    else console.error('Erro ao buscar inscrições:', error);
    setIsLoading(false);
  };

  const addLog = (nome, tipo, sucesso) => {
    const hora = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [{ hora, nome, tipo, sucesso }, ...prev.slice(0, 49)]);
  };

  const dispararNotificacao = async (sub, type) => {
    const tpl = templates[type];
    if (!window.confirm(`Disparar "${tpl.label}" para ${sub.nome}?`)) return;
    try {
      const emailBody = tpl.email.replace(/\[Nome\]/g, sub.nome);
      const wppBody = tpl.wpp.replace(/\[Nome\]/g, sub.nome);
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, nome: sub.nome, email: sub.email, celular: sub.celular, emailBody, wppBody })
      });
      addLog(sub.nome, tpl.label, res.ok);
      alert(res.ok ? 'Notificação enviada com sucesso!' : 'Erro ao enviar (API retornou erro).');
    } catch (e) {
      addLog(sub.nome, tpl.label, false);
      alert('Erro de conexão ao enviar notificação.');
    }
  };

  const confirmarPagamento = async (sub) => {
    if (!window.confirm(`Confirmar pagamento de ${sub.nome} e enviar notificação de acesso?`)) return;
    const { error } = await supabase.from('subscriptions').update({ status: 'pago' }).eq('id', sub.id);
    if (error) { alert('Erro ao atualizar: ' + error.message); return; }
    await dispararNotificacao({ ...sub, status: 'pago' }, 'confirmation');
    fetchSubscriptions();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SENHA) setIsAuthenticated(true);
    else alert('Senha incorreta!');
  };

  const statusColor = (s) => s === 'pago' ? '#50e890' : s === 'aguardando' ? '#ff9500' : '#ff4040';

  const pago = subscriptions.filter(s => s.status === 'pago').length;
  const aguardando = subscriptions.filter(s => s.status === 'aguardando').length;
  const pendente = subscriptions.filter(s => s.status === 'pendente').length;

  if (!isAuthenticated) return (
    <div style={{ background: '#07071a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleLogin} style={{ background: '#12102e', padding: '48px', borderRadius: '20px', border: '2px solid #2a1f5a', textAlign: 'center', width: '100%', maxWidth: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔐</div>
        <h2 style={{ color: '#E5C07B', marginBottom: '8px', fontFamily: "'Anton', sans-serif", fontSize: '2rem' }}>ÁREA RESTRITA</h2>
        <p style={{ color: '#9080c0', marginBottom: '24px', fontSize: '0.9rem' }}>Painel Admin - Workshop Claude</p>
        <input type="password" placeholder="Digite a senha" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '15px', borderRadius: '10px', border: '2px solid #2a1f5a', background: '#07071a', color: '#fff', marginBottom: '16px', width: '100%', fontSize: '1rem', textAlign: 'center', boxSizing: 'border-box' }} />
        <button type="submit" style={{ background: 'linear-gradient(to bottom, #E5C07B, #996A22)', color: '#fff', padding: '15px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '1.1rem', fontFamily: "'Anton', sans-serif" }}>ENTRAR</button>
      </form>
    </div>
  );

  return (
    <div style={{ background: '#07071a', minHeight: '100vh', padding: '30px 20px', fontFamily: "'Nunito', sans-serif", color: '#fff' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: '2.5rem', color: '#E5C07B', margin: 0 }}>PAINEL ADMIN</h1>
            <p style={{ color: '#9080c0', margin: '4px 0 0', fontSize: '0.9rem' }}>Workshop Claude Jurídico — 02/05/2026</p>
          </div>
          <button onClick={fetchSubscriptions} style={{ background: '#2a1f5a', color: '#fff', border: '1px solid #4a3f7a', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>⟳ Atualizar</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
          {[
            { label: 'Pagos ✅', value: pago, color: '#50e890' },
            { label: 'Aguardando 🕐', value: aguardando, color: '#ff9500' },
            { label: 'Leads / Pendentes 🔴', value: pendente, color: '#ff4040' }
          ].map(s => (
            <div key={s.label} style={{ background: '#12102e', border: '1px solid #2a1f5a', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
              <div style={{ color: '#9080c0', fontSize: '0.85rem', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {[['leads', '📋 Leads & Inscritos'], ['templates', '✏️ Templates de Mensagens'], ['logs', '📜 Log de Disparos']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', background: activeTab === tab ? '#E5C07B' : '#2a1f5a', color: activeTab === tab ? '#000' : '#fff' }}>{label}</button>
          ))}
        </div>

        {/* TAB: Leads */}
        {activeTab === 'leads' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#12102e', borderRadius: '12px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#1a1840' }}>
                  {['ID', 'Nome', 'E-mail', 'Celular', 'Método', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '14px 12px', textAlign: 'left', color: '#E5C07B', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.5px', borderBottom: '1px solid #2a1f5a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9080c0' }}>Carregando...</td></tr>}
                {!isLoading && subscriptions.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9080c0' }}>Nenhum registro encontrado.</td></tr>}
                {subscriptions.map((sub, i) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #1a1840', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '12px', color: '#9080c0', fontSize: '0.85rem' }}>{sub.id}</td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{sub.nome}</td>
                    <td style={{ padding: '12px', color: '#c0b0e8', fontSize: '0.9rem' }}>{sub.email}</td>
                    <td style={{ padding: '12px', color: '#c0b0e8', fontSize: '0.9rem' }}>{sub.celular}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#2a1f5a', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {sub.method === 'pix' ? 'PIX' : sub.method === 'card' ? 'Cartão' : sub.method === 'boleto' ? 'Boleto' : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: statusColor(sub.status), fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' }}>{sub.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {sub.status === 'aguardando' && (
                          <button onClick={() => confirmarPagamento(sub)} style={{ background: '#50e890', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>✅ Aprovar Pgto</button>
                        )}
                        {sub.status === 'pendente' && (
                          <button onClick={() => dispararNotificacao(sub, 'abandoned')} style={{ background: '#ff4040', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🛒 Recuperar</button>
                        )}
                        {(sub.status === 'pago' || sub.status === 'aguardando') && (
                          <>
                            <button onClick={() => dispararNotificacao(sub, 'reminder_1d')} style={{ background: '#4080ff', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>📅 Lembrete Dia</button>
                            <button onClick={() => dispararNotificacao(sub, 'reminder_1h')} style={{ background: '#996A22', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🚨 Lembrete Hora</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: Templates */}
        {activeTab === 'templates' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {Object.entries(templates).map(([key, tpl]) => (
              <div key={key} style={{ background: '#12102e', border: `1px solid ${tpl.color}44`, borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: tpl.color, marginBottom: '6px', fontSize: '1.1rem' }}>{tpl.label}</h3>
                <p style={{ color: '#9080c0', fontSize: '0.8rem', marginBottom: '16px' }}>Gatilho: {tpl.trigger}</p>
                {editingTemplate === key ? (
                  <>
                    <label style={{ color: '#E5C07B', fontSize: '0.8rem', fontWeight: 'bold' }}>TEXTO E-MAIL</label>
                    <textarea value={tpl.email} onChange={e => setTemplates(prev => ({ ...prev, [key]: { ...prev[key], email: e.target.value } }))} rows={6} style={{ width: '100%', marginTop: '6px', marginBottom: '12px', padding: '10px', background: '#07071a', border: '1px solid #2a1f5a', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
                    <label style={{ color: '#E5C07B', fontSize: '0.8rem', fontWeight: 'bold' }}>TEXTO WHATSAPP</label>
                    <textarea value={tpl.wpp} onChange={e => setTemplates(prev => ({ ...prev, [key]: { ...prev[key], wpp: e.target.value } }))} rows={4} style={{ width: '100%', marginTop: '6px', marginBottom: '12px', padding: '10px', background: '#07071a', border: '1px solid #2a1f5a', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setEditingTemplate(null)} style={{ flex: 1, padding: '8px', background: '#50e890', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Salvar</button>
                      <button onClick={() => { setTemplates(prev => ({ ...prev, [key]: DEFAULT_TEMPLATES[key] })); setEditingTemplate(null); }} style={{ padding: '8px 12px', background: '#2a1f5a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Restaurar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: '#07071a', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                      <div style={{ color: '#E5C07B', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '6px' }}>E-MAIL</div>
                      <pre style={{ color: '#c0b0e8', fontSize: '0.8rem', whiteSpace: 'pre-wrap', margin: 0 }}>{tpl.email}</pre>
                    </div>
                    <div style={{ background: '#07071a', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                      <div style={{ color: '#25d366', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '6px' }}>WHATSAPP</div>
                      <pre style={{ color: '#c0b0e8', fontSize: '0.8rem', whiteSpace: 'pre-wrap', margin: 0 }}>{tpl.wpp}</pre>
                    </div>
                    <button onClick={() => setEditingTemplate(key)} style={{ width: '100%', padding: '8px', background: '#2a1f5a', color: '#fff', border: `1px solid ${tpl.color}66`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>✏️ Editar Template</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB: Logs */}
        {activeTab === 'logs' && (
          <div style={{ background: '#12102e', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ color: '#E5C07B', marginBottom: '16px' }}>Log de Disparos desta Sessão</h3>
            {logs.length === 0 ? (
              <p style={{ color: '#9080c0', textAlign: 'center', padding: '40px' }}>Nenhum disparo realizado ainda nesta sessão.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Hora', 'Destinatário', 'Tipo de Mensagem', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#E5C07B', fontSize: '0.8rem', borderBottom: '1px solid #2a1f5a' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1a1840' }}>
                      <td style={{ padding: '10px 12px', color: '#9080c0', fontSize: '0.85rem' }}>{log.hora}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '600' }}>{log.nome}</td>
                      <td style={{ padding: '10px 12px', color: '#c0b0e8' }}>{log.tipo}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ color: log.sucesso ? '#50e890' : '#ff4040', fontWeight: 'bold', fontSize: '0.85rem' }}>{log.sucesso ? '✅ Enviado' : '❌ Falhou'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;
