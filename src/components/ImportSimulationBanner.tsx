'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { importSimulatedDebtsAction, type ImportSimulationState } from '@/actions/debts';
import type { SimDebt } from '@/lib/exampleDebts';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'Importando...' : 'Importar para minha conta'}
    </button>
  );
}

export function ImportSimulationBanner() {
  const [saved, setSaved] = useState<{ debts: SimDebt[]; extraMensal: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [state, formAction] = useFormState<ImportSimulationState, FormData>(importSimulatedDebtsAction, {
    imported: 0,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ddv_anon_debts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.debts) && parsed.debts.length > 0) {
          setSaved({ debts: parsed.debts, extraMensal: Number(parsed.extraMensal) || 0 });
        }
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }, []);

  useEffect(() => {
    if (state.imported > 0) {
      try {
        localStorage.removeItem('ddv_anon_debts');
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }, [state.imported]);

  if (!saved || dismissed || state.imported > 0) return null;

  return (
    <div className="card border-2 border-gold/40 bg-blush">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-medium text-magenta-dark">
            Encontramos uma simulação que você fez antes de criar a conta ({saved.debts.length}{' '}
            {saved.debts.length === 1 ? 'dívida' : 'dívidas'}).
          </p>
          <p className="mt-1 text-sm text-neutral-600">Quer importar ela pra sua Matriz agora?</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setDismissed(true)} className="text-sm text-neutral-500 hover:underline">
            Ignorar
          </button>
          <form action={formAction}>
            <input type="hidden" name="debtsJson" value={JSON.stringify(saved.debts)} />
            <input type="hidden" name="extraMensal" value={saved.extraMensal} />
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
