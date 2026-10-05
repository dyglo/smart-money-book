update storage.buckets set public=false where id='images';
create policy image_files_read on storage.objects for select to anon,authenticated using (
 bucket_id='images' and exists(select 1 from public.posts p where p.id::text=(storage.foldername(name))[1] and p.status='published')
);
drop policy files_admin on storage.objects;
create policy files_admin_read on storage.objects for select to authenticated using(bucket_id in ('resources','images') and (select public.is_admin()));
create policy files_admin_insert on storage.objects for insert to authenticated with check(bucket_id in ('resources','images') and (select public.is_admin()));
create policy files_admin_update on storage.objects for update to authenticated using(bucket_id in ('resources','images') and (select public.is_admin())) with check(bucket_id in ('resources','images') and (select public.is_admin()));
create policy files_admin_delete on storage.objects for delete to authenticated using(bucket_id in ('resources','images') and (select public.is_admin()));
-- Avoid evaluating duplicate SELECT policies for the same role.
drop policy files_admin_read on storage.objects;
drop policy resource_files_read on storage.objects;
drop policy image_files_read on storage.objects;
create policy site_files_read on storage.objects for select to anon,authenticated using (
 bucket_id in ('resources','images') and (
  (select public.is_admin()) or
  (bucket_id='resources' and exists(select 1 from public.resources r where r.storage_path=name and r.published)) or
  (bucket_id='images' and exists(select 1 from public.posts p where p.id::text=(storage.foldername(name))[1] and p.status='published'))
 )
);
drop policy posts_manage on public.posts;
create policy posts_insert on public.posts for insert to authenticated with check((select public.is_admin()));
create policy posts_update on public.posts for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy posts_delete on public.posts for delete to authenticated using((select public.is_admin()));
drop policy resources_manage on public.resources;
create policy resources_insert on public.resources for insert to authenticated with check((select public.is_admin()));
create policy resources_update on public.resources for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy resources_delete on public.resources for delete to authenticated using((select public.is_admin()));
drop policy comments_admin on public.comments;
create policy comments_delete on public.comments for delete to authenticated using((select public.is_admin()));
