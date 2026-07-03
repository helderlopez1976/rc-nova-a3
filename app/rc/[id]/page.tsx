'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TopBar from '@/components/TopBar';

const CORES: Record<string, string> = {
  'Aberto': '#63abe1', 'Em Análise': '#e0a500', 'Em Cotação': '#7c5cbf',
  'Aguardando Aprovação': '#e0a500', 'Aprovada': '#2e9e5b', 'Reprovada': '#d64560',
  'Recebido': '#1a7a45', 'Cancelada': '#8a97a8',
};

export default function DetalheRC() {
  const { id } = useParams();
  const [dados, setDados] = useState<any>(null);
  const [papel, setPapel] = useState('');
  const [motivo, setMotivo] = useState('');
  const [msg, setMsg] = useState('');

  async function carregar() {
    const r = await fetch(`/api/rc/${id}`);
    if (r.ok) setDados(await r.json());
    const s = await fetch('/api/notificacoes'); // usado só p/ confirmar sessão; papel vem do cookie via página
  }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [id]);

  // Descobre papel a partir de um endpoint leve
  useEffect(() => { fetch('/api/rc').then(() => {}); document.cookie; }, []);

  async function decidir(decisao: string) {
    setMsg('');
    const r = await fetch(`/api/rc/${id}/aprovar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisao, motivo }),
    });
    if (r.ok) { setMsg('Decisão registrada.'); carregar(); }
    else { const d = await r.json(); setMsg(d.error || 'Erro'); }
  }

  if (!dados) return (<><TopBar papel="" /><div className="wrap"><div className="card">Carregando...</div></div></>);
  const rc = dados.rc;
  const vencedora = dados.cotacoes.find((c: any) => c.vencedor);

  return (
    <>
      <TopBar papel={papel} />
      <div className="wrap">
        <div className="flex">
          <h1>RC {rc.protocolo}</h1>
          <span className="tag right" style={{ background: CORES[rc.status] || '#63abe1' }}>{rc.status}</span>
        </div>
        <div className="sub">{rc.solicitante_nome} · {rc.setor}</div>
        {msg && <div className="msg msg-info">{msg}</div>}

        <div className="card">
          <h2>Justificativa</h2>
          <p>{rc.justificativa}</p>
        </div>

        <div className="card">
          <h2>Itens</h2>
          <table>
            <thead><tr><th>Descrição</th><th>Qtd</th><th>Unid.</th><th>Valor unit.</th></tr></thead>
            <tbody>
              {(rc.itens || []).map((it: any, i: number) => (
                <tr key={i}><td>{it.descricao}</td><td>{it.quantidade}</td><td>{it.unidade}</td><td>R$ {Number(it.valor_unit).toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt" style={{ textAlign: 'right', fontWeight: 700, color: '#12263a' }}>
            Estimativa: R$ {Number(rc.valor_estimado).toFixed(2)}
          </div>
        </div>

        {dados.cotacoes.length > 0 && (
          <div className="card">
            <h2>Cotações</h2>
            <table>
              <thead><tr><th>Fornecedor</th><th>Valor</th><th>Prazo</th><th>Pagamento</th><th></th></tr></thead>
              <tbody>
                {dados.cotacoes.map((c: any) => (
                  <tr key={c.id} style={c.vencedor ? { background: '#e9f7ef' } : {}}>
                    <td>{c.fornecedor}</td>
                    <td>R$ {Number(c.valor_total).toFixed(2)}</td>
                    <td>{c.prazo_dias ? c.prazo_dias + ' dias' : '—'}</td>
                    <td>{c.condicao_pagamento || '—'}</td>
                    <td>{c.vencedor && <span className="tag" style={{ background: '#2e9e5b' }}>✓ vencedor</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Aprovação do financeiro */}
        {rc.status === 'Aguardando Aprovação' && vencedora && (
          <div className="card">
            <h2>Autorização (Financeiro)</h2>
            <div className="msg msg-info">
              Vencedor: <b>{vencedora.fornecedor}</b> — R$ {Number(vencedora.valor_total).toFixed(2)}
              {vencedora.justificativa && <><br />Justificativa: {vencedora.justificativa}</>}
            </div>
            <label>Motivo (obrigatório se reprovar)</label>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            <div className="flex mt">
              <button className="btn btn-ok" onClick={() => decidir('aprovado')}>Aprovar compra</button>
              <button className="btn btn-danger" onClick={() => decidir('reprovado')}>Reprovar</button>
            </div>
            <div className="sub mt">Se o botão der "sem permissão", entre como financeiro@novaa3.com.br.</div>
          </div>
        )}

        <div className="card">
          <h2>Histórico</h2>
          {dados.historico.length === 0 ? <p style={{ color: '#8a97a8' }}>Sem movimentações.</p> : (
            <table>
              <thead><tr><th>De</th><th>Para</th><th>Autor</th><th>Obs.</th></tr></thead>
              <tbody>
                {dados.historico.map((h: any) => (
                  <tr key={h.id}><td>{h.status_anterior || '—'}</td><td>{h.status_novo}</td><td>{h.autor}</td><td>{h.observacao || '—'}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
