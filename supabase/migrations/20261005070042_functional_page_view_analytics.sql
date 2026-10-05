create table private.page_view_events (
 event_id uuid primary key,
 visitor_id uuid not null,
 day date not null default (now() at time zone 'Africa/Nairobi')::date,
 path text not null check(length(path) <= 500),
 post_id uuid references public.posts(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table private.page_view_events enable row level security;
revoke all on private.page_view_events from public,anon,authenticated;
create policy page_view_events_internal on private.page_view_events for all to anon,authenticated using(false) with check(false);
create index page_view_events_day_visitor_idx on private.page_view_events(day,visitor_id);
create index page_view_events_post_idx on private.page_view_events(post_id) where post_id is not null;

-- One UUID per rendered navigation makes network retries and React effect replays idempotent.
create function private.record_page_view(p_event uuid,p_visitor uuid,p_path text,p_post_id uuid default null) returns void
language plpgsql security definer set search_path='' as $$
declare post public.posts;
begin
 if p_event is null or p_visitor is null or p_path is null or length(p_path)>500 then
  raise exception 'Invalid page view.';
 end if;
 if p_post_id is not null then
  select * into post from public.posts where id=p_post_id and status='published';
  if not found then return; end if;
  if p_path <> '/read?id=' || post.id::text and not (post.kind='tutorial' and p_path='/tutorials/' || post.slug) then return; end if;
 elsif p_path not in ('/','/blog','/tutorials','/market-structure','/books','/resources') then
  return;
 end if;
 insert into private.page_view_events(event_id,visitor_id,path,post_id) values(p_event,p_visitor,p_path,p_post_id)
 on conflict(event_id) do nothing;
end; $$;
revoke execute on function private.record_page_view(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function private.record_page_view(uuid,uuid,text,uuid) to anon,authenticated;
create function public.record_page_view(p_event uuid,p_visitor uuid,p_path text,p_post_id uuid default null) returns void
language sql security invoker set search_path='' as $$ select private.record_page_view(p_event,p_visitor,p_path,p_post_id); $$;
revoke execute on function public.record_page_view(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.record_page_view(uuid,uuid,text,uuid) to anon,authenticated;

create or replace function private.admin_analytics() returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare today date := (now() at time zone 'Africa/Nairobi')::date;
 result jsonb;
begin
 if not private.is_admin() then raise exception 'Administrator approval required.'; end if;
 with visits as (
  select visitor_id,day,post_id from private.page_visits
  union all
  select visitor_id,day,post_id from private.page_view_events
 ), daily_counts as (
  select day,count(distinct visitor_id) n from visits where day between today-6 and today group by day
 ), post_counts as (
  select post_id,count(*) n from visits where post_id is not null group by post_id
 )
 select jsonb_build_object(
  'visitors',(select count(distinct visitor_id) from visits where day between today-6 and today),
  'pageViews',(select count(*) from visits),
  'contentViews',coalesce((select sum(n) from post_counts),0),
  'daily',(select jsonb_agg(jsonb_build_object('day',d::date,'visitors',coalesce(c.n,0)) order by d)
    from generate_series(today-6,today,interval '1 day') d left join daily_counts c on c.day=d::date),
  'views',coalesce((select jsonb_object_agg(post_id,n) from post_counts),'{}'::jsonb)
 ) into result;
 return result;
end; $$;
