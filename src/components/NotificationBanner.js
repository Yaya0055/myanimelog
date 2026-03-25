import React, { useMemo } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationBanner({ animes, dismissed, onDismiss }) {
  const alerts = useMemo(() => {
    const now = new Date();
    const notifications = [];

    animes.forEach((anime) => {
      anime.seasons.forEach((season) => {
        if (
          season.releaseStatus === 'Not Released' &&
          season.expectedReleaseDate
        ) {
          const releaseDate = new Date(season.expectedReleaseDate);
          if (now >= releaseDate) {
            const key = `${anime.id}-${season.name}`;
            if (!dismissed.includes(key)) {
              notifications.push({
                key,
                title: anime.title,
                season: season.name,
                date: season.expectedReleaseDate,
              });
            }
          }
        }
      });
    });

    return notifications;
  }, [animes, dismissed]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4 animate-slide-up">
      {alerts.map((alert) => (
        <div
          key={alert.key}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neon-orange/10 border border-neon-orange/20"
        >
          <Bell size={16} className="text-neon-orange shrink-0 animate-pulse" />
          <p className="text-sm text-neon-orange flex-1">
            <span className="font-bold">{alert.title}</span> — {alert.season} est potentiellement disponible !
          </p>
          <button
            onClick={() => onDismiss(alert.key)}
            className="shrink-0 text-neon-orange/60 hover:text-neon-orange transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
