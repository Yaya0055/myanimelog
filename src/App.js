import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Search, Plus, Menu, Download, Upload, SortAsc, SortDesc, LayoutGrid,
  LogOut, Loader2, User
} from 'lucide-react';

import useAuth from './hooks/useAuth';
import useSupabaseAnimes from './hooks/useSupabaseAnimes';
import useToast from './hooks/useToast';
import ToastContainer from './components/ToastContainer';
import Sidebar from './components/Sidebar';
import AnimeCard from './components/AnimeCard';
import AnimeModal from './components/AnimeModal';
import StatsPage from './components/StatsPage';
import NotificationBanner from './components/NotificationBanner';
import AuthPage from './components/AuthPage';

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const {
    animes, loading: dataLoading, dismissedAlerts,
    addAnime, updateAnime, deleteAnime, toggleFavorite,
    dismissAlert, replaceCollection,
  } = useSupabaseAnimes(user?.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('collection');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', genres: [], favoritesOnly: false });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState(null);

  const { toasts, addToast, removeToast } = useToast();
  const importRef = useRef(null);

  const animeCounts = useMemo(() => {
    const counts = { total: animes.length };
    ['Plan to Watch', 'Watching', 'Completed', 'Dropped'].forEach((s) => {
      counts[s] = animes.filter((a) => a.status === s).length;
    });
    return counts;
  }, [animes]);

  const filteredAnimes = useMemo(() => {
    let list = [...animes];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q));
    }
    if (filters.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters.genres.length > 0) {
      list = list.filter((a) => filters.genres.some((g) => a.genres.includes(g)));
    }
    if (filters.favoritesOnly) {
      list = list.filter((a) => a.isFavorite);
    }

    list.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortBy === 'score') {
        valA = a.score;
        valB = b.score;
      } else {
        valA = a.updatedAt || '';
        valB = b.updatedAt || '';
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [animes, searchQuery, filters, sortBy, sortDir]);

  const handleSave = useCallback(
    async (formData) => {
      try {
        if (formData.id) {
          await updateAnime(formData);
          addToast(`"${formData.title}" mis a jour !`, 'success');
        } else {
          await addAnime(formData);
          addToast(`"${formData.title}" ajoute a ta collection !`, 'success');
        }
        setModalOpen(false);
        setEditingAnime(null);
      } catch (err) {
        addToast('Erreur lors de la sauvegarde.', 'error');
      }
    },
    [addAnime, updateAnime, addToast]
  );

  const handleDelete = useCallback(
    async (id) => {
      const anime = animes.find((a) => a.id === id);
      try {
        await deleteAnime(id);
        addToast(`"${anime?.title}" supprime.`, 'info');
        setModalOpen(false);
        setEditingAnime(null);
      } catch (err) {
        addToast('Erreur lors de la suppression.', 'error');
      }
    },
    [animes, deleteAnime, addToast]
  );

  const handleToggleFavorite = useCallback(
    (id) => {
      toggleFavorite(id);
    },
    [toggleFavorite]
  );

  const handleExport = useCallback(() => {
    const data = JSON.stringify(animes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myanimelog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Collection exportee (${animes.length} animes)`, 'success');
  }, [animes, addToast]);

  const handleImport = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (Array.isArray(data)) {
            const count = await replaceCollection(data);
            addToast(`${count} animes importes avec succes !`, 'success');
          } else {
            addToast('Format de fichier invalide.', 'error');
          }
        } catch {
          addToast('Erreur lors de la lecture du fichier.', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [replaceCollection, addToast]
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Deconnecte !', 'info');
    } catch {
      addToast('Erreur de deconnexion.', 'error');
    }
  };

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-ocean animate-spin" />
          <p className="text-dark-300 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // Auth page if not logged in
  if (!user) {
    return (
      <AuthPage
        onSignInWithGoogle={signInWithGoogle}
        onSignInWithEmail={signInWithEmail}
        onSignUpWithEmail={signUpWithEmail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={filters}
        setFilters={setFilters}
        currentView={currentView}
        setCurrentView={(v) => {
          setCurrentView(v);
          setSidebarOpen(false);
        }}
        animeCounts={animeCounts}
      />

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/30">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-dark-700 flex items-center justify-center hover:bg-dark-600 transition-colors text-dark-200"
            >
              <Menu size={18} />
            </button>

            <div className="flex-1 relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un anime..."
                className="w-full pl-10 pr-4 py-2 bg-dark-700/50 border border-dark-600/30 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-ocean/40 focus:ring-1 focus:ring-ocean/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-2 bg-dark-700/50 border border-dark-600/30 rounded-xl text-xs text-dark-200 focus:outline-none focus:border-ocean/40 transition-all"
                >
                  <option value="updatedAt">Date</option>
                  <option value="title">Titre</option>
                  <option value="score">Note</option>
                </select>
                <button
                  onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="w-9 h-9 rounded-xl bg-dark-700/50 border border-dark-600/30 flex items-center justify-center hover:bg-dark-600 transition-colors text-dark-300"
                >
                  {sortDir === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                </button>
              </div>

              <button
                onClick={handleExport}
                className="w-9 h-9 rounded-xl bg-dark-700/50 border border-dark-600/30 flex items-center justify-center hover:bg-dark-600 transition-colors text-dark-300 hover:text-white"
                title="Exporter"
              >
                <Download size={14} />
              </button>

              <button
                onClick={() => importRef.current?.click()}
                className="w-9 h-9 rounded-xl bg-dark-700/50 border border-dark-600/30 flex items-center justify-center hover:bg-dark-600 transition-colors text-dark-300 hover:text-white"
                title="Importer"
              >
                <Upload size={14} />
              </button>
              <input
                ref={importRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              <button
                onClick={() => { setEditingAnime(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-ocean to-accent text-white hover:opacity-90 transition-opacity shadow-lg shadow-ocean/20"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Ajouter</span>
              </button>

              {/* User menu */}
              <div className="relative group">
                <button
                  className="w-9 h-9 rounded-xl bg-dark-700/50 border border-dark-600/30 flex items-center justify-center hover:bg-dark-600 transition-colors overflow-hidden"
                  title={user.email}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={14} className="text-dark-300" />
                  )}
                </button>
                <div className="absolute right-0 top-full mt-1 w-56 bg-dark-700 border border-dark-600/40 rounded-xl shadow-2xl shadow-black/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 p-2">
                  <div className="px-3 py-2 border-b border-dark-600/30 mb-1">
                    <p className="text-xs font-medium text-white truncate">{user.user_metadata?.full_name || 'Mon compte'}</p>
                    <p className="text-[10px] text-dark-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neon-red hover:bg-neon-red/10 transition-colors"
                  >
                    <LogOut size={13} />
                    Se deconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {/* Data loading indicator */}
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 size={32} className="text-ocean animate-spin mb-3" />
              <p className="text-dark-300 text-sm">Chargement de ta collection...</p>
            </div>
          ) : currentView === 'stats' ? (
            <StatsPage animes={animes} />
          ) : (
            <>
              <NotificationBanner
                animes={animes}
                dismissed={dismissedAlerts}
                onDismiss={dismissAlert}
              />

              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-dark-300">
                  {filteredAnimes.length} anime{filteredAnimes.length !== 1 ? 's' : ''}
                  {searchQuery && ` pour "${searchQuery}"`}
                </p>
              </div>

              {filteredAnimes.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-dark-400">
                  <LayoutGrid size={48} className="mb-4 opacity-30" />
                  {animes.length === 0 ? (
                    <>
                      <p className="text-lg font-medium text-dark-200">Ta collection est vide</p>
                      <p className="text-sm mt-1 mb-4">
                        Commence par ajouter ton premier anime !
                      </p>
                      <button
                        onClick={() => { setEditingAnime(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-ocean to-accent text-white hover:opacity-90 transition-opacity"
                      >
                        <Plus size={16} />
                        Ajouter un anime
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-dark-200">Aucun resultat</p>
                      <p className="text-sm mt-1">
                        Essaie de modifier tes filtres ou ta recherche.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {filteredAnimes.map((anime) => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onClick={(a) => { setEditingAnime(a); setModalOpen(true); }}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <AnimeModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAnime(null); }}
        anime={editingAnime}
        onSave={handleSave}
        onDelete={handleDelete}
        existingAnimes={animes}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
