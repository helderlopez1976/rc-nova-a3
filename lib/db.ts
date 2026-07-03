import { neon } from '@neondatabase/serverless';

// Conexão "preguiçosa": só cria quando uma rota realmente usa o banco,
// evitando erro em tempo de build (quando DATABASE_URL ainda não vale).
let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}
export const sql = ((strings: TemplateStringsArray, ...values: any[]) =>
  (getSql() as any)(strings, ...values)) as (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

// Cria as tabelas se não existirem. Chamado pelo /api/seed.
export async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS rc_users (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      papel VARCHAR(20) NOT NULL DEFAULT 'solicitante',
      setor VARCHAR(150),
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS rc_requisicoes (
      id SERIAL PRIMARY KEY,
      protocolo VARCHAR(30) UNIQUE NOT NULL,
      user_id INT NOT NULL REFERENCES rc_users(id),
      solicitante_nome VARCHAR(150) NOT NULL,
      setor VARCHAR(150) NOT NULL,
      justificativa TEXT NOT NULL,
      itens JSONB NOT NULL DEFAULT '[]',
      valor_estimado NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'Aberto',
      obs_compras TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS rc_cotacoes (
      id SERIAL PRIMARY KEY,
      requisicao_id INT NOT NULL REFERENCES rc_requisicoes(id) ON DELETE CASCADE,
      fornecedor VARCHAR(200) NOT NULL,
      valor_total NUMERIC(14,2) NOT NULL DEFAULT 0,
      prazo_dias INT,
      condicao_pagamento VARCHAR(150),
      itens_faltantes TEXT,
      obs_qualidade TEXT,
      vencedor BOOLEAN NOT NULL DEFAULT false,
      justificativa TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS rc_notificacoes (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES rc_users(id),
      requisicao_id INT REFERENCES rc_requisicoes(id) ON DELETE CASCADE,
      titulo VARCHAR(200) NOT NULL,
      mensagem TEXT NOT NULL,
      lida BOOLEAN NOT NULL DEFAULT false,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS rc_historico (
      id SERIAL PRIMARY KEY,
      requisicao_id INT NOT NULL REFERENCES rc_requisicoes(id) ON DELETE CASCADE,
      status_anterior VARCHAR(30),
      status_novo VARCHAR(30) NOT NULL,
      autor VARCHAR(150),
      observacao TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
}
