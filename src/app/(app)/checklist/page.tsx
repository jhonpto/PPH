import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { blocosChecklist } from '@/lib/checklistItems';
import { ChecklistBlock } from '@/components/ChecklistBlock';

export default function ChecklistPage() {
  const user = getCurrentUser()!;
  const rows = db
    .prepare('SELECT item_id FROM checklist_state WHERE user_id = ? AND done = 1')
    .all(user.id) as { item_id: string }[];
  const doneIds = new Set(rows.map((r) => r.item_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Checklist de execução</h1>
        <p className="mt-2 text-neutral-600">Marque o que já foi feito. Seu progresso fica salvo na sua conta.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {blocosChecklist.map((bloco) => (
          <ChecklistBlock key={bloco.titulo} bloco={bloco} doneIds={doneIds} />
        ))}
      </div>
    </div>
  );
}
