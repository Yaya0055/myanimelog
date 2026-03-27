-- ============================================
-- Migration: Support Films (movies)
-- A executer dans l'editeur SQL de Supabase
-- ============================================

-- Ajouter les nouvelles colonnes
ALTER TABLE public.animes ADD COLUMN IF NOT EXISTS anime_type text DEFAULT 'series';
ALTER TABLE public.animes ADD COLUMN IF NOT EXISTS duration integer DEFAULT 0;
ALTER TABLE public.animes ADD COLUMN IF NOT EXISTS watched_duration integer DEFAULT 0;

-- Auto-detecter les films existants dans la base
-- Un anime avec 1 seule saison et 1 episode est probablement un film
-- On met a jour le type pour tous les utilisateurs
UPDATE public.animes
SET anime_type = 'movie'
WHERE anime_type = 'series'
  AND jsonb_array_length(seasons) = 1
  AND (seasons->0->>'episodeCount')::int = 1;
