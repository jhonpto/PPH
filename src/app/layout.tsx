import type { Metadata } from 'next';
import { Poppins, Caveat, Manrope } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Data da Virada — Sua data pra sair das dívidas',
  description:
    'Descubra a Data da Virada: o mês em que você fica livre das dívidas usando a Matriz de Realocação de Pagamentos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${caveat.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
