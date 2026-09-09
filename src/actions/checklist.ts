'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function toggleChecklistAction(formData: FormData) {
  const user = getCurrentUser();
  if (!user) return;
  const itemId = String(formData.get('itemId') || '');
  if (!itemId) return;

  const current = db
    .prepare('SELECT done FROM checklist_state WHERE user_id = ? AND item_id = ?')
    .get(user.id, itemId) as { done: number } | undefined;

  const novoEstado = current ? (current.done ? 0 : 1) : 1;

  db.prepare(
    `INSERT INTO checklist_state (user_id, item_id, done) VALUES (?, ?, ?)
     ON CONFLICT(user_id, item_id) DO UPDATE SET done = excluded.done`
  ).run(user.id, itemId, novoEstado);

  revalidatePath('/checklist');
}
