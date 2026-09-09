'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { resetPasswordAction } from '@/actions/password';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Salvando...' : 'Redefinir senha'}
    </button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, {});

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="font-heading text-xl font-extrabold text-magenta-dark">Data da Virada</Link>
        <h1 className="mt-4 text-3xl">Escolha uma nova senha</h1>
      </div>

      <form action={formAction} className="card space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="label-field" htmlFor="password">Nova senha</label>
          <input className="input-field" id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
        </div>
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        <SubmitButton />
      </form>
    </div>
  );
}
