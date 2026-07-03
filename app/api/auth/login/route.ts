import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { criarToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json();
  const rows = await sql`SELECT * FROM rc_users WHERE email = ${email}`;
  const u = rows[0];
  if (!u || !(await bcrypt.compare(senha, u.senha_hash))) {
    return NextResponse.json({ error: 'E-mail ou senha inválidos' }, { status: 401 });
  }
  const token = await criarToken({ id: u.id, nome: u.nome, email: u.email, papel: u.papel, setor: u.setor });
  const res = NextResponse.json({ id: u.id, nome: u.nome, papel: u.papel });
  res.cookies.set('rc_sessao', token, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 12 });
  return res;
}
