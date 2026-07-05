# Folga App

App para registrar e acompanhar as folgas da equipe (7 colaboradores).

## Stack
- **Next.js 14** (App Router) — frontend + backend em um projeto só
- **Supabase** — banco de dados (Postgres) e autenticação
- **Vercel** — hospedagem

## Como configurar

1. Crie um projeto em supabase.com
2. No **SQL Editor**, rode o conteúdo de `supabase/schema.sql` (edite os nomes dos colaboradores antes)
3. Em **Authentication → Users**, crie manualmente o seu usuário (e-mail + senha) — é o único login do app
4. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`
5. Copie `.env.example` para `.env.local` e preencha com os valores acima
6. `npm install && npm run dev` para rodar localmente
7. Deploy: `vercel --prod` (adicione as mesmas variáveis com `vercel env add`)

## Estrutura
- `app/login` — tela de login
- `app/(app)` — telas protegidas (dashboard e histórico)
- `actions/folgas.ts` — toda a lógica de negócio (marcar folga, histórico, regra de não duplicar no mesmo dia)
- `supabase/schema.sql` — schema do banco
