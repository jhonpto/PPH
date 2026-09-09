import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { calcularDataVirada, formatarMesAno } from '@/lib/calc';
import { DebtForm } from '@/components/DebtForm';
import { DebtList, type DebtRow } from '@/components/DebtList';
import { ExtraForm } from '@/components/ExtraForm';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function DashboardPage() {
  const user = getCurrentUser()!;
  const debts = db
    .prepare('SELECT id, nome, tipo, saldo, taxa_mensal, minimo FROM debts WHERE user_id = ? ORDER BY created_at')
    .all(user.id) as DebtRow[];

  const resultado = calcularDataVirada(
    debts.map((d) => ({ id: d.id, nome: d.nome, saldo: d.saldo, taxaMensal: d.taxa_mensal, minimo: d.minimo })),
    user.extra_mensal
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Sua Matriz de Realocação de Pagamentos</h1>
        <p className="mt-2 text-neutral-600">
          Cadastre todas as suas dívidas para descobrir sua Data da Virada — o mês em que você fica livre delas.
        </p>
      </div>

      {resultado && (
        <div className="card bg-gradient-to-br from-magenta to-magenta-dark text-white">
          {resultado.comEstrategia.estagnado ? (
            <>
              <p className="font-script text-xl text-blush">com o valor atual, o jogo não fecha</p>
              <h2 className="mt-1 text-2xl !text-white">
                Seus pagamentos mínimos não cobrem nem os juros. Aumente o valor extra mensal ou renegocie as taxas.
              </h2>
            </>
          ) : (
            <>
              <p className="font-script text-2xl text-blush">sua data da virada é</p>
              <h2 className="mt-1 text-4xl capitalize !text-white sm:text-5xl">
                {formatarMesAno(resultado.dataVirada)}
              </h2>
              <p className="mt-3 text-blush/90">
                Isso é daqui a <strong>{resultado.comEstrategia.meses} meses</strong>, pagando um total de{' '}
                <strong>{brl(resultado.comEstrategia.totalJuros)}</strong> em juros.
              </p>
              {resultado.mesesAntecipados === -1 && (
                <p className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
                  Sem a Matriz, ao menos uma dessas dívidas nunca seria quitada só com o pagamento mínimo — o juro come tudo.
                </p>
              )}
              {resultado.mesesAntecipados > 0 && (
                <p className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
                  Isso é <strong>{resultado.mesesAntecipados} meses mais rápido</strong> do que pagando cada dívida
                  separadamente, sem realocar nada.
                </p>
              )}
            </>
          )}
        </div>
      )}

      <ExtraForm extraMensal={user.extra_mensal} />
      <DebtForm />
      <DebtList debts={debts} />
    </div>
  );
}
