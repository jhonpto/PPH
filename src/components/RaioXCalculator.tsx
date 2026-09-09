'use client';

import { useState } from 'react';
import { calcularRaioXChequeEspecial } from '@/lib/calc';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function RaioXCalculator() {
  const [saldo, setSaldo] = useState('1000');
  const [taxa, setTaxa] = useState('8');

  const saldoNum = Number(saldo) || 0;
  const taxaNum = Number(taxa) || 0;
  const resultado = calcularRaioXChequeEspecial(saldoNum, taxaNum);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card space-y-4">
        <div>
          <label className="label-field">Quanto você usa do limite (R$)</label>
          <input
            className="input-field"
            type="number"
            min="0"
            step="0.01"
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Juro mensal do cheque especial / rotativo (%)</label>
          <input
            className="input-field"
            type="number"
            min="0"
            step="0.01"
            value={taxa}
            onChange={(e) => setTaxa(e.target.value)}
          />
          <p className="mt-1 text-xs text-neutral-500">Não sabe a taxa exata? Olhe o contrato ou o app do banco — costuma ficar entre 6% e 15% ao mês.</p>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-gold to-gold-light text-white">
        <p className="font-script text-xl">isso está custando</p>
        <p className="mt-1 text-3xl font-black !text-white">{brl(resultado.jurosMensalReais)} <span className="text-lg font-normal">por mês</span></p>
        <div className="mt-4 space-y-1 text-sm text-white/90">
          <p>Em 1 ano, isso vira <strong>{brl(resultado.jurosAnualReais)}</strong> só de juros.</p>
          <p>Taxa efetiva anual: <strong>{resultado.jurosAnualPercentual.toFixed(1)}%</strong>.</p>
        </div>
        <p className="mt-4 text-xs text-white/80">
          Alerta gentil: não é para assustar, é para decidir com clareza. Esse valor some assim que a dívida é
          quitada — é ele que a Matriz de Realocação prioriza eliminar primeiro.
        </p>
      </div>
    </div>
  );
}
