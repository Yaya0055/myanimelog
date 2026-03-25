-- ============================================
-- MyAnimeLog - Schema SQL pour Supabase
-- A executer dans l'editeur SQL de Supabase
-- ============================================

-- Table des animes (une ligne par anime par utilisateur)
create table public.animes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  cover_image text default '',
  description text default '',
  genres text[] default '{}',
  status text default 'Plan to Watch' check (status in ('Plan to Watch', 'Watching', 'Completed', 'Dropped')),
  score integer default 0 check (score >= 0 and score <= 10),
  is_favorite boolean default false,
  seasons jsonb default '[]'::jsonb,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Index pour les requetes par utilisateur
create index idx_animes_user_id on public.animes(user_id);
create index idx_animes_updated_at on public.animes(user_id, updated_at desc);

-- Row Level Security : chaque utilisateur ne voit que ses propres animes
alter table public.animes enable row level security;

create policy "Users can view their own animes"
  on public.animes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own animes"
  on public.animes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own animes"
  on public.animes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own animes"
  on public.animes for delete
  using (auth.uid() = user_id);

-- Table pour les alertes dismissées
create table public.dismissed_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  alert_key text not null,
  created_at timestamptz default now(),
  unique(user_id, alert_key)
);

alter table public.dismissed_alerts enable row level security;

create policy "Users can view their own dismissed alerts"
  on public.dismissed_alerts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own dismissed alerts"
  on public.dismissed_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own dismissed alerts"
  on public.dismissed_alerts for delete
  using (auth.uid() = user_id);

-- Fonction pour mettre a jour updated_at automatiquement
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_anime_update
  before update on public.animes
  for each row execute function public.handle_updated_at();
