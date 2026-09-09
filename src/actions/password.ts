'use server';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { hashToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export interface ForgotPasswordState {
  error?: string;
  sent?: boolean;
  devResetUrl?: string;
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!email) return { error: 'Informe seu e-mail.' };

  const users = await query<{ id: number }>('SELECT id FROM users WHERE email = $1', [email]);

  // Sempre responde com sucesso, mesmo se o e-mail nao existir, para nao revelar quais contas existem.
  if (users.length === 0) {
    return { sent: true };
  }

  const rawToken = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await query(
    'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
    [hashToken(rawToken), users[0].id, expiresAt]
  );

  const resetUrl = `${getBaseUrl()}/redefinir-senha?token=${rawToken}`;
  const emailEnviado = await sendPasswordResetEmail(email, resetUrl);

  if (emailEnviado) {
    return { sent: true };
  }

  // Sem servico de e-mail configurado (RESEND_API_KEY): mostra o link direto na tela
  // para nao travar o teste/uso do app.
  return { sent: true, devResetUrl: resetUrl };
}

export interface ResetPasswordState {
  error?: string;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');

  if (!token) return { error: 'Link inválido. Peça um novo link de redefinição.' };
  if (password.length < 6) return { error: 'A senha precisa ter pelo menos 6 caracteres.' };

  const rows = await query<{ user_id: number; expires_at: string }>(
    'SELECT user_id, expires_at FROM password_reset_tokens WHERE token_hash = $1',
    [hashToken(token)]
  );
  const row = rows[0];

  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return { error: 'Esse link expirou ou é inválido. Peça um novo link de redefinição.' };
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, row.user_id]);
  await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [row.user_id]);

  redirect('/login');
}
