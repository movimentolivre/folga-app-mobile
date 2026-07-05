import { getColaboradoresAtivos, getFolgasRecentes } from "@/actions/folgas";
import { BotaoMarcarFolga } from "./marcar-folga-button";

export default async function DashboardPage() {
  const [colaboradores, recentes] = await Promise.all([
    getColaboradoresAtivos(),
    getFolgasRecentes(5),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
          Quem está de folga hoje?
        </h2>
        <div className="space-y-2">
          {colaboradores.map((c) => (
            <BotaoMarcarFolga key={c.id} colaboradorId={c.id} nome={c.nome} />
          ))}
          {colaboradores.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum colaborador ativo cadastrado.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
          Últimas folgas registradas
        </h2>
        <div className="space-y-2">
          {recentes?.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-2 text-sm"
            >
              <span>{(f.colaboradores as unknown as { nome: string } | null)?.nome}</span>
              <span className="text-gray-500">
                {f.dia_semana}, {String(f.dia).padStart(2, "0")}/{String(f.mes).padStart(2, "0")}
                /{f.ano}
              </span>
            </div>
          ))}
          {(!recentes || recentes.length === 0) && (
            <p className="text-sm text-gray-500">Nenhuma folga registrada ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}
