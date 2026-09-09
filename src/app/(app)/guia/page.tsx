import { Accordion } from '@/components/Accordion';
import { secoesGuia } from '@/lib/guiaContent';

export default function GuiaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Guia da Virada</h1>
        <p className="mt-2 text-neutral-600">
          Reframe, passo a passo e o que fazer depois de descobrir sua Data da Virada.
        </p>
      </div>
      <Accordion secoes={secoesGuia} />
    </div>
  );
}
