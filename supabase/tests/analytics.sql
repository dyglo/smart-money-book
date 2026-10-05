-- Works with the real approved admin and rolls back every fixture/event.
begin;
insert into public.posts(id,title,html,status,kind) values
('91000000-0000-4000-8000-000000000001','Analytics test public','<p>View test</p>','published','blog'),
('91000000-0000-4000-8000-000000000002','Analytics test draft','<p>Private</p>','draft','blog');
select set_config('request.jwt.claims','{"role":"anon"}',true);
set local role anon;
select public.record_page_view('92000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001','/read?id=91000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001');
-- A retry of the same event must not increment views.
select public.record_page_view('92000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001','/read?id=91000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001');
-- A separate real navigation is a second view from the same visitor.
select public.record_page_view('92000000-0000-4000-8000-000000000002','93000000-0000-4000-8000-000000000001','/read?id=91000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001');
select public.record_page_view('92000000-0000-4000-8000-000000000003','93000000-0000-4000-8000-000000000002','/',null);
select public.record_page_view('92000000-0000-4000-8000-000000000004','93000000-0000-4000-8000-000000000001','/admin/dashboard',null);
select public.record_page_view('92000000-0000-4000-8000-000000000005','93000000-0000-4000-8000-000000000001','/read?id=91000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000002');
select public.record_page_view('92000000-0000-4000-8000-000000000006','93000000-0000-4000-8000-000000000001','/bogus','91000000-0000-4000-8000-000000000001');
reset role;
do $$ begin
 if (select count(*) from private.page_view_events where visitor_id in ('93000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000002')) <> 3 then raise exception 'Event validation/deduplication failed'; end if;
 if (select count(distinct visitor_id) from private.page_view_events where visitor_id in ('93000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000002')) <> 2 then raise exception 'Unique visitor count failed'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',(select user_id from private.admin_account where singleton),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare stats jsonb; begin
 stats:=public.admin_analytics();
 if (stats->'views'->>'91000000-0000-4000-8000-000000000001')::int <> 2 then raise exception 'Post views not reflected in dashboard'; end if;
 if (stats->>'visitors')::int < 2 then raise exception 'Visitor totals not reflected in dashboard'; end if;
 if jsonb_array_length(stats->'daily') <> 7 then raise exception 'Daily chart missing dates'; end if;
end $$;
reset role;
rollback;
select 'PASS: executed tracking, retry deduplication, repeat views, unique visitors, admin/draft exclusion, dashboard aggregates' as verification;

