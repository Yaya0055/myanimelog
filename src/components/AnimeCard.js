import React from 'react';
import { Heart, Star, Play, Eye, CheckCircle, XCircle, Film } from 'lucide-react';

const statusConfig = {
  'Plan to Watch': { icon: Eye, color: 'from-ocean to-ocean-dark', badge: 'bg-ocean/80' },
  'Watching': { icon: Play, color: 'from-neon-green to-emerald-600', badge: 'bg-neon-green/80' },
  'Completed': { icon: CheckCircle, color: 'from-accent to-accent-dark', badge: 'bg-accent/80' },
  'Dropped': { icon: XCircle, color: 'from-neon-red to-red-700', badge: 'bg-neon-red/80' },
};

const formatDuration = (min) => {
  if (!min) return '0min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}` : `${m}min`;
};

export default function AnimeCard({ anime, onClick, onToggleFavorite }) {
  const config = statusConfig[anime.status] || statusConfig['Plan to Watch'];
  const isMovie = anime.animeType === 'movie';
  const totalEpisodes = anime.seasons.reduce((sum, s) => sum + s.episodeCount, 0);
  const watchedEpisodes = anime.seasons.reduce((sum, s) => sum + (s.watchedEpisodes || 0), 0);
  const progress = isMovie
    ? (anime.duration > 0 ? ((anime.watchedDuration || 0) / anime.duration) * 100 : 0)
    : (totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-dark-700/40 border border-dark-600/25 hover:border-ocean/30 transition-all duration-300 hover:shadow-xl hover:shadow-ocean/8 cursor-pointer hover:-translate-y-1"
      onClick={() => onClick(anime)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={anime.coverImage}
          alt={anime.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = `data:image/svg+xml,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" fill="%231c2e42"><rect width="300" height="400"/><text x="150" y="200" fill="%23627a90" text-anchor="middle" font-family="sans-serif" font-size="14">No Image</text></svg>'
            )}`;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white ${config.badge} backdrop-blur-md`}>
          {anime.status}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(anime.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-dark-800/50 backdrop-blur-md flex items-center justify-center hover:bg-dark-800/70 transition-all"
        >
          <Heart
            size={16}
            className={`transition-all ${
              anime.isFavorite
                ? 'fill-neon-pink text-neon-pink scale-110'
                : 'text-white/60 hover:text-neon-pink'
            }`}
          />
        </button>

        {anime.score > 0 && (
          <div className="absolute bottom-12 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-800/60 backdrop-blur-md">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">{anime.score}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 mb-1 drop-shadow-lg">
            {anime.title}
          </h3>
          <div className="flex items-center gap-2 text-[10px] text-dark-100">
            {isMovie ? (
              <>
                <Film size={10} className="shrink-0" />
                <span>Film</span>
                <span className="text-dark-400">|</span>
                <span>{formatDuration(anime.watchedDuration || 0)}/{formatDuration(anime.duration || 0)}</span>
              </>
            ) : (
              <>
                <span>{anime.seasons.length} saison{anime.seasons.length > 1 ? 's' : ''}</span>
                <span className="text-dark-400">|</span>
                <span>{watchedEpisodes}/{totalEpisodes} ep.</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="h-1 bg-dark-600">
        <div
          className={`h-full bg-gradient-to-r ${config.color} transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
