import { NextResponse } from 'next/server';
import { lerSessao } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await lerSessao();
  if (!s) return NextResponse.json({ error: 'não autenticado' }, { status: 401 });
  return NextResponse.json({ id: s.id, nome: s.nome, email: s.email, papel: s.papel, setor: s.setor });
}
