#!/usr/bin/env node
/**
 * MyAnimeLog — Import depuis historique Chrome
 *
 * Ce script :
 *  1. Lit ton historique Chrome (anime-sama + voiranime)
 *  2. Cherche chaque anime sur MAL + AniList (avec gestion des saisons via séquelles)
 *  3. Te pose des questions pour chaque anime (terminé ? quelle saison/épisode ?)
 *  4. Génère un fichier myanimelog-import.json prêt à importer sur ton site
 *
 * Usage:
 *   node scripts/import-history.js
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// ── Config ────────────────────────────────────────────────────────────────────

const HISTORY_SRC = path.join(
  process.env.LOCALAPPDATA,
  'Google', 'Chrome', 'User Data', 'Default', 'History'
);
const TEMP_DB  = path.join(__dirname, '_temp_history.db');
const RAW_FILE = path.join(__dirname, '_raw_slugs.json');
const OUT_FILE = path.join(__dirname, '..', 'myanimelog-import.json');

const JIKAN_BASE  = 'https://api.jikan.moe/v4';
const ANILIST_GQL = 'https://graphql.anilist.co';

// ── Traductions French slug → English/Romaji pour la recherche ────────────────
const FR_OVERRIDES = {
  'moi-le-maitre-des-interdits':         'Kinsou no Vermeil',
  'food-for-the-soul':                   'Dungeon Meshi',
  'mysterious-disappearances':           'Shou to Ayashii Hitobito no Kai',
  'kizoku-tensei':                       'Kizoku Tensei',
  'aho-girl':                            'Aho Girl',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : require('crypto').randomBytes(16).toString('hex');
}

function slugToName(slug) {
  return FR_OVERRIDES[slug]
    || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Grouper les slugs voiranime qui sont des séquelles (-2, -3 suffixes)
function groupSequelSlugs(slugList) {
  const groups = {};
  // First pass: base slugs
  for (const s of slugList) {
    const base = s.slug.replace(/-\d+$/, '');
    if (!groups[base]) groups[base] = { base, sequelSlugs: [], allSlugs: [] };
    groups[base].allSlugs.push(s.slug);
    if (s.slug === base) groups[base].hasBase = true;
    else groups[base].sequelSlugs.push(s.slug);
  }
  return Object.values(groups);
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function searchJikan(query) {
  try {
    await sleep(400); // respect rate limit
    const res = await fetch(`${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=3&sfw=false`);
    if (!res.ok) return null;
    const j = await res.json();
    const item = j.data?.[0];
    if (!item) return null;
    return { source: 'MAL', malId: item.mal_id, title: item.title_english || item.title, score: item.score || 0 };
  } catch { return null; }
}

async function searchAniList(query) {
  const gql = `query($s:String){Page(perPage:3){media(search:$s,type:ANIME,sort:SEARCH_MATCH){id title{english romaji}averageScore episodes status relations{edges{relationType node{id title{english romaji}type episodes status}}}}}}`;
  try {
    const res = await fetch(ANILIST_GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gql, variables: { s: query } }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const item = j.data?.Page?.media?.[0];
    if (!item) return null;
    return {
      source: 'AniList',
      anilistId: item.id,
      title: item.title?.english || item.title?.romaji || '',
      score: item.averageScore ? Math.round(item.averageScore / 10) : 0,
      episodes: item.episodes || 0,
      status: item.status,
      relations: item.relations?.edges || [],
    };
  } catch { return null; }
}

// Build full season list from AniList sequel chain
async function buildSeasonsFromAniList(anilistId) {
  const gql = `query($id:Int){Media(id:$id,type:ANIME){title{english romaji}coverImage{large}description genres episodes status seasonYear relations{edges{relationType node{id title{english romaji}type episodes status}}}}}`;
  try {
    const res = await fetch(ANILIST_GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gql, variables: { id: anilistId } }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const m = j.data?.Media;
    if (!m) return null;

    const title = m.title?.english || m.title?.romaji || '';
    const cover = m.coverImage?.large || '';
    const description = (m.description || '').replace(/<[^>]+>/g, '');
    const genres = m.genres || [];

    // Build season list: main + sequels
    const seasons = [];
    seasons.push({
      name: 'Saison 1',
      episodeCount: m.episodes || 0,
      watchedEpisodes: 0,
      isFinished: false,
      releaseStatus: m.status === 'NOT_YET_RELEASED' ? 'Not Released' : 'Released',
      expectedReleaseDate: '',
    });

    const sequels = (m.relations?.edges || [])
      .filter(e => e.relationType === 'SEQUEL' && e.node.type === 'ANIME')
      .slice(0, 10);

    for (let i = 0; i < sequels.length; i++) {
      const n = sequels[i].node;
      seasons.push({
        name: `Saison ${i + 2}`,
        episodeCount: n.episodes || 0,
        watchedEpisodes: 0,
        isFinished: false,
        releaseStatus: n.status === 'NOT_YET_RELEASED' ? 'Not Released' : 'Released',
        expectedReleaseDate: '',
      });
    }

    return { title, cover, description, genres, seasons };
  } catch { return null; }
}

async function getJikanFull(malId) {
  try {
    await sleep(400);
    const res = await fetch(`${JIKAN_BASE}/anime/${malId}/full`);
    if (!res.ok) return null;
    const j = await res.json();
    const m = j.data;
    if (!m) return null;
    const genres = [...(m.genres || []), ...(m.themes || [])].map(g => g.name);
    return {
      title: m.title_english || m.title,
      cover: m.images?.jpg?.large_image_url || '',
      description: m.synopsis || '',
      genres: [...new Set(genres)],
      seasons: [{
        name: 'Saison 1',
        episodeCount: m.episodes || 0,
        watchedEpisodes: 0,
        isFinished: false,
        releaseStatus: m.status === 'Currently Airing' ? 'Not Released' : 'Released',
        expectedReleaseDate: '',
      }],
    };
  } catch { return null; }
}

// ── Readline helper ───────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, ans => resolve(ans.trim())));
}

// ── Apply user answer to seasons ──────────────────────────────────────────────

function applyAnswer(answer, seasons, autoSeasons) {
  const low = answer.toLowerCase();

  // "f" or "fini" or "done" = tout terminé
  if (!low || low === 'f' || low === 'fini' || low === 'done' || low === 'oui') {
    return seasons.map(s => ({ ...s, watchedEpisodes: s.episodeCount, isFinished: true }));
  }

  // "skip" = ignorer
  if (low === 'skip' || low === 's' || low === 'n' || low === 'non') {
    return null; // signal to skip
  }

  // "s2e5" or "2x5" = saison 2 épisode 5
  const seMatch = low.match(/^s?(\d+)e(\d+)$|^(\d+)x(\d+)$/);
  if (seMatch) {
    const sNum = parseInt(seMatch[1] || seMatch[3]);
    const eNum = parseInt(seMatch[2] || seMatch[4]);
    return seasons.map((s, i) => {
      if (i + 1 < sNum) return { ...s, watchedEpisodes: s.episodeCount, isFinished: true };
      if (i + 1 === sNum) return { ...s, watchedEpisodes: eNum, isFinished: eNum >= s.episodeCount };
      return s;
    });
  }

  // "s2" = jusqu'à saison 2 (terminée), saison 3+ pas commencée
  const sMatch = low.match(/^s(\d+)$/);
  if (sMatch) {
    const sNum = parseInt(sMatch[1]);
    return seasons.map((s, i) => {
      if (i + 1 <= sNum) return { ...s, watchedEpisodes: s.episodeCount, isFinished: true };
      return s;
    });
  }

  // Juste un numéro = episode de la saison 1
  const numMatch = low.match(/^(\d+)$/);
  if (numMatch) {
    const eNum = parseInt(numMatch[1]);
    return seasons.map((s, i) => {
      if (i === 0) return { ...s, watchedEpisodes: eNum, isFinished: eNum >= s.episodeCount };
      return s;
    });
  }

  // Défaut = Watching, ep 0
  return seasons;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  MyAnimeLog — Import depuis historique Chrome        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Lire les slugs bruts
  let rawData;
  if (fs.existsSync(RAW_FILE)) {
    rawData = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
  } else {
    console.log('Extraction de l\'historique Chrome...');
    fs.copyFileSync(HISTORY_SRC, TEMP_DB);
    const db = new Database(TEMP_DB, { readonly: true });
    // (same extraction as full-extract.js)
    db.close();
    fs.unlinkSync(TEMP_DB);
  }

  const { animeSama, voiranime } = rawData;

  // Grouper les séquelles voiranime
  const voirGroups = groupSequelSlugs(voiranime);

  // Construire la liste complète
  const allItems = [
    ...animeSama.map(a => ({
      slug: a.slug,
      displayName: slugToName(a.slug),
      source: 'anime-sama',
      animeSamaSeasons: Array.isArray(a.seasons) ? a.seasons : [],
      sequelCount: Array.isArray(a.seasons) ? Math.max(0, a.seasons.length - 1) : 0,
    })),
    ...voirGroups.map(g => ({
      slug: g.base,
      displayName: slugToName(g.base),
      source: 'voiranime',
      sequelCount: g.sequelSlugs.length,
    })),
  ];

  // Dédupliquer (même slug dans les 2 sources)
  const seen = new Set();
  const unique = allItems.filter(a => {
    if (seen.has(a.slug)) return false;
    seen.add(a.slug);
    return true;
  });

  console.log(`📋 ${unique.length} animes détectés dans ton historique\n`);
  console.log('Commandes disponibles pour chaque anime :');
  console.log('  [Entrée]  = Watching (en cours, ep 0)');
  console.log('  f         = Finished (tout terminé)');
  console.log('  s2e5      = Saison 2 Episode 5 en cours');
  console.log('  s3        = Terminé jusqu\'à Saison 3');
  console.log('  skip      = Ignorer cet anime\n');

  const results = [];
  let idx = 0;

  for (const item of unique) {
    idx++;
    console.log(`\n${'─'.repeat(56)}`);
    console.log(`[${idx}/${unique.length}] Recherche : "${item.displayName}"...`);

    // Chercher sur les APIs
    let apiResult = await searchAniList(item.displayName);
    if (!apiResult || !apiResult.title) {
      apiResult = await searchJikan(item.displayName);
    }
    // Retry avec le slug brut si pas trouvé
    if (!apiResult && item.displayName !== item.slug) {
      apiResult = await searchAniList(item.slug.replace(/-/g, ' '));
    }

    let animeData = null;

    if (apiResult) {
      console.log(`  → Trouvé : "${apiResult.title}" (${apiResult.source}${apiResult.score ? ` ★${apiResult.score}` : ''})`);

      // Récupérer les détails complets + saisons
      if (apiResult.source === 'AniList') {
        animeData = await buildSeasonsFromAniList(apiResult.anilistId);
      } else if (apiResult.malId) {
        animeData = await getJikanFull(apiResult.malId);
      }

      if (animeData) {
        const nbSaisons = animeData.seasons.length;
        if (nbSaisons > 1) {
          console.log(`  → ${nbSaisons} saisons détectées :`);
          animeData.seasons.forEach((s, i) => {
            console.log(`     Saison ${i + 1}: ${s.episodeCount || '?'} épisodes`);
          });
        } else {
          const ep = animeData.seasons[0]?.episodeCount;
          console.log(`  → ${ep ? ep + ' épisodes' : 'nombre d\'épisodes inconnu'}`);
        }
      }
    } else {
      console.log(`  ⚠ Aucun résultat API — sera ajouté manuellement`);
    }

    // Question à l'utilisateur
    const defaultHint = animeData?.seasons.length > 1
      ? `(ex: f, s2e5, s${animeData.seasons.length})`
      : '(ex: f, e12, skip)';
    const answer = await ask(`  Ton statut ${defaultHint} : `);

    if (answer.toLowerCase() === 'skip' || answer.toLowerCase() === 'n') {
      console.log(`  ✗ Ignoré`);
      continue;
    }

    const seasons = animeData?.seasons || [{
      name: 'Saison 1', episodeCount: 0, watchedEpisodes: 0,
      isFinished: false, releaseStatus: 'Released', expectedReleaseDate: '',
    }];

    const updatedSeasons = applyAnswer(answer, seasons);
    if (!updatedSeasons) {
      console.log(`  ✗ Ignoré`);
      continue;
    }

    // Déterminer le statut global
    const allFinished = updatedSeasons.every(s => s.isFinished);
    const anyWatched  = updatedSeasons.some(s => (s.watchedEpisodes || 0) > 0);
    const globalStatus = allFinished ? 'Completed' : anyWatched ? 'Watching' : 'Plan to Watch';

    const entry = {
      id: uuid(),
      title: animeData?.title || item.displayName,
      coverImage: animeData?.cover || '',
      description: animeData?.description || '',
      genres: animeData?.genres || [],
      status: globalStatus,
      score: 0,
      isFavorite: false,
      seasons: updatedSeasons,
      updatedAt: new Date().toISOString(),
    };

    results.push(entry);
    console.log(`  ✓ Ajouté → ${entry.title} [${globalStatus}]`);
  }

  rl.close();

  // Sauvegarder
  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));

  console.log(`\n${'═'.repeat(56)}`);
  console.log(`✅ ${results.length} animes exportés !`);
  console.log(`📄 Fichier : myanimelog-import.json`);
  console.log(`\nProchaine étape :`);
  console.log(`  → Va sur ton site myanimelog-orpin.vercel.app`);
  console.log(`  → Clique sur l'icône ↑ (Import) en haut à droite`);
  console.log(`  → Sélectionne le fichier myanimelog-import.json`);
  console.log(`${'═'.repeat(56)}\n`);
}

main().catch(err => {
  console.error('Erreur:', err);
  rl.close();
  process.exit(1);
});
