# Foundation Plan

## 0. Working Status

This file is now the live tracker for foundation work.

### Current status
- Foundation started
- Stack approved
- Git repository initialized
- Frontend app scaffolded
- Base docs created
- Initial schema drafted
- Initial RLS plan drafted
- App dependencies installed
- Supabase frontend credentials added locally
- Auth and profile feature foundation added
- Friend request feature foundation added
- Social media style home UI added
- Type-check and lint verified
- Supabase project still needs SQL migrations applied

### Approved decisions
- Frontend: `Vite + React`
- Language: `TypeScript`
- State management: `Zustand`
- Styling: `Tailwind CSS`
- Backend platform: `Supabase`
- Validation: `Zod`

### Foundation checklist
- [x] Problem statement reviewed
- [x] MVP direction defined
- [x] Tech stack approved
- [x] Git repository initialized
- [x] Frontend app scaffolded
- [x] Tailwind configured
- [x] Base folder structure created
- [x] Environment template added
- [x] README created
- [x] Product scope doc created
- [x] Supabase folder structure created
- [x] Initial schema drafted
- [x] RLS plan drafted
- [x] Dependencies installed
- [x] Supabase project created
- [x] Supabase credentials added
- [x] Auth flow implemented
- [x] Profile flow implemented
- [x] Friend search/request flow implemented
- [x] Social home page shell implemented
- [ ] Supabase SQL migrations applied
- [ ] Post creation flow implemented
- [ ] Media upload flow implemented
- [ ] Feed flow implemented

### Decision log
- Chose `Vite + React + TypeScript` for the fastest clean MVP setup.
- Chose `Zustand` over Redux Toolkit to keep state management lightweight.
- Chose `Tailwind CSS` for consistent UI foundations from the start.
- Chose `Supabase` as the backend platform for auth, database, storage, and edge logic.
- Chose `Zod` to validate app data and keep client/server contracts safer.
- Initialized the repository and created the `app/`, `docs/`, and `supabase/` foundation structure.
- Added the first schema draft and an initial RLS planning document before feature implementation.
- Verified the app foundation with `npm run check`, `npm run lint`, and `npm run build`.
- Added local Supabase frontend configuration using the provided project URL and publishable key.
- Implemented the first real feature slice: auth, profile setup, user search, friend requests, and accepted-friends listing.
- Added a Supabase setup note so the SQL files can be applied before end-to-end testing.

## 1. Project Summary

Build a friends-first social media app focused on real connections instead of engagement traps.

Core product idea:
- private-by-default social network
- chronological feed
- friends-only discovery
- easy photo/video sharing
- no addictive streak mechanics
- no public algorithmic attention economy

This is a strong problem statement. It is clear, relevant, and differentiated. The biggest risk is not the idea, but trying to build too much too early. The right move is to tighten the MVP and create strong backend rules from day one.

## 2. What Looks Good Already

Your planned modules are mostly correct:
- Identity and authentication
- User profiles
- Friend graph / social connections
- Posting
- Media storage and processing
- Feed delivery
- Notifications
- Security
- Search and discovery
- Settings and preferences
- API and backend services

Your tech stack is also mostly good:
- `React` for frontend
- `Supabase` for auth, database, storage, and realtime
- `Supabase Edge Functions` for backend logic that should not live in the client
- `RLS` for privacy and access control
- image/video compression before upload

This is a very practical stack for a student or early-stage project because it reduces backend setup time while still letting you build a serious product.

## 3. Recommended Changes Before Starting

### Keep
- Keep `React`
- Keep `Supabase`
- Keep `Supabase Edge Functions`
- Keep `RLS`
- Keep media compression

### Change

1. Prefer `TypeScript` everywhere
- Use TypeScript for frontend and backend functions.
- It will help a lot once auth, profile data, and post/media types start growing.

2. Choose `Zustand` over `Redux Toolkit` for MVP
- `Zustand` is simpler and faster to set up.
- For an MVP social app, Redux is usually unnecessary unless state becomes very complex.

3. Use `Next.js` instead of plain React if you are still deciding
- If by "React" you mean frontend choice is still open, prefer `Next.js`.
- It gives you routing, better project structure, easier deployment, and cleaner scaling.
- If you already want a pure SPA, `Vite + React + TypeScript` is also fine.

4. Add a validation layer
- Use `Zod` for request/data validation.
- This prevents bad payloads and keeps client/server contracts clean.

5. Add a UI system from day one
- Use `Tailwind CSS` and a small reusable component layer.
- Do not build random UI page by page.

6. Define privacy rules before coding features
- Since your app is friends-only in spirit, privacy rules are not a later feature.
- They are part of the foundation.

## 4. Suggested Final Stack

Recommended stack:
- `Next.js` or `Vite + React`
- `TypeScript`
- `Supabase`
- `PostgreSQL` via Supabase
- `Supabase Auth`
- `Supabase Storage`
- `Supabase Edge Functions`
- `Zustand`
- `Tailwind CSS`
- `Zod`
- `React Hook Form`
- image/video compression on client before upload

If you want the simplest option:
- `Vite + React + TypeScript + Zustand + Tailwind + Supabase`

If you want the most scalable frontend foundation:
- `Next.js + TypeScript + Zustand + Tailwind + Supabase`

## 5. MVP Scope

Do not build all 11 modules at once.

### MVP Phase 1
- Sign up / login
- Create and edit profile
- Send, accept, reject friend requests
- Create post with image/video/text
- Upload compressed media
- View chronological feed from accepted friends only
- Basic notifications for friend requests and post interactions
- Privacy settings basics

### Phase 2
- Comments
- Likes / reactions
- Search friends
- Friend suggestions from mutuals only
- Better notifications

### Phase 3
- Video optimization improvements
- Realtime feed updates
- Report/block tools
- Admin moderation tools
- Analytics for product improvement

## 6. Core Product Rules

These rules should guide every technical decision:

1. Friends-first
- A user should mainly see content from accepted friends.

2. Chronological feed
- Sort by created time, not engagement score.

3. Private by default
- New accounts, posts, and discovery should lean toward safety and consent.

4. No dark patterns
- No streaks, manipulative infinite growth loops, or engagement bait mechanics.

5. Strong data boundaries
- Client should never decide access on its own.
- Access must be enforced in database policies and server logic.

## 7. High-Level Architecture

### Frontend
- Authentication screens
- Onboarding/profile setup
- Home feed
- Post composer
- Friends page
- Notifications page
- Settings page

### Backend via Supabase
- Auth
- PostgreSQL tables
- Storage buckets for media
- RLS policies
- Edge functions for secure business logic

### Media Flow
1. User selects image/video
2. Client compresses media
3. Client uploads to Supabase Storage
4. App stores post record and media metadata in database
5. Feed fetches only allowed posts

## 8. First Database Model

Start with these tables:

### `profiles`
- `id` references auth user id
- `username`
- `display_name`
- `bio`
- `avatar_url`
- `created_at`
- `updated_at`

### `friend_requests`
- `id`
- `sender_id`
- `receiver_id`
- `status` (`pending`, `accepted`, `rejected`, `cancelled`)
- `created_at`
- `updated_at`

### `friendships`
- `id`
- `user_one_id`
- `user_two_id`
- `created_at`

### `posts`
- `id`
- `author_id`
- `caption`
- `visibility` (`friends`)
- `created_at`
- `updated_at`

### `post_media`
- `id`
- `post_id`
- `storage_path`
- `media_type` (`image`, `video`)
- `width`
- `height`
- `duration_seconds`
- `created_at`

### `notifications`
- `id`
- `user_id`
- `type`
- `actor_id`
- `entity_id`
- `read_at`
- `created_at`

You can add comments, reactions, and blocks later.

## 9. Critical RLS Thinking

RLS is one of the most important parts of this project.

Must enforce:
- users can edit only their own profile
- users can send friend requests as themselves only
- users can see posts only from accepted friends
- users can create posts only as themselves
- users can read notifications only for themselves
- storage access should align with friendship/privacy rules

Important note:
- some feed queries and access checks may be easier through SQL views or Edge Functions instead of only raw client-side queries

## 10. Recommended Folder Foundation

If using `Vite + React`:

```text
IP_mini_project/
  foundation.md
  app/
    src/
      components/
      features/
        auth/
        profile/
        friends/
        posts/
        feed/
        notifications/
        settings/
      lib/
      hooks/
      services/
      pages/
      types/
      utils/
    public/
  supabase/
    migrations/
    functions/
    seeds/
  docs/
    product/
    architecture/
    api/
```

Recommended feature structure:
- keep each feature self-contained
- place UI, hooks, types, and service logic near the feature
- keep shared utilities in `lib` or `utils`

## 11. Solid Start Order

This is the best order to begin the project.

### Step 1. Write the product decisions
Create a short product doc defining:
- who the app is for
- what problems it solves
- what the MVP includes
- what the MVP explicitly excludes

### Step 2. Create the repo and app shell
- initialize git
- create frontend app
- set up TypeScript
- set up Tailwind
- create base folder structure
- add `.env.example`

### Step 3. Create Supabase project
- create project
- connect app to Supabase
- set up auth
- create storage bucket plan

### Step 4. Design database schema first
- create SQL migration files
- define tables
- define indexes
- define relationships
- define RLS policies before UI work goes too far

### Step 5. Build auth and profile setup
- sign up
- sign in
- session handling
- profile creation after signup

### Step 6. Build friend system
- send request
- accept/reject request
- list friends
- protect duplicate requests

### Step 7. Build posting and media upload
- text + image/video composer
- client compression
- storage upload
- post creation flow

### Step 8. Build chronological friends feed
- fetch posts from accepted friends
- sort by created time descending
- add pagination

### Step 9. Build notifications
- friend request notifications
- accepted request notifications
- post interaction notifications later if needed

### Step 10. Harden the app
- empty states
- loading states
- error handling
- auth guards
- privacy checks
- rate limiting in sensitive flows

## 12. First 7 Deliverables

These should be your first concrete outputs:

1. `foundation.md`
2. `README.md`
3. product scope doc
4. initial folder/repo setup
5. Supabase config and environment setup
6. first SQL schema migration
7. auth + profile vertical slice

## 13. Suggested Milestones

### Milestone 1: Project setup
- repo created
- frontend bootstrapped
- Supabase connected
- env setup complete

### Milestone 2: Auth + profile
- user can sign up, log in, and create a profile

### Milestone 3: Friend graph
- users can manage friend requests and accepted friendships

### Milestone 4: Posting
- users can create a post with media

### Milestone 5: Feed
- users can view a chronological friends-only feed

### Milestone 6: Notifications + polish
- basic notifications and UX cleanup

## 14. Risks to Control Early

Main risks:
- trying to build too many modules at once
- weak RLS policies
- unclear friendship model
- poor media upload handling
- frontend state growing without structure
- not defining product rules before coding

How to reduce them:
- lock MVP scope before building
- design schema before components
- test auth and RLS early
- build one complete vertical slice first
- keep features modular

## 15. Recommended Immediate Next Actions

The next best moves are:

1. Approve this foundation direction
2. Decide between `Next.js` and `Vite + React`
3. Confirm `TypeScript + Zustand + Tailwind + Supabase`
4. Create the actual project folder/repo
5. Start with schema + auth, not feed UI

## 16. My Recommendation

If I were setting this up with you from scratch, I would start with:

- `Vite + React + TypeScript`
- `Zustand`
- `Tailwind CSS`
- `Supabase`
- `Zod`

Reason:
- fastest to build
- easy to understand
- low overhead
- strong enough for an MVP

If your goal is stronger long-term structure and possible SSR later, choose `Next.js` instead.

## 17. Execution Plan I Recommend We Follow

### Phase A: Foundation
- finalize stack
- initialize repo
- bootstrap app
- connect Supabase
- create docs and env templates

### Phase B: Data and security
- create schema
- add migrations
- add RLS policies
- test basic access rules

### Phase C: Core user flows
- auth
- profile creation
- friend requests
- friendships

### Phase D: Content flow
- post composer
- media upload
- post storage
- feed query

### Phase E: App completion
- notifications
- settings
- UX polish
- deployment prep

## 18. Definition of a Strong Foundation

You are ready to move into full feature development when:
- repo and app are created
- coding conventions are chosen
- Supabase is connected
- schema exists
- RLS exists
- auth works
- profile creation works
- friend relationship model is working

Until those are done, the foundation is not complete.
