"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export async function getColaboradoresAtivos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if (error) throw new Error(error.message);
  return data;
}

export async function getColaboradores() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("colaboradores").select("*").order("nome");

  if (error) throw new Error(error.message);
  return data;
}

export async function registrarFolga(colaboradorId: number) {
  const supabase = await createClient();
  const agora = new Date();

  // Regra de negócio: não permitir duas folgas do mesmo colaborador no mesmo dia.
  const inicioDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const fimDoDia = new Date(inicioDoDia);
  fimDoDia.setDate(fimDoDia.getDate() + 1);

  const { data: existentes, error: checkError } = await supabase
    .from("folgas")
    .select("id")
    .eq("colaborador_id", colaboradorId)
    .gte("data_hora", inicioDoDia.toISOString())
    .lt("data_hora", fimDoDia.toISOString());

  if (checkError) throw new Error(checkError.message);
  if (existentes && existentes.length > 0) {
    throw new Error("Folga já registrada para este colaborador neste dia");
  }

  const { error } = await supabase.from("folgas").insert({
    colaborador_id: colaboradorId,
    data_hora: agora.toISOString(),
    dia: agora.getDate(),
    mes: agora.getMonth() + 1,
    ano: agora.getFullYear(),
    dia_semana: DIAS_SEMANA[agora.getDay()],
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/historico");
}

export async function deletarFolga(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("folgas").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/historico");
}

export async function getFolgasPorMes(mes: number, ano: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("folgas")
    .select("*, colaboradores(nome)")
    .eq("mes", mes)
    .eq("ano", ano)
    .order("data_hora", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getFolgasRecentes(limite = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("folgas")
    .select("*, colaboradores(nome)")
    .order("data_hora", { ascending: false })
    .limit(limite);

  if (error) throw new Error(error.message);
  return data;
}

export async function getTotalFolgasPorColaborador(mes: number, ano: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("folgas")
    .select("colaborador_id, colaboradores(nome)")
    .eq("mes", mes)
    .eq("ano", ano);

  if (error) throw new Error(error.message);

  const totals = new Map<number, { nome: string; total: number }>();
  for (const folga of data ?? []) {
    const nome = (folga.colaboradores as unknown as { nome: string } | null)?.nome ?? "—";
    const current = totals.get(folga.colaborador_id);
    totals.set(folga.colaborador_id, { nome, total: (current?.total ?? 0) + 1 });
  }

  return Array.from(totals.entries()).map(([colaboradorId, v]) => ({
    colaboradorId,
    ...v,
  }));
}

export async function getRankingJustica() {
  const supabase = await createClient();
  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  const { data: colaboradores, error: colabError } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("ativo", true);
  if (colabError) throw new Error(colabError.message);

  const { data: todasFolgas, error: folgasError } = await supabase
    .from("folgas")
    .select("colaborador_id, data_hora, mes, ano")
    .order("data_hora", { ascending: false });
  if (folgasError) throw new Error(folgasError.message);

  const ranking = (colaboradores ?? []).map((c) => {
    const folgasDoColaborador = (todasFolgas ?? []).filter((f) => f.colaborador_id === c.id);
    const totalNoMes = folgasDoColaborador.filter((f) => f.mes === mes && f.ano === ano).length;

    const ultimaFolga = folgasDoColaborador[0]?.data_hora
      ? new Date(folgasDoColaborador[0].data_hora)
      : null;
    const diasSemFolgar = ultimaFolga
      ? Math.floor((agora.getTime() - ultimaFolga.getTime()) / (1000 * 60 * 60 * 24))
      : 999; // nunca folgou = prioridade alta

    return {
      colaboradorId: c.id,
      nome: c.nome,
      totalNoMes,
      diasSemFolgar,
    };
  });

  // Mais justo primeiro: quem tem menos folgas no mês, depois quem está há mais
  // tempo sem folgar. Não é uma fila rígida — só uma sugestão que se ajusta sozinha.
  ranking.sort((a, b) => {
    if (a.totalNoMes !== b.totalNoMes) return a.totalNoMes - b.totalNoMes;
    return b.diasSemFolgar - a.diasSemFolgar;
  });

  return ranking;
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
