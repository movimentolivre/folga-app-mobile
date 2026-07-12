import { getFolgasPorMes, getTotalFolgasPorColaborador } from "@/actions/folgas";
import { BotaoDeletarFolga } from "./deletar-button";
import { GraficoPicoFolguistas } from "./pico-chart";
import { BotaoImprimir } from "./print-button";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Rótulo do período de fechamento representado por um mês (16 do mês anterior a 15 do mês escolhido). */
function labelPeriodo(mes: number, ano: number) {
  const mesAnteriorIdx = mes - 2 < 0 ? 11 : mes - 2;
  const abrevAnterior = MESES[mesAnteriorIdx].slice(0, 3);
  const abrevAtual = MESES[mes - 1].slice(0, 3);
  return `16/${abrevAnterior} a 15/${abrevAtual}/${ano}`;
}

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
  const periodo = labelPeriodo(mes, ano);

  return (
    <div className="space-y-6">
      <form className="flex flex-wrap items-center gap-2 print:hidden" action="/historico">
        <select name="mes" defaultValue={mes} className="rounded-lg border px-3 py-2">
          {MESES.map((nome, i) => (
            <option key={i} value={i + 1}>
              Fechamento {nome}
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
        <div className="ml-auto">
          <BotaoImprimir />
        </div>
      </form>

      <div id="relatorio" className="space-y-6">
        <div className="hidden print:block">
          <h1 className="text-xl font-bold">Relatório de Folgas</h1>
          <p className="text-sm text-gray-600">Período de fechamento: {periodo}</p>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
            Período: {periodo}
          </h2>
          <div className="grid grid-cols-2 gap-2 print:grid-cols-3">
            {totais.map((t) => (
              <div key={t.colaboradorId} className="rounded-lg border bg-white p-3 text-sm">
                <p className="font-medium">{t.nome}</p>
                <p className="text-gray-500">{t.total} folga(s)</p>
              </div>
            ))}
            {totais.length === 0 && (
              <p className="col-span-2 text-sm text-gray-500">Sem registros neste período.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
            Pico de folguistas
          </h2>
          <GraficoPicoFolguistas totais={totais} />
          <p className="mt-1 text-xs text-gray-400 print:hidden">
            Em vermelho: quem mais folgou no período.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
            Registros do período
          </h2>
          <div className="space-y-2">
            {folgas?.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-2 text-sm print:break-inside-avoid"
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
    </div>
  );
}
