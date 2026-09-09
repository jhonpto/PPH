import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { calcularDataVirada, formatarMesAno } from '@/lib/calc';
import { DebtForm } from '@/components/DebtForm';
import { DebtList, type DebtRow } from '@/components/DebtList';
import { ExtraForm } from '@/components/ExtraForm';
import { PayoffChart } from '@/components/PayoffChart';
import { ExportPdfButton } from '@/components/ExportPdfButton';
import { ImportSimulationBanner } from '@/components/ImportSimulationBanner';
import { exampleDebts, exampleExtraMensal } from '@/lib/exampleDebts';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;
  const rawDebts = await query<{
    id: number;
    nome: string;
    tipo: string;
    saldo: string;
    taxa_mensal: string;
    minimo: string;
  }>('SELECT id, nome, tipo, saldo, taxa_mensal, minimo FROM debts WHERE user_id = $1 ORDER BY created_at', [
    user.id,
  ]);
  const debts: DebtRow[] = rawDebts.map((d) => ({
    id: d.id,
    nome: d.nome,
    tipo: d.tipo,
    saldo: Number(d.saldo),
    taxa_mensal: Number(d.taxa_mensal),
    minimo: Number(d.minimo),
  }));

  const resultado = calcularDataVirada(
    debts.map((d) => ({ id: d.id, nome: d.nome, saldo: d.saldo, taxaMensal: d.taxa_mensal, minimo: d.minimo })),
    user.extra_mensal
  );

  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const exemplo =
    debts.length === 0
      ? calcularDataVirada(
          exampleDebts.map((d) => ({ id: d.id, nome: d.nome, saldo: d.saldo, taxaMensal: d.taxaMensal, minimo: d.minimo })),
          exampleExtraMensal
        )
      : null;

  return (
    <div className="space-y-8">
      <div className="hidden print:block">
        <p className="font-script text-2xl text-gold">Data da Virada</p>
        <p className="text-sm text-neutral-500">Plano de {user.name} — gerado em {hoje}</p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Sua Matriz de Realocação de Pagamentos</h1>
          <p className="mt-2 text-neutral-600">
            Cadastre todas as suas dívidas para descobrir sua Data da Virada — o mês em que você fica livre delas.
          </p>
        </div>
        {resultado && <ExportPdfButton />}
      </div>

      <div className="print:hidden">
        <ImportSimulationBanner />
      </div>

      {exemplo && (
        <div className="print:hidden">
          <div className="mb-2 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
            EXEMPLO ILUSTRATIVO
          </div>
          <div className="card bg-gradient-to-br from-magenta to-magenta-dark text-white opacity-90">
            <p className="font-script text-xl text-blush">com dívidas parecidas, a data da virada seria</p>
            <h2 className="mt-1 text-3xl capitalize !text-white sm:text-4xl">{formatarMesAno(exemplo.dataVirada)}</h2>
            <p className="mt-2 text-sm text-blush/90">
              Exemplo com cheque especial + cartão rotativo e R$ {exampleExtraMensal} extra por mês. Adicione suas
              dívidas reais abaixo para ver a sua.
            </p>
          </div>
        </div>
      )}

      {resultado && (
        <div className="card bg-gradient-to-br from-magenta to-magenta-dark text-white print:!bg-none print:!bg-white print:!text-magenta-dark print:ring-1 print:ring-magenta/30">
          {resultado.comEstrategia.estagnado ? (
            <>
              <p className="font-script text-xl text-blush print:text-gold">com o valor atual, o jogo não fecha</p>
              <h2 className="mt-1 text-2xl !text-white print:!text-magenta-dark">
                Seus pagamentos mínimos não cobrem nem os juros. Aumente o valor extra mensal ou renegocie as taxas.
              </h2>
            </>
          ) : (
            <>
              <p className="font-script text-2xl text-blush print:text-gold">sua data da virada é</p>
              <h2 className="mt-1 text-4xl capitalize !text-white sm:text-5xl print:!text-magenta-dark">
                {formatarMesAno(resultado.dataVirada)}
              </h2>
              <p className="mt-3 text-blush/90 print:text-neutral-700">
                Isso é daqui a <strong>{resultado.comEstrategia.meses} meses</strong>, pagando um total de{' '}
                <strong>{brl(resultado.comEstrategia.totalJuros)}</strong> em juros.
              </p>
              {resultado.mesesAntecipados === -1 && (
                <p className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-sm print:bg-blush print:text-neutral-700">
                  Sem a Matriz, ao menos uma dessas dívidas nunca seria quitada só com o pagamento mínimo — o juro come tudo.
                </p>
              )}
              {resultado.mesesAntecipados > 0 && (
                <p className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-sm print:bg-blush print:text-neutral-700">
                  Isso é <strong>{resultado.mesesAntecipados} meses mais rápido</strong> do que pagando cada dívida
                  separadamente, sem realocar nada.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {resultado && (
        <PayoffChart
          comEstrategia={resultado.comEstrategia.pontosCronograma}
          semEstrategia={resultado.semEstrategia.pontosCronograma}
        />
      )}

      <div className="print:hidden">
        <ExtraForm extraMensal={user.extra_mensal} />
      </div>
      <div className="print:hidden">
        <DebtForm />
        <p className="mt-2 text-center text-xs text-neutral-500">🔒 Seus dados ficam privados, vinculados só à sua conta.</p>
      </div>
      <DebtList debts={debts} />
    </div>
  );
}
