"use client";

import { useState, useTransition } from "react";
import { registrarFolga } from "@/actions/folgas";

export function BotaoMarcarFolga({
  colaboradorId,
  nome,
}: {
  colaboradorId: number;
  nome: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClick = () => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await registrarFolga(colaboradorId);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao registrar folga");
      }
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-left shadow-sm disabled:opacity-50"
      >
        <span className="font-medium">{nome}</span>
        <span className="text-sm text-primary">
          {isPending ? "Registrando..." : success ? "Registrado ✓" : "Marcar folga"}
        </span>
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
