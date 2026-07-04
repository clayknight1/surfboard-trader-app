-- Push notification tokens for Expo Push API

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique check (length(token) between 20 and 200),
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens(user_id);

alter table public.push_tokens enable row level security;

create policy "users select own push tokens"
  on public.push_tokens for select
  using (auth.uid() = user_id);

create policy "users delete own push tokens"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

-- RPC: register or update a push token, handling ownership transfer
-- between users on the same device (same install, different login).
create or replace function public.register_push_token(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.push_tokens (user_id, token, platform)
  values (v_user_id, p_token, p_platform)
  on conflict (token) do update
    set user_id = excluded.user_id,
        platform = excluded.platform;
end;
$$;

grant execute on function public.register_push_token(text, text) to authenticated;