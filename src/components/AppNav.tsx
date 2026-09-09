import Link from 'next/link';
import { logoutAction } from '@/actions/auth';

const links = [
  { href: '/dashboard', label: 'Minha Matriz' },
  { href: '/guia', label: 'Guia' },
  { href: '/checklist', label: 'Checklist' },
  { href: '/raio-x', label: 'Raio-X do Cheque Especial' },
];

export function AppNav({ userName }: { userName: string }) {
  return (
    <header className="border-b border-black/5 bg-white/70 backdrop-blur-sm print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/dashboard" className="font-heading text-lg font-extrabold text-magenta-dark">
          Data da Virada
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 font-medium text-neutral-600 transition hover:bg-blush hover:text-magenta-dark"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-neutral-500">Olá, {userName.split(' ')[0]}</span>
          <form action={logoutAction}>
            <button type="submit" className="font-medium text-magenta hover:underline">Sair</button>
          </form>
        </div>
      </div>
    </header>
  );
}
