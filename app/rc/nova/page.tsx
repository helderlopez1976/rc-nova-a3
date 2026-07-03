'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';

interface Item { descricao: string; quantidade: string; unidade: string; valor_unit: string; }

export default function NovaRC() {
  const router = useRouter();
  const [setor, setSetor] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [itens, setItens] = useState<Item[]>([{ descricao: '', quantidade: '1', unidade: 'un', valor_unit: '0' }]);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');

  function addItem() { setItens([...itens, { descricao: '', quantidade: '1', unidade: 'un', valor_unit: '0' }]); }
  function delItem(i: number) { setItens(itens.filter((_, idx) => idx !== i)); }
  function setItem(i: number, campo: keyof Item, v: string) {
    const novo = [...itens]; novo[i][campo] = v; setItens(novo);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault(); setErro(''); setOk('');
    const r = await fetch('/api/rc', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setor, justificativa, itens: itens.map(i => ({ ...i, quantidade: Number(i.quantidade), valor_unit: Number(i.valor_unit) })) }),
    });
    if (r.ok) { const d = await r.json(); setOk(`Requisição ${d.protocolo} criada.`); setTimeout(() => router.push(`/rc/${d.id}`), 900); }
    else { const d = await r.json(); setErro(d.error || 'Erro ao criar'); }
  }

  const total = itens.reduce((a, i) => a + Number(i.quantidade || 0) * Number(i.valor_unit || 0), 0);

  return (
    <>
      <TopBar papel="solicitante" />
      <div className="wrap">
        <h1>Nova Requisição de Compra</h1>
        <div className="sub">Preencha os itens que precisa. Compras receberá no painel.</div>
        {erro && <div className="msg msg-erro">{erro}</div>}
        {ok && <div className="msg msg-ok">{ok}</div>}
        <form onSubmit={enviar}>
          <div className="card">
            <div className="flex flex-wrap" style={{ gap: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Setor / centro de custo</label>
                <input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Ex.: Manutenção" required />
              </div>
            </div>
            <div className="mt">
              <label>Justificativa</label>
              <textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)} required />
            </div>
          </div>

          <div className="card">
            <h2>Itens</h2>
            <div className="item-row" style={{ fontSize: 11, textTransform: 'uppercase', color: '#8a97a8', fontWeight: 600 }}>
              <div>Descrição</div><div>Qtd</div><div>Unid.</div><div>Valor unit.</div><div></div>
            </div>
            {itens.map((it, i) => (
              <div className="item-row" key={i}>
                <input value={it.descricao} onChange={(e) => setItem(i, 'descricao', e.target.value)} placeholder="Item" required />
                <input type="number" min="0" step="any" value={it.quantidade} onChange={(e) => setItem(i, 'quantidade', e.target.value)} />
                <input value={it.unidade} onChange={(e) => setItem(i, 'unidade', e.target.value)} />
                <input type="number" min="0" step="any" value={it.valor_unit} onChange={(e) => setItem(i, 'valor_unit', e.target.value)} />
                <button type="button" className="btn btn-danger btn-sm" onClick={() => delItem(i)}>×</button>
              </div>
            ))}
            <button type="button" className="btn btn-sec btn-sm mt" onClick={addItem}>+ Adicionar item</button>
            <div className="mt" style={{ textAlign: 'right', fontWeight: 700, color: '#12263a' }}>
              Estimativa: R$ {total.toFixed(2)}
            </div>
          </div>

          <button className="btn">Criar requisição</button>
        </form>
      </div>
    </>
  );
}
