import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { lerSessao } from '@/lib/auth';
import { notificar } from '@/lib/notify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await lerSessao();
  if (!s || !['compras', 'admin'].includes(s.papel)) {
    return NextResponse.json({ error: 'sem permissão' }, { status: 403 });
  }
  const { status, observacao } = await req.json();
  const rc = (await sql`SELECT * FROM rc_requisicoes WHERE id = ${params.id}`)[0];
  if (!rc) return NextResponse.json({ error: 'RC não encontrada' }, { status: 404 });

  await sql`UPDATE rc_requisicoes SET status = ${status}, obs_compras = ${observacao || null}, atualizado_em = now() WHERE id = ${params.id}`;
  await sql`INSERT INTO rc_historico (requisicao_id, status_anterior, status_novo, autor, observacao)
            VALUES (${params.id}, ${rc.status}, ${status}, ${s.nome}, ${observacao || null})`;

  // Só painel, sem e-mail
  await notificar(rc.user_id, Number(params.id), `RC ${rc.protocolo} - ${status}`, `Status atualizado para "${status}".`);
  return NextResponse.json({ ok: true });
}
