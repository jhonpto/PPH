'use client';

import { toggleChecklistAction } from '@/actions/checklist';
import type { ChecklistBloco } from '@/lib/checklistItems';

export function ChecklistBlock({ bloco, doneIds }: { bloco: ChecklistBloco; doneIds: Set<string> }) {
  const totalDone = bloco.itens.filter((i) => doneIds.has(i.id)).length;

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg">{bloco.titulo}</h3>
        <span className="text-sm font-medium text-gold">{totalDone}/{bloco.itens.length}</span>
      </div>
      <ul className="space-y-2">
        {bloco.itens.map((item) => {
          const done = doneIds.has(item.id);
          return (
            <li key={item.id}>
              <form action={toggleChecklistAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <button
                  type="submit"
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-blush ${
                    done ? 'text-neutral-400 line-through' : 'text-neutral-700'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs ${
                      done ? 'border-magenta bg-magenta text-white' : 'border-neutral-300'
                    }`}
                  >
                    {done ? '✓' : ''}
                  </span>
                  {item.texto}
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
