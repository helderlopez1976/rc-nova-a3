'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Notif { id: number; titulo: string; mensagem: string; lida: boolean; }

export default function TopBar({ papel }: { papel: string }) {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [aberto, setAberto] = useState(false);

  async function carregar() {
    try {
      const r = await fetch('/api/notificacoes');
      if (r.ok) { const d = await r.json(); setNotifs(d.notificacoes); setNaoLidas(d.naoLidas); }
    } catch {}
  }

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 8000); // polling a cada 8s (substitui e-mail e websocket)
    return () => clearInterval(t);
  }, []);

  async function abrir() {
    setAberto(!aberto);
    if (!aberto && naoLidas > 0) { await fetch('/api/notificacoes', { method: 'POST' }); setNaoLidas(0); }
  }

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const podePainel = ['compras', 'financeiro', 'admin_root'].includes(papel);

  return (
    <div className="topbar">
      <div className="brand">NOVA<span>·</span>A3 · RC</div>
      <nav>
        {podePainel && <a href="/painel">Painel</a>}
        <a href="/rc/nova">Nova RC</a>
        <div className="sino" onClick={abrir}>
          🔔{naoLidas > 0 && <span className="badge">{naoLidas}</span>}
        </div>
        <a onClick={sair} style={{ cursor: 'pointer' }}>Sair</a>
      </nav>
      {aberto && (
        <div className="painel-notif">
          {notifs.length === 0 && <div className="item"><div className="m">Sem notificações.</div></div>}
          {notifs.map((n) => (
            <div key={n.id} className={'item' + (n.lida ? '' : ' nao-lida')}>
              <div className="t">{n.titulo}</div>
              <div className="m">{n.mensagem}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
