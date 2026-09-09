import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function LandingPage() {
  const user = getCurrentUser();
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

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <p className="font-script text-2xl text-gold">não é falta de disciplina.</p>
          <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
            Descubra sua <span className="text-gold">Data da Virada</span>
          </h1>
          <p className="mt-5 text-lg text-neutral-600">
            Você paga em dia todo mês e mesmo assim a dívida não sai do lugar? O problema não é você —
            é a <strong className="text-magenta-dark">ordem de pagamento</strong>. Monte sua Matriz de
            Realocação de Pagamentos e veja, em segundos, o mês exato em que você fica livre do cartão
            rotativo, cheque especial, CDC e financiamentos.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="btn-primary">Calcular minha Data da Virada</Link>
            <Link href="/login" className="btn-secondary">Já tenho conta</Link>
          </div>
          <p className="mt-4 text-sm text-neutral-500">Grátis para criar sua conta e simular. Leva menos de 2 minutos.</p>
        </div>

        <div className="card">
          <h2 className="text-lg">Como funciona</h2>
          <ol className="mt-4 space-y-4">
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-magenta font-heading font-bold text-white">1</span>
              <span>Cadastre suas dívidas: saldo, juro mensal e pagamento mínimo.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-magenta font-heading font-bold text-white">2</span>
              <span>A Matriz reorganiza seus pagamentos, priorizando quem cobra mais caro.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold font-heading font-bold text-white">3</span>
              <span>Você recebe sua <strong>Data da Virada</strong> — e o quanto ela antecipa sua liberdade.</span>
            </li>
          </ol>
        </div>
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
