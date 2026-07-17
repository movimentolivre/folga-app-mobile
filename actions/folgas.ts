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

/**
 * Fechamento do mês vai do dia 16 ao dia 15 do mês seguinte.
 * `mes`/`ano` aqui representam o MÊS DE FECHAMENTO (ex: mes=7 -> período de
 * 16/06 a 15/07).
 */
function getIntervaloPeriodo(mes: number, ano: number) {
  const inicio = new Date(ano, mes - 2, 16, 0, 0, 0, 0);
  const fim = new Date(ano, mes - 1, 15, 23, 59, 59, 999);
  return { inicio, fim };
}

/** Período de fechamento (16 a 15) que contém a data de referência (hoje, por padrão). */
function getPeriodoAtual(referencia: Date = new Date()) {
  const dia = referencia.getDate();
  if (dia >= 16) {
    const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 16);
    const fim = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 15, 23, 59, 59, 999);
    return { inicio, fim };
  }
  const inicio = new Date(referencia.getFullYear(), referencia.getMonth() - 1, 16);
  const fim = new Date(referencia.getFullYear(), referencia.getMonth(), 15, 23, 59, 59, 999);
  return { inicio, fim };
}

export async function getColaboradoresAtivos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("ativo", true)
    .eq("em_ferias", false)
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

export async function getColaboradoresEmFerias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("em_ferias", true)
    .order("nome");

  if (error) throw new Error(error.message);
  return data;
}

export async function marcarFerias(colaboradorId: number, inicio: string, fim: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("colaboradores")
    .update({ em_ferias: true, ferias_inicio: inicio, ferias_fim: fim, updated_at: new Date().toISOString() })
    .eq("id", colaboradorId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/colaboradores");
}

export async function encerrarFerias(colaboradorId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("colaboradores")
    .update({
      em_ferias: false,
      ferias_inicio: null,
      ferias_fim: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", colaboradorId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/colaboradores");
}

export async function alternarAtivo(colaboradorId: number, ativo: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("colaboradores")
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq("id", colaboradorId);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/colaboradores");
}

export async function adicionarColaborador(nome: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("colaboradores").insert({ nome });
  if (error) throw new Error(error.message);

  revalidatePath("/colaboradores");
}

/** Exclui o colaborador. Como as folgas referenciam o colaborador com
 * "on delete cascade", o histórico de folgas dele também é apagado. */
export async function excluirColaborador(colaboradorId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("colaboradores").delete().eq("id", colaboradorId);
  if (error) throw new Error(error.message);

  revalidatePath("/colaboradores");
  revalidatePath("/");
  revalidatePath("/historico");
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
  const { inicio, fim } = getIntervaloPeriodo(mes, ano);
  const { data, error } = await supabase
    .from("folgas")
    .select("*, colaboradores(nome)")
    .gte("data_hora", inicio.toISOString())
    .lte("data_hora", fim.toISOString())
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
  const { inicio, fim } = getIntervaloPeriodo(mes, ano);
  const { data, error } = await supabase
    .from("folgas")
    .select("colaborador_id, colaboradores(nome)")
    .gte("data_hora", inicio.toISOString())
    .lte("data_hora", fim.toISOString());

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

/** Retorna o rótulo do período de fechamento atual, ex: "16/06 a 15/07/2026". */
export async function getPeriodoAtualLabel() {
  const { inicio, fim } = getPeriodoAtual();
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return `${fmt(inicio)} a ${fmt(fim)}`;
}

/** Dias restantes até o fechamento do período atual (dia 15). */
export async function getDiasParaFechamento() {
  const agora = new Date();
  const { fim } = getPeriodoAtual(agora);
  const inicioDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const fimDoDia = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());
  const dias = Math.round((fimDoDia.getTime() - inicioDoDia.getTime()) / (1000 * 60 * 60 * 24));
  return dias;
}

export async function getRankingJustica() {
  const supabase = await createClient();
  const agora = new Date();
  const { inicio, fim } = getPeriodoAtual(agora);

  const { data: colaboradores, error: colabError } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("ativo", true)
    .eq("em_ferias", false);
  if (colabError) throw new Error(colabError.message);

  const { data: todasFolgas, error: folgasError } = await supabase
    .from("folgas")
    .select("colaborador_id, data_hora")
    .order("data_hora", { ascending: false });
  if (folgasError) throw new Error(folgasError.message);

  const ranking = (colaboradores ?? []).map((c) => {
    const folgasDoColaborador = (todasFolgas ?? []).filter((f) => f.colaborador_id === c.id);
    const totalNoPeriodo = folgasDoColaborador.filter((f) => {
      const data = new Date(f.data_hora);
      return data >= inicio && data <= fim;
    }).length;

    const ultimaFolga = folgasDoColaborador[0]?.data_hora
      ? new Date(folgasDoColaborador[0].data_hora)
      : null;
    const diasSemFolgar = ultimaFolga
      ? Math.floor((agora.getTime() - ultimaFolga.getTime()) / (1000 * 60 * 60 * 24))
      : 999; // nunca folgou = prioridade alta

    return {
      colaboradorId: c.id,
      nome: c.nome,
      totalNoMes: totalNoPeriodo,
      diasSemFolgar,
    };
  });

  // Mais justo primeiro: quem tem menos folgas no período de fechamento atual
  // (16 a 15), depois quem está há mais tempo sem folgar. Não é fila rígida —
  // só uma sugestão que se ajusta sozinha.
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
