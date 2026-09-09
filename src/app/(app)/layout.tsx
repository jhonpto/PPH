import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AppNav } from '@/components/AppNav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-blush">
      <AppNav userName={user.name} />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
