'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';

const ROLES: Record<string, string> = {
  admin: '👑 Administrador',
  compras: '🛒 Compras',
  gestor: '📊 Gestor',
  tecnico: '🔧 Técnico',
  user: '👤 Usuário',
};
const SETORES = ['Produção', 'Logística', 'Administração', 'Manutenção', 'Qualidade', 'Comercial', 'TI', 'PCP', 'Financeiro', 'RH', 'SSMA', 'Outros'];

export default function Usuarios() {
  const [lista, setLista] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [novo, setNovo] = useState({ nome: '', email: '', papel: 'user', setor: '', senha: '' });

  async function carregar() {
    const r = await fetch('/api/usuarios');
    if (r.ok) setLista(await r.json());
    else setMsg('Acesso restrito a administradores.');
  }
  useEffect(() => { carregar(); }, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    const r = await fetch('/api/usuarios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo),
    });
    if (r.ok) { setMsg('Usuário cadastrado.'); setNovo({ nome: '', email: '', papel: 'user', setor: '', senha: '' }); carregar(); }
    else { const d = await r.json(); setMsg(d.error || 'Erro'); }
  }

  async function mudarPapel(id: number, papel: string) {
    const r = await fetch('/api/usuarios', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acao: 'papel', papel }),
    });
    if (r.ok) carregar(); else { const d = await r.json(); setMsg(d.error || 'Erro'); }
  }
  async function toggle(id: number) {
    const r = await fetch('/api/usuarios', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acao: 'toggle' }),
    });
    if (r.ok) carregar(); else { const d = await r.json(); setMsg(d.error || 'Erro'); }
  }
  async function resetSenha(id: number) {
    const senha = window.prompt('Nova senha para este usuário:');
    if (!senha) return;
    const r = await fetch('/api/usuarios', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acao: 'senha', senha }),
    });
    if (r.ok) setMsg('Senha redefinida.'); else { const d = await r.json(); setMsg(d.error || 'Erro'); }
  }

  return (
    <>
      <TopBar papel="admin" />
      <div className="wrap">
        <h1>Gestão de Usuários</h1>
        <div className="sub">Cadastre e defina o nível de acesso de cada pessoa</div>
        {msg && <div className="msg msg-info">{msg}</div>}

        <div className="card">
          <h2>Cadastrar novo usuário</h2>
          <form onSubmit={criar}>
            <div className="flex flex-wrap" style={{ gap: 12 }}>
              <div style={{ flex: 2, minWidth: 160 }}><label>Nome</label><input value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} required /></div>
              <div style={{ flex: 2, minWidth: 200 }}><label>E-mail</label><input type="email" value={novo.email} onChange={e => setNovo({ ...novo, email: e.target.value })} required /></div>
            </div>
            <div className="flex flex-wrap mt" style={{ gap: 12 }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <label>Nível de acesso</label>
                <select value={novo.papel} onChange={e => setNovo({ ...novo, papel: e.target.value })}>
                  {Object.keys(ROLES).map(k => <option key={k} value={k}>{ROLES[k]}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <label>Setor</label>
                <select value={novo.setor} onChange={e => setNovo({ ...novo, setor: e.target.value })}>
                  <option value="">—</option>
                  {SETORES.map(sx => <option key={sx} value={sx}>{sx}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}><label>Senha inicial</label><input type="text" value={novo.senha} onChange={e => setNovo({ ...novo, senha: e.target.value })} required /></div>
            </div>
            <button className="btn mt">Cadastrar usuário</button>
          </form>
        </div>

        <div className="card">
          <h2>Usuários</h2>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Nome</th><th>E-mail</th><th>Nível</th><th>Setor</th><th>Situação</th><th>Ações</th></tr></thead>
              <tbody>
                {lista.map(u => (
                  <tr key={u.id} style={u.ativo ? {} : { opacity: .5 }}>
                    <td><b>{u.nome}</b></td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.papel} onChange={e => mudarPapel(u.id, e.target.value)} style={{ padding: '6px 8px', fontSize: 13 }}>
                        {Object.keys(ROLES).map(k => <option key={k} value={k}>{ROLES[k]}</option>)}
                      </select>
                    </td>
                    <td>{u.setor || '—'}</td>
                    <td>{u.ativo ? <span className="tag" style={{ background: '#2e9e5b' }}>ativo</span> : <span className="tag" style={{ background: '#8a97a8' }}>inativo</span>}</td>
                    <td>
                      <div className="flex flex-wrap">
                        <button className="btn btn-sec btn-sm" onClick={() => toggle(u.id)}>{u.ativo ? 'Desativar' : 'Ativar'}</button>
                        <button className="btn btn-sec btn-sm" onClick={() => resetSenha(u.id)}>Senha</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
