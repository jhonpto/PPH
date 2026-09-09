'use client';

import { useState } from 'react';
import type { Secao } from '@/lib/guiaContent';

export function Accordion({ secoes }: { secoes: Secao[] }) {
  const [aberto, setAberto] = useState<string | null>(secoes[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {secoes.map((s) => {
        const isOpen = aberto === s.id;
        return (
          <div key={s.id} className="card !p-0 overflow-hidden">
            <button
              type="button"
              onClick={() => setAberto(isOpen ? null : s.id)}
              className="flex w-full items-center justify-between px-6 py-4 text-left font-heading font-semibold text-magenta-dark"
            >
              <span>{s.titulo}</span>
              <span className={`text-gold transition-transform ${isOpen ? 'rotate-45' : ''}`}>＋</span>
            </button>
            {isOpen && (
              <div className="space-y-3 px-6 pb-6 text-neutral-700">
                {s.corpo.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
