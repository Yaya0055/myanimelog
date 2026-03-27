// Quick peek at Chrome history URL patterns
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const HISTORY_SRC = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'History');
const TEMP = path.join(__dirname, '_temp_history.db');

fs.copyFileSync(HISTORY_SRC, TEMP);
const db = new Database(TEMP, { readonly: true });

// Anime-sama samples
console.log('\n=== ANIME-SAMA (50 exemples) ===');
const animeSama = db.prepare(`
  SELECT url, title FROM urls
  WHERE url LIKE '%anime-sama%'
  ORDER BY last_visit_time DESC
  LIMIT 50
`).all();
animeSama.forEach(r => console.log(r.url));

// Voiranime samples
console.log('\n=== VOIRANIME (50 exemples) ===');
const voirAnime = db.prepare(`
  SELECT url, title FROM urls
  WHERE url LIKE '%voiranime%'
  ORDER BY last_visit_time DESC
  LIMIT 50
`).all();
voirAnime.forEach(r => console.log(r.url));

// Count totals
const totalAnimeSama = db.prepare(`SELECT COUNT(*) as n FROM urls WHERE url LIKE '%anime-sama%catalogue%'`).get();
const totalVoir = db.prepare(`SELECT COUNT(*) as n FROM urls WHERE url LIKE '%voiranime%'`).get();
console.log(`\n=== TOTAUX ===`);
console.log(`Anime-sama (catalogue): ${totalAnimeSama.n} URLs`);
console.log(`Voiranime: ${totalVoir.n} URLs`);

db.close();
fs.unlinkSync(TEMP);
