export interface Secao {
  id: string;
  titulo: string;
  corpo: string[];
}

export const secoesGuia: Secao[] = [
  {
    id: 'sec-1',
    titulo: '1. Por que pagar em dia não é o mesmo que sair da dívida',
    corpo: [
      'Se você paga tudo em dia todo mês e mesmo assim a dívida não diminui, o problema não é falta de disciplina. É a ordem em que o dinheiro é distribuído entre as dívidas.',
      'Imagine que o carro quebra do nada e conserta custa R$ 800. Você paga no cartão, que já estava no rotativo. No mês seguinte, o mínimo do cartão sobe, o cheque especial cobre a diferença, e o juro de um alimenta o juro do outro. Você continua pagando certinho — só que pagando cada vez mais para ficar no mesmo lugar.',
      'A solução não é "se esforçar mais". É reorganizar para onde vai cada real que sobra, priorizando sempre a dívida que cobra o juro mais caro primeiro. É isso que a Matriz de Realocação de Pagamentos faz por você.',
    ],
  },
  {
    id: 'sec-2',
    titulo: '2. Como preencher a Matriz: saldo, juro mensal e pagamento mínimo',
    corpo: [
      'A Matriz trabalha com três números por dívida: o saldo devedor (quanto falta pagar hoje), a taxa de juros mensal (o quanto essa dívida cresce todo mês se não for paga) e o pagamento mínimo (o menor valor que você é obrigado a pagar por mês).',
      'Exemplo prático com um cartão no rotativo: saldo devedor de R$ 2.000, juro mensal de 14%, pagamento mínimo de R$ 200. Isso significa que, se você pagar só o mínimo, o cartão cobra R$ 280 de juros nesse mês — e a dívida praticamente não sai do lugar.',
      'Cadastre assim cada uma das suas dívidas na Matriz. Não precisa ter certeza absoluta da taxa: olhe a fatura ou o extrato, ou use uma estimativa (o guia de dívidas brasileiras a seguir te ajuda com isso).',
    ],
  },
  {
    id: 'sec-3',
    titulo: '3. Guia rápido das dívidas brasileiras',
    corpo: [
      'Cartão de crédito rotativo: é quando você paga só o mínimo da fatura e o resto "rola" para o mês seguinte com juros. Costuma ser uma das dívidas mais caras do país.',
      'Cheque especial: limite extra na conta corrente que cobre saques a descoberto. Parece prático, mas o juro é cobrado dia a dia sobre o valor usado — sai caríssimo se usado por mais de alguns dias.',
      'CDC de loja (Crédito Direto ao Consumidor): financiamento oferecido na hora da compra, direto na loja. Costuma embutir juros altos disfarçados de "parcelas sem juros".',
      'Financiamento (carro, imóvel, etc.): parcelas de longo prazo com juros geralmente menores que os anteriores, mas o valor total da dívida costuma ser bem maior.',
      'Boleto parcelado: parcelamento combinado direto com a loja ou prestador de serviço, fora do cartão. O juro varia muito de caso para caso — vale sempre perguntar a taxa mensal antes de fechar.',
    ],
  },
  {
    id: 'sec-4',
    titulo: '4. Como ler sua Data da Virada',
    corpo: [
      'A Data da Virada é o mês em que, seguindo a Matriz, o saldo de todas as suas dívidas chega a zero. Ela é uma projeção baseada no que você cadastrou hoje — não uma promessa gravada em pedra.',
      'No mês seguinte a receber sua Data da Virada, faça três coisas: revise os saldos reais das suas dívidas (às vezes juro ou tarifa muda), continue seguindo a ordem de prioridade da Matriz, e não desista se atrasar um mês — atualize os números e sua Data da Virada se ajusta sozinha.',
      'Comemore os marcos: cada dívida que chega a zero é uma vitória real. É o sinal de que o dinheiro que ia para o mínimo dela agora está sendo redirecionado para acelerar a próxima.',
    ],
  },
  {
    id: 'sec-5',
    titulo: '5. Checklist de execução',
    corpo: [
      'Primeira semana: cadastre todas as dívidas na Matriz, confirme os valores de saldo e juro na fatura/extrato, e defina quanto você consegue pagar a mais por mês.',
      'Primeiro mês: pague o mínimo em todas as dívidas, exceto na prioridade (a de juro mais alto), que recebe o mínimo mais tudo que sobrar. Guarde o comprovante de cada pagamento.',
      'A cada 90 dias: revise os saldos e taxas na Matriz, confira se sua Data da Virada mudou, e ajuste o valor extra mensal se sua renda mudou.',
    ],
  },
  {
    id: 'sec-bonus',
    titulo: 'Bônus: Raio-X do Cheque Especial',
    corpo: [
      'O cheque especial e o rotativo do cartão estão entre os juros mais caros do mercado brasileiro. Use a calculadora "Raio-X do Cheque Especial" (no menu acima) para ver exatamente quanto reais por mês esse limite está custando de verdade.',
      'Não é para assustar — é para decidir com clareza. Muita gente descobre que dá para quitar o cheque especial primeiro com uma pequena reorganização, e economizar centenas de reais por mês só de juros.',
    ],
  },
];
