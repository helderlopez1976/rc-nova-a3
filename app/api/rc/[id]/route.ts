import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { lerSessao } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await lerSessao();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });

  const rc = (await sql`SELECT * FROM rc_requisicoes WHERE id = ${params.id}`)[0];
  if (!rc) return NextResponse.json({ error: 'RC não encontrada' }, { status: 404 });

  const cotacoes = await sql`SELECT * FROM rc_cotacoes WHERE requisicao_id = ${params.id} ORDER BY valor_total ASC`;
  const historico = await sql`SELECT * FROM rc_historico WHERE requisicao_id = ${params.id} ORDER BY criado_em ASC`;
  return NextResponse.json({ rc, cotacoes, historico });
}
