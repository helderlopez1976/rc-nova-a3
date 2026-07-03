'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';

export default function Mapa() {
  const { id } = useParams();
  const router = useRouter();
  const [dados, setDados] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ fornecedor: '', valor_total: '', prazo_dias: '', condicao_pagamento: '', itens_faltantes: '', obs_qualidade: '' });

  async function carregar() { const r = await fetch(`/api/rc/${id}`); if (r.ok) setDados(await r.json()); }
  useEffect(() => { carregar(); /* eslint-disable-next-line */ }, [id]);

  async function addCotacao(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    const r = await fetch(`/api/rc/${id}/cotacoes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, valor_total: Number(form.valor_total), prazo_dias: form.prazo_dias ? Number(form.prazo_dias) : null }),
    });
    if (r.ok) { setForm({ fornecedor: '', valor_total: '', prazo_dias: '', condicao_pagamento: '', itens_faltantes: '', obs_qualidade: '' }); carregar(); }
    else { const d = await r.json(); setMsg(d.error || 'Erro'); }
  }

  async function escolher(cotacao_id: number, eMenor: boolean, fornecedor: string) {
    let justificativa = '';
    if (!eMenor) {
      justificativa = window.prompt(`${fornecedor} NÃO é a de menor valor. Justifique a escolha:`) || '';
      if (!justificativa) { setMsg('Justificativa obrigatória.'); return; }
    } else if (!window.confirm(`Definir ${fornecedor} como vencedor?`)) return;

    const r = await fetch(`/api/rc/${id}/escolher`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cotacao_id, justificativa }),
    });
    if (r.ok) { setMsg('Vencedor definido. Enviado ao Financeiro.'); setTimeout(() => router.push(`/rc/${id}`), 900); }
    else { const d = await r.json(); setMsg(d.error || 'Erro'); }
  }

  if (!dados) return (<><TopBar papel="compras" /><div className="wrap"><div className="card">Carregando...</div></div></>);
  const cotacoes = dados.cotacoes;
  const menorId = cotacoes.length ? cotacoes[0].id : 0;

  return (
    <>
      <TopBar papel="compras" />
      <div className="wrap">
        <h1>Mapa de Cotações</h1>
        <div className="sub">RC {dados.rc.protocolo} · {dados.rc.setor}</div>
        {msg && <div className="msg msg-info">{msg}</div>}

        <div className="card">
          {cotacoes.length === 0 ? <p style={{ color: '#8a97a8' }}>Sem cotações. Adicione a primeira abaixo.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Fornecedor</th><th>Valor</th><th>Prazo</th><th>Pagamento</th><th>Faltantes</th><th>Qualidade</th><th>Situação</th><th></th></tr></thead>
                <tbody>
                  {cotacoes.map((c: any) => (
                    <tr key={c.id} style={c.vencedor ? { background: '#e9f7ef' } : {}}>
                      <td><b>{c.fornecedor}</b></td>
                      <td>R$ {Number(c.valor_total).toFixed(2)}</td>
                      <td>{c.prazo_dias ? c.prazo_dias + ' dias' : '—'}</td>
                      <td>{c.condicao_pagamento || '—'}</td>
                      <td>{c.itens_faltantes || <span style={{ color: '#2e9e5b' }}>completo</span>}</td>
                      <td>{c.obs_qualidade || '—'}</td>
                      <td>
                        {c.id === menorId && <span className="tag" style={{ background: '#63abe1' }}>menor</span>}
                        {c.vencedor && <span className="tag" style={{ background: '#2e9e5b', marginLeft: 4 }}>✓</span>}
                      </td>
                      <td>{!c.vencedor && <button className="btn btn-ok btn-sm" onClick={() => escolher(c.id, c.id === menorId, c.fornecedor)}>Escolher</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Adicionar cotação</h2>
          <form onSubmit={addCotacao}>
            <div className="flex flex-wrap" style={{ gap: 12 }}>
              <div style={{ flex: 2, minWidth: 180 }}><label>Fornecedor</label><input value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} required /></div>
              <div style={{ flex: 1, minWidth: 120 }}><label>Valor total (R$)</label><input type="number" step="any" value={form.valor_total} onChange={(e) => setForm({ ...form, valor_total: e.target.value })} required /></div>
              <div style={{ flex: 1, minWidth: 100 }}><label>Prazo (dias)</label><input type="number" value={form.prazo_dias} onChange={(e) => setForm({ ...form, prazo_dias: e.target.value })} /></div>
            </div>
            <div className="flex flex-wrap mt" style={{ gap: 12 }}>
              <div style={{ flex: 1, minWidth: 140 }}><label>Condição pagamento</label><input value={form.condicao_pagamento} onChange={(e) => setForm({ ...form, condicao_pagamento: e.target.value })} placeholder="30/60 dias" /></div>
              <div style={{ flex: 1, minWidth: 140 }}><label>Itens faltantes</label><input value={form.itens_faltantes} onChange={(e) => setForm({ ...form, itens_faltantes: e.target.value })} placeholder="Vazio = completo" /></div>
            </div>
            <div className="mt"><label>Observação de qualidade</label><textarea value={form.obs_qualidade} onChange={(e) => setForm({ ...form, obs_qualidade: e.target.value })} /></div>
            <button className="btn mt">Adicionar cotação</button>
          </form>
        </div>
      </div>
    </>
  );
}
