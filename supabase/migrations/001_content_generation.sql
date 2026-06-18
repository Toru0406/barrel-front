-- content_sets: top-level record that tracks one generation job
create table if not exists public.content_sets (
  id            uuid        primary key default gen_random_uuid(),
  user_id       text        not null,
  status        text        not null default 'pending',
  analytics_data jsonb,
  error         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Add columns idempotently for any pre-existing content_sets table
alter table public.content_sets
  add column if not exists status         text        not null default 'pending',
  add column if not exists analytics_data jsonb,
  add column if not exists error          text;

-- contents: one row per channel per generation job
create table if not exists public.contents (
  id             uuid        primary key default gen_random_uuid(),
  content_set_id uuid        not null references public.content_sets(id) on delete cascade,
  channel        text        not null,
  body           text        not null,
  created_at     timestamptz not null default now()
);

-- Enable RLS on both tables
alter table public.content_sets enable row level security;
alter table public.contents     enable row level security;

-- Users may only SELECT their own content_sets
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'content_sets'
      and policyname = 'Users can read own content_sets'
  ) then
    create policy "Users can read own content_sets"
      on public.content_sets for select
      using (user_id = auth.uid()::text);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'contents'
      and policyname = 'Users can read own contents'
  ) then
    create policy "Users can read own contents"
      on public.contents for select
      using (
        content_set_id in (
          select id from public.content_sets
          where user_id = auth.uid()::text
        )
      );
  end if;
end $$;
