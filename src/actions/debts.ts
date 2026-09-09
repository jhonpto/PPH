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

export interface ImportSimulationState {
  imported: number;
}

export async function importSimulatedDebtsAction(
  _prevState: ImportSimulationState,
  formData: FormData
): Promise<ImportSimulationState> {
  const user = await getCurrentUser();
  if (!user) return { imported: 0 };

  const existing = await query<{ count: string }>('SELECT COUNT(*) FROM debts WHERE user_id = $1', [user.id]);
  if (Number(existing[0].count) > 0) return { imported: 0 };

  let parsed: { nome: unknown; saldo: unknown; taxaMensal: unknown; minimo: unknown }[];
  try {
    parsed = JSON.parse(String(formData.get('debtsJson') || '[]'));
  } catch {
    return { imported: 0 };
  }
  if (!Array.isArray(parsed)) return { imported: 0 };

  let imported = 0;
  for (const d of parsed) {
    const nome = String(d.nome || '').trim();
    const saldo = Number(d.saldo);
    const taxaMensal = Number(d.taxaMensal);
    const minimo = Number(d.minimo);
    if (!nome || !(saldo > 0) || !(taxaMensal >= 0) || !(minimo >= 0)) continue;
    await query(
      'INSERT INTO debts (user_id, nome, tipo, saldo, taxa_mensal, minimo) VALUES ($1, $2, $3, $4, $5, $6)',
      [user.id, nome, 'outra', saldo, taxaMensal, minimo]
    );
    imported++;
  }

  const extraMensal = Number(formData.get('extraMensal'));
  if (imported > 0 && extraMensal > 0) {
    await query('UPDATE users SET extra_mensal = $1 WHERE id = $2', [extraMensal, user.id]);
  }

  if (imported > 0) revalidatePath('/dashboard');
  return { imported };
}
