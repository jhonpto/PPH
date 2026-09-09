'use client';

import { useRef } from 'react';
import { addDebtAction } from '@/actions/debts';

const TIPOS = [
  { value: 'rotativo', label: 'Cartão rotativo' },
  { value: 'cheque_especial', label: 'Cheque especial' },
  { value: 'cdc', label: 'CDC de loja' },
  { value: 'financiamento', label: 'Financiamento' },
  { value: 'boleto_parcelado', label: 'Boleto parcelado' },
  { value: 'outra', label: 'Outra dívida' },
];

export function DebtForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addDebtAction(formData);
        formRef.current?.reset();
      }}
      className="card grid gap-4 sm:grid-cols-2"
    >
      <h3 className="sm:col-span-2 text-base">Adicionar dívida</h3>

      <div>
        <label className="label-field">Nome / apelido</label>
        <input className="input-field" name="nome" placeholder="Ex: Nubank rotativo" required />
      </div>

      <div>
        <label className="label-field">Tipo</label>
        <select className="input-field" name="tipo" defaultValue="rotativo">
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Saldo devedor (R$)</label>
        <input className="input-field" name="saldo" type="number" step="0.01" min="0.01" placeholder="1500.00" required />
      </div>

      <div>
        <label className="label-field">Juro mensal (%)</label>
        <input className="input-field" name="taxaMensal" type="number" step="0.01" min="0" placeholder="12.5" required />
      </div>

      <div className="sm:col-span-2">
        <label className="label-field">Pagamento mínimo mensal (R$)</label>
        <input className="input-field" name="minimo" type="number" step="0.01" min="0" placeholder="150.00" required />
      </div>

      <button type="submit" className="btn-primary sm:col-span-2">Adicionar à Matriz</button>
    </form>
  );
}
