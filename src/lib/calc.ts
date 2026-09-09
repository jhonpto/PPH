export interface DebtInput {
  id: number;
  nome: string;
  saldo: number;
  taxaMensal: number; // percentual, ex: 12.5
  minimo: number;
}

export interface SimulationResult {
  meses: number;
  totalJuros: number;
  estagnado: boolean;
  pontosCronograma: { mes: number; saldoTotal: number }[];
}

const MAX_MONTHS = 480; // 40 anos - teto de segurança

function simulateComEstrategia(debtsInput: DebtInput[], extraMensal: number): SimulationResult {
  const working = debtsInput.map((d) => ({ ...d }));
  let month = 0;
  let totalJuros = 0;
  const pontosCronograma: { mes: number; saldoTotal: number }[] = [];

  while (working.some((d) => d.saldo > 0.01) && month < MAX_MONTHS) {
    month++;

    for (const d of working) {
      if (d.saldo > 0) {
        const juros = d.saldo * (d.taxaMensal / 100);
        d.saldo += juros;
        totalJuros += juros;
      }
    }

    const ativos = working.filter((d) => d.saldo > 0).sort((a, b) => b.taxaMensal - a.taxaMensal);
    if (ativos.length === 0) break;
    const prioridade = ativos[0];

    let orcamentoRealocado = extraMensal;
    for (const d of working) {
      if (d.id === prioridade.id) continue;
      if (d.saldo > 0) {
        const pagamento = Math.min(d.minimo, d.saldo);
        d.saldo -= pagamento;
      } else {
        orcamentoRealocado += d.minimo;
      }
    }

    const pagamentoPrioridade = Math.min(prioridade.minimo + orcamentoRealocado, prioridade.saldo);
    prioridade.saldo -= pagamentoPrioridade;

    if (month % 1 === 0) {
      pontosCronograma.push({
        mes: month,
        saldoTotal: working.reduce((s, d) => s + Math.max(d.saldo, 0), 0),
      });
    }
  }

  return { meses: month, totalJuros, estagnado: month >= MAX_MONTHS, pontosCronograma };
}

function simulateSemEstrategia(debtsInput: DebtInput[], horizonMeses: number): SimulationResult {
  let maxMeses = 0;
  let totalJuros = 0;
  let estagnado = false;

  for (const original of debtsInput) {
    let saldo = original.saldo;
    let meses = 0;
    while (saldo > 0.01 && meses < MAX_MONTHS) {
      meses++;
      const juros = saldo * (original.taxaMensal / 100);
      saldo += juros;
      totalJuros += juros;
      const pagamento = Math.min(original.minimo, saldo);
      saldo -= pagamento;
      if (pagamento <= juros - 0.001) {
        // pagamento minimo nao cobre nem o juro: nunca quita
        estagnado = true;
        break;
      }
    }
    if (meses >= MAX_MONTHS || estagnado) {
      estagnado = true;
      meses = MAX_MONTHS;
    }
    maxMeses = Math.max(maxMeses, meses);
  }

  // Serie mes a mes (sem redirecionar pagamentos) so para comparacao visual no grafico.
  const working = debtsInput.map((d) => ({ ...d }));
  const pontosCronograma: { mes: number; saldoTotal: number }[] = [];
  for (let mes = 1; mes <= horizonMeses; mes++) {
    for (const d of working) {
      if (d.saldo <= 0) continue;
      const juros = d.saldo * (d.taxaMensal / 100);
      d.saldo += juros;
      const pagamento = Math.min(d.minimo, d.saldo);
      d.saldo -= pagamento;
    }
    pontosCronograma.push({ mes, saldoTotal: working.reduce((s, d) => s + Math.max(d.saldo, 0), 0) });
  }

  return { meses: maxMeses, totalJuros, estagnado, pontosCronograma };
}

export interface ComparativoResult {
  comEstrategia: SimulationResult;
  semEstrategia: SimulationResult;
  mesesAntecipados: number;
  dataVirada: Date;
}

export function calcularDataVirada(debts: DebtInput[], extraMensal: number, hoje: Date = new Date()): ComparativoResult | null {
  if (debts.length === 0) return null;

  const comEstrategia = simulateComEstrategia(debts, extraMensal);
  const horizonteGrafico = Math.max(comEstrategia.pontosCronograma.length, 1);
  const semEstrategia = simulateSemEstrategia(debts, horizonteGrafico);

  const dataVirada = new Date(hoje);
  dataVirada.setMonth(dataVirada.getMonth() + comEstrategia.meses);

  const mesesAntecipados = semEstrategia.estagnado
    ? comEstrategia.meses > 0
      ? -1 // sinaliza "infinito" - sem a estrategia nunca quita
      : 0
    : Math.max(0, semEstrategia.meses - comEstrategia.meses);

  return { comEstrategia, semEstrategia, mesesAntecipados, dataVirada };
}

export function formatarMesAno(data: Date): string {
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export interface RaioXResult {
  jurosMensalReais: number;
  jurosAnualReais: number;
  jurosAnualPercentual: number;
}

export function calcularRaioXChequeEspecial(saldoUsado: number, taxaMensalPercentual: number): RaioXResult {
  const jurosMensalReais = saldoUsado * (taxaMensalPercentual / 100);
  const taxaAnual = Math.pow(1 + taxaMensalPercentual / 100, 12) - 1;
  return {
    jurosMensalReais,
    jurosAnualReais: saldoUsado * taxaAnual,
    jurosAnualPercentual: taxaAnual * 100,
  };
}
