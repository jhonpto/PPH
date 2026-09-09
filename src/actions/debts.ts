'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function addDebtAction(formData: FormData) {
  const user = getCurrentUser();
  if (!user) return;

  const nome = String(formData.get('nome') || '').trim();
  const tipo = String(formData.get('tipo') || 'outra');
  const saldo = Number(formData.get('saldo'));
  const taxaMensal = Number(formData.get('taxaMensal'));
  const minimo = Number(formData.get('minimo'));

  if (!nome || !(saldo > 0) || !(taxaMensal >= 0) || !(minimo >= 0)) return;

  db.prepare(
    'INSERT INTO debts (user_id, nome, tipo, saldo, taxa_mensal, minimo) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(user.id, nome, tipo, saldo, taxaMensal, minimo);

  revalidatePath('/dashboard');
}

export async function deleteDebtAction(formData: FormData) {
  const user = getCurrentUser();
  if (!user) return;
  const id = Number(formData.get('id'));
  db.prepare('DELETE FROM debts WHERE id = ? AND user_id = ?').run(id, user.id);
  revalidatePath('/dashboard');
}

export async function updateExtraAction(formData: FormData) {
  const user = getCurrentUser();
  if (!user) return;
  const extra = Number(formData.get('extraMensal')) || 0;
  db.prepare('UPDATE users SET extra_mensal = ? WHERE id = ?').run(extra, user.id);
  revalidatePath('/dashboard');
}
