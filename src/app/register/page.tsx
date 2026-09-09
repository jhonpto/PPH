import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { registerAction } from '@/actions/auth';
import { AuthForm } from '@/components/AuthForm';

export default function RegisterPage() {
  if (getCurrentUser()) redirect('/dashboard');
  return <AuthForm action={registerAction} mode="register" />;
}
