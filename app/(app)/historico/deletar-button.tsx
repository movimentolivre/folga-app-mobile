"use client";

import { useTransition } from "react";
import { deletarFolga } from "@/actions/folgas";

export function BotaoDeletarFolga({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Remover esse registro de folga?")) return;
    startTransition(() => deletarFolga(id));
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-red-600 underline disabled:opacity-50"
    >
      Remover
    </button>
  );
}
