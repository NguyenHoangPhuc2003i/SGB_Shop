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
const UPLOADS_DIR = path.join(__dirname, 'uploads');

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
// Optional: Use Firebase Firestore for users storage
const USE_FIREBASE_USERS = ['1','true','yes'].includes(String(process.env.FIREBASE_ENABLED || process.env.FIREBASE_ENABLED_USERS || '').toLowerCase());
if(USE_FIREBASE_USERS){
  try{
    admin = require('firebase-admin');
    let creds = null;
    if(process.env.FIREBASE_CREDENTIALS){
      const p = path.resolve(process.env.FIREBASE_CREDENTIALS);
      creds = JSON.parse(fs.readFileSync(p,'utf8'));
    }else if(process.env.FIREBASE_CREDENTIALS_JSON){
      creds = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
    }
    if(!admin.apps.length){
      admin.initializeApp({ credential: creds ? admin.credential.cert(creds) : admin.credential.applicationDefault() });
    }
    firestore = admin.firestore();
    console.log('Firebase Firestore enabled for users collection');
  }catch(e){
    console.error('Failed to init Firebase Admin SDK, falling back to file storage for users.', e);
    firestore = null;
  }
}

async function readUsers(){
  if(firestore){
    const snap = await firestore.collection('users').get();
    return snap.docs.map(d => d.data());
  }
  try{
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){ return []; }
}

async function writeUsers(users){
  if(firestore){
    const col = firestore.collection('users');
    const batch = firestore.batch();
    // existing ids
    const existing = await col.get();
    const keepIds = new Set(users.map(u => String(u.id)));
    existing.docs.forEach(doc => { if(!keepIds.has(doc.id)) batch.delete(doc.ref); });
    users.forEach(u => { const id = String(u.id); batch.set(col.doc(id), u, { merge: true }); });
    await batch.commit();
    return;
  }
  try{ fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true }); }catch(_){ /* noop */ }
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Generic helpers: Firestore collections with file JSON fallback
async function readCollection(colName, filePath){
  if(firestore){
    const snap = await firestore.collection(colName).get();
    return snap.docs.map(d => d.data());
  }
  try{ const raw = fs.readFileSync(filePath, 'utf8'); return JSON.parse(raw || '[]'); }catch(e){ return []; }
}
async function writeCollection(colName, filePath, items){
  if(firestore){
    const col = firestore.collection(colName);
    const batch = firestore.batch();
    const existing = await col.get();
    const keep = new Set(items.map(x => String(x.id)));
    existing.docs.forEach(doc => { if(!keep.has(doc.id)) batch.delete(doc.ref); });
    items.forEach(x => { const id = String(x.id); batch.set(col.doc(id), x, { merge: true }); });
    await batch.commit(); return;
  }
  try{ fs.mkdirSync(path.dirname(filePath), { recursive: true }); }catch(_){ }
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
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

app.post('/api/tu-van-ai', async (req, res) => {
  console.log("🎉 ĐÃ NHẬN ĐƯỢC YÊU CẦU TỪ WEB!");
    console.log("Dữ liệu khách gửi:", req.body);
  try {
    if(!ai){
      return res.status(503).json({ error: 'AI chưa được cấu hình. Vui lòng thiết lập GEMINI_API_KEY.' });
    }
    const { hoSoKhachHang, cauHoi, imageBase64, imageMimeType } = req.body || {};
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
    res.json(JSON.parse(cleanText));
  } catch (error) {
    console.error('Lỗi khi gọi Gemini:', error);
    res.status(500).json({ error: 'Hệ thống AI đang bận, vui lòng thử lại!' });
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
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
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
    if(idx >= 0){
      orders[idx] = { ...orders[idx], ...order, ...totals, status, createdAt };
    }else{
      orders.push({ ...order, ...totals, status, createdAt });
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
    orders[idx] = setDefaultStatus({ ...orders[idx], status: newStatus });
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

// Products CRUD
// List products (public)
app.get('/api/products', async (req, res) => {
  try{
    const products = await readProducts();
    res.json(products);
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
    res.json(p);
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
    const product = {
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
    };
    products.push(product);
    await writeProducts(products);
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
    const merged = {
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
    };
    products[idx] = merged;
    await writeProducts(products);
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
    products[idx] = { ...prev, images };
    await writeProducts(products);
    res.json({ images });
  }catch(err){
    console.error('POST /api/products/:id/images error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Inventory low-stock endpoint (admin)
app.get('/api/inventory/low', async (req, res) => {
  if(!(isAdminBasic(req) || await isAdminByHeader(req))) return res.status(401).json({ error: 'Unauthorized' });
  try{
    const threshold = Number((req.query && req.query.threshold) || 5);
    const products = await readProducts();
    const alerts = [];
    products.forEach(p => {
      (Array.isArray(p.variants) ? p.variants : []).forEach(v => {
        const stock = Number(v.stock)||0;
        if(stock <= threshold){
          alerts.push({
            productId: p.id,
            productName: p.name,
            category: p.category || '',
            brand: p.brand || '',
            size: String(v.size||''),
            color: String(v.color||''),
            stock,
            sku: v.sku || undefined,
            cover: (p.images && p.images.cover) || ''
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
      return res.json({ source: 'gemini', reply });
    }

    // Rule-based fallback + product recommendations
    const rb = buildRuleBasedAdvice(profile);
    let recs = [];
    try{ recs = await pickRecommendations(profile); }catch(_){ recs = []; }
    const recText = recs.length ? ('\n\nGợi ý sản phẩm phù hợp:\n' + recs.map(r=>`- ${r.name} (${formatCurrency(r.price)}) → /product.html?id=${r.id}`).join('\n')) : '';
    const finalReply = rb.reply + recText;
    // Log chat
    try{
      const logs = await readAIlogs();
      const entry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        userEmail: (req.headers['x-user-email']||'').toString(),
        profile, chatHistory,
        reply: finalReply, source: 'rule-based', recommendations: recs
      };
      logs.push(entry); await writeAIlogs(logs);
    }catch(_){ }
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
  const products = await readProducts();
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
  const ranked = products.map(p=> ({ ...p, _score: scoreProduct(p) }))
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
