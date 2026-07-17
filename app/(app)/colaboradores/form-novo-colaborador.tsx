"use client";

import { useState, useTransition } from "react";
import { adicionarColaborador } from "@/actions/folgas";

export function FormNovoColaborador() {
  const [nome, setNome] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await adicionarColaborador(nome.trim());
        setNome("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao adicionar colaborador");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do colaborador"
        className="flex-1 rounded-lg border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isPending || !nome.trim()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "..." : "Adicionar"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
