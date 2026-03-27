const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const HISTORY_SRC = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'History');
const TEMP = path.join(__dirname, '_temp_history.db');

fs.copyFileSync(HISTORY_SRC, TEMP);
const db = new Database(TEMP, { readonly: true });

// ── Anime-sama : tous les slugs uniques avec saisons visitées ─────────────────
const animeSamaRows = db.prepare(`
  SELECT url FROM urls
  WHERE (url LIKE '%anime-sama%/catalogue/%')
    AND url NOT LIKE '%login%'
    AND url NOT LIKE '%profil%'
  ORDER BY last_visit_time ASC
`).all();

const animeSamaMap = {};
for (const row of animeSamaRows) {
  // Extract slug from URLs like: /catalogue/{slug}/saison{n}/vostfr
  const m = row.url.match(/\/catalogue\/([^\/\?#]+)/);
  if (!m) continue;
  const slug = m[1].toLowerCase().trim();
  if (!slug || slug.length < 2) continue;

  // Extract season if present
  const saison = row.url.match(/saison(\d+(?:-\d+)?)/i);
  if (!animeSamaMap[slug]) {
    animeSamaMap[slug] = { slug, seasons: [], source: 'anime-sama' };
  }
  if (saison && !animeSamaMap[slug].seasons.includes(saison[1])) {
    animeSamaMap[slug].seasons.push(saison[1]);
  }
}

// ── Voiranime : tous les slugs uniques ───────────────────────────────────────
const voirRows = db.prepare(`
  SELECT url FROM urls
  WHERE (url LIKE '%voiranime%/anime/%')
  ORDER BY last_visit_time ASC
`).all();

const voirMap = {};
for (const row of voirRows) {
  const m = row.url.match(/\/anime\/([^\/\?#]+)/);
  if (!m) continue;
  let slug = m[1].toLowerCase().replace(/\/$/, '').trim();
  // Skip URL-encoded garbage or very short slugs
  if (!slug || slug.length < 2 || slug.includes('%')) continue;
  if (!voirMap[slug]) voirMap[slug] = { slug, source: 'voiranime' };
}

db.close();
fs.unlinkSync(TEMP);

const animeSamaList = Object.values(animeSamaMap);
const voirList = Object.values(voirMap);

console.log(`\n=== ANIME-SAMA: ${animeSamaList.length} animes uniques ===`);
animeSamaList.forEach(a => {
  const saisonStr = a.seasons.size > 0 ? ` [saisons visitées: ${[...a.seasons].join(', ')}]` : '';
  console.log(`  ${a.slug}${saisonStr}`);
});

console.log(`\n=== VOIRANIME: ${voirList.length} animes uniques ===`);
voirList.forEach(a => console.log(`  ${a.slug}`));

// Save raw lists to JSON for the import script
fs.writeFileSync(
  path.join(__dirname, '_raw_slugs.json'),
  JSON.stringify({ animeSama: animeSamaList, voiranime: voirList }, null, 2)
);
console.log('\n✓ Sauvegardé dans scripts/_raw_slugs.json');
