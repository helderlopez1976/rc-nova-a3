import { sql } from './db';

// Notificação de painel (sem e-mail). O corte de e-mail que você pediu já
// nasce embutido aqui: nada de e-mail por mudança de status, tudo vai para
// o painel/sino do usuário.
export async function notificar(
  userId: number,
  requisicaoId: number | null,
  titulo: string,
  mensagem: string
) {
  await sql`
    INSERT INTO rc_notificacoes (user_id, requisicao_id, titulo, mensagem)
    VALUES (${userId}, ${requisicaoId}, ${titulo}, ${mensagem})`;
}

export async function notificarPapel(
  papeis: string[],
  requisicaoId: number | null,
  titulo: string,
  mensagem: string
) {
  const users = await sql`SELECT id FROM rc_users WHERE papel = ANY(${papeis})`;
  for (const u of users) {
    await notificar(u.id, requisicaoId, titulo, mensagem);
  }
}
