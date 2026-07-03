import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { lerSessao } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PROTEGIDOS = ['vmachado@novaa3.com.br', 'hlopez@novaa3.com.br'];
const ROLES = ['admin', 'compras', 'gestor', 'tecnico', 'user'];

// Lista usuários (só admin)
export async function GET() {
  const s = await lerSessao();
  if (!s || s.papel !== 'admin') return NextResponse.json({ error: 'sem permissão' }, { status: 403 });
  const rows = await sql`SELECT id, nome, email, papel, setor, ativo FROM rc_users ORDER BY papel, nome`;
  return NextResponse.json(rows);
}

// Cria usuário (só admin)
export async function POST(req: NextRequest) {
  const s = await lerSessao();
  if (!s || s.papel !== 'admin') return NextResponse.json({ error: 'sem permissão' }, { status: 403 });
  const { nome, email, papel, setor, senha } = await req.json();
  if (!nome || !email || !senha) return NextResponse.json({ error: 'Preencha nome, e-mail e senha' }, { status: 400 });
  if (!ROLES.includes(papel)) return NextResponse.json({ error: 'Papel inválido' }, { status: 400 });

  const existe = await sql`SELECT id FROM rc_users WHERE email = ${email.toLowerCase()}`;
  if (existe.length > 0) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });

  const hash = await bcrypt.hash(senha, 10);
  await sql`INSERT INTO rc_users (nome, email, senha_hash, papel, setor)
            VALUES (${nome}, ${email.toLowerCase()}, ${hash}, ${papel}, ${setor || null})`;
  return NextResponse.json({ ok: true });
}

// Atualiza papel / ativa-desativa / reseta senha (só admin)
export async function PATCH(req: NextRequest) {
  const s = await lerSessao();
  if (!s || s.papel !== 'admin') return NextResponse.json({ error: 'sem permissão' }, { status: 403 });
  const { id, acao, papel, senha } = await req.json();

  const alvo = (await sql`SELECT email FROM rc_users WHERE id = ${id}`)[0];
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  if (acao === 'papel') {
    if (!ROLES.includes(papel)) return NextResponse.json({ error: 'Papel inválido' }, { status: 400 });
    if (PROTEGIDOS.includes(alvo.email)) return NextResponse.json({ error: 'Usuário protegido' }, { status: 403 });
    await sql`UPDATE rc_users SET papel = ${papel} WHERE id = ${id}`;
  } else if (acao === 'toggle') {
    if (PROTEGIDOS.includes(alvo.email)) return NextResponse.json({ error: 'Usuário protegido' }, { status: 403 });
    await sql`UPDATE rc_users SET ativo = NOT ativo WHERE id = ${id}`;
  } else if (acao === 'senha') {
    if (!senha) return NextResponse.json({ error: 'Informe a nova senha' }, { status: 400 });
    const hash = await bcrypt.hash(senha, 10);
    await sql`UPDATE rc_users SET senha_hash = ${hash} WHERE id = ${id}`;
  }
  return NextResponse.json({ ok: true });
}
