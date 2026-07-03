import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { lerSessao } from '@/lib/auth';
import { notificar } from '@/lib/notify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await lerSessao();
  if (!s || !['financeiro', 'admin_root'].includes(s.papel)) {
    return NextResponse.json({ error: 'sem permissão' }, { status: 403 });
  }
  const { decisao, motivo } = await req.json();
  if (decisao === 'reprovado' && !motivo) {
    return NextResponse.json({ error: 'Motivo obrigatório para reprovar' }, { status: 400 });
  }

  const rc = (await sql`SELECT * FROM rc_requisicoes WHERE id = ${params.id}`)[0];
  if (!rc) return NextResponse.json({ error: 'RC não encontrada' }, { status: 404 });

  const novo = decisao === 'aprovado' ? 'Aprovada' : 'Reprovada';
  await sql`UPDATE rc_requisicoes SET status = ${novo}, atualizado_em = now() WHERE id = ${params.id}`;
  await sql`INSERT INTO rc_historico (requisicao_id, status_anterior, status_novo, autor, observacao)
            VALUES (${params.id}, ${rc.status}, ${novo}, ${s.nome}, ${motivo || null})`;

  await notificar(rc.user_id, Number(params.id), `RC ${rc.protocolo} - ${novo}`,
    decisao === 'aprovado' ? 'Sua requisição foi aprovada.' : `Reprovada. Motivo: ${motivo}`);
  return NextResponse.json({ ok: true });
}
