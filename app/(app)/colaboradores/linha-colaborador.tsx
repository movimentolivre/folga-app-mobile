"use client";

import { useState, useTransition } from "react";
import { alternarAtivo, encerrarFerias, marcarFerias } from "@/actions/folgas";

type Colaborador = {
  id: number;
  nome: string;
  ativo: boolean;
  em_ferias: boolean;
  ferias_inicio: string | null;
  ferias_fim: string | null;
};

export function LinhaColaborador({ colaborador }: { colaborador: Colaborador }) {
  const [isPending, startTransition] = useTransition();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [inicio, setInicio] = useState(colaborador.ferias_inicio ?? "");
  const [fim, setFim] = useState(colaborador.ferias_fim ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleMarcarFerias = () => {
    if (!inicio || !fim) {
      setError("Preencha as duas datas");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await marcarFerias(colaborador.id, inicio, fim);
        setMostrarForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao marcar férias");
      }
    });
  };

  const handleEncerrarFerias = () => {
    startTransition(() => encerrarFerias(colaborador.id));
  };

  const handleAlternarAtivo = () => {
    startTransition(() => alternarAtivo(colaborador.id, !colaborador.ativo));
  };

  return (
    <div className="rounded-lg border bg-white p-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{colaborador.nome}</p>
          <div className="mt-1 flex gap-2">
            {!colaborador.ativo && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                Inativo
              </span>
            )}
            {colaborador.em_ferias && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                Férias até{" "}
                {colaborador.ferias_fim
                  ? new Date(colaborador.ferias_fim + "T00:00:00").toLocaleDateString("pt-BR")
                  : "—"}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleAlternarAtivo}
            disabled={isPending}
            className="text-xs text-gray-500 underline disabled:opacity-50"
          >
            {colaborador.ativo ? "Desativar" : "Ativar"}
          </button>

          {colaborador.em_ferias ? (
            <button
              type="button"
              onClick={handleEncerrarFerias}
              disabled={isPending}
              className="text-xs text-primary underline disabled:opacity-50"
            >
              Encerrar férias
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarForm((v) => !v)}
              className="text-xs text-primary underline"
            >
              Marcar férias
            </button>
          )}
        </div>
      </div>

      {mostrarForm && !colaborador.em_ferias && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-gray-500">
              Início
              <input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
            <label className="flex-1 text-xs text-gray-500">
              Fim
              <input
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleMarcarFerias}
            disabled={isPending}
            className="w-full rounded bg-primary py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Salvando..." : "Confirmar férias"}
          </button>
        </div>
      )}
    </div>
  );
}
