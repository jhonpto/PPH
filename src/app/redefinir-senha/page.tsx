import Link from 'next/link';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl">Link inválido</h1>
        <p className="mt-2 text-neutral-600">
          Esse link de redefinição está incompleto. Peça um novo em{' '}
          <Link href="/esqueci-senha" className="font-semibold text-magenta">Esqueci minha senha</Link>.
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
