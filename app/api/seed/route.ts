import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, initSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Acesse /api/seed uma vez após configurar o banco para criar as tabelas
// e os usuários de demonstração.
export async function GET() {
  await initSchema();

  const existentes = await sql`SELECT COUNT(*)::int AS n FROM rc_users`;
  if (existentes[0].n > 0) {
    return NextResponse.json({ ok: true, msg: 'Banco já inicializado.' });
  }

  const senha = await bcrypt.hash('nova123', 10);
  const users = [
    ['Helder Lopez', 'admin@novaa3.com.br', 'admin_root', 'TI'],
    ['Compras Nova A3', 'compras@novaa3.com.br', 'compras', 'Compras'],
    ['Financeiro Nova A3', 'financeiro@novaa3.com.br', 'financeiro', 'Financeiro'],
    ['Solicitante Exemplo', 'solicitante@novaa3.com.br', 'solicitante', 'Manutenção'],
  ];
  for (const [nome, email, papel, setor] of users) {
    await sql`INSERT INTO rc_users (nome, email, senha_hash, papel, setor)
              VALUES (${nome}, ${email}, ${senha}, ${papel}, ${setor})`;
  }

  return NextResponse.json({
    ok: true,
    msg: 'Banco criado. Usuários de teste (senha: nova123): admin@novaa3.com.br, compras@novaa3.com.br, financeiro@novaa3.com.br, solicitante@novaa3.com.br',
  });
}
