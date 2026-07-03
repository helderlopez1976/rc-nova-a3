import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { lerSessao } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await lerSessao();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  const rows = await sql`SELECT * FROM rc_notificacoes WHERE user_id = ${s.id} ORDER BY criado_em DESC LIMIT 30`;
  const naoLidas = await sql`SELECT COUNT(*)::int AS n FROM rc_notificacoes WHERE user_id = ${s.id} AND lida = false`;
  return NextResponse.json({ notificacoes: rows, naoLidas: naoLidas[0].n });
}

export async function POST() {
  const s = await lerSessao();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  await sql`UPDATE rc_notificacoes SET lida = true WHERE user_id = ${s.id}`;
  return NextResponse.json({ ok: true });
}
