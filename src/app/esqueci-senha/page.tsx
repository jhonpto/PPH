import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';

export default async function ForgotPasswordPage() {
  if (await getCurrentUser()) redirect('/dashboard');
  return <ForgotPasswordForm />;
}
