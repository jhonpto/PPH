import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DebtSimulator } from '@/components/DebtSimulator';

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-gradient-to-b from-blush to-blush-dark">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-heading text-xl font-extrabold text-magenta-dark">Data da Virada</span>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary !px-4 !py-2 text-sm">Entrar</Link>
          <Link href="/register" className="btn-primary !px-4 !py-2 text-sm">Começar agora</Link>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-12 text-center md:py-16">
        <p className="font-script text-2xl text-gold">não é falta de disciplina.</p>
        <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
          Descubra sua <span className="text-gold">Data da Virada</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
          Você paga em dia todo mês e mesmo assim a dívida não sai do lugar? O problema não é você —
          é a <strong className="text-magenta-dark">ordem de pagamento</strong>. Mexa nos números abaixo
          e veja, em segundos, o mês em que você ficaria livre do cartão rotativo, cheque especial, CDC
          e financiamentos — sem precisar criar conta pra testar.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <DebtSimulator persistKey="ddv_anon_debts" ctaHref="/register" />
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="card grid gap-6 sm:grid-cols-3">
          <div>
            <p className="font-heading text-3xl font-black text-magenta">1</p>
            <p className="mt-1 text-sm text-neutral-600">Matriz de Realocação de Pagamentos, pronta para usar</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-black text-magenta">6</p>
            <p className="mt-1 text-sm text-neutral-600">Capítulos do guia: cartão rotativo, cheque especial, CDC e mais</p>
          </div>
          <div>
            <p className="font-heading text-3xl font-black text-magenta">+</p>
            <p className="mt-1 text-sm text-neutral-600">Bônus: Raio-X do Cheque Especial, sua calculadora de juros</p>
          </div>
        </div>
      </section>
    </main>
  );
}
