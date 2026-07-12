import { getColaboradoresAtivos, getFolgasRecentes, getPeriodoAtualLabel, getRankingJustica } from "@/actions/folgas";
import { BotaoMarcarFolga } from "./marcar-folga-button";

export default async function DashboardPage() {
  const [colaboradores, recentes, ranking, periodoLabel] = await Promise.all([
    getColaboradoresAtivos(),
    getFolgasRecentes(5),
    getRankingJustica(),
    getPeriodoAtualLabel(),
  ]);

  const top3 = ranking.slice(0, 3);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
          Sugestão de rodízio · fechamento {periodoLabel}
        </h2>
        <div className="space-y-2">
          {top3.map((r, i) => (
            <div
              key={r.colaboradorId}
              className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm"
            >
              <span className="font-medium">
                {i + 1}º {r.nome}
              </span>
              <span className="text-gray-500">
                {r.totalNoMes} folga(s) neste período
                {r.diasSemFolgar < 999 ? ` · ${r.diasSemFolgar}d sem folgar` : " · nunca folgou"}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Só uma sugestão — qualquer colaborador pode marcar folga a qualquer momento.
        </p>
      </section>

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
