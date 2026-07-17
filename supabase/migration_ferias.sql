-- Rode isso no Supabase: SQL Editor -> New query -> cole -> Run

alter table colaboradores
  add column if not exists em_ferias boolean not null default false,
  add column if not exists ferias_inicio date,
  add column if not exists ferias_fim date;
