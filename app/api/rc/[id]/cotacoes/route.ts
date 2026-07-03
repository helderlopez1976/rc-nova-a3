import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { lerSessao } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await lerSessao();
  if (!s || !['compras', 'admin'].includes(s.papel)) {
    return NextResponse.json({ error: 'sem permissão' }, { status: 403 });
  }
  const b = await req.json();
  if (!b.fornecedor) return NextResponse.json({ error: 'Informe o fornecedor' }, { status: 400 });

  await sql`
    INSERT INTO rc_cotacoes (requisicao_id, fornecedor, valor_total, prazo_dias, condicao_pagamento, itens_faltantes, obs_qualidade)
    VALUES (${params.id}, ${b.fornecedor}, ${Number(b.valor_total) || 0}, ${b.prazo_dias || null},
            ${b.condicao_pagamento || null}, ${b.itens_faltantes || null}, ${b.obs_qualidade || null})`;

  await sql`UPDATE rc_requisicoes SET status = 'Em Cotação', atualizado_em = now()
            WHERE id = ${params.id} AND status IN ('Aberto', 'Em Análise')`;
  return NextResponse.json({ ok: true });
}
