import { RaioXCalculator } from '@/components/RaioXCalculator';

export default function RaioXPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Raio-X do Cheque Especial</h1>
        <p className="mt-2 text-neutral-600">
          Descubra em segundos quanto o cheque especial ou o rotativo do cartão custa de verdade, em reais, por mês.
        </p>
      </div>
      <RaioXCalculator />
    </div>
  );
}
