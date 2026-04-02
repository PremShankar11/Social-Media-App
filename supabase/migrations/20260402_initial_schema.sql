-- Initial schema draft for foundation work.
-- This file is intentionally conservative and focused on the MVP core.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friend_requests_no_self_request check (sender_id <> receiver_id)
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_one_id uuid not null references public.profiles (id) on delete cascade,
  user_two_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_no_self_link check (user_one_id <> user_two_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  caption text not null default '',
  visibility text not null default 'friends' check (visibility in ('friends')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  width integer,
  height integer,
  duration_seconds numeric(10,2),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  actor_id uuid references public.profiles (id) on delete cascade,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists friendships_pair_unique
  on public.friendships (least(user_one_id, user_two_id), greatest(user_one_id, user_two_id));

create unique index if not exists friend_requests_pending_unique
  on public.friend_requests (sender_id, receiver_id)
  where status = 'pending';

create index if not exists posts_author_created_at_idx
  on public.posts (author_id, created_at desc);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);
