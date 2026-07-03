import { redirect } from 'next/navigation';
import { lerSessao } from '@/lib/auth';
import { sql } from '@/lib/db';
import TopBar from '@/components/TopBar';

const CORES: Record<string, string> = {
  'Aberto': '#63abe1', 'Em Análise': '#e0a500', 'Em Cotação': '#7c5cbf',
  'Aguardando Aprovação': '#e0a500', 'Aprovada': '#2e9e5b', 'Reprovada': '#d64560',
  'Recebido': '#1a7a45', 'Cancelada': '#8a97a8',
};

export const dynamic = 'force-dynamic';

export default async function Painel({ searchParams }: { searchParams: { status?: string } }) {
  const s = await lerSessao();
  if (!s) redirect('/login');
  if (!['compras', 'gestor', 'admin'].includes(s.papel)) redirect('/rc/nova');

  const filtro = searchParams.status || '';
  const lista = filtro
    ? await sql`SELECT * FROM rc_requisicoes WHERE status = ${filtro} ORDER BY criado_em DESC`
    : await sql`SELECT * FROM rc_requisicoes ORDER BY criado_em DESC`;
  const contagem = await sql`SELECT status, COUNT(*)::int AS n FROM rc_requisicoes GROUP BY status`;
  const mapa: Record<string, number> = {};
  contagem.forEach((c: any) => (mapa[c.status] = c.n));
  const total = Object.values(mapa).reduce((a, b) => a + b, 0);

  return (
    <>
      <TopBar papel={s.papel} />
      <div className="wrap">
        <h1>Painel de Requisições</h1>
        <div className="sub">{total} requisições · administração central</div>

        <div className="cards-grid">
          <a href="/painel" className="scard" style={{ borderLeftColor: '#12263a' }}>
            <div className="n">{total}</div><div className="l">Todas</div>
          </a>
          {Object.keys(CORES).map((st) => (
            <a key={st} href={`/painel?status=${encodeURIComponent(st)}`} className="scard" style={{ borderLeftColor: CORES[st] }}>
              <div className="n">{mapa[st] || 0}</div><div className="l">{st}</div>
            </a>
          ))}
        </div>

        <div className="card">
          {lista.length === 0 ? (
            <p style={{ color: '#8a97a8' }}>Nenhuma requisição{filtro ? ` com status "${filtro}"` : ''}.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>Protocolo</th><th>Solicitante</th><th>Setor</th><th>Valor est.</th><th>Status</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {lista.map((r: any) => (
                    <tr key={r.id}>
                      <td><b>{r.protocolo}</b></td>
                      <td>{r.solicitante_nome}</td>
                      <td>{r.setor}</td>
                      <td>R$ {Number(r.valor_estimado).toFixed(2)}</td>
                      <td><span className="tag" style={{ background: CORES[r.status] || '#63abe1' }}>{r.status}</span></td>
                      <td>
                        <div className="flex flex-wrap">
                          <a className="btn btn-sec btn-sm" href={`/rc/${r.id}`}>Ver</a>
                          {['compras', 'admin'].includes(s.papel) && <a className="btn btn-sm" href={`/mapa/${r.id}`}>Mapa</a>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
