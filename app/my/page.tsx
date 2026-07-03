'use client';
import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';

const CORES: Record<string, string> = {
  'Aberto': '#63abe1', 'Em Análise': '#e0a500', 'Em Cotação': '#7c5cbf',
  'Aguardando Aprovação': '#e0a500', 'Aprovada': '#2e9e5b', 'Reprovada': '#d64560',
  'Recebido': '#1a7a45', 'Cancelada': '#8a97a8',
};

export default function MinhasRC() {
  const [lista, setLista] = useState<any[]>([]);
  const [carregou, setCarregou] = useState(false);

  useEffect(() => {
    fetch('/api/rc').then(r => r.ok ? r.json() : []).then(d => { setLista(d); setCarregou(true); });
  }, []);

  return (
    <>
      <TopBar papel="solicitante" />
      <div className="wrap">
        <h1>Minhas Requisições</h1>
        <div className="sub">Acompanhe o andamento das suas RC</div>

        <div className="card">
          <a className="btn" href="/rc/nova">+ Nova Requisição</a>
        </div>

        <div className="card">
          {!carregou ? <p style={{ color: '#8a97a8' }}>Carregando...</p> :
            lista.length === 0 ? <p style={{ color: '#8a97a8' }}>Você ainda não tem requisições. Clique em "Nova Requisição".</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>Protocolo</th><th>Setor</th><th>Tipo</th><th>Valor est.</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {lista.map((r: any) => (
                      <tr key={r.id}>
                        <td><b>{r.protocolo}</b></td>
                        <td>{r.setor}</td>
                        <td>{r.tipo_solicitacao || '—'}</td>
                        <td>R$ {Number(r.valor_estimado).toFixed(2)}</td>
                        <td><span className="tag" style={{ background: CORES[r.status] || '#63abe1' }}>{r.status}</span></td>
                        <td><a className="btn btn-sec btn-sm" href={`/rc/${r.id}`}>Ver</a></td>
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
