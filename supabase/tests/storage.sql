-- Storage authorization test: metadata-only rows, rolled back with the temporary admin.
begin;
insert into auth.users(id,email,email_confirmed_at) values('10000000-0000-4000-8000-000000000001','tafartechlabs@gmail.com',now());
update private.admin_account set approved_at=now();
insert into public.posts(id,title,html,status) values
('20000000-0000-4000-8000-000000000001','Private image verification','<p>Draft</p>','draft'),
('20000000-0000-4000-8000-000000000002','Public image verification','<p>Published</p>','published');
insert into public.resources(id,slug,title,category,filename,storage_path,size,published) values
('30000000-0000-4000-8000-000000000001','hidden-verification','Hidden PDF','Reference','hidden.pdf','verification/hidden.pdf',100,false),
('30000000-0000-4000-8000-000000000002','public-verification','Public PDF','Reference','public.pdf','verification/public.pdf',100,true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
insert into storage.objects(bucket_id,name) values
('images','20000000-0000-4000-8000-000000000001/private.png'),
('images','20000000-0000-4000-8000-000000000002/public.png'),
('resources','verification/hidden.pdf'),('resources','verification/public.pdf');
do $$ begin
 if (select count(*) from storage.objects where bucket_id='resources' and name like 'verification/%') <> 2 then raise exception 'Admin file read failed'; end if;
 update storage.objects set metadata='{"verified":true}' where bucket_id='resources' and name='verification/hidden.pdf';
 if not found then raise exception 'Admin storage update failed'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"anon"}',true);
set local role anon;
do $$ begin
 if exists(select 1 from storage.objects where bucket_id='images' and name='20000000-0000-4000-8000-000000000001/private.png') then raise exception 'Draft image leaked'; end if;
 if not exists(select 1 from storage.objects where bucket_id='images' and name='20000000-0000-4000-8000-000000000002/public.png') then raise exception 'Published image denied'; end if;
 if exists(select 1 from storage.objects where bucket_id='resources' and name='verification/hidden.pdf') then raise exception 'Hidden PDF leaked'; end if;
 if not exists(select 1 from storage.objects where bucket_id='resources' and name='verification/public.pdf') then raise exception 'Published PDF denied'; end if;
 begin
  insert into storage.objects(bucket_id,name) values('resources','verification/unauthorized.pdf');
  raise exception 'Anonymous upload allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Unpublishing immediately denies fresh public media reads.
update public.posts set status='draft' where id='20000000-0000-4000-8000-000000000002';
update public.resources set published=false where id='30000000-0000-4000-8000-000000000002';
set local role anon;
do $$ begin
 if exists(select 1 from storage.objects where bucket_id='images' and name='20000000-0000-4000-8000-000000000002/public.png') then raise exception 'Unpublished image readable'; end if;
 if exists(select 1 from storage.objects where bucket_id='resources' and name='verification/public.pdf') then raise exception 'Unpublished PDF readable'; end if;
end $$;
reset role;
rollback;
select 'PASS: storage CRUD authorization, private draft images/PDFs, published access, unpublishing, blocked anonymous uploads' as verification;
