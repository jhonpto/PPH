'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { calcularDataVirada, formatarMesAno } from '@/lib/calc';
import { exampleDebts, exampleExtraMensal, type SimDebt } from '@/lib/exampleDebts';
import { PayoffChart } from '@/components/PayoffChart';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function DebtSimulator({
  persistKey,
  ctaHref,
  ctaLabel,
}: {
  persistKey?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [debts, setDebts] = useState<SimDebt[]>(exampleDebts);
  const [extraMensal, setExtraMensal] = useState(exampleExtraMensal);
  const nextId = useRef(100);
  const [nome, setNome] = useState('');
  const [saldo, setSaldo] = useState('');
  const [taxaMensal, setTaxaMensal] = useState('');
  const [minimo, setMinimo] = useState('');

  useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.debts) && parsed.debts.length > 0) {
          setDebts(parsed.debts);
          nextId.current = Math.max(...parsed.debts.map((d: SimDebt) => d.id)) + 1;
        }
        if (typeof parsed.extraMensal === 'number') setExtraMensal(parsed.extraMensal);
      }
      // eslint-disable-next-line no-empty
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!persistKey) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify({ debts, extraMensal }));
      // eslint-disable-next-line no-empty
    } catch {}
  }, [debts, extraMensal, persistKey]);

  const resultado = useMemo(
    () =>
      calcularDataVirada(
        debts.map((d) => ({ id: d.id, nome: d.nome, saldo: d.saldo, taxaMensal: d.taxaMensal, minimo: d.minimo })),
        extraMensal
      ),
    [debts, extraMensal]
  );

  function addDebt() {
    const saldoNum = Number(saldo);
    const taxaNum = Number(taxaMensal);
    const minimoNum = Number(minimo);
    if (!nome.trim() || !(saldoNum > 0) || !(taxaNum >= 0) || !(minimoNum >= 0)) return;
    setDebts((prev) => [...prev, { id: nextId.current++, nome: nome.trim(), saldo: saldoNum, taxaMensal: taxaNum, minimo: minimoNum }]);
    setNome('');
    setSaldo('');
    setTaxaMensal('');
    setMinimo('');
  }

  function removeDebt(id: number) {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-6">
      {resultado && (
        <div className="card bg-gradient-to-br from-magenta to-magenta-dark text-white">
          {resultado.comEstrategia.estagnado ? (
            <>
              <p className="font-script text-xl text-blush">com esses valores, o jogo não fecha</p>
              <h2 className="mt-1 text-xl !text-white sm:text-2xl">
                Os pagamentos mínimos não cobrem nem os juros. Aumente o valor extra mensal na simulação.
              </h2>
            </>
          ) : (
            <>
              <p className="font-script text-xl text-blush">sua data da virada seria</p>
              <h2 className="mt-1 text-3xl capitalize !text-white sm:text-4xl">{formatarMesAno(resultado.dataVirada)}</h2>
              <p className="mt-2 text-sm text-blush/90">
                {resultado.comEstrategia.meses} meses, {brl(resultado.comEstrategia.totalJuros)} em juros no total.
              </p>
              {resultado.mesesAntecipados > 0 && (
                <p className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-xs">
                  {resultado.mesesAntecipados} meses mais rápido do que pagando cada dívida separadamente.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {resultado && (
        <PayoffChart comEstrategia={resultado.comEstrategia.pontosCronograma} semEstrategia={resultado.semEstrategia.pontosCronograma} />
      )}

      <div className="card">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base">Suas dívidas (edite à vontade — é só uma simulação)</h3>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="sim-extra" className="text-neutral-500">Extra/mês:</label>
            <input
              id="sim-extra"
              type="number"
              min="0"
              step="0.01"
              value={extraMensal}
              onChange={(e) => setExtraMensal(Number(e.target.value) || 0)}
              className="input-field !py-1.5 !px-2 w-24"
            />
          </div>
        </div>

        {debts.length > 0 && (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-neutral-500">
                  <th className="pb-2 font-medium">Dívida</th>
                  <th className="pb-2 font-medium">Saldo</th>
                  <th className="pb-2 font-medium">Juro/mês</th>
                  <th className="pb-2 font-medium">Mínimo</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.id} className="border-b border-black/5 last:border-0">
                    <td className="py-2 font-medium">{d.nome}</td>
                    <td className="py-2">{brl(d.saldo)}</td>
                    <td className="py-2">{d.taxaMensal.toFixed(2)}%</td>
                    <td className="py-2">{brl(d.minimo)}</td>
                    <td className="py-2 text-right">
                      <button type="button" onClick={() => removeDebt(d.id)} className="text-neutral-400 hover:text-magenta" title="Remover">
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-4">
          <input className="input-field sm:col-span-1" placeholder="Nome da dívida" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input className="input-field" type="number" min="0" step="0.01" placeholder="Saldo (R$)" value={saldo} onChange={(e) => setSaldo(e.target.value)} />
          <input className="input-field" type="number" min="0" step="0.01" placeholder="Juro mensal (%)" value={taxaMensal} onChange={(e) => setTaxaMensal(e.target.value)} />
          <input className="input-field" type="number" min="0" step="0.01" placeholder="Mínimo (R$)" value={minimo} onChange={(e) => setMinimo(e.target.value)} />
        </div>
        <button type="button" onClick={addDebt} className="btn-secondary mt-3 w-full sm:w-auto">
          Adicionar dívida à simulação
        </button>
      </div>

      {ctaHref && (
        <div className="card bg-blush-dark text-center">
          <p className="text-neutral-700">Gostou do resultado? Crie uma conta grátis pra salvar esse plano e acompanhar mês a mês.</p>
          <Link href={ctaHref} className="btn-primary mt-3 inline-flex">
            {ctaLabel ?? 'Criar conta grátis e salvar meu plano'}
          </Link>
          <p className="mt-2 text-xs text-neutral-500">🔒 Seus dados ficam privados, vinculados só à sua conta.</p>
        </div>
      )}
    </div>
  );
}
