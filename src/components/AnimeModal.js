import React, { useState, useEffect, useRef } from 'react';
import {
  X, Plus, Minus, Trash2, Heart, Search, Check, ChevronDown,
  CalendarDays, Tv, Save, Loader2, Film, Clock
} from 'lucide-react';
import StarRating from './StarRating';
import useAnimeSearch from '../hooks/useAnimeSearch';

const STATUSES = ['Plan to Watch', 'Watching', 'Completed', 'Dropped'];

const emptySeason = () => ({
  name: 'Saison 1',
  episodeCount: 12,
  watchedEpisodes: 0,
  isFinished: false,
  releaseStatus: 'Released',
  expectedReleaseDate: '',
});

const emptyAnime = () => ({
  title: '',
  coverImage: '',
  description: '',
  genres: [],
  status: 'Plan to Watch',
  score: 0,
  isFavorite: false,
  animeType: 'series',
  duration: 0,
  watchedDuration: 0,
  seasons: [emptySeason()],
});

export default function AnimeModal({ isOpen, onClose, anime, onSave, onDelete, existingAnimes = [] }) {
  const [form, setForm] = useState(emptyAnime());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const searchRef = useRef(null);
  const statusRef = useRef(null);

  const { results, loading, error, search, getAnimeDetails, clearResults } = useAnimeSearch();

  const isEditing = !!anime;

  // Normalize title for duplicate comparison
  const normTitle = (t = '') => t.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const existingTitles = existingAnimes.map(a => normTitle(a.title));
  const isDuplicate = (title) => existingTitles.includes(normTitle(title));

  useEffect(() => {
    if (anime) {
      setForm({ ...anime });
    } else {
      setForm(emptyAnime());
    }
    setSearchQuery('');
    setShowSuggestions(false);
    setDuplicateError('');
    clearResults();
  }, [anime, isOpen, clearResults]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setShowSuggestions(true);
    search(q);
  };

  const selectSuggestion = async (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setLoadingDetail(true);
    setDuplicateError('');

    // Pass the full suggestion object so the hook picks the right API
    const details = await getAnimeDetails(suggestion);
    setLoadingDetail(false);

    if (details) {
      setForm((prev) => ({
        ...prev,
        title: details.title,
        coverImage: details.coverImage,
        description: details.description,
        genres: details.genres,
        seasons: details.seasons,
        animeType: details.animeType || 'series',
        duration: details.duration || 0,
        watchedDuration: 0,
      }));
    } else {
      const isMovie = (suggestion.type || '').toLowerCase() === 'movie';
      // Fallback to basic info from search results
      setForm((prev) => ({
        ...prev,
        title: suggestion.title,
        coverImage: suggestion.coverImage,
        description: suggestion.synopsis,
        genres: suggestion.genres,
        animeType: isMovie ? 'movie' : 'series',
        duration: 0,
        watchedDuration: 0,
        seasons: [{
          name: 'Saison 1',
          episodeCount: suggestion.episodes || 0,
          watchedEpisodes: 0,
          isFinished: false,
          releaseStatus: suggestion.status === 'Currently Airing' ? 'Not Released' : 'Released',
          expectedReleaseDate: '',
        }],
      }));
    }

    clearResults();
  };

  const updateSeason = (index, field, value) => {
    setForm((prev) => {
      const seasons = [...prev.seasons];
      seasons[index] = { ...seasons[index], [field]: value };
      return { ...prev, seasons };
    });
  };

  const addSeason = () => {
    setForm((prev) => ({
      ...prev,
      seasons: [
        ...prev.seasons,
        { ...emptySeason(), name: `Saison ${prev.seasons.length + 1}` },
      ],
    }));
  };

  const removeSeason = (index) => {
    if (form.seasons.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      seasons: prev.seasons.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    // Block duplicate when adding (not editing)
    if (!isEditing && isDuplicate(form.title)) {
      setDuplicateError('Cet anime est deja dans ta liste !');
      return;
    }
    onSave(form);
  };

  const toggleGenre = (genre) => {
    setForm((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  if (!isOpen) return null;

  const allGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
    'Supernatural', 'Thriller', 'Mecha', 'Music', 'Psychological',
    'Ecchi', 'Seinen', 'Shounen', 'Shoujo', 'Josei', 'Isekai',
    'Military', 'Historical', 'School', 'Gourmet', 'Suspense',
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-8 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-dark-800 border border-dark-600/40 rounded-2xl shadow-2xl shadow-black/40 animate-slide-up mb-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-600/30">
          <h2 className="text-lg font-bold text-dark-50">
            {isEditing ? 'Modifier l\'anime' : 'Ajouter un anime'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center hover:bg-dark-600 transition-colors text-dark-300 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Loading overlay when fetching details */}
        {loadingDetail && (
          <div className="absolute inset-0 bg-dark-800/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-3 text-ocean-light">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm font-medium">Chargement des details...</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* API Search (only for new anime) */}
          {!isEditing && (
            <div ref={searchRef} className="relative">
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                Rechercher un anime (MyAnimeList)
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                {loading && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean animate-spin" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => results.length > 0 && setShowSuggestions(true)}
                  placeholder="Ex: Naruto, One Piece, Jujutsu Kaisen..."
                  className="w-full pl-10 pr-10 py-2.5 bg-dark-700 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-ocean/50 focus:ring-1 focus:ring-ocean/20 transition-all"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="mt-1 text-xs text-neon-orange">{error}</p>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600/50 rounded-xl overflow-hidden shadow-2xl shadow-black/40 z-10 max-h-80 overflow-y-auto">
                  {results.map((s) => {
                    const alreadyAdded = isDuplicate(s.title);
                    return (
                      <button
                        key={s.uid}
                        type="button"
                        onClick={() => !alreadyAdded && selectSuggestion(s)}
                        disabled={alreadyAdded}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left border-b border-dark-600/20 last:border-0 ${
                          alreadyAdded
                            ? 'opacity-50 cursor-not-allowed bg-dark-700'
                            : 'hover:bg-dark-600 cursor-pointer'
                        }`}
                      >
                        <img
                          src={s.coverImage}
                          alt={s.title}
                          className="w-9 h-12 object-cover rounded-md shrink-0 shadow-md"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-white truncate flex-1">{s.title}</p>
                            {alreadyAdded && (
                              <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-neon-orange/20 text-neon-orange">
                                Deja ajouté
                              </span>
                            )}
                            <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              s.source === 'MAL'    ? 'bg-ocean/20 text-ocean-light' :
                              s.source === 'AniList'? 'bg-accent/20 text-accent-light' :
                                                      'bg-neon-green/15 text-neon-green'
                            }`}>
                              {s.source}
                            </span>
                          </div>
                          {s.titleAlt && (
                            <p className="text-[10px] text-dark-300 truncate">{s.titleAlt}</p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-dark-300">
                              {s.type} {s.year && `(${s.year})`}
                            </span>
                            {s.episodes > 0 && (
                              <span className="text-[10px] text-dark-400">{s.episodes} ep.</span>
                            )}
                            {s.score > 0 && (
                              <span className="text-[10px] text-yellow-400 font-semibold">★ {s.score}</span>
                            )}
                          </div>
                          {s.genres.length > 0 && (
                            <p className="text-[10px] text-dark-400 truncate">
                              {s.genres.slice(0, 4).join(', ')}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Preview cover if we have one */}
          {form.coverImage && (
            <div className="flex items-start gap-4">
              <img
                src={form.coverImage}
                alt={form.title}
                className="w-20 h-28 object-cover rounded-xl shadow-lg shadow-black/30 shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate">{form.title || 'Titre'}</p>
                <p className="text-xs text-dark-300 mt-1 line-clamp-3">{form.description}</p>
                {form.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.genres.slice(0, 5).map((g) => (
                      <span key={g} className="px-1.5 py-0.5 rounded text-[9px] bg-ocean/15 text-ocean-light font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title + Cover Image row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                Titre *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-ocean/50 focus:ring-1 focus:ring-ocean/20 transition-all"
                placeholder="Nom de l'anime"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                Image (URL)
              </label>
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-ocean/50 focus:ring-1 focus:ring-ocean/20 transition-all"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 bg-dark-700 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-ocean/50 focus:ring-1 focus:ring-ocean/20 transition-all resize-none"
              placeholder="Synopsis de l'anime..."
            />
          </div>

          {/* Status + Favorite row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status dropdown */}
            <div ref={statusRef} className="relative">
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                Statut
              </label>
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-dark-700 border border-dark-600/50 rounded-xl text-sm text-white focus:outline-none focus:border-ocean/50 transition-all"
              >
                <span>{form.status}</span>
                <ChevronDown size={14} className={`text-dark-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600/50 rounded-xl overflow-hidden shadow-2xl shadow-black/40 z-10">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, status: s }));
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        form.status === s
                          ? 'bg-ocean/15 text-ocean-light'
                          : 'text-dark-200 hover:bg-dark-600'
                      }`}
                    >
                      <span>{s}</span>
                      {form.status === s && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite toggle */}
            <div>
              <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                Favori
              </label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, isFavorite: !f.isFavorite }))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.isFavorite
                    ? 'bg-neon-pink/15 border-neon-pink/25 text-neon-pink'
                    : 'bg-dark-700 border-dark-600/50 text-dark-300 hover:text-white'
                }`}
              >
                <Heart size={16} className={form.isFavorite ? 'fill-neon-pink' : ''} />
                {form.isFavorite ? 'Favori !' : 'Ajouter aux favoris'}
              </button>
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
              Note
            </label>
            <StarRating rating={form.score} onChange={(v) => setForm((f) => ({ ...f, score: v }))} />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
              Genres
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    form.genres.includes(genre)
                      ? 'bg-accent/15 text-accent-light border-accent/25'
                      : 'text-dark-400 border-dark-600/40 hover:bg-dark-600 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Type toggle (Film / Serie) */}
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, animeType: 'series' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  form.animeType !== 'movie'
                    ? 'bg-ocean/15 text-ocean-light border-ocean/25'
                    : 'text-dark-400 border-dark-600/40 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <Tv size={14} />
                Serie
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, animeType: 'movie' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  form.animeType === 'movie'
                    ? 'bg-accent/15 text-accent-light border-accent/25'
                    : 'text-dark-400 border-dark-600/40 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <Film size={14} />
                Film
              </button>
            </div>
          </div>

          {/* Movie duration OR Seasons */}
          {form.animeType === 'movie' ? (
            <div>
              <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Film size={14} />
                Film
              </label>
              <div className="p-3 bg-dark-700/50 border border-dark-600/25 rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-dark-400 mb-1">Duree totale (min)</label>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-dark-400 shrink-0" />
                      <input
                        type="number"
                        value={form.duration || 0}
                        onChange={(e) => setForm((f) => ({ ...f, duration: Math.max(0, parseInt(e.target.value) || 0) }))}
                        className="flex-1 px-2 py-1.5 bg-dark-600 border border-dark-500/40 rounded-lg text-xs text-white text-center focus:outline-none focus:border-ocean/50 transition-all"
                      />
                    </div>
                    {form.duration > 0 && (
                      <p className="text-[10px] text-dark-400 mt-1">
                        {Math.floor(form.duration / 60)}h{String(form.duration % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-dark-400 mb-1">Duree regardee (min)</label>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-dark-400 shrink-0" />
                      <input
                        type="number"
                        value={form.watchedDuration || 0}
                        onChange={(e) => setForm((f) => ({ ...f, watchedDuration: Math.min(f.duration, Math.max(0, parseInt(e.target.value) || 0)) }))}
                        className="flex-1 px-2 py-1.5 bg-dark-600 border border-dark-500/40 rounded-lg text-xs text-white text-center focus:outline-none focus:border-ocean/50 transition-all"
                      />
                    </div>
                    {form.watchedDuration > 0 && (
                      <p className="text-[10px] text-dark-400 mt-1">
                        {Math.floor(form.watchedDuration / 60)}h{String(form.watchedDuration % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
                {form.duration > 0 && (
                  <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-ocean rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((form.watchedDuration || 0) / form.duration) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-2">
                  <Tv size={14} />
                  Saisons ({form.seasons.length})
                </label>
                <button
                  type="button"
                  onClick={addSeason}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-ocean/15 text-ocean-light hover:bg-ocean/25 transition-colors"
                >
                  <Plus size={12} />
                  Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {form.seasons.map((season, i) => (
                  <div
                    key={i}
                    className="p-3 bg-dark-700/50 border border-dark-600/25 rounded-xl space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={season.name}
                        onChange={(e) => updateSeason(i, 'name', e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-dark-600 border border-dark-500/40 rounded-lg text-xs text-white focus:outline-none focus:border-ocean/50 transition-all"
                      />
                      {form.seasons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSeason(i)}
                          className="w-7 h-7 rounded-lg bg-neon-red/10 text-neon-red flex items-center justify-center hover:bg-neon-red/20 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-dark-400 mb-1">Total episodes</label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateSeason(i, 'episodeCount', Math.max(0, season.episodeCount - 1))
                            }
                            className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center hover:bg-dark-500 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            value={season.episodeCount}
                            onChange={(e) =>
                              updateSeason(i, 'episodeCount', Math.max(0, parseInt(e.target.value) || 0))
                            }
                            className="flex-1 px-2 py-1.5 bg-dark-600 border border-dark-500/40 rounded-lg text-xs text-white text-center focus:outline-none focus:border-ocean/50 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => updateSeason(i, 'episodeCount', season.episodeCount + 1)}
                            className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center hover:bg-dark-500 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-dark-400 mb-1">Episodes vus</label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateSeason(i, 'watchedEpisodes', Math.max(0, (season.watchedEpisodes || 0) - 1))
                            }
                            className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center hover:bg-dark-500 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            value={season.watchedEpisodes || 0}
                            onChange={(e) =>
                              updateSeason(i, 'watchedEpisodes', Math.min(season.episodeCount, Math.max(0, parseInt(e.target.value) || 0)))
                            }
                            className="flex-1 px-2 py-1.5 bg-dark-600 border border-dark-500/40 rounded-lg text-xs text-white text-center focus:outline-none focus:border-ocean/50 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateSeason(i, 'watchedEpisodes', Math.min(season.episodeCount, (season.watchedEpisodes || 0) + 1))
                            }
                            className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center hover:bg-dark-500 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={season.isFinished}
                          onChange={(e) => updateSeason(i, 'isFinished', e.target.checked)}
                          className="w-4 h-4 rounded bg-dark-600 border-dark-500 text-ocean focus:ring-ocean/30"
                        />
                        <span className="text-xs text-dark-300">Termine</span>
                      </label>

                      <select
                        value={season.releaseStatus}
                        onChange={(e) => updateSeason(i, 'releaseStatus', e.target.value)}
                        className="px-2 py-1 bg-dark-600 border border-dark-500/40 rounded-lg text-xs text-white focus:outline-none focus:border-ocean/50 transition-all"
                      >
                        <option value="Released">Released</option>
                        <option value="Not Released">Not Released</option>
                      </select>
                    </div>

                    {season.releaseStatus === 'Not Released' && (
                      <div className="flex items-center gap-2">
                        <CalendarDays size={12} className="text-dark-400 shrink-0" />
                        <input
                          type="date"
                          value={season.expectedReleaseDate || ''}
                          onChange={(e) => updateSeason(i, 'expectedReleaseDate', e.target.value)}
                          className="flex-1 px-2 py-1.5 bg-dark-600 border border-dark-500/40 rounded-lg text-xs text-white focus:outline-none focus:border-ocean/50 transition-all"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate error */}
          {duplicateError && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-orange/10 border border-neon-orange/25 text-neon-orange text-sm font-medium">
              {duplicateError}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-dark-600/30">
            {isEditing && (
              <button
                type="button"
                onClick={() => onDelete(anime.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-neon-red/10 text-neon-red border border-neon-red/20 hover:bg-neon-red/20 transition-colors"
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            )}
            <div className={`flex items-center gap-2 ${!isEditing ? 'ml-auto' : ''}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-dark-300 hover:bg-dark-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-ocean to-accent text-white hover:opacity-90 transition-opacity shadow-lg shadow-ocean/20"
              >
                <Save size={14} />
                {isEditing ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
