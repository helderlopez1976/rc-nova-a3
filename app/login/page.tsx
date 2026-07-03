'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setCarregando(true);
    const r = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    setCarregando(false);
    if (r.ok) { router.push('/'); router.refresh(); }
    else { const d = await r.json(); setErro(d.error || 'Falha no login'); }
  }

  return (
    <div className="wrap">
      <div className="card login-box">
        <div className="brand" style={{ color: '#12263a', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
          NOVA·A3 <span style={{ color: '#63abe1' }}>RC</span>
        </div>
        <div className="sub">Requisições de Compra</div>
        {erro && <div className="msg msg-erro">{erro}</div>}
        <form onSubmit={entrar}>
          <div style={{ marginBottom: 14 }}>
            <label>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label>Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          <button className="btn" style={{ width: '100%' }} disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="msg msg-info mt" style={{ fontSize: 12 }}>
          Teste (senha <b>nova123</b>): hlopez@novaa3.com.br (admin), compras@novaa3.com.br, gestor@novaa3.com.br, tecnico@novaa3.com.br, usuario@novaa3.com.br
        </div>
      </div>
    </div>
  );
}
