import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { lerSessao } from '@/lib/auth';
import { notificarPapel } from '@/lib/notify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await lerSessao();
  if (!s || !['compras', 'admin_root'].includes(s.papel)) {
    return NextResponse.json({ error: 'sem permissão' }, { status: 403 });
  }
  const { cotacao_id, justificativa } = await req.json();

  const cotacoes = await sql`SELECT * FROM rc_cotacoes WHERE requisicao_id = ${params.id} ORDER BY valor_total ASC`;
  if (cotacoes.length === 0) return NextResponse.json({ error: 'Sem cotações' }, { status: 400 });

  const escolhida = cotacoes.find((c: any) => c.id === Number(cotacao_id));
  if (!escolhida) return NextResponse.json({ error: 'Cotação inválida' }, { status: 400 });

  const eMenor = cotacoes[0].id === escolhida.id;
  if (!eMenor && !justificativa) {
    return NextResponse.json({ error: 'Esta não é a de menor valor. Justificativa é obrigatória.' }, { status: 400 });
  }

  await sql`UPDATE rc_cotacoes SET vencedor = false, justificativa = null WHERE requisicao_id = ${params.id}`;
  await sql`UPDATE rc_cotacoes SET vencedor = true, justificativa = ${justificativa || null} WHERE id = ${cotacao_id}`;
  await sql`UPDATE rc_requisicoes SET status = 'Aguardando Aprovação', atualizado_em = now() WHERE id = ${params.id}`;

  const rc = (await sql`SELECT protocolo FROM rc_requisicoes WHERE id = ${params.id}`)[0];
  await notificarPapel(['financeiro', 'admin_root'], Number(params.id),
    `Autorizar compra - RC ${rc.protocolo}`,
    `${escolhida.fornecedor} - R$ ${Number(escolhida.valor_total).toFixed(2)}. Autorize pelo painel.`);
  return NextResponse.json({ ok: true });
}
