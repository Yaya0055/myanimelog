import React from 'react';
import { X, Heart, Filter, BarChart3, Library } from 'lucide-react';

const ALL_STATUSES = ['Plan to Watch', 'Watching', 'Completed', 'Dropped'];
const ALL_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports',
  'Supernatural', 'Thriller', 'Mecha', 'Music', 'Psychological',
  'Ecchi', 'Seinen', 'Shounen', 'Shoujo', 'Isekai', 'Historical',
  'School', 'Gourmet'
];

const statusColors = {
  'Plan to Watch': 'bg-ocean/15 text-ocean-light border-ocean/25',
  'Watching': 'bg-neon-green/15 text-neon-green border-neon-green/25',
  'Completed': 'bg-accent/15 text-accent-light border-accent/25',
  'Dropped': 'bg-neon-red/15 text-neon-red border-neon-red/25',
};

export default function Sidebar({
  isOpen,
  onClose,
  filters,
  setFilters,
  currentView,
  setCurrentView,
  animeCounts,
}) {
  const toggleGenre = (genre) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const toggleStatus = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? '' : status,
    }));
  };

  const clearFilters = () => {
    setFilters({ status: '', genres: [], favoritesOnly: false });
  };

  const hasActiveFilters = filters.status || filters.genres.length > 0 || filters.favoritesOnly;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-dark-800/95 backdrop-blur-xl border-r border-dark-600/30 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Header */}
        <div className="p-5 border-b border-dark-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean to-accent flex items-center justify-center shadow-lg shadow-ocean/20">
                <Library size={16} className="text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-ocean-light to-accent-light bg-clip-text text-transparent">
                MyAnimeLog
              </h1>
            </div>
            <button onClick={onClose} className="lg:hidden text-dark-300 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-1">
          <button
            onClick={() => setCurrentView('collection')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'collection'
                ? 'bg-ocean/15 text-ocean-light'
                : 'text-dark-200 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <Library size={18} />
            Ma Collection
            <span className="ml-auto text-xs bg-dark-600 px-2 py-0.5 rounded-full text-dark-200">
              {animeCounts.total}
            </span>
          </button>
          <button
            onClick={() => setCurrentView('stats')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'stats'
                ? 'bg-ocean/15 text-ocean-light'
                : 'text-dark-200 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <BarChart3 size={18} />
            Statistiques
          </button>
        </div>

        {currentView === 'collection' && (
          <>
            <div className="px-4 pt-2 pb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-dark-300 uppercase tracking-wider">
                  <Filter size={12} />
                  Filtres
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-ocean hover:text-ocean-light transition-colors"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 py-2">
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  filters.favoritesOnly
                    ? 'bg-neon-pink/15 text-neon-pink border-neon-pink/25'
                    : 'text-dark-300 border-dark-600/40 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <Heart size={16} className={filters.favoritesOnly ? 'fill-neon-pink' : ''} />
                Favoris uniquement
              </button>
            </div>

            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
                Statut
              </h3>
              <div className="space-y-1">
                {ALL_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all border ${
                      filters.status === status
                        ? statusColors[status]
                        : 'text-dark-300 border-transparent hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    <span>{status}</span>
                    <span className="text-xs opacity-70">{animeCounts[status] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-2 pb-6">
              <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">
                Genres
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {ALL_GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                      filters.genres.includes(genre)
                        ? 'bg-accent/15 text-accent-light border-accent/25'
                        : 'text-dark-400 border-dark-600/40 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
