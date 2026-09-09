export interface SimDebt {
  id: number;
  nome: string;
  saldo: number;
  taxaMensal: number;
  minimo: number;
}

export const exampleDebts: SimDebt[] = [
  { id: 1, nome: 'Cheque especial', saldo: 1800, taxaMensal: 9, minimo: 90 },
  { id: 2, nome: 'Cartão rotativo', saldo: 1300, taxaMensal: 13.5, minimo: 130 },
];

export const exampleExtraMensal = 150;
