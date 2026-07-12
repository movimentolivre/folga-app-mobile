"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Totais = { colaboradorId: number; nome: string; total: number }[];

export function GraficoPicoFolguistas({ totais }: { totais: Totais }) {
  if (!totais || totais.length === 0) {
    return <p className="text-sm text-gray-500">Sem dados suficientes neste período.</p>;
  }

  const dados = [...totais].sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(...dados.map((d) => d.total));

  return (
    <div className="h-64 w-full rounded-lg border bg-white p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 16, right: 8, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="nome"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={50}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value: number) => [`${value} folga(s)`, "Total"]} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {dados.map((entry) => (
              <Cell
                key={entry.colaboradorId}
                fill={entry.total === maxTotal ? "#dc2626" : "#2563eb"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
