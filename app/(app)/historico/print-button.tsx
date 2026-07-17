"use client";

export function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary print:hidden"
    >
      Salvar relatório em PDF
    </button>
  );
}
