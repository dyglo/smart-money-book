-- Keep privileged implementations out of the exposed API schema.
alter function public.is_admin() set schema private;
alter function public.add_comment(uuid,text,text,uuid) set schema private;
alter function public.record_visit(uuid,text,uuid) set schema private;
alter function public.admin_analytics() set schema private;
grant usage on schema private to anon, authenticated;
revoke all on all tables in schema private from anon,authenticated;
revoke execute on all functions in schema private from public,anon,authenticated;
grant execute on function private.is_admin() to anon,authenticated;
grant execute on function private.add_comment(uuid,text,text,uuid) to anon,authenticated;
grant execute on function private.record_visit(uuid,text,uuid) to anon,authenticated;
grant execute on function private.admin_analytics() to authenticated;

create function public.is_admin() returns boolean language sql stable security invoker set search_path='' as $$ select private.is_admin(); $$;
create function public.add_comment(p_post_id uuid,p_name text,p_text text,p_visitor uuid) returns void language sql security invoker set search_path='' as $$ select private.add_comment(p_post_id,p_name,p_text,p_visitor); $$;
create function public.record_visit(p_visitor uuid,p_path text,p_post_id uuid default null) returns void language sql security invoker set search_path='' as $$ select private.record_visit(p_visitor,p_path,p_post_id); $$;
create function public.admin_analytics() returns jsonb language sql stable security invoker set search_path='' as $$ select private.admin_analytics(); $$;
-- Explicitly remove Supabase default anon grants as well as PUBLIC grants.
revoke execute on function public.is_admin(),public.add_comment(uuid,text,text,uuid),public.record_visit(uuid,text,uuid),public.admin_analytics() from public,anon,authenticated;
grant execute on function public.is_admin(),public.add_comment(uuid,text,text,uuid),public.record_visit(uuid,text,uuid) to anon,authenticated;
grant execute on function public.admin_analytics() to authenticated;
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;

create policy admin_account_internal on private.admin_account for all to anon,authenticated using(false) with check(false);
create policy comment_limits_internal on private.comment_limits for all to anon,authenticated using(false) with check(false);
create policy page_visits_internal on private.page_visits for all to anon,authenticated using(false) with check(false);
