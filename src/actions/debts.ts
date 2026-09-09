'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function addDebtAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const nome = String(formData.get('nome') || '').trim();
  const tipo = String(formData.get('tipo') || 'outra');
  const saldo = Number(formData.get('saldo'));
  const taxaMensal = Number(formData.get('taxaMensal'));
  const minimo = Number(formData.get('minimo'));

  if (!nome || !(saldo > 0) || !(taxaMensal >= 0) || !(minimo >= 0)) return;

  await query(
    'INSERT INTO debts (user_id, nome, tipo, saldo, taxa_mensal, minimo) VALUES ($1, $2, $3, $4, $5, $6)',
    [user.id, nome, tipo, saldo, taxaMensal, minimo]
  );

  revalidatePath('/dashboard');
}

export async function deleteDebtAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const id = Number(formData.get('id'));
  await query('DELETE FROM debts WHERE id = $1 AND user_id = $2', [id, user.id]);
  revalidatePath('/dashboard');
}

export async function updateExtraAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const extra = Number(formData.get('extraMensal')) || 0;
  await query('UPDATE users SET extra_mensal = $1 WHERE id = $2', [extra, user.id]);
  revalidatePath('/dashboard');
}
