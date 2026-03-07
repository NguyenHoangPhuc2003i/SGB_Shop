#!/usr/bin/env node
/**
 * Import local JSON data into Firestore.
 * Collections: users, orders, products, categories, coupons, banners, ai_logs
 *
 * Usage:
 *   node scripts/import-to-firestore.js [--sync]
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
const args = new Set(process.argv.slice(2));
const doSyncDelete = args.has('--sync') || args.has('-s');

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
};

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

(async () => {
  const datasets = Object.entries(files)
    .map(([name, p]) => ({ name, path: p, items: readJSON(p) }))
    .filter(x => Array.isArray(x.items));

  log(`Starting import${doSyncDelete ? ' with sync delete' : ''}...`);
  for(const ds of datasets){
    try{ await importCollection(ds.name, ds.items); }catch(e){ console.error(`Failed importing ${ds.name}`, e); }
  }
  log('Import completed.');
})();
