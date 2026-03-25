import { useState, useCallback, useRef } from 'react';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

// Rate-limit: Jikan allows ~3 req/s, we debounce at 500ms
export default function useAnimeSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const search = useCallback((query) => {
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);
    // Abort previous request
    if (abortRef.current) abortRef.current.abort();

    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Debounce 500ms
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=12&sfw=true`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          if (res.status === 429) {
            setError('Trop de requetes, patientez un instant...');
            setLoading(false);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        const mapped = (json.data || []).map(mapJikanAnime);
        setResults(mapped);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Erreur de recherche. Reessayez.');
          console.error('Jikan search error:', err);
        }
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  const getAnimeDetails = useCallback(async (malId) => {
    try {
      const res = await fetch(`${JIKAN_BASE}/anime/${malId}/full`);
      if (!res.ok) return null;
      const json = await res.json();
      return mapJikanAnimeDetailed(json.data);
    } catch (err) {
      console.error('Jikan detail error:', err);
      return null;
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, getAnimeDetails, clearResults };
}

function mapJikanAnime(item) {
  return {
    malId: item.mal_id,
    title: item.title,
    titleFr: item.title_english || item.title,
    coverImage: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    genres: (item.genres || []).map((g) => g.name),
    episodes: item.episodes || 0,
    score: item.score || 0,
    synopsis: item.synopsis || '',
    status: item.status || '',
    year: item.year || (item.aired?.prop?.from?.year) || '',
    type: item.type || '',
  };
}

function mapJikanAnimeDetailed(item) {
  if (!item) return null;

  const genres = [
    ...(item.genres || []).map((g) => g.name),
    ...(item.themes || []).map((t) => t.name),
  ];

  // Build seasons from relations or just default to 1 season
  const seasons = [{
    name: 'Saison 1',
    episodeCount: item.episodes || 0,
    watchedEpisodes: 0,
    isFinished: false,
    releaseStatus: item.status === 'Currently Airing' ? 'Not Released' : 'Released',
    expectedReleaseDate: '',
  }];

  return {
    malId: item.mal_id,
    title: item.title_english || item.title,
    coverImage: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    description: item.synopsis || '',
    genres: [...new Set(genres)],
    seasons,
    score: 0,
    year: item.year || '',
    type: item.type || '',
  };
}
