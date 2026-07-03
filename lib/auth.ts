import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-troque');

export interface Sessao {
  id: number;
  nome: string;
  email: string;
  papel: string;
  setor?: string;
}

export async function criarToken(s: Sessao): Promise<string> {
  return await new SignJWT({ ...s })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(secret);
}

export async function lerSessao(): Promise<Sessao | null> {
  const token = cookies().get('rc_sessao')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as Sessao;
  } catch {
    return null;
  }
}
