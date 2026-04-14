create extension if not exists "pgcrypto";

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.voyages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  start_name text not null,
  start_latitude double precision not null,
  start_longitude double precision not null,
  end_name text not null,
  end_latitude double precision not null,
  end_longitude double precision not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint voyages_coordinates_check check (
    start_latitude between -90 and 90
    and start_longitude between -180 and 180
    and end_latitude between -90 and 90
    and end_longitude between -180 and 180
  ),
  constraint voyages_id_user_id_key unique (id, user_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  image_path text not null,
  caption text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  posted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint posts_coordinates_check check (
    latitude between -90 and 90
    and longitude between -180 and 180
  ),
  constraint posts_voyage_owner_fkey
    foreign key (voyage_id, user_id)
    references public.voyages (id, user_id)
    on delete cascade
);

create index if not exists voyages_user_id_created_at_idx
  on public.voyages (user_id, created_at desc);

create index if not exists posts_voyage_id_posted_at_idx
  on public.posts (voyage_id, posted_at desc);

create index if not exists posts_user_id_created_at_idx
  on public.posts (user_id, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_current_timestamp_updated_at();

create trigger voyages_set_updated_at
before update on public.voyages
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.profiles enable row level security;
alter table public.voyages enable row level security;
alter table public.posts enable row level security;

create policy "profiles are publicly readable"
on public.profiles
for select
using (true);

create policy "profiles can be inserted by the owner"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles can be updated by the owner"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "voyages are publicly readable"
on public.voyages
for select
using (true);

create policy "voyages can be inserted by the owner"
on public.voyages
for insert
with check (auth.uid() = user_id);

create policy "voyages can be updated by the owner"
on public.voyages
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "voyages can be deleted by the owner"
on public.voyages
for delete
using (auth.uid() = user_id);

create policy "posts are publicly readable"
on public.posts
for select
using (true);

create policy "posts can be inserted by the owner"
on public.posts
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.voyages
    where voyages.id = posts.voyage_id
      and voyages.user_id = auth.uid()
  )
);

create policy "posts can be updated by the owner"
on public.posts
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.voyages
    where voyages.id = posts.voyage_id
      and voyages.user_id = auth.uid()
  )
);

create policy "posts can be deleted by the owner"
on public.posts
for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('voyage-photos', 'voyage-photos', true)
on conflict (id) do nothing;

create policy "voyage photos are publicly readable"
on storage.objects
for select
using (bucket_id = 'voyage-photos');

create policy "voyage photos can be inserted by their owner"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'voyage-photos'
  and name like auth.uid()::text || '/%'
);

create policy "voyage photos can be updated by their owner"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'voyage-photos'
  and name like auth.uid()::text || '/%'
)
with check (
  bucket_id = 'voyage-photos'
  and name like auth.uid()::text || '/%'
);

create policy "voyage photos can be deleted by their owner"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'voyage-photos'
  and name like auth.uid()::text || '/%'
);
