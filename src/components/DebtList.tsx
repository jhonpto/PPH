'use client';

import { deleteDebtAction } from '@/actions/debts';

export interface DebtRow {
  id: number;
  nome: string;
  tipo: string;
  saldo: number;
  taxa_mensal: number;
  minimo: number;
}

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function DebtList({ debts }: { debts: DebtRow[] }) {
  if (debts.length === 0) {
    return (
      <p className="card text-center text-neutral-500">
        Nenhuma dívida cadastrada ainda. Adicione a primeira para calcular sua Data da Virada.
      </p>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-black/5 text-neutral-500">
            <th className="pb-2 font-medium">Dívida</th>
            <th className="pb-2 font-medium">Saldo</th>
            <th className="pb-2 font-medium">Juro/mês</th>
            <th className="pb-2 font-medium">Mínimo</th>
            <th className="pb-2 print:hidden"></th>
          </tr>
        </thead>
        <tbody>
          {debts.map((d) => (
            <tr key={d.id} className="border-b border-black/5 last:border-0">
              <td className="py-3 font-medium">{d.nome}</td>
              <td className="py-3">{brl(d.saldo)}</td>
              <td className="py-3">{d.taxa_mensal.toFixed(2)}%</td>
              <td className="py-3">{brl(d.minimo)}</td>
              <td className="py-3 text-right print:hidden">
                <form action={deleteDebtAction}>
                  <input type="hidden" name="id" value={d.id} />
                  <button type="submit" className="text-neutral-400 hover:text-magenta" title="Remover">
                    ✕
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
