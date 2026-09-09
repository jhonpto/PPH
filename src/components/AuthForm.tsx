'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import type { AuthState } from '@/actions/auth';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Enviando...' : label}
    </button>
  );
}

export function AuthForm({
  action,
  mode,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: 'login' | 'register';
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="font-heading text-xl font-extrabold text-magenta-dark">Data da Virada</Link>
        <h1 className="mt-4 text-3xl">{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
        <p className="mt-2 text-neutral-600">
          {mode === 'login'
            ? 'Entre para ver sua Data da Virada.'
            : 'Leva menos de 1 minuto para começar.'}
        </p>
      </div>

      <form action={formAction} className="card space-y-4">
        {mode === 'register' && (
          <div>
            <label className="label-field" htmlFor="name">Nome</label>
            <input className="input-field" id="name" name="name" type="text" placeholder="Seu nome" required />
          </div>
        )}
        <div>
          <label className="label-field" htmlFor="email">E-mail</label>
          <input className="input-field" id="email" name="email" type="email" placeholder="voce@email.com" required />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label-field" htmlFor="password">Senha</label>
            {mode === 'login' && (
              <Link href="/esqueci-senha" className="mb-1.5 text-xs font-medium text-magenta hover:underline">
                Esqueci minha senha
              </Link>
            )}
          </div>
          <input className="input-field" id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <SubmitButton label={mode === 'login' ? 'Entrar' : 'Criar conta grátis'} />
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        {mode === 'login' ? (
          <>Ainda não tem conta? <Link href="/register" className="font-semibold text-magenta">Cadastre-se</Link></>
        ) : (
          <>Já tem conta? <Link href="/login" className="font-semibold text-magenta">Entrar</Link></>
        )}
      </p>
    </div>
  );
}
