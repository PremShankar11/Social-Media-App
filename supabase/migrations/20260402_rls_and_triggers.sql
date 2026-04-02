create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists friend_requests_set_updated_at on public.friend_requests;
create trigger friend_requests_set_updated_at
before update on public.friend_requests
for each row
execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "friend_requests_select_participants" on public.friend_requests;
create policy "friend_requests_select_participants"
on public.friend_requests
for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "friend_requests_insert_sender" on public.friend_requests;
create policy "friend_requests_insert_sender"
on public.friend_requests
for insert
with check (auth.uid() = sender_id);

drop policy if exists "friend_requests_update_participants" on public.friend_requests;
create policy "friend_requests_update_participants"
on public.friend_requests
for update
using (auth.uid() = sender_id or auth.uid() = receiver_id)
with check (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "friendships_select_participants" on public.friendships;
create policy "friendships_select_participants"
on public.friendships
for select
using (auth.uid() = user_one_id or auth.uid() = user_two_id);

drop policy if exists "friendships_insert_participants" on public.friendships;
create policy "friendships_insert_participants"
on public.friendships
for insert
with check (auth.uid() = user_one_id or auth.uid() = user_two_id);

drop policy if exists "posts_select_self_or_friend" on public.posts;
create policy "posts_select_self_or_friend"
on public.posts
for select
using (
  auth.uid() = author_id
  or exists (
    select 1
    from public.friendships
    where (
      friendships.user_one_id = auth.uid()
      and friendships.user_two_id = posts.author_id
    ) or (
      friendships.user_two_id = auth.uid()
      and friendships.user_one_id = posts.author_id
    )
  )
);

drop policy if exists "posts_insert_self" on public.posts;
create policy "posts_insert_self"
on public.posts
for insert
with check (auth.uid() = author_id);

drop policy if exists "posts_update_self" on public.posts;
create policy "posts_update_self"
on public.posts
for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "post_media_select_allowed_posts" on public.post_media;
create policy "post_media_select_allowed_posts"
on public.post_media
for select
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_media.post_id
      and (
        posts.author_id = auth.uid()
        or exists (
          select 1
          from public.friendships
          where (
            friendships.user_one_id = auth.uid()
            and friendships.user_two_id = posts.author_id
          ) or (
            friendships.user_two_id = auth.uid()
            and friendships.user_one_id = posts.author_id
          )
        )
      )
  )
);

drop policy if exists "post_media_insert_owner_post" on public.post_media;
create policy "post_media_insert_owner_post"
on public.post_media
for insert
with check (
  exists (
    select 1
    from public.posts
    where posts.id = post_media.post_id
      and posts.author_id = auth.uid()
  )
);

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
