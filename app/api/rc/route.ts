import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { lerSessao } from '@/lib/auth';
import { notificarPapel } from '@/lib/notify';

export const dynamic = 'force-dynamic';

// Lista RCs (solicitante vê as suas; compras/financeiro/admin veem todas)
export async function GET(req: NextRequest) {
  const s = await lerSessao();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });

  const status = req.nextUrl.searchParams.get('status') || '';
  let rows;
  if (s.papel === 'solicitante') {
    rows = status
      ? await sql`SELECT * FROM rc_requisicoes WHERE user_id = ${s.id} AND status = ${status} ORDER BY criado_em DESC`
      : await sql`SELECT * FROM rc_requisicoes WHERE user_id = ${s.id} ORDER BY criado_em DESC`;
  } else {
    rows = status
      ? await sql`SELECT * FROM rc_requisicoes WHERE status = ${status} ORDER BY criado_em DESC`
      : await sql`SELECT * FROM rc_requisicoes ORDER BY criado_em DESC`;
  }
  return NextResponse.json(rows);
}

// Cria RC
export async function POST(req: NextRequest) {
  const s = await lerSessao();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });

  const { setor, justificativa, itens } = await req.json();
  if (!setor || !justificativa || !Array.isArray(itens) || itens.length === 0) {
    return NextResponse.json({ error: 'Preencha setor, justificativa e ao menos um item' }, { status: 400 });
  }

  const valor = itens.reduce((acc: number, i: any) => acc + Number(i.quantidade || 0) * Number(i.valor_unit || 0), 0);
  const ano = new Date().getFullYear();
  const seqRows = await sql`SELECT COUNT(*)::int AS n FROM rc_requisicoes WHERE protocolo LIKE ${'RC-' + ano + '-%'}`;
  const protocolo = `RC-${ano}-${String(seqRows[0].n + 1).padStart(4, '0')}`;

  const rows = await sql`
    INSERT INTO rc_requisicoes (protocolo, user_id, solicitante_nome, setor, justificativa, itens, valor_estimado)
    VALUES (${protocolo}, ${s.id}, ${s.nome}, ${setor}, ${justificativa}, ${JSON.stringify(itens)}, ${valor})
    RETURNING id, protocolo`;

  await notificarPapel(['compras', 'admin_root'], rows[0].id, `Nova RC ${protocolo}`, `${s.nome} abriu uma requisição (${setor}).`);
  return NextResponse.json(rows[0]);
}
