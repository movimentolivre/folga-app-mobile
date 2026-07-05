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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
