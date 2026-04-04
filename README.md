# Circle (IP Mini Project)

**Circle** is a friends-first social app prototype focused on real connections instead of addictive engagement patterns:

- private-by-default (friends-only intent)
- chronological feed (no recommendation algorithm)
- lightweight posting with optional image/video
- friend requests + accepted friends graph
- database-enforced access rules (Supabase RLS)

This repository contains:
- a **Vite + React** frontend in `app/`
- **Supabase SQL migrations** (schema + RLS + storage policies) in `supabase/`
- planning + architecture notes in `docs/`

## Features (implemented)

- **Auth**: email/password sign up + sign in (Supabase Auth)
- **Profile**: create/update profile, avatar upload (Supabase Storage `avatars` bucket)
- **Friends**: search users, send/accept/reject requests, list accepted friends
- **Feed & posts**: create text posts with optional image/video upload (Storage `post-media` bucket), view a chronological feed
- **Engagement**: likes, comments, replies (tables: `post_likes`, `comments`, `replies`, etc.)
- **Friend profile**: view a friend’s profile + posts
- **Graph view**: visualize connections (D3 force graph)

## What’s not implemented yet (in this repo)

- Notifications UI/service (table exists, feature not wired)
- Supabase Edge Functions (folder exists, no functions written yet)
- Image/video compression (uploads happen as-is)

## Tech stack

- Frontend: `Vite`, `React`, `TypeScript`, `Tailwind CSS`
- State/validation: `Zustand`, `Zod`
- Backend platform: `Supabase` (Auth + Postgres + Storage + Row Level Security)
- Graph/visualization: `d3`

## Repository structure

```text
IP_mini_project/
  README.md
  docs/
    setup/supabase-setup.md
    architecture/rls-plan.md
    product/product-scope.md
  app/                       # Frontend (Vite + React)
  supabase/                  # Supabase SQL migrations (schema/RLS/storage)
```

## Setup & run (local)

### Prerequisites

- **Node.js 18+** (Vite 5 requires modern Node)
- A **Supabase project** (cloud project is simplest for this repo)

### 1) Create a Supabase project

1. Create a new project in Supabase.
2. In the Supabase dashboard, copy:
   - Project URL
   - `anon` public key (do **not** use the service role key in the frontend)
3. Ensure Email/password auth is enabled (Supabase Auth → Providers).

### 2) Apply SQL migrations in Supabase (required)

This app expects specific tables, RLS policies, triggers, and Storage buckets to exist.
Open **Supabase Dashboard → SQL Editor**, then run these files **in order**:

1. `supabase/migrations/20260402_initial_schema.sql`
2. `supabase/migrations/20260402_rls_and_triggers.sql`
3. `supabase/migrations/20260402_storage_setup.sql`
4. `supabase/migrations/003_post_engagement.sql`
5. `supabase/migrations/20260403_enable_avatars_bucket.sql`
6. `supabase/migrations/20260403_enable_post_media_public_access.sql`

Notes:
- The frontend uses `getPublicUrl()` for media, so `avatars` and `post-media` are configured for **public read** by the migrations above.
- If you want private media, you’ll need to switch the frontend to **signed URLs** instead of public URLs.

### 3) Configure environment variables (required)

Create the frontend env file:

- Copy `app/.env.example` → `app/.env`
- Fill in:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

The app will throw on startup if these are missing (see `app/src/lib/supabase.ts`).

### 4) Install & run the frontend

From the repo root:

```bash
cd app
npm install
npm run dev
```

Then open the Vite URL printed in the terminal (usually `http://localhost:5173`).

## Useful commands

Run these from `app/`:

```bash
npm run dev       # start dev server
npm run build     # type-check + production build
npm run preview   # preview production build locally
npm run check     # TypeScript check (no emit)
npm run lint      # ESLint
```

## How the app is organized (mental model)

- UI pages/components: `app/src/features/**` and `app/src/App.tsx`
- Hooks (orchestration/state): `app/src/hooks/**`
- Services (Supabase queries + Storage uploads): `app/src/services/**`
- Supabase client: `app/src/lib/supabase.ts`
- Domain types: `app/src/types/domain.ts`
- Database + policies: `supabase/migrations/**`

## Troubleshooting

### “Missing Supabase environment variables”

- Confirm you created `app/.env` and filled `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

### Auth works, but profiles/posts/friends fail (RLS / table errors)

- Re-check that you ran the SQL migrations listed above, in order.
- Ensure you’re signed in (RLS policies require authenticated users for most reads/writes).

### Media uploads succeed, but images/videos don’t display

- Confirm you ran:
  - `supabase/migrations/20260403_enable_avatars_bucket.sql`
  - `supabase/migrations/20260403_enable_post_media_public_access.sql`
- Confirm the buckets exist in Supabase Storage: `avatars` and `post-media`.

## Roadmap (high level)

- Notifications UI + basic delivery
- Stronger “friends-only” profile visibility (RLS tightening)
- Media compression before upload
- Optional Edge Functions for complex feed queries

## Contributing

This is a student/mini-project style repo. If you’re extending it:

- Update migrations in `supabase/migrations/` before relying on new tables/columns.
- Keep access control in the database (RLS) as the source of truth.
- Update `docs/` when you make architectural decisions.

## License

No license file is included yet. Add a `LICENSE` file if you plan to distribute this project publicly.
