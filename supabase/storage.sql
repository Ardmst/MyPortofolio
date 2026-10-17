-- ===========================================================================
-- Portototo — storage.sql
-- Creates the `portfolio-media` bucket and its access policies.
-- Mirrors the uploader in src/lib/data/repository.ts (uploadMedia).
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760, -- 10 MB, matches MAX_UPLOAD_BYTES in the repository layer
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'image/svg+xml', 'image/avif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read for every object in the bucket.
drop policy if exists "portfolio media is publicly readable" on storage.objects;
create policy "portfolio media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

-- Authenticated admins may upload / replace / delete.
drop policy if exists "portfolio media is writable by authenticated" on storage.objects;
create policy "portfolio media is writable by authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media');

drop policy if exists "portfolio media is updatable by authenticated" on storage.objects;
create policy "portfolio media is updatable by authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media')
  with check (bucket_id = 'portfolio-media');

drop policy if exists "portfolio media is deletable by authenticated" on storage.objects;
create policy "portfolio media is deletable by authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media');
