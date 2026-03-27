import { useState, useCallback, useRef } from 'react';

// ─── API configs ──────────────────────────────────────────────────────────────
const JIKAN_BASE   = 'https://api.jikan.moe/v4';
const KITSU_BASE   = 'https://kitsu.io/api/edge';
const ANILIST_GQL  = 'https://graphql.anilist.co';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Parse Jikan duration string like "1 hr 52 min", "2 hr", "24 min per ep" → minutes
function parseJikanDuration(str) {
  if (!str) return 0;
  const hrs = str.match(/(\d+)\s*hr/i);
  const mins = str.match(/(\d+)\s*min/i);
  return (hrs ? parseInt(hrs[1]) * 60 : 0) + (mins ? parseInt(mins[1]) : 0);
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapJikan(item) {
  return {
    uid:         `jikan-${item.mal_id}`,
    malId:       item.mal_id,
    source:      'MAL',
    title:       item.title_english || item.title,
    titleAlt:    item.title_english ? item.title : null,
    coverImage:  item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    synopsis:    item.synopsis || '',
    genres:      (item.genres || []).map(g => g.name),
    episodes:    item.episodes || 0,
    score:       item.score || 0,
    year:        item.year || item.aired?.prop?.from?.year || '',
    type:        item.type || '',
    status:      item.status || '',
  };
}

function mapAniList(item) {
  const title = item.title?.english || item.title?.romaji || item.title?.native || '';
  const titleAlt = item.title?.english ? item.title.romaji : null;
  return {
    uid:         `anilist-${item.id}`,
    malId:       null,
    anilistId:   item.id,
    source:      'AniList',
    title,
    titleAlt,
    coverImage:  item.coverImage?.large || item.coverImage?.medium || '',
    synopsis:    (item.description || '').replace(/<[^>]+>/g, ''),
    genres:      item.genres || [],
    episodes:    item.episodes || 0,
    score:       item.averageScore ? Math.round(item.averageScore / 10) : 0,
    year:        item.seasonYear || item.startDate?.year || '',
    type:        item.format || '',
    status:      item.status || '',
  };
}

function mapKitsu(item) {
  const attr = item.attributes || {};
  const title = attr.titles?.en || attr.titles?.en_jp || attr.canonicalTitle || '';
  const titleAlt = attr.titles?.en ? (attr.titles?.en_jp || null) : null;
  return {
    uid:         `kitsu-${item.id}`,
    malId:       null,
    kitsuId:     item.id,
    source:      'Kitsu',
    title,
    titleAlt,
    coverImage:  attr.posterImage?.large || attr.posterImage?.medium || attr.posterImage?.small || '',
    synopsis:    attr.synopsis || attr.description || '',
    genres:      [],   // genres need a separate request on Kitsu; skip for perf
    episodes:    attr.episodeCount || 0,
    score:       attr.averageRating ? Math.round(parseFloat(attr.averageRating) / 10) : 0,
    year:        attr.startDate?.slice(0, 4) || '',
    type:        attr.subtype || attr.showType || '',
    status:      attr.status || '',
  };
}

// ─── Individual search functions ──────────────────────────────────────────────

async function searchJikan(query, signal) {
  try {
    const res = await fetch(
      `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=8&sfw=true`,
      { signal }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map(mapJikan);
  } catch {
    return [];
  }
}

async function searchAniList(query, signal) {
  const gql = `
    query ($search: String) {
      Page(perPage: 8) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          id
          title { romaji english native }
          coverImage { large medium }
          description
          genres
          episodes
          averageScore
          seasonYear
          startDate { year }
          format
          status
        }
      }
    }
  `;
  try {
    const res = await fetch(ANILIST_GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: gql, variables: { search: query } }),
      signal,
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data?.Page?.media || []).map(mapAniList);
  } catch {
    return [];
  }
}

async function searchKitsu(query, signal) {
  try {
    const res = await fetch(
      `${KITSU_BASE}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=8&fields[anime]=titles,posterImage,synopsis,episodeCount,averageRating,startDate,subtype,status`,
      { signal }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map(mapKitsu);
  } catch {
    return [];
  }
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function normalizeTitle(t = '') {
  return t.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function deduplicateResults(all) {
  const seen = new Map();
  const out  = [];

  for (const item of all) {
    if (!item.title) continue;
    const key = normalizeTitle(item.title);
    if (seen.has(key)) {
      // If a duplicate is from MAL, prefer it (better data)
      if (item.source === 'MAL' && seen.get(key).source !== 'MAL') {
        seen.get(key)._replace = true;
        seen.set(key, item);
      }
      continue;
    }
    seen.set(key, item);
    out.push(item);
  }

  // Re-order: MAL results first, then AniList, then Kitsu
  return out.sort((a, b) => {
    const order = { MAL: 0, AniList: 1, Kitsu: 2 };
    return (order[a.source] ?? 3) - (order[b.source] ?? 3);
  });
}

// ─── Detail fetchers ──────────────────────────────────────────────────────────

async function getJikanDetails(malId) {
  try {
    const res = await fetch(`${JIKAN_BASE}/anime/${malId}/full`);
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data;
    if (!item) return null;

    const genres = [
      ...(item.genres  || []).map(g => g.name),
      ...(item.themes  || []).map(t => t.name),
    ];

    const isMovie = (item.type || '').toLowerCase() === 'movie';
    return {
      title:       item.title_english || item.title,
      coverImage:  item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
      description: item.synopsis || '',
      genres:      [...new Set(genres)],
      animeType:   isMovie ? 'movie' : 'series',
      duration:    isMovie ? parseJikanDuration(item.duration) : 0,
      seasons: [{
        name:                 'Saison 1',
        episodeCount:         item.episodes || 0,
        watchedEpisodes:      0,
        isFinished:           false,
        releaseStatus:        item.status === 'Currently Airing' ? 'Not Released' : 'Released',
        expectedReleaseDate:  '',
      }],
    };
  } catch {
    return null;
  }
}

async function getAniListDetails(anilistId) {
  const gql = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        title { romaji english }
        coverImage { large }
        description
        genres
        episodes
        format
        duration
        status
        seasonYear
        relations {
          edges {
            relationType
            node { id title { english romaji } type episodes status }
          }
        }
      }
    }
  `;
  try {
    const res = await fetch(ANILIST_GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: gql, variables: { id: anilistId } }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const item = json.data?.Media;
    if (!item) return null;

    // Build seasons from sequel relations
    const sequels = (item.relations?.edges || [])
      .filter(e => e.relationType === 'SEQUEL' && e.node.type === 'ANIME')
      .map((e, i) => ({
        name:                 `Saison ${i + 2}`,
        episodeCount:         e.node.episodes || 0,
        watchedEpisodes:      0,
        isFinished:           false,
        releaseStatus:        e.node.status === 'NOT_YET_RELEASED' ? 'Not Released' : 'Released',
        expectedReleaseDate:  '',
      }));

    const isMovie = (item.format || '').toUpperCase() === 'MOVIE';
    return {
      title:       item.title?.english || item.title?.romaji || '',
      coverImage:  item.coverImage?.large || '',
      description: (item.description || '').replace(/<[^>]+>/g, ''),
      genres:      item.genres || [],
      animeType:   isMovie ? 'movie' : 'series',
      duration:    isMovie ? (item.duration || 0) : 0,
      seasons: [
        {
          name:                 'Saison 1',
          episodeCount:         item.episodes || 0,
          watchedEpisodes:      0,
          isFinished:           false,
          releaseStatus:        item.status === 'NOT_YET_RELEASED' ? 'Not Released' : 'Released',
          expectedReleaseDate:  '',
        },
        ...sequels,
      ],
    };
  } catch {
    return null;
  }
}

async function getKitsuDetails(kitsuId) {
  try {
    const res = await fetch(
      `${KITSU_BASE}/anime/${kitsuId}?include=genres`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    const attr = json.data?.attributes || {};

    const genres = (json.included || [])
      .filter(i => i.type === 'genres')
      .map(i => i.attributes?.name || '');

    const isMovie = (attr.subtype || '').toLowerCase() === 'movie';
    return {
      title:       attr.titles?.en || attr.titles?.en_jp || attr.canonicalTitle || '',
      coverImage:  attr.posterImage?.large || attr.posterImage?.medium || '',
      description: attr.synopsis || '',
      genres,
      animeType:   isMovie ? 'movie' : 'series',
      duration:    isMovie ? (attr.totalLength || 0) : 0,
      seasons: [{
        name:                 'Saison 1',
        episodeCount:         attr.episodeCount || 0,
        watchedEpisodes:      0,
        isFinished:           false,
        releaseStatus:        attr.status === 'upcoming' ? 'Not Released' : 'Released',
        expectedReleaseDate:  '',
      }],
    };
  } catch {
    return null;
  }
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export default function useAnimeSearch() {
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const abortRef  = useRef(null);
  const timerRef  = useRef(null);

  const search = useCallback((query) => {
    if (timerRef.current)  clearTimeout(timerRef.current);
    if (abortRef.current)  abortRef.current.abort();

    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      const { signal } = controller;

      try {
        // Fire all 3 APIs in parallel
        const [jikan, anilist, kitsu] = await Promise.allSettled([
          searchJikan(query, signal),
          searchAniList(query, signal),
          searchKitsu(query, signal),
        ]);

        if (signal.aborted) return;

        const all = [
          ...(jikan.status   === 'fulfilled' ? jikan.value   : []),
          ...(anilist.status === 'fulfilled' ? anilist.value : []),
          ...(kitsu.status   === 'fulfilled' ? kitsu.value   : []),
        ];

        setResults(deduplicateResults(all).slice(0, 20));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Erreur de recherche. Reessayez.');
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }, 500);
  }, []);

  const getAnimeDetails = useCallback(async (result) => {
    // Try the best source first
    if (result.source === 'MAL' && result.malId) {
      const details = await getJikanDetails(result.malId);
      if (details) return details;
    }
    if (result.source === 'AniList' && result.anilistId) {
      const details = await getAniListDetails(result.anilistId);
      if (details) return details;
    }
    if (result.source === 'Kitsu' && result.kitsuId) {
      const details = await getKitsuDetails(result.kitsuId);
      if (details) return details;
    }
    // Fallback: build details from search result itself
    const isMovie = (result.type || '').toLowerCase() === 'movie';
    return {
      title:       result.title,
      coverImage:  result.coverImage,
      description: result.synopsis,
      genres:      result.genres,
      animeType:   isMovie ? 'movie' : 'series',
      duration:    0,
      seasons: [{
        name:                 'Saison 1',
        episodeCount:         result.episodes || 0,
        watchedEpisodes:      0,
        isFinished:           false,
        releaseStatus:        'Released',
        expectedReleaseDate:  '',
      }],
    };
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, getAnimeDetails, clearResults };
}
