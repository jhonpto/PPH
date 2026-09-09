'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function toggleChecklistAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const itemId = String(formData.get('itemId') || '');
  if (!itemId) return;

  const rows = await query<{ done: number }>(
    'SELECT done FROM checklist_state WHERE user_id = $1 AND item_id = $2',
    [user.id, itemId]
  );
  const novoEstado = rows[0] ? (rows[0].done ? 0 : 1) : 1;

  await query(
    `INSERT INTO checklist_state (user_id, item_id, done) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, item_id) DO UPDATE SET done = excluded.done`,
    [user.id, itemId, novoEstado]
  );

  revalidatePath('/checklist');
}
