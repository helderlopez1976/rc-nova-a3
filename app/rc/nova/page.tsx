'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';

interface Item {
  descricao: string; quantidade: string; unidade: string;
  valor_unitario: string; total: string; ultima_compra: string;
}

const TIPOS = ['Compra de Material', 'Prestação de Serviço', 'Material + Serviço'];
const SETORES = ['Produção', 'Logística', 'Administração', 'Manutenção', 'Qualidade', 'Comercial', 'TI', 'PCP', 'Financeiro', 'RH', 'SSMA', 'Outros'];

function brToFloat(s: string): number {
  s = (s || '').replace(/[^\d.,-]/g, '');
  if (!s) return 0;
  s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
function floatToBr(n: number): string {
  return Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function itemVazio(): Item {
  return { descricao: '', quantidade: '1,00', unidade: 'un', valor_unitario: '0,00', total: '0,00', ultima_compra: '' };
}

export default function NovaRC() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('Compra de Material');
  const [setor, setSetor] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [itens, setItens] = useState<Item[]>([itemVazio()]);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const hoje = new Date().toLocaleDateString('pt-BR');

  useEffect(() => {
    fetch('/api/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d) { setNome(d.nome); setEmail(d.email); if (d.setor) setSetor(d.setor); }
    });
  }, []);

  function setItem(i: number, campo: keyof Item, v: string) {
    const novo = [...itens];
    novo[i][campo] = v;
    const q = brToFloat(novo[i].quantidade);
    const vu = brToFloat(novo[i].valor_unitario);
    novo[i].total = floatToBr(q * vu);
    setItens(novo);
  }
  function blurMoney(i: number, campo: keyof Item) {
    const novo = [...itens];
    novo[i][campo] = floatToBr(brToFloat(novo[i][campo]));
    setItens(novo);
  }
  function addRow() { setItens([...itens, itemVazio()]); }
  function delRow(i: number) {
    if (itens.length <= 1) { alert('Não é possível remover o último item!'); return; }
    if (confirm('Remover este item?')) setItens(itens.filter((_, idx) => idx !== i));
  }

  const grandTotal = itens.reduce((a, it) => a + brToFloat(it.quantidade) * brToFloat(it.valor_unitario), 0);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setOk('');
    if (!setor) { setErro('Selecione o setor solicitante.'); return; }
    const itensPayload = itens.map(it => ({
      descricao: it.descricao,
      quantidade: brToFloat(it.quantidade),
      unidade: it.unidade,
      valor_unitario: brToFloat(it.valor_unitario),
      total: brToFloat(it.quantidade) * brToFloat(it.valor_unitario),
      ultima_compra: brToFloat(it.ultima_compra),
    }));
    const msg = `Confirmar envio da Requisição de Compras?\n\nTotal de itens: ${itens.length}\nValor total: R$ ${floatToBr(grandTotal)}`;
    if (!confirm(msg)) return;

    const r = await fetch('/api/rc', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo_solicitacao: tipo, setor, justificativa, itens: itensPayload }),
    });
    if (r.ok) { const d = await r.json(); setOk(`Requisição ${d.protocolo} enviada!`); setTimeout(() => router.push(`/rc/${d.id}`), 900); }
    else { const d = await r.json(); setErro(d.error || 'Erro ao enviar'); }
  }

  return (
    <>
      <TopBar papel="user" />
      <div className="page-wrapper">
        <div className="page">
          {erro && <div className="alert alert-error">{erro}</div>}
          {ok && <div className="alert alert-success">{ok}</div>}

          <div className="doc-header">
            <div className="logo"><div className="logo-txt">NOVA·A3</div></div>
            <div className="title-section">
              <h1>REQUISIÇÃO DE COMPRAS</h1>
              <div className="subtitle">Nova A3 - Sistema de Gestão de Compras</div>
            </div>
            <div className="spacer" />
          </div>

          <form id="rcForm" onSubmit={enviar}>
            <div className="info-grid">
              <div className="info-box">
                <label>Nº Requisição (RC/Protocolo)</label>
                <div className="static-value">Gerado automaticamente</div>
              </div>
              <div className="info-box">
                <label>Data</label>
                <div className="static-value">{hoje}</div>
              </div>
              <div className="info-box">
                <label>Tipo de Solicitação</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)} required>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="info-box">
                <label>Setor Solicitante</label>
                <select value={setor} onChange={e => setSetor(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {SETORES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="info-grid-row2">
              <div className="info-box">
                <label>Solicitante</label>
                <div className="static-value"><strong>{nome}</strong>{email ? ` - ${email}` : ''}</div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Utilização / Justificativa</div>
              <div className="section-content">
                <textarea value={justificativa} onChange={e => setJustificativa(e.target.value)} required
                  placeholder="Descreva a utilização/justificativa (obrigatório)" />
                <div className="hint">Campo obrigatório - Explique a necessidade dos itens</div>
              </div>
            </div>

            <div className="section">
              <div className="section-title">Itens Solicitados</div>
              <div className="table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Especificação / Descrição Detalhada</th>
                      <th style={{ width: '8%' }}>Quant.</th>
                      <th style={{ width: '8%' }}>Un</th>
                      <th style={{ width: '12%' }}>Valor Estimado (R$)</th>
                      <th style={{ width: '12%' }}>Total (R$)</th>
                      <th style={{ width: '12%' }}>Última Compra (R$)</th>
                      <th style={{ width: '8%', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((it, i) => (
                      <tr key={i}>
                        <td data-label="Descrição">
                          <textarea value={it.descricao} onChange={e => setItem(i, 'descricao', e.target.value)} required maxLength={800}
                            placeholder="Descreva detalhadamente o item/serviço: marca, modelo, características técnicas, finalidade, etc." />
                        </td>
                        <td data-label="Quant."><input type="text" className="right" value={it.quantidade}
                          onChange={e => setItem(i, 'quantidade', e.target.value)} onBlur={() => blurMoney(i, 'quantidade')} required /></td>
                        <td data-label="Un"><input type="text" value={it.unidade} onChange={e => setItem(i, 'unidade', e.target.value)} maxLength={20} required /></td>
                        <td data-label="Valor Unit."><input type="text" className="right" value={it.valor_unitario}
                          onChange={e => setItem(i, 'valor_unitario', e.target.value)} onBlur={() => blurMoney(i, 'valor_unitario')} /></td>
                        <td data-label="Total"><input type="text" className="right total_show" value={it.total} readOnly /></td>
                        <td data-label="Últ. Compra"><input type="text" className="right" value={it.ultima_compra}
                          onChange={e => setItem(i, 'ultima_compra', e.target.value)} onBlur={() => blurMoney(i, 'ultima_compra')} /></td>
                        <td style={{ textAlign: 'center' }}><button type="button" className="btn-remove" onClick={() => delRow(i)}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="add-item-btn" onClick={addRow}>+ Adicionar Item</button>
            </div>

            <div className="total-section">
              <div className="total-box">
                <div className="label">Total Geral (R$)</div>
                <div className="value">{floatToBr(grandTotal)}</div>
              </div>
            </div>

            <div className="actions">
              <button type="submit" className="btn btn-success">Enviar Requisição</button>
              <a href="/my" className="btn btn-secondary">Voltar</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
