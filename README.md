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

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Postgres (via `pg`).

## Variáveis de ambiente

Veja `.env.example`. Você precisa de:

- `POSTGRES_URL`: connection string de um banco Postgres
- `SESSION_SECRET`: chave aleatória para assinar o cookie de sessão

## Publicando na Vercel (grátis)

1. Crie uma conta em https://vercel.com e conecte com o GitHub.
2. Clique em **Add New > Project**, escolha este repositório e a branch com o app.
3. Antes de fazer o deploy, vá em **Storage > Create Database > Postgres** (Neon), crie o banco
   e clique em **Connect Project** apontando para este projeto — a Vercel já injeta a variável
   `POSTGRES_URL` automaticamente.
4. Em **Settings > Environment Variables**, adicione `SESSION_SECRET` com um valor aleatório
   (gere um com `openssl rand -base64 32`, por exemplo).
5. Clique em **Deploy**. Ao final você recebe uma URL pública (tipo `seu-app.vercel.app`) pra abrir
   no navegador ou celular. As tabelas do banco são criadas automaticamente no primeiro acesso.

## Rodando localmente

```bash
npm install
npm run dev
```

Requer um Postgres local ou remoto configurado via `POSTGRES_URL`. Acesse http://localhost:3000.

## Build de produção

```bash
npm run build
npm start
```
