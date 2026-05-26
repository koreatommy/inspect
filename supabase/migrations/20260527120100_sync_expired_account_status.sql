create or replace function public.sync_my_account_status()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  result record;
begin
  update public.inspection_user_roles r
  set
    status = 'active',
    suspended_at = null,
    suspended_until = null,
    suspend_reason = null,
    suspended_by = null
  where r.user_id = auth.uid()
    and r.status = 'suspended'
    and r.suspended_until is not null
    and r.suspended_until <= now();

  select r.status, r.suspend_reason, r.suspended_until
  into result
  from public.inspection_user_roles r
  where r.user_id = auth.uid();

  if not found then
    return json_build_object(
      'status', 'active',
      'suspend_reason', null,
      'suspended_until', null
    );
  end if;

  return json_build_object(
    'status', result.status,
    'suspend_reason', result.suspend_reason,
    'suspended_until', result.suspended_until
  );
end;
$$;

revoke all on function public.sync_my_account_status() from public;
grant execute on function public.sync_my_account_status() to authenticated;
