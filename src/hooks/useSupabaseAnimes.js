import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Convert DB row (snake_case) to app format (camelCase)
function rowToAnime(row) {
  return {
    id: row.id,
    title: row.title,
    coverImage: row.cover_image || '',
    description: row.description || '',
    genres: row.genres || [],
    status: row.status || 'Plan to Watch',
    score: row.score || 0,
    isFavorite: row.is_favorite || false,
    seasons: row.seasons || [],
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

// Convert app format to DB row
function animeToRow(anime, userId) {
  return {
    user_id: userId,
    title: anime.title,
    cover_image: anime.coverImage || '',
    description: anime.description || '',
    genres: anime.genres || [],
    status: anime.status || 'Plan to Watch',
    score: anime.score || 0,
    is_favorite: anime.isFavorite || false,
    seasons: anime.seasons || [],
  };
}

export default function useSupabaseAnimes(userId) {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  // Fetch all animes for the user
  const fetchAnimes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('animes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching animes:', error);
    } else {
      setAnimes((data || []).map(rowToAnime));
    }
    setLoading(false);
  }, [userId]);

  // Fetch dismissed alerts
  const fetchDismissedAlerts = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('dismissed_alerts')
      .select('alert_key')
      .eq('user_id', userId);

    if (!error && data) {
      setDismissedAlerts(data.map((d) => d.alert_key));
    }
  }, [userId]);

  useEffect(() => {
    fetchAnimes();
    fetchDismissedAlerts();
  }, [fetchAnimes, fetchDismissedAlerts]);

  // Add anime
  const addAnime = useCallback(async (formData) => {
    if (!userId) return;
    const row = animeToRow(formData, userId);
    const { data, error } = await supabase
      .from('animes')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error('Error adding anime:', error);
      throw error;
    }
    setAnimes((prev) => [rowToAnime(data), ...prev]);
    return rowToAnime(data);
  }, [userId]);

  // Update anime
  const updateAnime = useCallback(async (formData) => {
    if (!userId) return;
    const row = animeToRow(formData, userId);
    const { data, error } = await supabase
      .from('animes')
      .update(row)
      .eq('id', formData.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating anime:', error);
      throw error;
    }
    setAnimes((prev) =>
      prev.map((a) => (a.id === formData.id ? rowToAnime(data) : a))
    );
    return rowToAnime(data);
  }, [userId]);

  // Delete anime
  const deleteAnime = useCallback(async (id) => {
    if (!userId) return;
    const { error } = await supabase
      .from('animes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting anime:', error);
      throw error;
    }
    setAnimes((prev) => prev.filter((a) => a.id !== id));
  }, [userId]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id) => {
    const anime = animes.find((a) => a.id === id);
    if (!anime || !userId) return;

    const newVal = !anime.isFavorite;
    // Optimistic update
    setAnimes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFavorite: newVal } : a))
    );

    const { error } = await supabase
      .from('animes')
      .update({ is_favorite: newVal })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      // Revert
      setAnimes((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isFavorite: !newVal } : a))
      );
      console.error('Error toggling favorite:', error);
    }
  }, [animes, userId]);

  // Dismiss alert
  const dismissAlert = useCallback(async (key) => {
    if (!userId) return;
    setDismissedAlerts((prev) => [...prev, key]);
    await supabase
      .from('dismissed_alerts')
      .insert([{ user_id: userId, alert_key: key }]);
  }, [userId]);

  // Import animes (bulk insert)
  const importAnimes = useCallback(async (importedAnimes) => {
    if (!userId || !Array.isArray(importedAnimes)) return;
    const rows = importedAnimes.map((a) => animeToRow(a, userId));
    const { data, error } = await supabase
      .from('animes')
      .insert(rows)
      .select();

    if (error) {
      console.error('Error importing animes:', error);
      throw error;
    }
    setAnimes((data || []).map(rowToAnime));
    return data?.length || 0;
  }, [userId]);

  // Replace collection with imported data
  const replaceCollection = useCallback(async (importedAnimes) => {
    if (!userId || !Array.isArray(importedAnimes)) return;
    // Delete all current animes
    await supabase.from('animes').delete().eq('user_id', userId);
    // Insert new ones
    const rows = importedAnimes.map((a) => animeToRow(a, userId));
    const { data, error } = await supabase
      .from('animes')
      .insert(rows)
      .select();

    if (error) {
      console.error('Error replacing collection:', error);
      throw error;
    }
    setAnimes((data || []).map(rowToAnime));
    return data?.length || 0;
  }, [userId]);

  return {
    animes,
    loading,
    dismissedAlerts,
    addAnime,
    updateAnime,
    deleteAnime,
    toggleFavorite,
    dismissAlert,
    importAnimes,
    replaceCollection,
    refreshAnimes: fetchAnimes,
  };
}
