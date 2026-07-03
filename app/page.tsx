import { redirect } from 'next/navigation';
import { lerSessao } from '@/lib/auth';

export default async function Home() {
  const s = await lerSessao();
  if (!s) redirect('/login');
  if (['compras', 'financeiro', 'admin_root'].includes(s.papel)) redirect('/painel');
  redirect('/my');
}
