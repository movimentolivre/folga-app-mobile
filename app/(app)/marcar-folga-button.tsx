"use client";

import { useState, useTransition } from "react";
import { registrarFolga } from "@/actions/folgas";
import { useToast } from "@/components/toast-provider";

export function BotaoMarcarFolga({
  colaboradorId,
  nome,
}: {
  colaboradorId: number;
  nome: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        await registrarFolga(colaboradorId);
        showToast(`Folga registrada para ${nome} ✓`, "success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao registrar folga";
        setError(message);
        showToast(message, "error");
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
          {isPending ? "Registrando..." : "Marcar folga"}
        </span>
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
