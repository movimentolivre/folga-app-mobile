import { getFolgasPorMes, getTotalFolgasPorColaborador } from "@/actions/folgas";
import { BotaoDeletarFolga } from "./deletar-button";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const mes = Number(params.mes) || now.getMonth() + 1;
  const ano = Number(params.ano) || now.getFullYear();

  const [folgas, totais] = await Promise.all([
    getFolgasPorMes(mes, ano),
    getTotalFolgasPorColaborador(mes, ano),
  ]);

  const anos = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <form className="flex gap-2" action="/historico">
        <select name="mes" defaultValue={mes} className="rounded-lg border px-3 py-2">
          {MESES.map((nome, i) => (
            <option key={i} value={i + 1}>
              {nome}
            </option>
          ))}
        </select>
        <select name="ano" defaultValue={ano} className="rounded-lg border px-3 py-2">
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-white">
          Filtrar
        </button>
      </form>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
          Total no mês
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {totais.map((t) => (
            <div key={t.colaboradorId} className="rounded-lg border bg-white p-3 text-sm">
              <p className="font-medium">{t.nome}</p>
              <p className="text-gray-500">{t.total} folga(s)</p>
            </div>
          ))}
          {totais.length === 0 && (
            <p className="col-span-2 text-sm text-gray-500">Sem registros neste mês.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
          Registros de {MESES[mes - 1]} de {ano}
        </h2>
        <div className="space-y-2">
          {folgas?.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border bg-white px-4 py-2 text-sm"
            >
              <div>
                <p className="font-medium">
                  {(f.colaboradores as unknown as { nome: string } | null)?.nome}
                </p>
                <p className="text-gray-500">
                  {f.dia_semana}, {String(f.dia).padStart(2, "0")}/{String(f.mes).padStart(2, "0")}
                  /{f.ano}
                </p>
              </div>
              <BotaoDeletarFolga id={f.id} />
            </div>
          ))}
          {(!folgas || folgas.length === 0) && (
            <p className="text-sm text-gray-500">Nenhuma folga neste período.</p>
          )}
        </div>
      </section>
    </div>
  );
}
