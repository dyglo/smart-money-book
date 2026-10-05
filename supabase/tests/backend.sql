-- Integration test against the connected database. Always rolls back the account slot and fixtures.
begin;
do $$
declare rejected boolean := false;
begin
 begin
  insert into auth.users(id,email) values(gen_random_uuid(),'unauthorized@example.com');
 exception when others then
  if sqlerrm not like '%restricted%' then raise; end if;
  rejected := true;
 end;
 if not rejected then raise exception 'Unexpected signup allowed'; end if;
end $$;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
values('10000000-0000-4000-8000-000000000001','tafartechlabs@gmail.com',now(),'{"name":"Backend verification"}');
do $$
declare rejected boolean := false;
begin
 begin
  insert into auth.users(id,email) values(gen_random_uuid(),'tafartechlabs@gmail.com');
 exception when others then
  if sqlerrm not like '%closed%' then raise; end if;
  rejected := true;
 end;
 if not rejected then raise exception 'Second signup allowed'; end if;
end $$;
insert into public.posts(id,title,html,status,kind) values
('20000000-0000-4000-8000-000000000001','Verification draft','<p>Private draft</p>','draft','tutorial'),
('20000000-0000-4000-8000-000000000002','Verification public','<p>Public lesson</p>','published','blog');
insert into public.resources(id,slug,title,category,filename,storage_path,size,published) values
('30000000-0000-4000-8000-000000000001','verification-hidden','Hidden verification PDF','Reference','hidden.pdf','verification/hidden.pdf',100,false),
('30000000-0000-4000-8000-000000000002','verification-public','Public verification PDF','Reference','public.pdf','verification/public.pdf',100,true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$
begin
 if public.is_admin() then raise exception 'Pending admin authorized'; end if;
 if exists(select 1 from public.posts where id='20000000-0000-4000-8000-000000000001') then raise exception 'Draft leaked'; end if;
 if exists(select 1 from public.resources where id='30000000-0000-4000-8000-000000000001') then raise exception 'Hidden resource leaked'; end if;
 begin
  insert into public.posts(title) values('Denied pending write');
  raise exception 'Pending admin write succeeded';
 exception when insufficient_privilege then null; end;
 begin
  perform public.admin_analytics();
  raise exception 'Pending admin analytics succeeded';
 exception when raise_exception then
  if sqlerrm not like '%approval required%' then raise; end if;
 end;
end $$;
reset role;
update private.admin_account set approved_at=now() where singleton;
set local role authenticated;
do $$
begin
 if not public.is_admin() then raise exception 'Approved admin rejected'; end if;
 if not exists(select 1 from public.posts where id='20000000-0000-4000-8000-000000000001') then raise exception 'Admin cannot read draft'; end if;
 insert into public.posts(id,title,html,status) values('20000000-0000-4000-8000-000000000003','CRUD verification','<p>Published</p>','published');
 update public.posts set status='draft' where id='20000000-0000-4000-8000-000000000003';
 if not found then raise exception 'Admin update failed'; end if;
 delete from public.posts where id='20000000-0000-4000-8000-000000000003';
 if not found then raise exception 'Admin delete failed'; end if;
 update public.resources set published=true where id='30000000-0000-4000-8000-000000000001';
 if not found then raise exception 'Admin resource update failed'; end if;
 update public.resources set published=false where id='30000000-0000-4000-8000-000000000001';
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"anon"}',true);
set local role anon;
do $$
begin
 if public.is_admin() then raise exception 'Anonymous admin authorized'; end if;
 if exists(select 1 from public.posts where id='20000000-0000-4000-8000-000000000001') then raise exception 'Anonymous draft leaked'; end if;
 if not exists(select 1 from public.posts where id='20000000-0000-4000-8000-000000000002') then raise exception 'Public post unreadable'; end if;
 if exists(select 1 from public.resources where id='30000000-0000-4000-8000-000000000001') then raise exception 'Anonymous hidden PDF leaked'; end if;
 perform public.add_comment('20000000-0000-4000-8000-000000000002','Reader','Persistent verification comment','40000000-0000-4000-8000-000000000001');
 if not exists(select 1 from public.comments where post_id='20000000-0000-4000-8000-000000000002') then raise exception 'Comment unreadable'; end if;
 begin
  perform public.add_comment('20000000-0000-4000-8000-000000000001','Reader','Draft comment forbidden','40000000-0000-4000-8000-000000000002');
  raise exception 'Draft comment allowed';
 exception when raise_exception then
  if sqlerrm not like '%published posts only%' then raise; end if;
 end;
 perform public.record_visit('40000000-0000-4000-8000-000000000001','/read?id=verification','20000000-0000-4000-8000-000000000002');
 perform public.record_visit('40000000-0000-4000-8000-000000000001','/read?id=verification','20000000-0000-4000-8000-000000000002');
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$
declare analytics jsonb;
begin
 analytics := public.admin_analytics();
 if (analytics->'views'->>'20000000-0000-4000-8000-000000000002')::int <> 1 then raise exception 'Visit deduplication failed'; end if;
end $$;
reset role;
-- Revocation takes effect immediately, without waiting for token refresh.
update private.admin_account set approved_at=null;
set local role authenticated;
do $$ begin if public.is_admin() then raise exception 'Revoked admin authorized'; end if; end $$;
reset role;
-- Account deletion does not reopen registration.
delete from auth.users where id='10000000-0000-4000-8000-000000000001';
do $$
declare rejected boolean := false;
begin
 begin insert into auth.users(id,email) values(gen_random_uuid(),'tafartechlabs@gmail.com');
 exception when others then if sqlerrm not like '%closed%' then raise; end if; rejected:=true; end;
 if not rejected then raise exception 'Deletion reopened registration'; end if;
end $$;
rollback;
select 'PASS: signup restriction, permanent lock, approval/revocation, RLS, CRUD, comments, analytics' as verification;
