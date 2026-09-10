# Centro Contas

Web app mobile-first para controlar contas a receber dos lojistas do Centro do Reparo.

## O que já está pronto

- Dashboard com total em aberto, recebido no mês, quantidade de devedores e valores com +30 dias.
- Cadastro de lojistas com WhatsApp.
- Lançamento de serviço com aparelho, descrição, valor e data.
- Serviços em aberto, pagos e histórico completo.
- Seleção de vários serviços para baixa conjunta.
- Pagamento parcial: distribui o valor do mais antigo para o mais recente e deixa o saldo restante aberto.
- Registro separado de cada pagamento e das vinculações com os serviços.
- Histórico de pagamentos.
- Fechamento por período.
- Mensagem pronta para copiar.
- Botão que abre o WhatsApp com a cobrança preenchida.
- Comprovante de pagamento e opção de salvar como PDF pela impressão do navegador.
- Modo local para testar sem configurar nada.
- Supabase para uso real e sincronização entre aparelhos.
- Layout responsivo para celular e computador.

## Testar imediatamente no computador

1. Instale Node.js 20 ou superior.
2. Abra esta pasta no terminal.
3. Execute:

```bash
npm install
npm run dev
```

4. Abra o endereço mostrado pelo Vite.

Sem arquivo `.env`, o sistema entra em **Modo local**. Os dados ficam somente naquele navegador.

## Colocar online com Supabase

### 1. Criar o banco

1. Crie um projeto em https://supabase.com.
2. Abra `SQL Editor`.
3. Cole e execute todo o arquivo `supabase.sql` deste projeto.
4. Em `Authentication > Providers`, deixe Email habilitado.

### 2. Configurar o app

No Supabase, abra `Project Settings > API` e copie:

- Project URL
- anon/public key

Na raiz do projeto, crie `.env` copiando `.env.example`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

Depois execute novamente:

```bash
npm run dev
```

Agora aparecerá a tela de login. No primeiro acesso, crie sua conta.

## Publicar no Vercel

1. Suba a pasta para um repositório GitHub, ou importe o projeto diretamente no Vercel.
2. No projeto do Vercel, adicione as duas variáveis de ambiente do `.env`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Faça o deploy.

## Claude Code / Work

O projeto já está completo. Você pode abrir esta pasta no Claude Code ou no ChatGPT Work para fazer ajustes visuais ou acrescentar recursos. Não é necessário reconstruir a arquitetura.

Pedido recomendado para o agente:

> Abra o projeto Centro Contas, execute npm install e npm run build. Não altere a regra de negócio sem necessidade. Valide o fluxo: cadastrar lojista > lançar serviços > selecionar serviços > pagamento total > pagamento parcial > fechamento > recibo > WhatsApp. Se encontrar erro, corrija e execute o build novamente.

## Estrutura de dados

- `stores`: lojistas.
- `services`: cada serviço lançado.
- `payments`: cada pagamento recebido.
- `payment_allocations`: quanto de cada pagamento foi aplicado em cada serviço.

Um serviço nunca é apagado ao ser pago. O saldo em aberto é calculado como `valor do serviço - pagamentos vinculados`.
