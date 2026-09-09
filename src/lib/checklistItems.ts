export interface ChecklistItem {
  id: string;
  texto: string;
}

export interface ChecklistBloco {
  titulo: string;
  itens: ChecklistItem[];
}

export const blocosChecklist: ChecklistBloco[] = [
  {
    titulo: 'Primeira semana',
    itens: [
      { id: 'sem1-1', texto: 'Cadastrar todas as dívidas na Matriz (saldo, juro mensal, mínimo)' },
      { id: 'sem1-2', texto: 'Conferir saldo e juro de cada dívida na fatura ou extrato' },
      { id: 'sem1-3', texto: 'Definir quanto consigo pagar a mais por mês' },
      { id: 'sem1-4', texto: 'Ler o Guia da Virada, seções 1 a 3' },
    ],
  },
  {
    titulo: 'Primeiro mês',
    itens: [
      { id: 'mes1-1', texto: 'Pagar o mínimo em todas as dívidas, menos na prioridade' },
      { id: 'mes1-2', texto: 'Direcionar o valor extra + mínimos liberados para a dívida prioridade' },
      { id: 'mes1-3', texto: 'Guardar comprovante de cada pagamento feito' },
      { id: 'mes1-4', texto: 'Rodar o Raio-X do Cheque Especial, se for o seu caso' },
    ],
  },
  {
    titulo: 'A cada 90 dias',
    itens: [
      { id: 'q90-1', texto: 'Revisar saldos e taxas de todas as dívidas na Matriz' },
      { id: 'q90-2', texto: 'Conferir se a Data da Virada mudou' },
      { id: 'q90-3', texto: 'Ajustar o valor extra mensal se a renda mudou' },
      { id: 'q90-4', texto: 'Comemorar cada dívida quitada 🎉' },
    ],
  },
];
