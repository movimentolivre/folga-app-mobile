-- Rode isso no painel do Supabase: SQL Editor -> New query -> cole tudo -> Run

create table if not exists colaboradores (
  id bigint generated always as identity primary key,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists folgas (
  id bigint generated always as identity primary key,
  colaborador_id bigint not null references colaboradores(id) on delete cascade,
  data_hora timestamptz not null default now(),
  dia int not null,
  mes int not null,
  ano int not null,
  dia_semana text not null,
  created_at timestamptz not null default now()
);

create index if not exists folgas_colaborador_id_idx on folgas(colaborador_id);
create index if not exists folgas_mes_ano_idx on folgas(mes, ano);

-- Segurança: só usuários autenticados (você) podem ler/escrever.
alter table colaboradores enable row level security;
alter table folgas enable row level security;

create policy "authenticated_read_colaboradores" on colaboradores
  for select using (auth.role() = 'authenticated');
create policy "authenticated_write_colaboradores" on colaboradores
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_read_folgas" on folgas
  for select using (auth.role() = 'authenticated');
create policy "authenticated_write_folgas" on folgas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seus 7 colaboradores (edite os nomes antes de rodar)
insert into colaboradores (nome) values
  ('Colaborador 1'),
  ('Colaborador 2'),
  ('Colaborador 3'),
  ('Colaborador 4'),
  ('Colaborador 5'),
  ('Colaborador 6'),
  ('Colaborador 7');
