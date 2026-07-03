import { redirect } from 'next/navigation';
import { lerSessao } from '@/lib/auth';

export default async function Home() {
  const s = await lerSessao();
  if (!s) redirect('/login');
  if (['compras', 'gestor', 'admin'].includes(s.papel)) redirect('/painel');
  redirect('/my');
}
