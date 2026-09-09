'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { setSessionCookie, clearSessionCookie } from '@/lib/auth';

export interface AuthState {
  error?: string;
}

export async function registerAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!name || !email || !password) {
    return { error: 'Preencha nome, e-mail e senha.' };
  }
  if (password.length < 6) {
    return { error: 'A senha precisa ter pelo menos 6 caracteres.' };
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.length > 0) {
    return { error: 'Já existe uma conta com esse e-mail. Faça login.' };
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const rows = await query<{ id: number }>(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [name, email, passwordHash]
  );

  setSessionCookie(rows[0].id);
  redirect('/dashboard');
}

export async function loginAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const rows = await query<{ id: number; password_hash: string }>(
    'SELECT id, password_hash FROM users WHERE email = $1',
    [email]
  );
  const user = rows[0];

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { error: 'E-mail ou senha incorretos.' };
  }

  setSessionCookie(user.id);
  redirect('/dashboard');
}

export async function logoutAction() {
  clearSessionCookie();
  redirect('/login');
}
