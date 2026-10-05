create schema if not exists private;
revoke all on schema private from public;

-- This singleton remains claimed even if the auth user is later deleted.
create table private.admin_account (
  singleton boolean primary key default true check (singleton),
  user_id uuid unique,
  approved_at timestamptz,
  claimed_at timestamptz
);
insert into private.admin_account(singleton) values (true);
alter table private.admin_account enable row level security;

create function private.claim_admin_account() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if lower(new.email) is distinct from 'tafartechlabs@gmail.com' then
    raise exception 'Registration is restricted to the designated administrator.';
  end if;
  update private.admin_account set user_id = new.id, claimed_at = now()
    where singleton and user_id is null;
  if not found then raise exception 'Registration is closed.'; end if;
  return new;
end; $$;
revoke all on function private.claim_admin_account() from public, anon, authenticated;
create trigger claim_admin_account before insert on auth.users
for each row execute function private.claim_admin_account();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from private.admin_account a join auth.users u on u.id = a.user_id
    where a.user_id = auth.uid() and a.approved_at is not null
      and lower(u.email) = 'tafartechlabs@gmail.com' and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default gen_random_uuid()::text,
  title text not null default '' check (length(title) <= 500),
  description text not null default '' check (length(description) <= 2000),
  kind text not null default 'blog' check (kind in ('blog','tutorial')),
  html text not null default '' check (length(html) <= 5000000),
  cover text not null default '',
  status text not null default 'draft' check (status in ('draft','published')),
  kind_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or (length(trim(title)) > 0 and length(trim(html)) > 0))
);
create index posts_status_updated_idx on public.posts(status, updated_at desc);
alter table public.posts enable row level security;
grant select on public.posts to anon, authenticated;
grant insert,update,delete on public.posts to authenticated;
create policy posts_read on public.posts for select to anon,authenticated using (status='published' or (select public.is_admin()));
create policy posts_manage on public.posts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (length(description)<=600),
  category text not null check (category in ('Books','Reference','Worksheets')),
  filename text not null,
  storage_path text unique not null,
  size bigint not null check (size between 1 and 15728640),
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.resources enable row level security;
grant select on public.resources to anon, authenticated;
grant insert,update,delete on public.resources to authenticated;
create policy resources_read on public.resources for select to anon,authenticated using (published or (select public.is_admin()));
create policy resources_manage on public.resources for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create function private.set_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end; $$;
create trigger posts_updated before update on public.posts for each row execute function private.set_updated_at();
create trigger resources_updated before update on public.resources for each row execute function private.set_updated_at();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('resources','resources',false,15728640,array['application/pdf']),
 ('images','images',true,5242880,array['image/png','image/jpeg','image/webp','image/gif']);
create policy resource_files_read on storage.objects for select to anon,authenticated using (
 bucket_id='resources' and ((select public.is_admin()) or exists(select 1 from public.resources r where r.storage_path=name and r.published))
);
create policy files_admin on storage.objects for all to authenticated using (
 bucket_id in ('resources','images') and (select public.is_admin())
) with check (bucket_id in ('resources','images') and (select public.is_admin()));

create table public.comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.posts(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 80),
 text text not null check(length(trim(text)) between 3 and 5000),
 created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments(post_id,created_at);
alter table public.comments enable row level security;
grant select on public.comments to anon,authenticated;
create policy comments_read on public.comments for select to anon,authenticated using (
 exists(select 1 from public.posts p where p.id=post_id and p.status='published') or (select public.is_admin())
);
create policy comments_admin on public.comments for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant delete on public.comments to authenticated;

create table private.comment_limits (visitor_id uuid primary key,last_posted timestamptz not null);
alter table private.comment_limits enable row level security;
create function public.add_comment(p_post_id uuid,p_name text,p_text text,p_visitor uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_visitor is null or not exists(select 1 from public.posts where id=p_post_id and status='published') then
   raise exception 'Comments are available on published posts only.';
 end if;
 insert into private.comment_limits values(p_visitor,now()) on conflict(visitor_id) do update set last_posted=now()
 where private.comment_limits.last_posted < now()-interval '30 seconds';
 if not found then raise exception 'Please wait before posting another comment.'; end if;
 insert into public.comments(post_id,name,text) values(p_post_id,trim(p_name),trim(p_text));
end; $$;
revoke all on function public.add_comment(uuid,text,text,uuid) from public;
grant execute on function public.add_comment(uuid,text,text,uuid) to anon,authenticated;

create table private.page_visits (
 visitor_id uuid not null,
 day date not null default (now() at time zone 'Africa/Nairobi')::date,
 path text not null check(length(path)<=500),
 post_id uuid references public.posts(id) on delete cascade,
 primary key(visitor_id,day,path)
);
alter table private.page_visits enable row level security;
create index visits_post_idx on private.page_visits(post_id);
create index visits_day_idx on private.page_visits(day);
create function public.record_visit(p_visitor uuid,p_path text,p_post_id uuid default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if p_visitor is null or p_path not like '/%' or p_path like '/admin%' then return; end if;
 if p_post_id is not null and not exists(select 1 from public.posts where id=p_post_id and status='published') then return; end if;
 insert into private.page_visits(visitor_id,path,post_id) values(p_visitor,p_path,p_post_id)
 on conflict(visitor_id,day,path) do update set post_id=coalesce(excluded.post_id,private.page_visits.post_id);
end; $$;
revoke all on function public.record_visit(uuid,text,uuid) from public;
grant execute on function public.record_visit(uuid,text,uuid) to anon,authenticated;

create function public.admin_analytics() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare today date := (now() at time zone 'Africa/Nairobi')::date;
begin
 if not public.is_admin() then raise exception 'Administrator approval required.'; end if;
 return jsonb_build_object(
 'visitors',(select count(distinct visitor_id) from private.page_visits where day between today-6 and today),
 'daily',(select jsonb_agg(jsonb_build_object('day',d::date,'visitors',(select count(distinct visitor_id) from private.page_visits where day=d::date)) order by d) from generate_series(today-6,today,interval '1 day') d),
 'views',coalesce((select jsonb_object_agg(post_id,n) from (select post_id,count(*) n from private.page_visits where post_id is not null group by post_id) v),'{}'::jsonb)
 );
end; $$;
revoke all on function public.admin_analytics() from public;
grant execute on function public.admin_analytics() to authenticated;
