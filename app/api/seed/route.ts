import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, initSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Acesse /api/seed uma vez após configurar o banco para criar as tabelas
// e os usuários de demonstração.
export async function GET() {
  await initSchema();
  // Garante colunas novas mesmo se o banco já existia (migração leve)
  await sql`ALTER TABLE rc_requisicoes ADD COLUMN IF NOT EXISTS tipo_solicitacao VARCHAR(50) NOT NULL DEFAULT 'Compra de Material'`;
  await sql`ALTER TABLE rc_users ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true`;

  const existentes = await sql`SELECT COUNT(*)::int AS n FROM rc_users`;
  if (existentes[0].n > 0) {
    return NextResponse.json({ ok: true, msg: 'Banco já inicializado.' });
  }

  const senha = await bcrypt.hash('nova123', 10);
  const users = [
    ['Helder Lopez', 'hlopez@novaa3.com.br', 'admin', 'TI'],
    ['Compras Nova A3', 'compras@novaa3.com.br', 'compras', 'Compras'],
    ['Gestor Nova A3', 'gestor@novaa3.com.br', 'gestor', 'Administração'],
    ['Técnico Nova A3', 'tecnico@novaa3.com.br', 'tecnico', 'Manutenção'],
    ['Usuário Exemplo', 'usuario@novaa3.com.br', 'user', 'Produção'],
  ];
  for (const [nome, email, papel, setor] of users) {
    await sql`INSERT INTO rc_users (nome, email, senha_hash, papel, setor)
              VALUES (${nome}, ${email}, ${senha}, ${papel}, ${setor})`;
  }

  return NextResponse.json({
    ok: true,
    msg: 'Banco criado. Usuários de teste (senha: nova123): hlopez@novaa3.com.br (admin), compras@novaa3.com.br, gestor@novaa3.com.br, tecnico@novaa3.com.br, usuario@novaa3.com.br',
  });
}
