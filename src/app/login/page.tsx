import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { loginAction } from '@/actions/auth';
import { AuthForm } from '@/components/AuthForm';

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/dashboard');
  return <AuthForm action={loginAction} mode="login" />;
}
