# Project Technical Report (IP Mini Project)

This report summarizes the complete technical structure of this repository: tech stack, where each piece is used, the tools/libraries involved, and the features implemented so far.

---

## 1) Repository structure

```text
IP_mini_project/
  README.md
  foundation.md
  report.md
  docs/
    setup/supabase-setup.md
    architecture/rls-plan.md
    product/product-scope.md
  app/                       # Frontend (Vite + React)
    package.json
    .env.example
    src/
      main.tsx               # React boot
      App.tsx                # App shell + navigation
      lib/supabase.ts        # Supabase client
      features/              # Feature UI components
      hooks/                 # Feature orchestration hooks
      services/              # Supabase DB/storage calls
      types/domain.ts        # Shared domain types
      utils/                 # helpers + graph algorithms
  supabase/                  # Backend migrations (SQL)
    migrations/
    functions/               # Edge functions placeholder (not implemented yet)
    seeds/
```

---

## 2) Tech stack (what it is + where it is used)

### 2.1 Frontend runtime & build

#### Node.js + npm
**What it is:** JavaScript runtime + package manager used to run/build the frontend and install dependencies.  
**Where used:** `app/package.json` scripts:
- `npm run dev` → local dev server
- `npm run build` → type-check + production build
- `npm run check` → TypeScript no-emit type-check
- `npm run lint` → ESLint

#### Vite
**What it is:** modern dev server + bundler optimized for fast React development.  
**Where used:** `app/vite.config.ts`, plus `app/package.json` scripts (`dev`, `preview`, `build`).  
**Usage in this project:** serves the SPA, bundles TypeScript/React for production.

**Example (Vite config):**
```ts
// app/vite.config.ts
export default defineConfig({ plugins: [react()] })
```

---

### 2.2 Frontend UI

#### React + React DOM
**What it is:** component-based UI library (React) and browser renderer (React DOM).  
**Where used:**
- Entry: `app/src/main.tsx`
- App shell + views: `app/src/App.tsx`
- Feature components: `app/src/features/**`

**Usage in this project:** renders the entire UI: authentication, feed, profiles, friends, and graph visualization pages.

**Example (React boot):**
```ts
// app/src/main.tsx
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

#### TypeScript
**What it is:** typed superset of JavaScript for safer refactors and clearer data contracts.  
**Where used:** almost all code in `app/src/**` (`.ts`/`.tsx`).  
**Key usage:** shared domain models in `app/src/types/domain.ts` (profiles, posts, friendships, graph types, engagement types).

---

### 2.3 Styling

#### Tailwind CSS
**What it is:** utility-first CSS framework.  
**Where used:**
- Config tokens/theme: `app/tailwind.config.ts`
- Global styles + component classes: `app/src/index.css`
- Tailwind classes throughout `app/src/**/*.tsx`

**Usage in this project:** consistent design system (colors, shadows, animations), and reusable UI classes like `.card`, `.btn-primary`, `.input-base`.

**Example (component classes via @apply):**
```css
/* app/src/index.css */
.btn-primary {
  @apply rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white;
}
```

#### PostCSS + Autoprefixer
**What it is:** CSS processing pipeline; Autoprefixer adds vendor prefixes.  
**Where used:** `app/postcss.config.js` (Tailwind + Autoprefixer plugins).

---

### 2.4 Client state & validation

#### Zustand
**What it is:** lightweight global state management store.  
**Where used:** `app/src/store/app-store.ts`.  
**Usage in this project (current):** foundation-mode flag store exists but is not currently imported by any UI files yet.

**Example:**
```ts
// app/src/store/app-store.ts
export const useAppStore = create((set) => ({
  isFoundationMode: true,
  setFoundationMode: (value) => set({ isFoundationMode: value }),
}))
```

#### Zod
**What it is:** runtime schema validation library.  
**Where used:** `app/src/features/auth/schemas.ts`.  
**Usage in this project:** validates auth inputs (email/password) and profile setup fields before calling Supabase.

**Example:**
```ts
// app/src/features/auth/schemas.ts
export const authSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})
```

#### react-hook-form (installed)
**What it is:** form state library for React.  
**Where used:** currently installed in `app/package.json` but forms mostly use `useState` + `zod.safeParse` right now.

---

### 2.5 Backend platform

#### Supabase
**What it is:** backend platform providing:
- Auth (users/sessions)
- Postgres database (tables, views, SQL, triggers)
- Storage (buckets + object policies)
- Row Level Security (RLS) enforcement

**Where used (frontend client):** `app/src/lib/supabase.ts` (initializes the Supabase JS client).  
**Where used (data access):**
- Auth/session: `app/src/hooks/use-auth.ts`
- Services: `app/src/services/*.ts` (`friends-service`, `profile-service`, `post-service`, `engagement-service`, `graph-service`)

**Environment variables (Vite):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
Defined in `.env.example` and `app/.env.example`, loaded via `import.meta.env` in `app/src/lib/supabase.ts`.

**Example (Supabase client):**
```ts
// app/src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### 2.6 Database security (RLS) + triggers

#### Row Level Security (RLS)
**What it is:** Postgres feature that enforces per-row read/write rules for each table.  
**Where defined:** `supabase/migrations/20260402_rls_and_triggers.sql`.  
**Usage in this project:** “friends-first” privacy and ownership enforcement, such as:
- users can update only their own `profiles`
- users can read only their own + friends’ `posts`
- users can write only their own `posts`, `post_media`, likes, comments, etc.

**Example (posts readable by self or friend):**
```sql
create policy "posts_select_self_or_friend"
on public.posts
for select
using (auth.uid() = author_id or exists (select 1 from public.friendships where ...));
```

#### Updated-at trigger
**What it is:** a trigger function to keep `updated_at` current.  
**Where defined:** `supabase/migrations/20260402_rls_and_triggers.sql` (`set_updated_at()`).

---

### 2.7 File/media storage

#### Supabase Storage buckets + policies
**What it is:** object storage integrated with Supabase Auth + policy enforcement.  
**Where defined:**
- Post media bucket + policies: `supabase/migrations/20260402_storage_setup.sql` (private) and `supabase/migrations/20260403_enable_post_media_public_access.sql` (public read enabled).
- Avatars bucket + policies: `supabase/migrations/20260403_enable_avatars_bucket.sql` (public read + per-user write rules).

**Where used in frontend:**
- Avatar upload: `app/src/services/profile-service.ts`
- Post media upload: `app/src/services/post-service.ts`

**Example (upload + public URL):**
```ts
// app/src/services/profile-service.ts
await supabase.storage.from('avatars').upload(storagePath, file, { upsert: true })
const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath)
```

---

### 2.8 Graph visualization

#### D3
**What it is:** data visualization library.  
**Where used:** `app/src/features/graph/force-graph.tsx`.  
**Usage in this project:** force-directed friend network graph with:
- force simulation + layout
- zoom/pan
- drag nodes
- tooltips + hover highlighting

---

### 2.9 Quality tools

#### ESLint
**What it is:** linter for code quality and consistency.  
**Where used:** `app/eslint.config.js`, run via `npm run lint`.

---

## 3) Supabase database schema (tables implemented)

The main schema is defined in `supabase/migrations/20260402_initial_schema.sql` and engagement schema in `supabase/migrations/003_post_engagement.sql`.

### Core tables
- `profiles` (user profile data; `id` references `auth.users`)
- `friend_requests` (pending/accepted/rejected/cancelled requests)
- `friendships` (accepted friendships; unique constraint via `least/greatest` index)
- `posts` (friends-only posts)
- `post_media` (storage_path + media metadata linked to posts)
- `notifications` (table exists; UI/logic not implemented yet)

### Engagement tables
- `comments`, `replies`
- `post_likes`, `comment_likes`, `reply_likes`

---

## 4) Features implemented so far (by user flow)

### 4.1 Authentication (Supabase Auth)
**What works:**
- Sign up
- Sign in
- Sign out
- Session persistence + auth-state subscription

**Where:**
- UI: `app/src/features/auth/landing-page.tsx`, `app/src/features/auth/auth-forms.tsx`
- Logic: `app/src/hooks/use-auth.ts`

---

### 4.2 Profile management
**What works:**
- Create/update profile (username, display name, bio)
- Profile form validation (Zod)
- Profile avatar upload (Supabase Storage `avatars` bucket)

**Where:**
- UI form: `app/src/features/profile/profile-setup-form.tsx`
- Avatar UI: `app/src/features/profile/avatar-upload.tsx`
- Data: `app/src/services/profile-service.ts`

---

### 4.3 Friends system (search + requests + acceptance)
**What works:**
- Search profiles by username/display name
- Send friend requests
- View incoming/outgoing pending requests
- Accept/decline requests
- List accepted friends

**Where:**
- UI: `app/src/features/friends/friends-panel.tsx`
- Hook orchestration: `app/src/hooks/use-connections.ts`
- Data access: `app/src/services/friends-service.ts`
- DB tables: `friend_requests`, `friendships`

---

### 4.4 Feed (friends-first chronological posts)
**What works:**
- Pull a friends + self feed (chronological)
- Attach profile data (display name, username, avatar)
- Attach media (from `post_media` + Storage public URL)
- Compute counts (likes/comments) and “did I like this?” state

**Where:**
- Hook: `app/src/hooks/use-feed.ts`
- Data building: `app/src/services/engagement-service.ts` (`fetchFriendsFeedPosts`)

---

### 4.5 Posting (text + optional image/video)
**What works:**
- Create a post (friends-only visibility)
- Optional upload of image/video to Storage (`post-media` bucket)
- Create `post_media` row linked to the post
- Optimistic UI post insertion while saving

**Where:**
- Hook: `app/src/hooks/use-feed.ts`
- Data: `app/src/services/post-service.ts`
- UI composer: implemented inside `app/src/App.tsx`

---

### 4.6 Post deletion
**What works:**
- Delete a post row
- Remove associated storage objects (if any)
- Delete related `post_media` rows

**Where:**
- Hook: `app/src/hooks/use-profile.ts`
- Data: `app/src/services/post-service.ts` (`deletePost`)

---

### 4.7 Post engagement (likes, comments, replies)
**What works:**
- Like/unlike posts
- Load comments for a post, show author info + avatar
- Like/unlike comments
- Create/delete comments
- Load replies for a comment, show author info + avatar
- Like/unlike replies
- Create/delete replies
- Optimistic UI updates for likes/counts

**Where:**
- UI: `app/src/features/engagement/post-engagement.tsx`
- Service: `app/src/services/engagement-service.ts`
- DB tables: `comments`, `replies`, `post_likes`, `comment_likes`, `reply_likes`

---

### 4.8 Friend graph visualization
**What works:**
- Build a graph from friendships (direct friends + friends-of-friends)
- Fetch profiles for graph nodes
- Compute friend counts and mutual connections
- Visualize interactive force graph (D3): zoom, drag, hover highlight, tooltip
- Compute network metrics + communities (label propagation)

**Where:**
- Data: `app/src/services/graph-service.ts`
- Algorithms: `app/src/utils/graph-algorithms.ts`
- Hook: `app/src/hooks/use-graph-data.ts`
- UI: `app/src/features/graph/graph-page.tsx`, `app/src/features/graph/force-graph.tsx`

---

### 4.9 Friend profile view (read-only profile page)
**What works:**
- View another user’s profile details
- See friend’s posts and media (if allowed by RLS)
- Show friend stats (friend count, post count)
- Navigate to another friend from a related-friends list

**Where:**
- Hook: `app/src/hooks/use-friend-profile.ts`
- UI: `app/src/features/profile/friend-profile-page.tsx` and subcomponents
- Data: `app/src/services/friends-service.ts` + `app/src/services/post-service.ts`

---

## 5) Items present but not implemented (yet)

### Supabase Edge Functions
- Folder exists: `supabase/functions/.gitkeep`
- No Edge Function code implemented yet.

### Image & video compression
- No compression code/dependency found in this repo yet.
- Media uploads happen as-is via Storage upload in:
  - `app/src/services/profile-service.ts` (avatars)
  - `app/src/services/post-service.ts` (post media)

### Notifications feature
- `notifications` table exists (`20260402_initial_schema.sql`)
- UI + service logic for notifications is not implemented yet.

---

## 6) Setup notes (important for running the project)

### Required environment variables
Copy `app/.env.example` → `app/.env` and fill:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Required Supabase SQL (to enable current features)
Run in Supabase SQL editor in order (per `docs/setup/supabase-setup.md`):
1. `supabase/migrations/20260402_initial_schema.sql`
2. `supabase/migrations/20260402_rls_and_triggers.sql`
3. `supabase/migrations/20260402_storage_setup.sql`

Then run feature migrations you’re using:
- `supabase/migrations/003_post_engagement.sql`
- `supabase/migrations/20260403_enable_avatars_bucket.sql`
- `supabase/migrations/20260403_enable_post_media_public_access.sql`

---

## 7) Quick “how requests flow” (mental model)

UI components call hooks (state + orchestration), hooks call services (Supabase queries/uploads), and Supabase enforces security with RLS:

- UI: `app/src/features/**` and `app/src/App.tsx`
- Hooks: `app/src/hooks/**`
- Services: `app/src/services/**`
- Security rules: `supabase/migrations/20260402_rls_and_triggers.sql` (+ storage policies)
