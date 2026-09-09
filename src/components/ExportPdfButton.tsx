'use client';

export function ExportPdfButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary print:hidden">
      Baixar PDF do plano
    </button>
  );
}
