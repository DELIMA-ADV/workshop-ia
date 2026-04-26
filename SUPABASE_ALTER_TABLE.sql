-- ========================================
-- ALTER TABLE: Adicionar link do evento
-- ========================================
-- Execute este código no SQL Editor do Supabase

-- 1. Adicionar coluna event_link (link do zoom/meet)
ALTER TABLE subscriptions ADD COLUMN event_link VARCHAR(500);

-- 2. Adicionar coluna event_date (data/hora do evento)
ALTER TABLE subscriptions ADD COLUMN event_date TIMESTAMP;

-- 3. Criar índice para event_date (para ordenação)
CREATE INDEX IF NOT EXISTS idx_subscriptions_event_date ON subscriptions(event_date);

-- ========================================
-- Dados Padrão
-- ========================================

-- Se quiser pré-preenchido com a data do evento (2 de maio de 2026, 10h):
-- UPDATE subscriptions SET event_date = '2026-05-02 10:00:00' WHERE event_date IS NULL;

-- ========================================
-- Verificação
-- ========================================

-- Execute esta query para verificar se as colunas foram criadas:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'subscriptions' 
-- ORDER BY ordinal_position;

-- Resultado esperado:
-- id                 | uuid
-- nome               | character varying(255)
-- email              | character varying(255)
-- celular            | character varying(20)
-- q1                 | text
-- q2                 | text
-- q3                 | text
-- method             | character varying(50)
-- status             | character varying(50)
-- created_at         | timestamp
-- updated_at         | timestamp
-- event_link         | character varying(500)      ← NOVA
-- event_date         | timestamp                    ← NOVA
