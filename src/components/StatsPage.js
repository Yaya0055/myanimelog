import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, Film, Star, Trophy, TrendingUp, Heart } from 'lucide-react';

const COLORS = [
  '#5ba8f5', '#7c6ef0', '#e879a8', '#4cd9a0', '#f0a050',
  '#e86070', '#06b6d4', '#f97316', '#84cc16', '#a855f7',
  '#14b8a6', '#e11d48',
];

export default function StatsPage({ animes }) {
  const stats = useMemo(() => {
    const totalWatched = animes.reduce(
      (sum, a) => sum + a.seasons.reduce((s, se) => s + (se.watchedEpisodes || 0), 0),
      0
    );
    const totalMinutes = totalWatched * 24;
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = (totalMinutes / 60 / 24).toFixed(1);
    const remainingHours = totalHours % 24;
    const fullDays = Math.floor(totalHours / 24);

    const completed = animes.filter((a) => a.status === 'Completed').length;
    const watching = animes.filter((a) => a.status === 'Watching').length;
    const favorites = animes.filter((a) => a.isFavorite).length;

    const scored = animes.filter((a) => a.score > 0);
    const avgScore = scored.length > 0
      ? (scored.reduce((sum, a) => sum + a.score, 0) / scored.length).toFixed(1)
      : 0;

    const genreMap = {};
    animes.forEach((a) => {
      const watched = a.seasons.reduce((s, se) => s + (se.watchedEpisodes || 0), 0);
      if (watched > 0) {
        a.genres.forEach((g) => {
          genreMap[g] = (genreMap[g] || 0) + watched;
        });
      }
    });
    const genreData = Object.entries(genreMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);

    const statusData = [
      { name: 'Watching', value: watching, color: '#4cd9a0' },
      { name: 'Completed', value: completed, color: '#7c6ef0' },
      { name: 'Plan to Watch', value: animes.filter((a) => a.status === 'Plan to Watch').length, color: '#5ba8f5' },
      { name: 'Dropped', value: animes.filter((a) => a.status === 'Dropped').length, color: '#e86070' },
    ].filter((d) => d.value > 0);

    return {
      totalWatched, totalMinutes, totalHours, totalDays, fullDays, remainingHours,
      completed, watching, favorites, avgScore, genreData, statusData,
      totalAnimes: animes.length,
    };
  }, [animes]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-700 border border-dark-500/40 rounded-xl px-3 py-2 shadow-xl shadow-black/30">
          <p className="text-sm font-semibold text-white">{payload[0].name}</p>
          <p className="text-xs text-dark-200">{payload[0].value} episodes</p>
        </div>
      );
    }
    return null;
  };

  if (animes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-dark-400">
        <TrendingUp size={48} className="mb-4 opacity-40" />
        <p className="text-lg font-medium">Aucune statistique disponible</p>
        <p className="text-sm mt-1">Ajoutez des animes pour voir vos stats !</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-dark-50">Statistiques</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={Clock} label="Temps total" value={`${stats.fullDays}j ${stats.remainingHours}h`} sublabel={`${stats.totalMinutes.toLocaleString()} min`} color="text-ocean-light" bgColor="bg-ocean/12" />
        <StatCard icon={Film} label="Episodes vus" value={stats.totalWatched.toLocaleString()} sublabel={`~${stats.totalDays} jours`} color="text-accent-light" bgColor="bg-accent/12" />
        <StatCard icon={Trophy} label="Completes" value={stats.completed} sublabel={`sur ${stats.totalAnimes}`} color="text-neon-green" bgColor="bg-neon-green/12" />
        <StatCard icon={TrendingUp} label="En cours" value={stats.watching} color="text-neon-orange" bgColor="bg-neon-orange/12" />
        <StatCard icon={Star} label="Note moyenne" value={`${stats.avgScore}/10`} color="text-yellow-400" bgColor="bg-yellow-400/10" />
        <StatCard icon={Heart} label="Favoris" value={stats.favorites} color="text-neon-pink" bgColor="bg-neon-pink/12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.genreData.length > 0 && (
          <div className="bg-dark-700/40 border border-dark-600/25 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-dark-50 mb-4">Genres les plus regardes</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.genreData} cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2} dataKey="value">
                    {stats.genreData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {stats.genreData.map((g, i) => (
                <div key={g.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] text-dark-200">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.statusData.length > 0 && (
          <div className="bg-dark-700/40 border border-dark-600/25 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-dark-50 mb-4">Repartition par statut</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.statusData} cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2} dataKey="value">
                    {stats.statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {stats.statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] text-dark-200">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {animes.filter((a) => a.score > 0).length > 0 && (
        <div className="bg-dark-700/40 border border-dark-600/25 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-dark-50 mb-4">Top animes notes</h3>
          <div className="space-y-2">
            {animes
              .filter((a) => a.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((anime, i) => (
                <div key={anime.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-dark-800/50">
                  <span className="text-lg font-bold text-dark-400 w-6 text-center">{i + 1}</span>
                  <img
                    src={anime.coverImage}
                    alt={anime.title}
                    className="w-8 h-11 object-cover rounded-md shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span className="text-sm font-medium text-white flex-1 truncate">{anime.title}</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-400">{anime.score}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, color, bgColor }) {
  return (
    <div className="bg-dark-700/40 border border-dark-600/25 rounded-2xl p-4 hover:border-dark-500/40 transition-colors">
      <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center mb-3`}>
        <Icon size={18} className={color} />
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-dark-300 uppercase tracking-wider mt-0.5">{label}</p>
      {sublabel && <p className="text-[10px] text-dark-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}
