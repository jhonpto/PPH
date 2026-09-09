'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { requestPasswordResetAction } from '@/actions/password';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Enviando...' : 'Enviar link de redefinição'}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordResetAction, {});

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="font-heading text-xl font-extrabold text-magenta-dark">Data da Virada</Link>
        <h1 className="mt-4 text-3xl">Esqueci minha senha</h1>
        <p className="mt-2 text-neutral-600">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
      </div>

      {state?.sent ? (
        <div className="card space-y-3">
          <p className="text-neutral-700">
            Se esse e-mail tiver uma conta, enviamos um link de redefinição para ele. Confira sua caixa de entrada
            (e o spam).
          </p>
          {state.devResetUrl && (
            <div className="rounded-lg bg-blush px-3 py-2 text-sm text-neutral-700">
              <p className="font-medium">Envio de e-mail ainda não configurado neste ambiente.</p>
              <p className="mt-1">
                Use este link para redefinir agora:{' '}
                <a href={state.devResetUrl} className="break-all font-semibold text-magenta underline">
                  {state.devResetUrl}
                </a>
              </p>
            </div>
          )}
        </div>
      ) : (
        <form action={formAction} className="card space-y-4">
          <div>
            <label className="label-field" htmlFor="email">E-mail</label>
            <input className="input-field" id="email" name="email" type="email" placeholder="voce@email.com" required />
          </div>
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <SubmitButton />
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-600">
        Lembrou a senha? <Link href="/login" className="font-semibold text-magenta">Entrar</Link>
      </p>
    </div>
  );
}
