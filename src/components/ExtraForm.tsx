'use client';

import { updateExtraAction } from '@/actions/debts';

export function ExtraForm({ extraMensal }: { extraMensal: number }) {
  return (
    <form action={updateExtraAction} className="card flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px]">
        <label className="label-field">Quanto você consegue pagar A MAIS por mês? (R$)</label>
        <input
          className="input-field"
          name="extraMensal"
          type="number"
          step="0.01"
          min="0"
          defaultValue={extraMensal || ''}
          placeholder="0.00"
        />
      </div>
      <button type="submit" className="btn-secondary">Atualizar</button>
    </form>
  );
}
