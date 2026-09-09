# Data da Virada

App web (Next.js) do produto **Data da Virada**: descubra o mês em que você fica livre das dívidas
(cartão rotativo, cheque especial, CDC, financiamento) usando a Matriz de Realocação de Pagamentos.

## Funcionalidades

- Cadastro e login (sessão via cookie assinado, senha com hash bcrypt)
- Cadastro de dívidas (saldo, juro mensal, pagamento mínimo)
- Cálculo automático da "Data da Virada" (simulação mês a mês da estratégia de realocação
  de pagamentos, priorizando sempre a dívida de juro mais alto) comparado ao cenário sem estratégia
- Guia da Virada (conteúdo educativo em acordeão)
- Checklist de execução (progresso salvo por usuário)
- Raio-X do Cheque Especial (calculadora de custo real do rotativo/cheque especial)

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS + SQLite (better-sqlite3), sem serviços externos.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000. O banco SQLite é criado automaticamente em `data/app.db` na primeira execução.

## Build de produção

```bash
npm run build
npm start
```
