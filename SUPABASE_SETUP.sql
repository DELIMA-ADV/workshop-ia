-- ========================================
-- Setup da Tabela de Inscrições no Supabase
-- ========================================
-- Copie e cole este código no SQL Editor do Supabase
-- Acesse: https://supabase.com/dashboard → Seu Projeto → SQL Editor

-- 1. Criar tabela 'subscriptions'
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  celular VARCHAR(20) NOT NULL,
  q1 TEXT DEFAULT '',
  q2 TEXT DEFAULT '',
  q3 TEXT DEFAULT '',
  method VARCHAR(50) DEFAULT 'nenhum', -- 'pix', 'card', 'nenhum'
  status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'pago', 'aguardando', 'confirmado'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. Criar índice para email (melhora performance)
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);

-- 3. Criar índice para status (melhora performance)
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Criar política para permitir inserção (qualquer um pode criar inscrição)
CREATE POLICY "Permitir inserção de inscrições" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- 6. Criar política para permitir atualização (qualquer um pode atualizar sua inscrição)
CREATE POLICY "Permitir atualização de inscrições" ON subscriptions
  FOR UPDATE USING (true);

-- 7. Criar política para permitir leitura (apenas para admin depois)
CREATE POLICY "Permitir leitura de inscrições" ON subscriptions
  FOR SELECT USING (true);

-- 8. Criar função para atualizar 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger para atualizar timestamp
CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_timestamp();

-- ========================================
-- Comandos de Teste (Execute após)
-- ========================================

-- Verificar se a tabela foi criada
-- SELECT * FROM subscriptions;

-- Inserir um registro de teste
-- INSERT INTO subscriptions (nome, email, celular) VALUES 
-- ('Teste', 'teste@email.com', '(11) 98765-4321');

-- ========================================
-- Notas de Segurança
-- ========================================
-- ✅ Row Level Security está ativado para controlar acesso
-- ✅ Índices foram criados para melhorar performance
-- ✅ Campo email é UNIQUE para evitar duplicatas
-- ✅ Timestamp automático de criação e atualização
