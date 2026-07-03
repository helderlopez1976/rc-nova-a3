import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, initSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Corrige os usuários para os papéis certos, mesmo que o banco já tivesse
// usuários antigos (do primeiro seed, com papel 'admin_root' que nao existe mais).
// Acesse /api/reset-usuarios UMA vez para consertar. Depois entre como
// hlopez@novaa3.com.br / nova123 e o menu Usuários vai aparecer.
export async function GET() {
  await initSchema();
  await sql`ALTER TABLE rc_requisicoes ADD COLUMN IF NOT EXISTS tipo_solicitacao VARCHAR(50) NOT NULL DEFAULT 'Compra de Material'`;
  await sql`ALTER TABLE rc_users ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true`;

  const senha = await bcrypt.hash('nova123', 10);
  const users: [string, string, string, string][] = [
    ['Helder Lopez', 'hlopez@novaa3.com.br', 'admin', 'TI'],
    ['Compras Nova A3', 'compras@novaa3.com.br', 'compras', 'Compras'],
    ['Gestor Nova A3', 'gestor@novaa3.com.br', 'gestor', 'Administração'],
    ['Técnico Nova A3', 'tecnico@novaa3.com.br', 'tecnico', 'Manutenção'],
    ['Usuário Exemplo', 'usuario@novaa3.com.br', 'user', 'Produção'],
  ];

  for (const [nome, email, papel, setor] of users) {
    const existe = await sql`SELECT id FROM rc_users WHERE email = ${email}`;
    if (existe.length > 0) {
      // Atualiza papel e reseta senha (garante acesso)
      await sql`UPDATE rc_users SET nome = ${nome}, papel = ${papel}, setor = ${setor}, senha_hash = ${senha}, ativo = true WHERE email = ${email}`;
    } else {
      await sql`INSERT INTO rc_users (nome, email, senha_hash, papel, setor) VALUES (${nome}, ${email}, ${senha}, ${papel}, ${setor})`;
    }
  }

  // Remove o usuário antigo admin@ (papel admin_root) se existir, para não confundir
  await sql`DELETE FROM rc_users WHERE email = 'admin@novaa3.com.br'`;

  const todos = await sql`SELECT nome, email, papel, ativo FROM rc_users ORDER BY papel`;
  return NextResponse.json({
    ok: true,
    msg: 'Usuários corrigidos. Entre como hlopez@novaa3.com.br / senha nova123 — o menu Usuários vai aparecer.',
    usuarios: todos,
  });
}
