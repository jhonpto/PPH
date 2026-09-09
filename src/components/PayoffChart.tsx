'use client';

interface Ponto {
  mes: number;
  saldoTotal: number;
}

const brlCompact = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : v.toFixed(0);

export function PayoffChart({
  comEstrategia,
  semEstrategia,
}: {
  comEstrategia: Ponto[];
  semEstrategia: Ponto[];
}) {
  if (comEstrategia.length === 0) return null;

  const width = 640;
  const height = 260;
  const padding = { top: 16, right: 16, bottom: 28, left: 44 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxMes = Math.max(comEstrategia.length, semEstrategia.length);
  const maxSaldo = Math.max(
    1,
    ...comEstrategia.map((p) => p.saldoTotal),
    ...semEstrategia.map((p) => p.saldoTotal)
  );

  const x = (mes: number) => padding.left + (mes / maxMes) * innerW;
  const y = (saldo: number) => padding.top + innerH - (saldo / maxSaldo) * innerH;

  const toPath = (pontos: Ponto[]) =>
    pontos.length === 0
      ? ''
      : pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.mes)} ${y(p.saldoTotal)}`).join(' ');

  const areaPath = (pontos: Ponto[]) =>
    pontos.length === 0
      ? ''
      : `${toPath(pontos)} L ${x(pontos[pontos.length - 1].mes)} ${y(0)} L ${x(pontos[0].mes)} ${y(0)} Z`;

  const yTicks = [0, 0.5, 1].map((f) => f * maxSaldo);
  const xTickStep = Math.max(1, Math.round(maxMes / 4));
  const xTicks = Array.from({ length: Math.floor(maxMes / xTickStep) + 1 }, (_, i) => i * xTickStep);

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base">Evolução da dívida ao longo do tempo</h3>
        <div className="flex gap-4 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-magenta" /> Com a Matriz
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-neutral-300" /> Sem estratégia
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Gráfico de evolução da dívida">
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(t)}
              y2={y(t)}
              stroke="currentColor"
              className="text-black/5"
            />
            <text x={padding.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-neutral-400 text-[10px]">
              {brlCompact(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text key={i} x={x(t)} y={height - 8} textAnchor="middle" className="fill-neutral-400 text-[10px]">
            {t}m
          </text>
        ))}

        {semEstrategia.length > 0 && (
          <path d={toPath(semEstrategia)} fill="none" stroke="#d4d4d4" strokeWidth={2} strokeDasharray="4 4" />
        )}
        <path d={areaPath(comEstrategia)} fill="#c11f5c" opacity={0.12} />
        <path d={toPath(comEstrategia)} fill="none" stroke="#c11f5c" strokeWidth={2.5} />
      </svg>
    </div>
  );
}
