insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', false)
on conflict (id) do nothing;

drop policy if exists "post_media_storage_select_authenticated" on storage.objects;
create policy "post_media_storage_select_authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'post-media');

drop policy if exists "post_media_storage_insert_authenticated" on storage.objects;
create policy "post_media_storage_insert_authenticated"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-media'
  and auth.uid() is not null
);

drop policy if exists "post_media_storage_update_owner" on storage.objects;
create policy "post_media_storage_update_owner"
on storage.objects
for update
to authenticated
using (bucket_id = 'post-media' and owner = auth.uid())
with check (bucket_id = 'post-media' and owner = auth.uid());

drop policy if exists "post_media_storage_delete_owner" on storage.objects;
create policy "post_media_storage_delete_owner"
on storage.objects
for delete
to authenticated
using (bucket_id = 'post-media' and owner = auth.uid());
