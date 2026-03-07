#!/usr/bin/env node
/**
 * Import local JSON data into Firestore.
 * Collections: users, orders, products, categories, coupons, banners, ai_logs, support_requests, hero_media, inventory, inventory_logs
 *
 * Usage:
 *   node scripts/import-to-firestore.js [--sync]
 *   node scripts/import-to-firestore.js [--sync] [--collections users,orders,ai_logs]
 *
 * Auth:
 *   Provide Firebase credentials via one of:
 *     - env GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON)
 *     - env FIREBASE_CREDENTIALS (path to service account JSON)
 *     - env FIREBASE_CREDENTIALS_JSON (inline JSON string)
 */
const fs = require('fs');
const path = require('path');

function log(msg){ console.log(`[import] ${msg}`); }
function readJSON(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')||'[]'); }catch(e){ return []; } }

// Parse args
const argv = process.argv.slice(2);
const args = new Set(argv);
const doSyncDelete = args.has('--sync') || args.has('-s');
const collectionsArgIdx = argv.findIndex(x => x === '--collections' || x === '-c');
const selectedCollections = (collectionsArgIdx >= 0 && argv[collectionsArgIdx + 1])
  ? new Set(String(argv[collectionsArgIdx + 1]).split(',').map(x => x.trim()).filter(Boolean))
  : null;

// Resolve credentials
let admin = null; let firestore = null;
try{
  admin = require('firebase-admin');
  let creds = null;
  if(process.env.FIREBASE_CREDENTIALS){
    const p = path.resolve(process.env.FIREBASE_CREDENTIALS);
    creds = JSON.parse(fs.readFileSync(p,'utf8'));
  }else if(process.env.GOOGLE_APPLICATION_CREDENTIALS){
    const p = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    creds = JSON.parse(fs.readFileSync(p,'utf8'));
  }else if(process.env.FIREBASE_CREDENTIALS_JSON){
    creds = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
  }
  if(!admin.apps.length){
    admin.initializeApp({ credential: creds ? admin.credential.cert(creds) : admin.credential.applicationDefault() });
  }
  firestore = admin.firestore();
}catch(e){
  console.error('Failed to initialize firebase-admin. Ensure credentials are set.', e);
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const files = {
  users: path.join(ROOT, 'users.json'),
  orders: path.join(ROOT, 'orders.json'),
  products: path.join(ROOT, 'products.json'),
  categories: path.join(ROOT, 'categories.json'),
  coupons: path.join(ROOT, 'coupons.json'),
  banners: path.join(ROOT, 'banners.json'),
  ai_logs: path.join(ROOT, 'ai_logs.json'),
  support_requests: path.join(ROOT, 'support_requests.json'),
  inventory: path.join(ROOT, 'inventory.json'),
  inventory_logs: path.join(ROOT, 'inventory_logs.json'),
};
const heroMediaFile = path.join(ROOT, 'hero_media.json');

async function importCollection(name, items){
  const col = firestore.collection(name);
  const batch = firestore.batch();
  const keepIds = new Set();

  for(const x of items){
    const id = String(x.id ?? Date.now() + '_' + Math.random().toString(36).slice(2));
    keepIds.add(id);
    batch.set(col.doc(id), x, { merge: true });
  }

  if(doSyncDelete){
    const snap = await col.get();
    snap.docs.forEach(d => { if(!keepIds.has(d.id)) batch.delete(d.ref); });
  }

  await batch.commit();
  log(`${name}: upserted ${items.length}${doSyncDelete ? ' (sync delete enabled)' : ''}`);
}

async function importHeroMedia(){
  const raw = readJSON(heroMediaFile);
  const obj = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  const saved = {
    type: obj.type === 'image' ? 'image' : 'video',
    src: String(obj.src || ''),
    poster: String(obj.poster || ''),
    updatedAt: obj.updatedAt || new Date().toISOString()
  };
  await firestore.collection('hero_media').doc('current').set(saved, { merge: true });
  log('hero_media: upserted current document');
}

(async () => {
  let datasets = Object.entries(files)
    .map(([name, p]) => ({ name, path: p, items: readJSON(p) }))
    .filter(x => Array.isArray(x.items));

  if(selectedCollections && selectedCollections.size){
    datasets = datasets.filter(x => selectedCollections.has(x.name));
  }

  const selectedText = datasets.map(x => x.name).join(', ') || '(none)';
  log(`Starting import${doSyncDelete ? ' with sync delete' : ''} for: ${selectedText}`);
  for(const ds of datasets){
    try{ await importCollection(ds.name, ds.items); }catch(e){ console.error(`Failed importing ${ds.name}`, e); }
  }
  const shouldImportHero = !selectedCollections || selectedCollections.has('hero_media');
  if(shouldImportHero){
    try{ await importHeroMedia(); }catch(e){ console.error('Failed importing hero_media', e); }
  }
  log('Import completed.');
})();
