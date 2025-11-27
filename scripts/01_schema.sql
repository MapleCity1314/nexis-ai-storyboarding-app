-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  default_prompt text default 'A cinematic shot in a cyberpunk style...',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS TABLE
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled Project',
  description text,
  is_deleted boolean default false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SCENES TABLE
create table public.scenes (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  order_index integer not null,
  content text,
  image_url text,
  ai_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.scenes enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can update their own profile" 
on public.profiles for update 
using (auth.uid() = id);

-- Projects Policies
create policy "Users can view their own projects" 
on public.projects for select 
using (auth.uid() = user_id);

create policy "Users can insert their own projects" 
on public.projects for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own projects" 
on public.projects for update 
using (auth.uid() = user_id);

create policy "Users can delete their own projects" 
on public.projects for delete 
using (auth.uid() = user_id);

-- Scenes Policies (Access via Project ownership)
create policy "Users can view scenes of their projects" 
on public.scenes for select 
using (
  exists (
    select 1 from public.projects 
    where projects.id = scenes.project_id 
    and projects.user_id = auth.uid()
  )
);

create policy "Users can insert scenes to their projects" 
on public.scenes for insert 
with check (
  exists (
    select 1 from public.projects 
    where projects.id = scenes.project_id 
    and projects.user_id = auth.uid()
  )
);

create policy "Users can update scenes of their projects" 
on public.scenes for update 
using (
  exists (
    select 1 from public.projects 
    where projects.id = scenes.project_id 
    and projects.user_id = auth.uid()
  )
);

create policy "Users can delete scenes of their projects" 
on public.scenes for delete 
using (
  exists (
    select 1 from public.projects 
    where projects.id = scenes.project_id 
    and projects.user_id = auth.uid()
  )
);

-- Trigger to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
