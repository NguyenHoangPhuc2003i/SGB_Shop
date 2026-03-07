const express = require('express');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer');
let GoogleGenAI = null;
try{ ({ GoogleGenAI } = require('@google/genai')); }catch(_){ /* optional */ }
let admin = null; let firestore = null;
// Ensure fetch exists (Node 18+ has global fetch; fallback to node-fetch@2 if needed)
const fetch = globalThis.fetch || require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;
// Users data file path: configurable via env for custom storage location
// If USERS_FILE points to a directory, we'll store users.json inside it
const USERS_PATH_ENV = process.env.USERS_FILE || process.env.USERS_DB_PATH || process.env.USERS_DATA_PATH;
const DATA_FILE = USERS_PATH_ENV
  ? (function(){
      const p = path.resolve(USERS_PATH_ENV);
      return path.extname(p).toLowerCase() === '.json' ? p : path.join(p, 'users.json');
    })()
  : path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');
const COUPONS_FILE = path.join(__dirname, 'coupons.json');
const BANNERS_FILE = path.join(__dirname, 'banners.json');
const AI_LOGS_FILE = path.join(__dirname, 'ai_logs.json');
const SUPPORT_REQUESTS_FILE = path.join(__dirname, 'support_requests.json');
const HERO_MEDIA_FILE = path.join(__dirname, 'hero_media.json');
const INVENTORY_FILE = path.join(__dirname, 'inventory.json');
const INVENTORY_LOGS_FILE = path.join(__dirname, 'inventory_logs.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

function toBool(value, defaultValue = false){
  if(value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function parseCollectionSet(value){
  return new Set(
    String(value || '')
      .split(',')
      .map(x => String(x || '').trim().toLowerCase())
      .filter(Boolean)
  );
}

const DEFAULT_FIREBASE_COLLECTIONS = '*';
const FIREBASE_ENABLED = toBool(process.env.FIREBASE_ENABLED, false);
const FIREBASE_ENABLED_USERS_LEGACY = toBool(process.env.FIREBASE_ENABLED_USERS, false);
const FIREBASE_COLLECTIONS = parseCollectionSet(process.env.FIREBASE_COLLECTIONS || DEFAULT_FIREBASE_COLLECTIONS);
if(FIREBASE_ENABLED_USERS_LEGACY) FIREBASE_COLLECTIONS.add('users');
const JSON_BACKUP_ENABLED = toBool(process.env.JSON_BACKUP_ENABLED, true);
const HAS_FIREBASE_CREDENTIALS_HINT = !!(
  process.env.FIREBASE_CREDENTIALS ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.FIREBASE_CREDENTIALS_JSON
);

// Simple admin credentials (change in env for better security)
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

// Ensure uploads dir exists
try{ if(!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR); }catch{ /* noop */ }

// Allow larger payloads for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Force UTF-8 for HTML responses to prevent mojibake on some static servers/proxies
app.use((req, res, next) => {
  if((req.path || '').toLowerCase().endsWith('.html')){
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }
  next();
});
// CORS: allow static sites (GitHub Pages/Netlify) to call this API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Email');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
// Serve static files (the site)
app.use('/uploads', express.static(UPLOADS_DIR));
// Helpers for role-based admin checks
function shouldUseFirestore(colName){
  const key = String(colName || '').toLowerCase();
  return !!(firestore && (FIREBASE_COLLECTIONS.has('*') || FIREBASE_COLLECTIONS.has(key)));
}

function storageForCollection(colName){
  return shouldUseFirestore(colName) ? 'firestore' : 'json';
}

function writeJsonFile(filePath, data){
  try{ fs.mkdirSync(path.dirname(filePath), { recursive: true }); }catch(_){ /* noop */ }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Optional: Use Firebase Firestore for selected collections only
const SHOULD_INIT_FIREBASE = FIREBASE_ENABLED || FIREBASE_ENABLED_USERS_LEGACY || HAS_FIREBASE_CREDENTIALS_HINT;
if(SHOULD_INIT_FIREBASE && FIREBASE_COLLECTIONS.size){
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
    console.log('Firebase Firestore enabled for collections:', Array.from(FIREBASE_COLLECTIONS).join(', '));
  }catch(e){
    console.error('Failed to init Firebase Admin SDK, falling back to file storage for all collections.', e);
    firestore = null;
  }
}

async function readUsers(){
  if(shouldUseFirestore('users')){
    const snap = await firestore.collection('users').get();
    return snap.docs.map(d => d.data());
  }
  try{
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){ return []; }
}

async function writeUsers(users){
  if(shouldUseFirestore('users')){
    const col = firestore.collection('users');
    const batch = firestore.batch();
    // existing ids
    const existing = await col.get();
    const keepIds = new Set(users.map(u => String(u.id)));
    existing.docs.forEach(doc => { if(!keepIds.has(doc.id)) batch.delete(doc.ref); });
    users.forEach(u => { const id = String(u.id); batch.set(col.doc(id), u, { merge: true }); });
    await batch.commit();
    if(JSON_BACKUP_ENABLED) writeJsonFile(DATA_FILE, users);
    return;
  }
  writeJsonFile(DATA_FILE, users);
}

// Generic helpers: Firestore collections with file JSON fallback
async function readCollection(colName, filePath){
  if(shouldUseFirestore(colName)){
    const snap = await firestore.collection(colName).get();
    return snap.docs.map(d => d.data());
  }
  try{ const raw = fs.readFileSync(filePath, 'utf8'); return JSON.parse(raw || '[]'); }catch(e){ return []; }
}

function getCollectionDocId(colName, item, index = 0){
  const x = item || {};
  if(colName === 'inventory'){
    if(x.product_id != null && String(x.product_id).trim()) return String(x.product_id).trim();
  }
  if(x.id != null && String(x.id).trim()) return String(x.id).trim();
  if(colName === 'users' && x.email) return String(x.email).trim().toLowerCase();
  if(colName === 'support_requests' && x.trackingCode) return String(x.trackingCode).trim().toUpperCase();
  return `${String(colName || 'row')}_${index + 1}`;
}

async function writeCollection(colName, filePath, items){
  if(shouldUseFirestore(colName)){
    const col = firestore.collection(colName);
    const batch = firestore.batch();
    const docIds = (Array.isArray(items) ? items : []).map((x, i) => getCollectionDocId(colName, x, i));
    const existing = await col.get();
    const keep = new Set(docIds);
    existing.docs.forEach(doc => { if(!keep.has(doc.id)) batch.delete(doc.ref); });
    items.forEach((x, i) => {
      const id = docIds[i];
      batch.set(col.doc(id), x, { merge: true });
    });
    await batch.commit();
    if(JSON_BACKUP_ENABLED) writeJsonFile(filePath, items);
    return;
  }
  writeJsonFile(filePath, items);
}

async function readOrders(){ return readCollection('orders', ORDERS_FILE); }
async function writeOrders(orders){ return writeCollection('orders', ORDERS_FILE, orders); }

async function readProducts(){ return readCollection('products', PRODUCTS_FILE); }
async function writeProducts(products){ return writeCollection('products', PRODUCTS_FILE, products); }

async function readCategories(){ return readCollection('categories', CATEGORIES_FILE); }
async function writeCategories(categories){ return writeCollection('categories', CATEGORIES_FILE, categories); }

async function readCoupons(){ return readCollection('coupons', COUPONS_FILE); }
async function writeCoupons(coupons){ return writeCollection('coupons', COUPONS_FILE, coupons); }

async function readBanners(){ return readCollection('banners', BANNERS_FILE); }
async function writeBanners(banners){ return writeCollection('banners', BANNERS_FILE, banners); }

async function readAIlogs(){ return readCollection('ai_logs', AI_LOGS_FILE); }
async function writeAIlogs(logs){ return writeCollection('ai_logs', AI_LOGS_FILE, logs); }

async function readSupportRequests(){ return readCollection('support_requests', SUPPORT_REQUESTS_FILE); }
async function writeSupportRequests(items){ return writeCollection('support_requests', SUPPORT_REQUESTS_FILE, items); }

async function readInventory(){ return readCollection('inventory', INVENTORY_FILE); }
async function writeInventory(items){ return writeCollection('inventory', INVENTORY_FILE, items); }

async function readInventoryLogs(){ return readCollection('inventory_logs', INVENTORY_LOGS_FILE); }
async function writeInventoryLogs(items){ return writeCollection('inventory_logs', INVENTORY_LOGS_FILE, items); }

function normalizeVariantValue(x){
  return String(x || '').trim().toLowerCase();
}

function inventoryVariantKey(productId, size, color){
  return `${String(productId)}|${normalizeVariantValue(size)}|${normalizeVariantValue(color)}`;
}

function normalizeStockDetailItem(item){
  return {
    size: String(item && item.size || '').trim(),
    color: String(item && item.color || '').trim(),
    quantity: Math.max(0, Number(item && item.quantity != null ? item.quantity : item && item.stock) || 0)
  };
}

function buildStockDetailFromVariants(variants){
  return (Array.isArray(variants) ? variants : []).map(v => ({
    size: String(v && v.size || '').trim(),
    color: String(v && v.color || '').trim(),
    quantity: Math.max(0, Number(v && v.stock) || 0)
  }));
}

function upsertInventoryRecordFromProduct(product, prevRecord){
  const p = product || {};
  const previous = prevRecord || {};
  const next = {
    product_id: String(p.id),
    product_name: String(p.name || previous.product_name || ''),
    low_stock_threshold: Number(previous.low_stock_threshold != null ? previous.low_stock_threshold : 5) || 5,
    last_imported: previous.last_imported || null,
    updatedAt: new Date().toISOString(),
    stock_detail: []
  };
  const fallbackStockDetail = Array.isArray(previous.stock_detail) ? previous.stock_detail : [];
  const fromProduct = buildStockDetailFromVariants(p.variants);
  next.stock_detail = fromProduct.length ? fromProduct : fallbackStockDetail.map(normalizeStockDetailItem);
  return next;
}

function sumStockQty(stockDetail){
  return (Array.isArray(stockDetail) ? stockDetail : []).reduce((acc, x) => acc + (Number(x.quantity) || 0), 0);
}

function normalizeOrderItemVariant(item){
  const raw = item || {};
  return {
    productId: raw.id != null ? String(raw.id) : '',
    size: String(raw.size || raw.selectedSize || raw.variantSize || '').trim(),
    color: String(raw.color || raw.selectedColor || raw.variantColor || '').trim(),
    qty: Math.max(0, Number(raw.qty || 1) || 1),
    name: String(raw.name || '')
  };
}

async function appendInventoryLog(entry){
  const logs = await readInventoryLogs();
  logs.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    ts: new Date().toISOString(),
    ...entry
  });
  // keep history bounded for performance in file mode
  const trimmed = logs.slice(-5000);
  await writeInventoryLogs(trimmed);
}

async function ensureInventoryIndex(){
  const [products, inventory] = await Promise.all([readProducts(), readInventory()]);
  const byProductId = new Map(inventory.map(x => [String(x.product_id), x]));
  let changed = false;
  products.forEach((p) => {
    const key = String(p.id);
    if(!byProductId.has(key)){
      byProductId.set(key, upsertInventoryRecordFromProduct(p, null));
      changed = true;
    }
  });
  const productIdSet = new Set(products.map(p => String(p.id)));
  for(const [k] of byProductId){
    if(!productIdSet.has(k)){
      byProductId.delete(k);
      changed = true;
    }
  }
  const items = Array.from(byProductId.values());
  if(changed) await writeInventory(items);
  return { products, inventory: items };
}

async function syncProductVariantsFromInventory(productId, stockDetail){
  const products = await readProducts();
  const idx = products.findIndex(p => String(p.id) === String(productId));
  if(idx < 0) return;
  const p = products[idx];
  const detailMap = new Map((Array.isArray(stockDetail) ? stockDetail : []).map(x => [
    inventoryVariantKey(productId, x.size, x.color),
    Math.max(0, Number(x.quantity) || 0)
  ]));
  const nextVariants = (Array.isArray(p.variants) ? p.variants : []).map(v => {
    const key = inventoryVariantKey(productId, v.size, v.color);
    if(!detailMap.has(key)) return { ...v };
    return { ...v, stock: detailMap.get(key) };
  });
  products[idx] = { ...p, variants: nextVariants };
  await writeProducts(products);
}

async function applyOrderInventoryDelta(orderItems, actor, reason, multiplier = -1){
  const normalizedItems = (Array.isArray(orderItems) ? orderItems : []).map(normalizeOrderItemVariant);
  if(!normalizedItems.length) return;

  const inventory = await readInventory();
  const byProductId = new Map(inventory.map(x => [String(x.product_id), x]));
  let changed = false;

  for(const it of normalizedItems){
    if(!it.productId) continue;
    const rec = byProductId.get(it.productId);
    if(!rec || !Array.isArray(rec.stock_detail) || !rec.stock_detail.length) continue;
    const key = inventoryVariantKey(it.productId, it.size, it.color);
    const idx = rec.stock_detail.findIndex(v => inventoryVariantKey(it.productId, v.size, v.color) === key);
    if(idx < 0) continue;

    const currentQty = Math.max(0, Number(rec.stock_detail[idx].quantity) || 0);
    const delta = (Number(it.qty) || 0) * multiplier;
    const nextQty = Math.max(0, currentQty + delta);
    if(nextQty === currentQty) continue;
    rec.stock_detail[idx] = { ...rec.stock_detail[idx], quantity: nextQty };
    rec.updatedAt = new Date().toISOString();
    changed = true;

    await appendInventoryLog({
      product_id: String(it.productId),
      product_name: rec.product_name || it.name || '',
      size: String(rec.stock_detail[idx].size || ''),
      color: String(rec.stock_detail[idx].color || ''),
      delta,
      quantity_before: currentQty,
      quantity_after: nextQty,
      reason,
      actor: String(actor || 'system')
    });
  }

  if(changed){
    await writeInventory(Array.from(byProductId.values()));
    const touched = Array.from(new Set(normalizedItems.map(x => x.productId).filter(Boolean)));
    for(const productId of touched){
      const rec = byProductId.get(String(productId));
      if(rec) await syncProductVariantsFromInventory(productId, rec.stock_detail);
    }
  }
}

function makeSupportTrackingCode(existingItems){
  const pool = Array.isArray(existingItems) ? existingItems : [];
  const existing = new Set(pool.map(x => String(x && x.trackingCode || '').toUpperCase()).filter(Boolean));
  for(let i=0; i<80; i++){
    const raw = Math.random().toString(36).slice(2, 8).toUpperCase();
    const code = `HT-${raw}`;
    if(!existing.has(code)) return code;
  }
  return `HT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

async function readHeroMedia(){
  if(shouldUseFirestore('hero_media')){
    try{
      const doc = await firestore.collection('hero_media').doc('current').get();
      const data = doc.exists ? (doc.data() || {}) : {};
      const normalized = {
        type: data.type === 'image' ? 'image' : 'video',
        src: String(data.src || ''),
        poster: String(data.poster || ''),
        updatedAt: data.updatedAt || null
      };
      if(JSON_BACKUP_ENABLED) writeJsonFile(HERO_MEDIA_FILE, normalized);
      return normalized;
    }catch(_){ /* fallback to file */ }
  }
  try{
    const raw = fs.readFileSync(HERO_MEDIA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    return {
      type: parsed.type === 'image' ? 'image' : 'video',
      src: String(parsed.src || ''),
      poster: String(parsed.poster || ''),
      updatedAt: parsed.updatedAt || null
    };
  }catch(_){
    return { type:'video', src:'', poster:'', updatedAt:null };
  }
}

async function writeHeroMedia(data){
  const saved = {
    type: data.type === 'image' ? 'image' : 'video',
    src: String(data.src || ''),
    poster: String(data.poster || ''),
    updatedAt: new Date().toISOString()
  };
  if(shouldUseFirestore('hero_media')){
    await firestore.collection('hero_media').doc('current').set(saved, { merge: true });
    if(JSON_BACKUP_ENABLED) writeJsonFile(HERO_MEDIA_FILE, saved);
    return saved;
  }
  writeJsonFile(HERO_MEDIA_FILE, saved);
  return saved;
}

function isAdminBasic(req){
  const auth = req.headers['authorization'];
  if(!auth || !auth.startsWith('Basic ')) return false;
  const b64 = auth.split(' ')[1] || '';
  const txt = Buffer.from(b64, 'base64').toString('utf8');
  const [user, pass] = txt.split(':');
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

async function isAdminByHeader(req){
  const email = (req.headers['x-user-email'] || '').toLowerCase();
  if(!email) return false;
  const users = await readUsers();
  const u = users.find(x => x.email === email);
  return !!(u && (u.role === 'admin'));
}

async function requireAdminApi(req, res, next){
  // Protect /api/users* and write operations on /api/products*
  const p = req.path || '';
  const method = (req.method || 'GET').toUpperCase();
  const needsAdmin = p.startsWith('/api/users') ||
    (p.startsWith('/api/products') && ['POST','PUT','DELETE'].includes(method));
  if(needsAdmin){
    if(isAdminBasic(req) || await isAdminByHeader(req)) return next();
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
app.use(requireAdminApi);
app.use(express.static(path.join(__dirname)));

// === Gemini AI Relay (Style Advisor) ===
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const ai = (GoogleGenAI && GEMINI_API_KEY) ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

async function generateTextWithGemini(prompt){
  if(!ai) return null;
  try{
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: String(prompt || '') }] }]
    });
    return (response && response.text) ? String(response.text).trim() : null;
  }catch(err){
    console.error('Gemini helper error', err);
    return null;
  }
}

function buildTuVanFallback(hoSoKhachHang, cauHoi){
  const rb = buildRuleBasedAdvice(hoSoKhachHang || {});
  const q = String(cauHoi || '').toLowerCase();
  const gender = String((hoSoKhachHang && hoSoKhachHang.gender) || 'unisex').toLowerCase();

  let baseKeywords = ['outfit', 'casual'];
  if(/di lam|cong so|office/.test(q)) baseKeywords = ['office', 'shirt', 'chinos'];
  else if(/di choi|casual|dao pho/.test(q)) baseKeywords = ['casual', 'tshirt', 'jeans'];
  else if(/tiec|party/.test(q)) baseKeywords = ['party', 'blazer', 'dress'];
  else if(/formal|su kien/.test(q)) baseKeywords = ['formal', 'suit', 'loafer'];

  const genderPrefix = gender === 'men' ? 'men' : (gender === 'women' ? 'women' : 'unisex');
  const tu_khoa_tim_kiem = `${genderPrefix} ${baseKeywords.join(' ')}`;

  return {
    loi_tu_van: rb.reply,
    tu_khoa_tim_kiem
  };
}

app.post('/api/tu-van-ai', async (req, res) => {
  console.log("🎉 ĐÃ NHẬN ĐƯỢC YÊU CẦU TỪ WEB!");
    console.log("Dữ liệu khách gửi:", req.body);
  try {
    const { hoSoKhachHang, cauHoi, imageBase64, imageMimeType } = req.body || {};
    if(!ai){
      return res.json(buildTuVanFallback(hoSoKhachHang, cauHoi));
    }
    const prompt = `Bạn là một chuyên gia tư vấn thời trang (Stylist) của shop Style Glamour Beats.
Dưới đây là hồ sơ của khách hàng: ${JSON.stringify(hoSoKhachHang || {})}
Nhu cầu cụ thể của khách: "${cauHoi || ''}"

HƯỚNG DẪN XỬ LÝ:
1. Nếu khách chỉ chào hỏi xã giao (ví dụ: "hi", "hello", "xin chào") mà chưa đưa ra yêu cầu phối đồ:
   - Hãy chào lại khách một cách thân thiện, lịch sự.
   - Nhắc nhẹ cho khách biết bạn đã nắm được thông số cơ thể (chiều cao, cân nặng) của họ.
   - Hỏi xem khách đang cần tư vấn mặc đồ cho dịp gì hoặc phong cách nào.

2. Nếu khách có nhu cầu cụ thể (ví dụ: "mặc gì đi tiệc", "set đồ đi làm"):
   - Dựa vào hồ sơ (tuổi, vóc dáng) để đưa ra lời khuyên chuyên sâu.
   - Phân tích tại sao bộ đồ đó lại hợp với vóc dáng của họ.

LƯU Ý QUAN TRỌNG:
- Câu trả lời phải tự nhiên, ấm áp như người thật.
- Tuyệt đối chỉ gợi ý các sản phẩm phù hợp với giới tính ${hoSoKhachHang && hoSoKhachHang.gender ? hoSoKhachHang.gender : ''}. Từ khóa tìm kiếm phải bao gồm giới tính, ví dụ: "women office blazer" thay vì chỉ "blazer".
- BẮT BUỘC TRẢ VỀ ĐỊNH DẠNG JSON NHƯ SAU:
{
  "loi_tu_van": "Nội dung câu trả lời của bạn ở đây...",
  "tu_khoa_tim_kiem": "3-4 từ khóa về món đồ bằng tiếng Anh để shop tìm ảnh (ví dụ: white office shirt, black dress...)"
}

BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON, KHÔNG THÊM BẤT KỲ CHỮ NÀO KHÁC BÊN NGOÀI.
Cấu trúc mẫu:
{
  "loi_tu_van": "nội dung tư vấn ở đây",
  "tu_khoa_tim_kiem": "từ khóa"
}`;

    const contentParts = [{ text: prompt }];
    if(imageBase64){
      contentParts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: imageBase64
        }
      });
      contentParts.push({ text: 'Dữ liệu ảnh đính kèm: Đây là món đồ khách hàng muốn bạn tư vấn.' });
    }
    contentParts.push({ text: `Câu hỏi từ khách: ${cauHoi || ''}` });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
      contents: [{ role: 'user', parts: contentParts }],
    });

    const rawText = response?.text || '';
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    let parsed = null;
    try{
      parsed = JSON.parse(cleanText);
    }catch(_){
      parsed = null;
    }

    if(!parsed || typeof parsed !== 'object'){
      return res.json(buildTuVanFallback(hoSoKhachHang, cauHoi));
    }

    const safe = {
      loi_tu_van: String(parsed.loi_tu_van || '').trim() || buildTuVanFallback(hoSoKhachHang, cauHoi).loi_tu_van,
      tu_khoa_tim_kiem: String(parsed.tu_khoa_tim_kiem || '').trim() || buildTuVanFallback(hoSoKhachHang, cauHoi).tu_khoa_tim_kiem
    };
    res.json(safe);
  } catch (error) {
    console.error('Lỗi khi gọi Gemini:', error);
    const { hoSoKhachHang, cauHoi } = req.body || {};
    res.json(buildTuVanFallback(hoSoKhachHang, cauHoi));
  }
});

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOADS_DIR); },
  filename: function (req, file, cb) {
    const safeName = String(file.originalname || 'file').replace(/[^a-zA-Z0-9_.-]/g, '_');
    const ts = Date.now();
    cb(null, ts + '_' + safeName);
  }
});
const upload = multer({ storage });

app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if(!name || !email || !password || password.length < 6){
    return res.status(400).json({ error: 'Invalid input' });
  }
  const users = await readUsers();
  if(users.find(u => u.email === email.toLowerCase())){
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  // Assign role: default 'user'.
  // If registering with ADMIN_USER/ADMIN_PASS via Basic or matching env, allow 'admin'.
  // Also allow if current user is admin (via X-User-Email header)
  let assignedRole = 'user';
  const isAdmin = isAdminBasic(req) || await isAdminByHeader(req) || (email.toLowerCase() === ADMIN_USER && password === ADMIN_PASS);
  if(role === 'admin' && isAdmin){
    assignedRole = 'admin';
  }
  const user = { id: Date.now(), name, email: email.toLowerCase(), passwordHash: hash, role: assignedRole };
  users.push(user);
  await writeUsers(users);
  // don't send password hash back
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    storage: storageForCollection('users')
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if(!email || !password){
    return res.status(400).json({ error: 'Invalid input' });
  }
  const users = await readUsers();
  const user = users.find(u => u.email === email.toLowerCase());
  if(!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role || 'user' });
});

// Optional: expose users for debugging (not secure) - can be removed
app.get('/api/users', async (req, res) => {
  const users = (await readUsers()).map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role || 'user' }));
  res.json(users);
});

// Storage backend status (admin only)
app.get('/api/admin/storage-status', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  const collections = [
    'users', 'orders', 'ai_logs', 'products', 'categories',
    'coupons', 'banners', 'support_requests', 'hero_media',
    'inventory', 'inventory_logs'
  ];
  const byCollection = {};
  collections.forEach((name) => { byCollection[name] = storageForCollection(name); });
  res.json({
    firestoreInitialized: !!firestore,
    firebaseEnabledEnv: FIREBASE_ENABLED,
    firebaseCollectionsEnv: Array.from(FIREBASE_COLLECTIONS),
    byCollection
  });
});

// Update role for a user
app.post('/api/users/role', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  const { email, role } = req.body || {};
  if(!email || !role || !['user','admin'].includes(role)) return res.status(400).json({ error: 'Invalid input' });
  const users = await readUsers();
  const u = users.find(x => x.email === String(email).toLowerCase());
  if(!u) return res.status(404).json({ error: 'User not found' });
  u.role = role;
  await writeUsers(users);
  res.json({ ok: true });
});

// Delete a user
app.delete('/api/users', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  const { email } = req.body || {};
  if(!email) return res.status(400).json({ error: 'Invalid input' });
  let users = await readUsers();
  const before = users.length;
  users = users.filter(x => x.email !== String(email).toLowerCase());
  await writeUsers(users);
  res.json({ removed: before - users.length });
});

// Create order (public endpoint)
app.post('/api/orders', async (req, res) => {
  try{
    const order = req.body || {};
    // basic validation
    if(!order || !order.id || !Array.isArray(order.items)){
      return res.status(400).json({ error: 'Invalid order' });
    }
    // normalize createdAt
    const createdAt = order.createdAt || new Date().toISOString();
    const status = normalizeStatus(order.status);
    const totals = computeTotals(order);
    const orders = await readOrders();
    const idx = orders.findIndex(o => o.id === order.id);
    const actor = String(req.headers['x-user-email'] || 'system');
    if(idx >= 0){
      const prev = setDefaultStatus(orders[idx]);
      const next = { ...prev, ...order, ...totals, status, createdAt };
      // If status switches to canceled, add stock back. If uncancel, deduct again.
      if(prev.status !== 'canceled' && next.status === 'canceled'){
        await applyOrderInventoryDelta(prev.items, actor, `order-canceled:${next.id}`, +1);
      }else if(prev.status === 'canceled' && next.status !== 'canceled'){
        await applyOrderInventoryDelta(next.items, actor, `order-reactivated:${next.id}`, -1);
      }
      orders[idx] = next;
    }else{
      const next = { ...order, ...totals, status, createdAt };
      orders.push(next);
      if(status !== 'canceled'){
        await applyOrderInventoryDelta(next.items, actor, `order-created:${next.id}`, -1);
      }
    }
    await writeOrders(orders);
    res.json({ ok: true });
  }catch(err){
    console.error('POST /api/orders error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get orders (admin only). Optional query: month=YYYY-MM
app.get('/api/orders', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const { month, from, to } = req.query || {};
    let orders = (await readOrders()).map(setDefaultStatus);
    if(month){
      // month format YYYY-MM
      orders = orders.filter(o => {
        const d = new Date(o.createdAt);
        const y = d.getFullYear();
        const m = String(d.getMonth()+1).padStart(2,'0');
        return `${y}-${m}` === String(month);
      });
    }
    if(from || to){
      const fromD = from ? new Date(String(from)) : null;
      const toD = to ? new Date(String(to)) : null;
      orders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return (!fromD || d >= fromD) && (!toD || d <= toD);
      });
    }
    res.json(orders);
  }catch(err){
    console.error('GET /api/orders error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get single order (admin)
app.get('/api/orders/:id', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const id = String(req.params.id);
    const orders = await readOrders();
    const o = orders.find(x => String(x.id) === id);
    if(!o) return res.status(404).json({ error: 'Not found' });
    res.json(setDefaultStatus(o));
  }catch(err){
    console.error('GET /api/orders/:id error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Update order status (admin)
app.put('/api/orders/:id/status', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const id = String(req.params.id);
    const { status } = req.body || {};
    const newStatus = normalizeStatus(status);
    const orders = await readOrders();
    const idx = orders.findIndex(x => String(x.id) === id);
    if(idx < 0) return res.status(404).json({ error: 'Not found' });
    const prev = setDefaultStatus(orders[idx]);
    const next = setDefaultStatus({ ...orders[idx], status: newStatus });
    const actor = String(req.headers['x-user-email'] || 'admin');
    if(prev.status !== 'canceled' && next.status === 'canceled'){
      await applyOrderInventoryDelta(prev.items, actor, `order-status-canceled:${next.id}`, +1);
    }else if(prev.status === 'canceled' && next.status !== 'canceled'){
      await applyOrderInventoryDelta(next.items, actor, `order-status-reactivated:${next.id}`, -1);
    }
    orders[idx] = next;
    await writeOrders(orders);
    res.json({ ok: true, status: orders[idx].status });
  }catch(err){
    console.error('PUT /api/orders/:id/status error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Helpers for orders
const ALLOWED_STATUSES = ['pending','packing','shipping','completed','canceled'];
function normalizeStatus(s){
  const val = String(s || '').toLowerCase();
  return ALLOWED_STATUSES.includes(val) ? val : 'pending';
}
function setDefaultStatus(o){
  if(!o) return o;
  const status = normalizeStatus(o.status);
  return { ...o, status };
}
function computeTotals(o){
  try{
    const items = Array.isArray(o.items) ? o.items : [];
    const subtotal = items.reduce((acc, it) => acc + (Number(it.price)||0) * (Number(it.qty)||0), 0);
    const shippingFee = o.shippingFee != null ? Number(o.shippingFee) : 30000;
    const discount = o.discount != null ? Number(o.discount) : 0;
    const total = subtotal + shippingFee - discount;
    return { subtotal, shippingFee, discount, total };
  }catch{ return {}; }
}

function getProductFallbackImage(name, category){
  const seedImg = (seed) => `https://picsum.photos/seed/${seed}/900/1200`;
  const n = String(name || '').toLowerCase();
  const c = String(category || '').toLowerCase();
  if(/khoác|jacket|bomber|coat|gió|denim/.test(n)) return seedImg('sgb-jacket');
  if(/polo/.test(n)) return seedImg('sgb-polo');
  if(/quần tây|tây âu|slacks|chinos|\btây\b/.test(n)) return seedImg('sgb-trousers');
  if(/jeans|denim|quần jean/.test(n)) return seedImg('sgb-jeans');
  if(/balo|backpack/.test(n)) return seedImg('sgb-backpack');
  if(/túi|bag|ví|wallet/.test(n)) return seedImg('sgb-bag');
  if(/giày|loafer|sneaker|boots/.test(n)) return seedImg('sgb-shoes');
  if(/thắt lưng|belt/.test(n)) return seedImg('sgb-belt');
  if(/sơ mi|shirt/.test(n)) return seedImg('sgb-shirt');
  if(/áo thun|tee|t-shirt/.test(n)) return seedImg('sgb-tee');
  if(c.includes('phụ kiện') || c.includes('accessories')) return seedImg('sgb-accessory');
  if(c.includes('women') && /đầm|dress|blouse/.test(n)) return seedImg('sgb-dress');
  return seedImg('sgb-fashion');
}

function normalizeImageRef(value){
  const raw = String(value || '').trim();
  if(!raw) return '';
  const lower = raw.toLowerCase();
  if(lower === 'null' || lower === 'undefined') return '';
  if(/^https?:\/\//i.test(raw)) return raw;
  if(/^data:image\//i.test(raw)) return raw;
  if(/^blob:/i.test(raw)) return raw;
  if(raw.startsWith('/uploads/')) return raw;
  if(raw.startsWith('uploads/')) return '/' + raw;
  if(raw.startsWith('./uploads/')) return '/' + raw.slice(2);
  return '';
}

function normalizeProductImages(product){
  const p = product || {};
  const rawImages = (p.images && typeof p.images === 'object') ? p.images : {};
  const gallery = Array.isArray(rawImages.gallery)
    ? rawImages.gallery.map(normalizeImageRef).filter(Boolean)
    : [];
  const coverCandidates = [rawImages.cover, p.image, gallery[0]];
  const currentCover = coverCandidates.map(normalizeImageRef).find(Boolean) || '';
  const cover = currentCover || getProductFallbackImage(p.name, p.category);
  return {
    ...p,
    image: cover,
    images: {
      ...rawImages,
      cover,
      gallery
    }
  };
}

// Products CRUD
// List products (public)
app.get('/api/products', async (req, res) => {
  try{
    const products = await readProducts();
    const normalized = products.map((p) => normalizeProductImages(p));
    res.json(normalized);
  }catch(err){
    console.error('GET /api/products error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get product by id (public)
app.get('/api/products/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    const products = await readProducts();
    const p = products.find(x => Number(x.id) === id);
    if(!p) return res.status(404).json({ error: 'Not found' });
    res.json(normalizeProductImages(p));
  }catch(err){
    console.error('GET /api/products/:id error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Create product (admin)
app.post('/api/products', async (req, res) => {
  try{
    const b = req.body || {};
    const required = ['name','price'];
    for(const k of required){ if(!b[k]) return res.status(400).json({ error: `Missing ${k}` }); }
    const products = await readProducts();
    const id = Date.now();
    const product = normalizeProductImages({
      id,
      name: String(b.name),
      description: String(b.description || ''),
      category: String(b.category || ''),
      brand: String(b.brand || ''),
      price: Number(b.price) || 0,
      salePrice: b.salePrice != null ? Number(b.salePrice) : null,
      images: {
        cover: String(b.images?.cover || ''),
        gallery: Array.isArray(b.images?.gallery) ? b.images.gallery.map(String) : []
      },
      variants: Array.isArray(b.variants) ? b.variants.map(v => ({
        size: String(v.size || ''),
        color: String(v.color || ''),
        stock: Number(v.stock) || 0,
        sku: v.sku ? String(v.sku) : undefined
      })) : []
    });
    products.push(product);
    await writeProducts(products);
    const inventory = await readInventory();
    const iIdx = inventory.findIndex(x => String(x.product_id) === String(product.id));
    const nextRecord = upsertInventoryRecordFromProduct(product, iIdx >= 0 ? inventory[iIdx] : null);
    if(iIdx >= 0) inventory[iIdx] = nextRecord;
    else inventory.push(nextRecord);
    await writeInventory(inventory);
    res.json(product);
  }catch(err){
    console.error('POST /api/products error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Update product (admin)
app.put('/api/products/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    const patch = req.body || {};
    const products = await readProducts();
    const idx = products.findIndex(x => Number(x.id) === id);
    if(idx < 0) return res.status(404).json({ error: 'Not found' });
    const prev = products[idx];
    const merged = normalizeProductImages({
      ...prev,
      name: patch.name != null ? String(patch.name) : prev.name,
      description: patch.description != null ? String(patch.description) : prev.description,
      category: patch.category != null ? String(patch.category) : prev.category,
      brand: patch.brand != null ? String(patch.brand) : prev.brand,
      price: patch.price != null ? Number(patch.price) : prev.price,
      salePrice: patch.salePrice != null ? Number(patch.salePrice) : prev.salePrice,
      images: patch.images ? {
        cover: patch.images.cover != null ? String(patch.images.cover) : prev.images.cover,
        gallery: Array.isArray(patch.images.gallery) ? patch.images.gallery.map(String) : prev.images.gallery
      } : prev.images,
      variants: Array.isArray(patch.variants) ? patch.variants.map(v => ({
        size: String(v.size || ''),
        color: String(v.color || ''),
        stock: Number(v.stock) || 0,
        sku: v.sku ? String(v.sku) : undefined
      })) : prev.variants
    });
    products[idx] = merged;
    await writeProducts(products);
    const inventory = await readInventory();
    const iIdx = inventory.findIndex(x => String(x.product_id) === String(merged.id));
    const nextRecord = upsertInventoryRecordFromProduct(merged, iIdx >= 0 ? inventory[iIdx] : null);
    if(iIdx >= 0) inventory[iIdx] = nextRecord;
    else inventory.push(nextRecord);
    await writeInventory(inventory);
    res.json(merged);
  }catch(err){
    console.error('PUT /api/products/:id error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Delete product (admin)
app.delete('/api/products/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    const products = await readProducts();
    const before = products.length;
    const remain = products.filter(x => Number(x.id) !== id);
    if(remain.length === before) return res.status(404).json({ error: 'Not found' });
    await writeProducts(remain);
    const inventory = await readInventory();
    const keptInventory = inventory.filter(x => String(x.product_id) !== String(id));
    if(keptInventory.length !== inventory.length) await writeInventory(keptInventory);
    res.json({ removed: before - remain.length });
  }catch(err){
    console.error('DELETE /api/products/:id error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Upload images (admin) - supports cover and gallery[]
app.post('/api/products/:id/images', upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]), async (req, res) => {
  try{
    const id = Number(req.params.id);
    const products = await readProducts();
    const idx = products.findIndex(x => Number(x.id) === id);
    if(idx < 0) return res.status(404).json({ error: 'Not found' });
    const files = req.files || {};
    const coverFile = files.cover && files.cover[0];
    const galleryFiles = Array.isArray(files.gallery) ? files.gallery : [];
    const prev = products[idx];
    const images = { ...prev.images };
    if(coverFile) images.cover = '/uploads/' + coverFile.filename;
    if(galleryFiles.length) images.gallery = [ ...images.gallery, ...galleryFiles.map(f => '/uploads/' + f.filename) ];
    products[idx] = {
      ...prev,
      image: String(images.cover || prev.image || ''),
      images
    };
    await writeProducts(products);
    res.json({ images });
  }catch(err){
    console.error('POST /api/products/:id/images error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Inventory APIs (admin)
app.get('/api/inventory', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const { products, inventory } = await ensureInventoryIndex();
    const pMap = new Map(products.map(p => [String(p.id), p]));
    const items = inventory.map((rec) => {
      const p = pMap.get(String(rec.product_id));
      const stockDetail = Array.isArray(rec.stock_detail) ? rec.stock_detail.map(normalizeStockDetailItem) : [];
      return {
        product_id: String(rec.product_id),
        product_name: rec.product_name || (p && p.name) || '',
        category: (p && p.category) || '',
        brand: (p && p.brand) || '',
        cover: (p && p.images && p.images.cover) || '',
        low_stock_threshold: Number(rec.low_stock_threshold != null ? rec.low_stock_threshold : 5) || 5,
        last_imported: rec.last_imported || null,
        updatedAt: rec.updatedAt || null,
        total_qty: sumStockQty(stockDetail),
        stock_detail: stockDetail
      };
    }).sort((a,b) => a.product_name.localeCompare(b.product_name, 'vi'));
    res.json(items);
  }catch(err){
    console.error('GET /api/inventory error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/inventory/low', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const threshold = Number((req.query && req.query.threshold) || 5);
    const { products, inventory } = await ensureInventoryIndex();
    const pMap = new Map(products.map(p => [String(p.id), p]));
    const alerts = [];
    inventory.forEach((rec) => {
      const product = pMap.get(String(rec.product_id));
      const rowThreshold = Number(rec.low_stock_threshold != null ? rec.low_stock_threshold : threshold) || threshold;
      (Array.isArray(rec.stock_detail) ? rec.stock_detail : []).forEach((detail) => {
        const d = normalizeStockDetailItem(detail);
        if(d.quantity <= rowThreshold){
          alerts.push({
            productId: rec.product_id,
            productName: rec.product_name || (product && product.name) || '',
            category: (product && product.category) || '',
            brand: (product && product.brand) || '',
            size: d.size,
            color: d.color,
            stock: d.quantity,
            threshold: rowThreshold,
            cover: (product && product.images && product.images.cover) || ''
          });
        }
      });
    });
    alerts.sort((a,b)=> (a.stock||0) - (b.stock||0));
    res.json({ threshold, items: alerts });
  }catch(err){
    console.error('GET /api/inventory/low error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.put('/api/inventory/:productId/quick-update', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const productId = String(req.params.productId || '');
    const size = String((req.body && req.body.size) || '').trim();
    const color = String((req.body && req.body.color) || '').trim();
    const quantityRaw = Number(req.body && req.body.quantity);
    const thresholdRaw = req.body && req.body.low_stock_threshold;
    if(!productId || !size || !color || !Number.isFinite(quantityRaw) || quantityRaw < 0){
      return res.status(400).json({ error: 'Invalid input' });
    }

    const { products, inventory } = await ensureInventoryIndex();
    const p = products.find(x => String(x.id) === productId);
    if(!p) return res.status(404).json({ error: 'Product not found' });

    const idx = inventory.findIndex(x => String(x.product_id) === productId);
    if(idx < 0) return res.status(404).json({ error: 'Inventory not found' });
    const rec = { ...inventory[idx] };
    const detail = Array.isArray(rec.stock_detail) ? rec.stock_detail.map(normalizeStockDetailItem) : [];
    const key = inventoryVariantKey(productId, size, color);
    let i = detail.findIndex(x => inventoryVariantKey(productId, x.size, x.color) === key);
    if(i < 0){
      detail.push({ size, color, quantity: 0 });
      i = detail.length - 1;
    }
    const beforeQty = Number(detail[i].quantity) || 0;
    const afterQty = Math.max(0, Math.floor(quantityRaw));
    detail[i].quantity = afterQty;
    rec.stock_detail = detail;
    if(thresholdRaw != null) rec.low_stock_threshold = Math.max(0, Number(thresholdRaw) || 0);
    rec.updatedAt = new Date().toISOString();
    inventory[idx] = rec;
    await writeInventory(inventory);
    await syncProductVariantsFromInventory(productId, rec.stock_detail);

    const actor = String(req.headers['x-user-email'] || 'admin');
    await appendInventoryLog({
      product_id: productId,
      product_name: rec.product_name || p.name || '',
      size,
      color,
      delta: afterQty - beforeQty,
      quantity_before: beforeQty,
      quantity_after: afterQty,
      reason: 'quick-update',
      actor
    });
    res.json({ ok: true, product_id: productId, size, color, quantity: afterQty });
  }catch(err){
    console.error('PUT /api/inventory/:productId/quick-update error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/api/inventory/:productId/import', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const productId = String(req.params.productId || '');
    const size = String((req.body && req.body.size) || '').trim();
    const color = String((req.body && req.body.color) || '').trim();
    const quantityRaw = Number(req.body && req.body.quantity);
    if(!productId || !size || !color || !Number.isFinite(quantityRaw) || quantityRaw <= 0){
      return res.status(400).json({ error: 'Invalid input' });
    }

    const { products, inventory } = await ensureInventoryIndex();
    const p = products.find(x => String(x.id) === productId);
    if(!p) return res.status(404).json({ error: 'Product not found' });

    const idx = inventory.findIndex(x => String(x.product_id) === productId);
    if(idx < 0) return res.status(404).json({ error: 'Inventory not found' });
    const rec = { ...inventory[idx] };
    const detail = Array.isArray(rec.stock_detail) ? rec.stock_detail.map(normalizeStockDetailItem) : [];
    const key = inventoryVariantKey(productId, size, color);
    let i = detail.findIndex(x => inventoryVariantKey(productId, x.size, x.color) === key);
    if(i < 0){
      detail.push({ size, color, quantity: 0 });
      i = detail.length - 1;
    }
    const beforeQty = Number(detail[i].quantity) || 0;
    const importQty = Math.max(1, Math.floor(quantityRaw));
    const afterQty = beforeQty + importQty;
    detail[i].quantity = afterQty;
    rec.stock_detail = detail;
    rec.last_imported = new Date().toISOString();
    rec.updatedAt = rec.last_imported;
    inventory[idx] = rec;
    await writeInventory(inventory);
    await syncProductVariantsFromInventory(productId, rec.stock_detail);

    const actor = String(req.headers['x-user-email'] || 'admin');
    await appendInventoryLog({
      product_id: productId,
      product_name: rec.product_name || p.name || '',
      size,
      color,
      delta: importQty,
      quantity_before: beforeQty,
      quantity_after: afterQty,
      reason: 'import-stock',
      actor
    });
    res.json({ ok: true, product_id: productId, size, color, quantity: afterQty });
  }catch(err){
    console.error('POST /api/inventory/:productId/import error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/inventory/history', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const productId = String((req.query && req.query.productId) || '').trim();
    const limitRaw = Number((req.query && req.query.limit) || 100);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, Math.floor(limitRaw))) : 100;
    let logs = await readInventoryLogs();
    if(productId) logs = logs.filter(x => String(x.product_id) === productId);
    logs = logs.slice().sort((a,b) => new Date(b.ts || 0) - new Date(a.ts || 0));
    res.json(logs.slice(0, limit));
  }catch(err){
    console.error('GET /api/inventory/history error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Support requests (customer -> admin)
// Public create endpoint for customers on storefront
app.post('/api/support-requests', async (req, res) => {
  try{
    const b = req.body || {};
    const message = String(b.message || '').trim();
    const page = String(b.page || '').slice(0, 260);
    const customerName = String(b.customerName || '').trim().slice(0, 120);
    const customerEmail = String(b.customerEmail || '').trim().toLowerCase().slice(0, 160);
    const customerPhone = String(b.customerPhone || '').trim().slice(0, 40);
    if(message.length < 3){
      return res.status(400).json({ error: 'Nội dung yêu cầu quá ngắn' });
    }

    const requests = await readSupportRequests();
    const item = {
      id: Date.now(),
      trackingCode: makeSupportTrackingCode(requests),
      message: message.slice(0, 800),
      page,
      customerName,
      customerEmail,
      customerPhone,
      source: 'storefront',
      status: 'pending',
      createdAt: new Date().toISOString(),
      handledAt: null,
      handledBy: '',
      note: '',
      userAgent: String(req.headers['user-agent'] || '').slice(0, 300)
    };
    requests.push(item);
    await writeSupportRequests(requests);
    res.json({ ok: true, id: item.id, status: item.status, trackingCode: item.trackingCode });
  }catch(err){
    console.error('POST /api/support-requests error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Public endpoint for customer-side widget to check request status and staff response.
app.post('/api/support-requests/check', async (req, res) => {
  try{
    const idsRaw = Array.isArray(req.body && req.body.ids) ? req.body.ids : [];
    const ids = Array.from(new Set(idsRaw.map(x => Number(x)).filter(x => Number.isFinite(x) && x > 0))).slice(0, 40);
    const codeRaw = Array.isArray(req.body && req.body.codes) ? req.body.codes : [];
    const codes = Array.from(new Set(codeRaw.map(x => String(x || '').trim().toUpperCase()).filter(Boolean))).slice(0, 40);
    const email = String((req.body && req.body.customerEmail) || '').trim().toLowerCase().slice(0, 160);
    if(!ids.length && !codes.length && !email) return res.json({ items: [] });

    const all = await readSupportRequests();
    const idSet = new Set(ids);
    let matched = all.filter(x => idSet.has(Number(x.id)));

    if(codes.length){
      const codeSet = new Set(codes);
      const byCode = all.filter(x => codeSet.has(String(x.trackingCode || '').toUpperCase()));
      matched = matched.concat(byCode);
    }

    if(email){
      const byEmail = all.filter(x => String(x.customerEmail || '').toLowerCase() === email);
      matched = matched.concat(byEmail);
    }

    const uniq = [];
    const seen = new Set();
    matched.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    for(const x of matched){
      const id = Number(x.id);
      if(!id || seen.has(id)) continue;
      seen.add(id);
      uniq.push(x);
      if(uniq.length >= 40) break;
    }

    const items = uniq.map((x) => ({
      id: Number(x.id),
      trackingCode: String(x.trackingCode || ''),
      status: String(x.status || 'pending'),
      message: String(x.message || ''),
      note: String(x.note || ''),
      createdAt: x.createdAt || null,
      handledAt: x.handledAt || null
    }));

    res.json({ items });
  }catch(err){
    console.error('POST /api/support-requests/check error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Public direct lookup by single tracking code.
app.get('/api/support-requests/code/:code', async (req, res) => {
  try{
    const code = String(req.params.code || '').trim().toUpperCase();
    if(!/^HT-[A-Z0-9]{4,12}$/.test(code)) return res.status(400).json({ error: 'Invalid code' });

    const all = await readSupportRequests();
    const item = all.find((x) => String(x.trackingCode || '').toUpperCase() === code);
    if(!item) return res.status(404).json({ error: 'Not found' });

    res.json({
      id: Number(item.id),
      trackingCode: String(item.trackingCode || ''),
      status: String(item.status || 'pending'),
      message: String(item.message || ''),
      note: String(item.note || ''),
      createdAt: item.createdAt || null,
      handledAt: item.handledAt || null
    });
  }catch(err){
    console.error('GET /api/support-requests/code/:code error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Admin list support requests
app.get('/api/support-requests', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const status = String((req.query && req.query.status) || 'all').toLowerCase();
    const limitRaw = Number((req.query && req.query.limit) || 30);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, limitRaw)) : 30;

    let items = await readSupportRequests();
    items = items.slice().sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const pendingCount = items.filter(x => String(x.status || 'pending') === 'pending').length;
    if(status !== 'all') items = items.filter(x => String(x.status || 'pending') === status);

    res.json({ items: items.slice(0, limit), pendingCount });
  }catch(err){
    console.error('GET /api/support-requests error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Admin update support request status
app.patch('/api/support-requests/:id', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const id = Number(req.params.id);
    const status = String((req.body && req.body.status) || '').toLowerCase();
    const note = String((req.body && req.body.note) || '').trim().slice(0, 400);
    if(!['pending','handled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const items = await readSupportRequests();
    const idx = items.findIndex(x => Number(x.id) === id);
    if(idx < 0) return res.status(404).json({ error: 'Not found' });

    const adminActor = String(req.headers['x-user-email'] || ADMIN_USER || 'admin').slice(0, 160);
    const prev = items[idx];
    items[idx] = {
      ...prev,
      status,
      note,
      handledAt: status === 'handled' ? new Date().toISOString() : null,
      handledBy: status === 'handled' ? adminActor : ''
    };
    await writeSupportRequests(items);
    res.json(items[idx]);
  }catch(err){
    console.error('PATCH /api/support-requests/:id error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Categories CRUD
// List categories (public)
app.get('/api/categories', async (req, res) => {
  try{
    const categories = await readCategories();
    res.json(categories);
  }catch(err){
    console.error('GET /api/categories error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get category by id (public)
app.get('/api/categories/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    const categories = await readCategories();
    const c = categories.find(x => Number(x.id) === id);
    if(!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  }catch(err){
    console.error('GET /api/categories/:id error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Create category (admin)
app.post('/api/categories', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const b = req.body || {};
    if(!b.name || String(b.name).trim() === '') return res.status(400).json({ error: 'Missing name' });
    const categories = await readCategories();
    if(categories.some(x => String(x.name).toLowerCase() === String(b.name).toLowerCase())){
      return res.status(409).json({ error: 'Category exists' });
    }
    const id = Date.now();
    const cat = {
      id,
      name: String(b.name).trim(),
      description: String(b.description || ''),
      active: b.active != null ? !!b.active : true,
      createdAt: new Date().toISOString()
    };
    categories.push(cat);
    await writeCategories(categories);
    res.json(cat);
  }catch(err){
    console.error('POST /api/categories error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Update category (admin)
app.put('/api/categories/:id', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const id = Number(req.params.id);
    const patch = req.body || {};
    const categories = await readCategories();
    const idx = categories.findIndex(x => Number(x.id) === id);
    if(idx < 0) return res.status(404).json({ error: 'Not found' });
    const prev = categories[idx];
    const merged = {
      ...prev,
      name: patch.name != null ? String(patch.name).trim() : prev.name,
      description: patch.description != null ? String(patch.description) : prev.description,
      active: patch.active != null ? !!patch.active : prev.active
    };
    categories[idx] = merged;
    await writeCategories(categories);
    res.json(merged);
  }catch(err){
    console.error('PUT /api/categories/:id error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Delete category (admin)
app.delete('/api/categories/:id', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const id = Number(req.params.id);
    const categories = await readCategories();
    const before = categories.length;
    const remain = categories.filter(x => Number(x.id) !== id);
    if(remain.length === before) return res.status(404).json({ error: 'Not found' });
    await writeCategories(remain);
    res.json({ removed: before - remain.length });
  }catch(err){
    console.error('DELETE /api/categories/:id error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// AI Style Advisor endpoint
// Uses OpenAI if OPENAI_API_KEY is set; falls back to rule-based suggestions otherwise.
app.post('/api/style-advisor', async (req, res) => {
  try{
    const profile = (req.body && req.body.profile) || {};
    const chatHistory = Array.isArray(req.body && req.body.chatHistory) ? req.body.chatHistory : [];

    // Build base conversation
    const systemPrompt = [
      'Bạn là một nhà tư vấn thời trang cao cấp (Personal Stylist).',
      'Dựa trên thông tin hồ sơ khách hàng (tuổi, giới tính, chiều cao, cân nặng, sở thích màu sắc, dịp, khí hậu, ngân sách),',
      'hãy gợi ý phong cách, phối đồ và mẹo cụ thể cho khách hàng tại Việt Nam.',
      'Luôn súc tích, thân thiện, có danh sách gợi ý dễ làm theo.',
    ].join(' ');

    const messages = [{ role: 'system', content: systemPrompt }];
    messages.push({ role: 'user', content: JSON.stringify({ profile }) });
    for(const m of chatHistory){
      if(m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'){
        messages.push({ role: m.role, content: m.content });
      }
    }

    // Provider selection: explicit AI_PROVIDER or auto by available keys
    const provider = (process.env.AI_PROVIDER || '').toLowerCase() ||
      (process.env.OPENAI_API_KEY ? 'openai' : (process.env.GEMINI_API_KEY ? 'gemini' : ''));

    async function appendAIlog(source, replyText, recommendations = []){
      try{
        const logs = await readAIlogs();
        logs.push({
          id: Date.now(),
          ts: new Date().toISOString(),
          userEmail: (req.headers['x-user-email'] || '').toString(),
          profile,
          chatHistory,
          reply: String(replyText || ''),
          source: String(source || 'unknown'),
          recommendations: Array.isArray(recommendations) ? recommendations : []
        });
        await writeAIlogs(logs);
      }catch(_){ /* do not block main response if log write fails */ }
    }

    if(provider === 'openai' && process.env.OPENAI_API_KEY){
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({ model, messages, temperature: 0.7 })
      });
      if(!response.ok){
        const text = await response.text();
        return res.status(502).json({ error: 'AI provider error', provider: 'openai', detail: text });
      }
      const data = await response.json();
      const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
        ? data.choices[0].message.content
        : 'Xin lỗi, hiện chưa thể tư vấn. Vui lòng thử lại.';
      await appendAIlog('openai', reply, []);
      return res.json({ source: 'openai', reply });
    }

    if(provider === 'gemini' && process.env.GEMINI_API_KEY){
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const contents = toGeminiContents(messages);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.7 } })
      });
      if(!response.ok){
        const text = await response.text();
        return res.status(502).json({ error: 'AI provider error', provider: 'gemini', detail: text });
      }
      const data = await response.json();
      const reply = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text
        ? data.candidates[0].content.parts[0].text
        : 'Xin lỗi, hiện chưa thể tư vấn. Vui lòng thử lại.';
      await appendAIlog('gemini', reply, []);
      return res.json({ source: 'gemini', reply });
    }

    // Rule-based fallback + product recommendations
    const rb = buildRuleBasedAdvice(profile);
    let recs = [];
    try{ recs = await pickRecommendations(profile); }catch(_){ recs = []; }
    const recText = recs.length ? ('\n\nGợi ý sản phẩm phù hợp:\n' + recs.map(r=>`- ${r.name} (${formatCurrency(r.price)}) → /product.html?id=${r.id}`).join('\n')) : '';
    const finalReply = rb.reply + recText;
    await appendAIlog('rule-based', finalReply, recs);
    return res.json({ source: 'rule-based', reply: finalReply, data: { ...rb.data, recommendations: recs } });
  }catch(err){
    console.error('style-advisor error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

function toGeminiContents(openaiMessages){
  const contents = [];
  let pendingSystem = '';
  for(const m of openaiMessages){
    if(!m || typeof m.content !== 'string') continue;
    if(m.role === 'system'){
      pendingSystem += (pendingSystem ? '\n' : '') + m.content;
      continue;
    }
    if(m.role === 'user'){
      const text = (pendingSystem ? pendingSystem + '\n' : '') + m.content;
      pendingSystem = '';
      contents.push({ role: 'user', parts: [{ text }] });
    }else if(m.role === 'assistant'){
      contents.push({ role: 'model', parts: [{ text: m.content }] });
    }
  }
  if(pendingSystem){
    contents.unshift({ role: 'user', parts: [{ text: pendingSystem }] });
  }
  return contents;
}

function buildRuleBasedAdvice(profile){
  const {
    gender = 'unisex',
    age,
    height_cm,
    weight_kg,
    occasions = [],
    colors = [],
    fit_preference = 'regular',
    climate = 'temperate',
    budget = 'mid'
  } = profile || {};

  let bmi = null;
  if(height_cm && weight_kg){
    const h = Number(height_cm) / 100;
    const w = Number(weight_kg);
    bmi = (h > 0 && w > 0) ? (w / (h*h)) : null;
  }

  const bodyNote = (()=>{
    if(bmi == null) return 'Chọn phom vừa vặn, tránh quá bó hoặc quá rộng.';
    if(bmi < 18.5) return 'Dáng gầy: ưu tiên lớp áo, chất liệu có độ phồng nhẹ.';
    if(bmi < 25) return 'Dáng cân đối: hầu hết phom dáng đều phù hợp.';
    if(bmi < 30) return 'Dáng hơi đầy: ưu tiên phom suông, tối màu, đơn giản.';
    return 'Dáng đầy: chọn phom suông, tối màu, tránh họa tiết to.';
  })();

  const palette = colors.length ? colors : (climate === 'tropical' ? ['trắng','be','pastel','xanh biển'] : ['đen','xám','navy','trắng']);

  const basePieces = (()=>{
    const common = ['áo thun chất lượng', 'quần jean vừa vặn', 'áo sơ mi cổ điển', 'giày đa dụng'];
    if(gender === 'women') return ['váy midi', 'áo blouse', 'quần ống rộng', ...common];
    if(gender === 'men') return ['áo polo', 'quần chinos', 'áo khoác nhẹ', ...common];
    return [...common, 'cardigan mỏng', 'áo khoác đa dụng'];
  })();

  const byOccasion = (occ)=>{
    const fit = fit_preference;
    const pick = {
      casual: [
        `Áo thun ${fit}, quần jean/shorts`,
        `Sneakers trắng, phụ kiện tối giản`,
      ],
      office: [
        `Sơ mi ${fit}, quần tây/chinos`,
        `Giày tây/loafer, đồng hồ đơn giản`,
      ],
      party: [
        `Áo/blouse thời thượng, quần/váy nhấn nhá`,
        `Giày cao gót/boot (nữ) hoặc loafer (nam)`,
      ],
      formal: [
        `Vest/suit ${fit}, sơ mi trắng`,
        `Giày da, thắt lưng cùng tông`,
      ]
    };
    return pick[occ] || pick.casual;
  };

  const outfits = (Array.isArray(occasions) && occasions.length ? occasions : ['casual','office']).map(occ=>({
    occasion: occ,
    suggestions: byOccasion(occ)
  }));

  const tips = [
    bodyNote,
    `Bảng màu gợi ý: ${palette.join(', ')}`,
    climate === 'tropical' ? 'Chất liệu thoáng mát (cotton, linen), màu sáng.' : 'Layer hợp lý, chất liệu giữ ấm (len, dạ).',
    budget === 'low' ? 'Tập trung vào các món cơ bản dễ phối, bền.' : budget === 'high' ? 'Đầu tư một vài món signature chất lượng cao.' : 'Cân bằng cơ bản và một vài món điểm nhấn.'
  ];

  const reply = [
    'Dựa trên thông tin của bạn, đây là gợi ý phong cách:',
    `Các món cơ bản nên có: ${basePieces.join(', ')}.`,
    `Một số set đồ theo dịp:`,
    ...outfits.map(o=>`- ${o.occasion}: ${o.suggestions.join(' | ')}`),
    `Mẹo thêm: ${tips.join(' | ')}`
  ].join('\n');

  return { reply, data: { bmi, palette, basePieces, outfits, tips } };
}

function normalizeColor(text){ return String(text||'').toLowerCase().trim(); }
function formatCurrency(n){ try{ return new Intl.NumberFormat('vi-VN',{ style:'currency', currency:'VND'}).format(Number(n)||0); }catch(_){ return String(n); } }
async function pickRecommendations(profile){
  const [products, inventory] = await Promise.all([readProducts(), readInventory()]);
  const inventoryMap = new Map((Array.isArray(inventory) ? inventory : []).map((x) => {
    const total = sumStockQty(Array.isArray(x.stock_detail) ? x.stock_detail : []);
    return [String(x.product_id), total];
  }));

  function productInStock(p){
    const byInventory = inventoryMap.get(String(p.id));
    if(Number.isFinite(byInventory)) return byInventory > 0;

    if(Array.isArray(p.variants) && p.variants.length){
      const totalVariant = p.variants.reduce((acc, v) => acc + Math.max(0, Number(v && v.stock) || 0), 0);
      return totalVariant > 0;
    }
    return true;
  }

  const inStockProducts = products.filter(productInStock);
  const palette = Array.isArray(profile.colors) ? profile.colors.map(normalizeColor) : [];
  const occs = Array.isArray(profile.occasions) ? profile.occasions.map(String) : [];
  const gender = String(profile.gender||'unisex');
  const budget = String(profile.budget||'mid');
  const budgetTier = (p)=>{
    const price = Number(p.salePrice ?? p.price ?? 0);
    if(budget==='low') return price < 300000;
    if(budget==='high') return price >= 1200000;
    return price >= 300000 && price < 1200000;
  };
  const occHints = new Set(occs);
  const hasOccWord = (p, words)=> words.some(w=> String(p.name||'').toLowerCase().includes(w) || String(p.category||'').toLowerCase().includes(w) || String(p.description||'').toLowerCase().includes(w));
  const occWords = {
    office: ['sơ mi','chinos','tây','vest','suit','công sở'],
    casual: ['thun','jean','short','casual','thoải mái'],
    party: ['váy','đầm','party','boot','nhấn nhá'],
    formal: ['vest','suit','trang trọng','formal']
  };
  function scoreProduct(p){
    let s = 0;
    const price = Number(p.salePrice ?? p.price ?? 0);
    // color match via variants or name/desc
    const varColors = Array.isArray(p.variants) ? p.variants.map(v=> normalizeColor(v.color)).filter(Boolean) : [];
    const nameDesc = normalizeColor((p.name||'') + ' ' + (p.description||''));
    palette.forEach(c=>{ if(varColors.includes(c) || nameDesc.includes(c)) s += 2; });
    // budget fit
    if(budgetTier(p)) s += 1;
    // occasion hint
    occHints.forEach(occ=>{ const words = occWords[occ]; if(words && hasOccWord(p, words)) s += 1; });
    // prefer discounted items
    if(p.salePrice != null && p.salePrice < p.price) s += 0.5;
    // slight tie-breaker: lower price is better
    s += Math.max(0, 1500000 - price) / 1500000 * 0.3;
    return s;
  }
  const ranked = inStockProducts.map(p=> ({ ...p, _score: scoreProduct(p) }))
    .sort((a,b)=> b._score - a._score)
    .slice(0,5)
    .map(({_score, ...rest})=> rest);
  return ranked;
}

app.listen(PORT, () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
});

// --- Coupons APIs ---
function normalizeCoupon(b){
  const type = ['percent','amount','freeship'].includes(String(b.type)) ? String(b.type) : 'percent';
  const value = Number(b.value)||0;
  const code = String(b.code||'').trim().toUpperCase();
  const expiresAt = b.expiresAt ? new Date(String(b.expiresAt)).toISOString() : null;
  const active = b.active != null ? !!b.active : true;
  return { code, type, value, expiresAt, active };
}

// Validate coupon by code (public)
app.get('/api/coupons/validate', async (req,res)=>{
  try{
    const code = String((req.query && req.query.code) || '').trim().toUpperCase();
    if(!code) return res.status(400).json({ valid:false, error:'Missing code' });
    const coupons = await readCoupons();
    const c = coupons.find(x => String(x.code).toUpperCase() === code);
    if(!c || !c.active) return res.json({ valid:false });
    if(c.expiresAt && new Date(c.expiresAt) < new Date()) return res.json({ valid:false, expired:true });
    res.json({ valid:true, code:c.code, type:c.type, value:c.value, expiresAt:c.expiresAt });
  }catch(err){ console.error('GET /api/coupons/validate',err); res.status(500).json({ error:'Internal error' }); }
});

// Public list of active coupons (non-expired)
app.get('/api/coupons/public', async (req,res)=>{
  try{
    const now = new Date();
    const coupons = await readCoupons();
    const active = coupons.filter(c => {
      if(c.active === false) return false;
      if(c.expiresAt && new Date(c.expiresAt) < now) return false;
      return true;
    });
    res.json(active);
  }catch(err){ console.error('GET /api/coupons/public',err); res.status(500).json({ error:'Internal error' }); }
});

// Coupons CRUD (admin)
app.get('/api/coupons', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{ res.json(await readCoupons()); }catch(err){ res.status(500).json({ error:'Internal error' }); }
});
app.post('/api/coupons', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const b = normalizeCoupon(req.body||{});
    if(!b.code) return res.status(400).json({ error:'Missing code' });
    const coupons = await readCoupons();
    if(coupons.some(x => String(x.code).toUpperCase() === b.code)) return res.status(409).json({ error:'Code exists' });
    const saved = { id: Date.now(), createdAt: new Date().toISOString(), ...b };
    coupons.push(saved); await writeCoupons(coupons); res.json(saved);
  }catch(err){ console.error('POST /api/coupons',err); res.status(500).json({ error:'Internal error' }); }
});
app.put('/api/coupons/:id', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const id = Number(req.params.id);
    const coupons = await readCoupons();
    const idx = coupons.findIndex(x=> Number(x.id)===id);
    if(idx<0) return res.status(404).json({ error:'Not found' });
    const patch = normalizeCoupon(req.body||{});
    coupons[idx] = { ...coupons[idx], ...patch };
    await writeCoupons(coupons); res.json(coupons[idx]);
  }catch(err){ console.error('PUT /api/coupons/:id',err); res.status(500).json({ error:'Internal error' }); }
});
app.delete('/api/coupons/:id', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const id = Number(req.params.id);
    const coupons = await readCoupons();
    const before = coupons.length; const remain = coupons.filter(x=> Number(x.id)!==id);
    if(remain.length===before) return res.status(404).json({ error:'Not found' });
    await writeCoupons(remain); res.json({ removed: before-remain.length });
  }catch(err){ console.error('DELETE /api/coupons/:id',err); res.status(500).json({ error:'Internal error' }); }
});

// --- Banners APIs ---
// Public list (only active)
app.get('/api/banners', async (req,res)=>{
  try{
    const banners = (await readBanners()).filter(b=> b.active!==false).sort((a,b)=> (a.sortOrder||0)-(b.sortOrder||0));
    res.json(banners);
  }catch(err){ console.error('GET /api/banners',err); res.status(500).json({ error:'Internal error' }); }
});
// Admin list (all banners)
app.get('/api/banners/admin', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{ res.json(await readBanners()); }catch(err){ console.error('GET /api/banners/admin',err); res.status(500).json({ error:'Internal error' }); }
});
// Admin CRUD
app.post('/api/banners', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const b = req.body||{};
    const banner = {
      id: Date.now(), title: String(b.title||''), image: String(b.image||''),
      active: b.active != null ? !!b.active : true, sortOrder: Number(b.sortOrder)||0,
      createdAt: new Date().toISOString()
    };
    const all = await readBanners(); all.push(banner); await writeBanners(all); res.json(banner);
  }catch(err){ console.error('POST /api/banners',err); res.status(500).json({ error:'Internal error' }); }
});
app.put('/api/banners/:id', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const id = Number(req.params.id); const patch = req.body||{};
    const banners = await readBanners(); const idx = banners.findIndex(x=> Number(x.id)===id);
    if(idx<0) return res.status(404).json({ error:'Not found' });
    banners[idx] = {
      ...banners[idx],
      title: patch.title != null ? String(patch.title) : banners[idx].title,
      image: patch.image != null ? String(patch.image) : banners[idx].image,
      active: patch.active != null ? !!patch.active : banners[idx].active,
      sortOrder: patch.sortOrder != null ? Number(patch.sortOrder) : banners[idx].sortOrder
    };
    await writeBanners(banners); res.json(banners[idx]);
  }catch(err){ console.error('PUT /api/banners/:id',err); res.status(500).json({ error:'Internal error' }); }
});
app.delete('/api/banners/:id', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const id = Number(req.params.id); const banners = await readBanners();
    const before = banners.length; const remain = banners.filter(x=> Number(x.id)!==id);
    if(remain.length===before) return res.status(404).json({ error:'Not found' });
    await writeBanners(remain); res.json({ removed: before-remain.length });
  }catch(err){ console.error('DELETE /api/banners/:id',err); res.status(500).json({ error:'Internal error' }); }
});
// Banner image upload (admin)
app.post('/api/banners/:id/image', upload.single('image'), async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const id = Number(req.params.id);
    const banners = await readBanners(); const idx = banners.findIndex(x=> Number(x.id)===id);
    if(idx<0) return res.status(404).json({ error:'Not found' });
    const file = req.file; if(!file) return res.status(400).json({ error:'Missing image' });
    banners[idx].image = '/uploads/' + file.filename; await writeBanners(banners);
    res.json({ image: banners[idx].image });
  }catch(err){ console.error('POST /api/banners/:id/image',err); res.status(500).json({ error:'Internal error' }); }
});

// --- Hero media APIs ---
app.get('/api/hero-media', async (req,res)=>{
  try{
    const hero = await readHeroMedia();
    res.json(hero);
  }catch(err){
    console.error('GET /api/hero-media', err);
    res.status(500).json({ error:'Internal error' });
  }
});

app.put('/api/hero-media', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const body = req.body || {};
    const saved = await writeHeroMedia({
      type: body.type,
      src: body.src,
      poster: body.poster
    });
    res.json(saved);
  }catch(err){
    console.error('PUT /api/hero-media', err);
    res.status(500).json({ error:'Internal error' });
  }
});

app.post('/api/hero-media/upload', upload.single('media'), async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const file = req.file;
    if(!file) return res.status(400).json({ error:'Missing media file' });
    const mimetype = String(file.mimetype || '').toLowerCase();
    const type = mimetype.startsWith('image/') ? 'image' : 'video';
    const src = '/uploads/' + file.filename;
    const saved = await writeHeroMedia({ type, src, poster:'' });
    res.json(saved);
  }catch(err){
    console.error('POST /api/hero-media/upload', err);
    res.status(500).json({ error:'Internal error' });
  }
});

// --- AI Logs APIs (admin) ---
app.get('/api/ai/logs', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{ res.json(await readAIlogs()); }catch(err){ res.status(500).json({ error:'Internal error' }); }
});
app.get('/api/ai/logs/:id', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{ const id = Number(req.params.id); const logs = await readAIlogs(); const e = logs.find(x=> Number(x.id)===id); if(!e) return res.status(404).json({ error:'Not found' }); res.json(e); }catch(err){ res.status(500).json({ error:'Internal error' }); }
});
app.delete('/api/ai/logs/:id', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{ const id = Number(req.params.id); const logs = await readAIlogs(); const before = logs.length; const remain = logs.filter(x=> Number(x.id)!==id); if(remain.length===before) return res.status(404).json({ error:'Not found' }); await writeAIlogs(remain); res.json({ removed: before-remain.length }); }catch(err){ res.status(500).json({ error:'Internal error' }); }
});

// --- Admin AI tools ---
app.post('/api/admin/ai/generate-product-description', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const category = String(body.category || '').trim();
    const brand = String(body.brand || 'SGB').trim();
    const tone = String(body.tone || 'sang trọng, dễ bán').trim();
    if(!name) return res.status(400).json({ error:'Missing product name' });

    const prompt = `Viết mô tả sản phẩm tiếng Việt cho shop thời trang ${brand}.\nTên sản phẩm: ${name}\nDanh mục: ${category}\nGiọng văn: ${tone}\nYêu cầu: 70-110 từ, nêu chất liệu/cảm giác mặc, dịp phù hợp, kết thúc bằng CTA ngắn.`;
    const aiText = await generateTextWithGemini(prompt);
    const fallback = `${name} mang phong cách ${tone}, phù hợp cho nhiều dịp từ đi làm đến dạo phố. Thiết kế chỉn chu, dễ phối với quần jeans, chân váy hoặc quần tây để tạo tổng thể hiện đại và tinh tế. Chất liệu thoải mái, đứng form tốt, giúp bạn tự tin suốt ngày dài. Thêm ngay vào tủ đồ để nâng cấp phong cách mỗi ngày.`;
    res.json({ description: aiText || fallback, source: aiText ? 'gemini' : 'rule-based' });
  }catch(err){
    console.error('POST /api/admin/ai/generate-product-description', err);
    res.status(500).json({ error:'Internal error' });
  }
});

app.post('/api/admin/ai/forecast-flash-sale', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const days = Math.min(60, Math.max(7, Number((req.body && req.body.days) || 30)));
    const now = Date.now();
    const fromTs = now - days * 24 * 60 * 60 * 1000;
    const orders = (await readOrders()).filter(o => new Date(o.createdAt || o.ts || 0).getTime() >= fromTs);

    const productQty = new Map();
    const categoryQty = new Map();
    let revenue = 0;
    orders.forEach(o => {
      revenue += Number(o.total || 0);
      (Array.isArray(o.items) ? o.items : []).forEach(it => {
        const key = String(it.name || `#${it.id || 'unknown'}`);
        const qty = Number(it.qty || 1);
        productQty.set(key, (productQty.get(key) || 0) + qty);
      });
    });

    const products = await readProducts();
    products.forEach(p => {
      const sold = productQty.get(String(p.name || `#${p.id}`)) || 0;
      const cat = String(p.category || 'other');
      categoryQty.set(cat, (categoryQty.get(cat) || 0) + sold);
    });

    const topProducts = Array.from(productQty.entries()).sort((a,b)=> b[1]-a[1]).slice(0,5).map(([name, qty])=>({ name, qty }));
    const topCategories = Array.from(categoryQty.entries()).sort((a,b)=> b[1]-a[1]).slice(0,3).map(([name, qty])=>({ name, qty }));

    const heuristic = {
      periodDays: days,
      totalOrders: orders.length,
      revenue,
      recommendedDiscount: orders.length > 40 ? 18 : orders.length > 15 ? 14 : 10,
      topProducts,
      topCategories
    };

    const aiPrompt = `Dựa trên dữ liệu bán hàng sau, hãy đề xuất kế hoạch flash sale ngắn gọn bằng tiếng Việt gồm: khung giờ, mức giảm, danh mục trọng tâm, cảnh báo tồn kho. Dữ liệu: ${JSON.stringify(heuristic)}`;
    const aiSummary = await generateTextWithGemini(aiPrompt);

    res.json({
      source: aiSummary ? 'gemini' : 'rule-based',
      heuristic,
      summary: aiSummary || `Gợi ý chạy flash sale ${heuristic.recommendedDiscount}% trong 2 khung giờ 11:00-13:00 và 20:00-22:00, ưu tiên ${topCategories.map(x=>x.name).join(', ') || 'danh mục bán chạy'}, tập trung hàng có biên lợi nhuận tốt.`
    });
  }catch(err){
    console.error('POST /api/admin/ai/forecast-flash-sale', err);
    res.status(500).json({ error:'Internal error' });
  }
});

app.get('/api/admin/ai/logs-summary', async (req,res)=>{
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error:'Unauthorized' });
  try{
    const date = String((req.query && req.query.date) || new Date().toISOString().slice(0,10));
    const logs = await readAIlogs();
    const filtered = logs.filter(x => String(x.ts || x.createdAt || '').slice(0,10) === date);
    const bySource = filtered.reduce((acc, x) => {
      const key = String(x.source || 'unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const byUser = filtered.reduce((acc, x) => {
      const key = String(x.userEmail || 'guest');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const topUsers = Object.entries(byUser).sort((a,b)=> b[1]-a[1]).slice(0,3).map(([email,count])=>({ email, count }));

    const baseSummary = {
      date,
      totalLogs: filtered.length,
      bySource,
      topUsers
    };

    const aiSummary = await generateTextWithGemini(`Tóm tắt ngắn nhật ký AI trong ngày theo tiếng Việt, nêu xu hướng và rủi ro. Dữ liệu: ${JSON.stringify(baseSummary)}`);
    res.json({ summary: aiSummary || `Ngày ${date} có ${filtered.length} lượt sử dụng AI. Nguồn chính: ${Object.keys(bySource).join(', ') || 'chưa có'}.`, data: baseSummary, source: aiSummary ? 'gemini' : 'rule-based' });
  }catch(err){
    console.error('GET /api/admin/ai/logs-summary', err);
    res.status(500).json({ error:'Internal error' });
  }
});
