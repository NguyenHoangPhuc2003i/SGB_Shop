const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

// Simple admin credentials (change in env for better security)
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

app.use(express.json());
// Serve static files (the site)
// Admin protection middleware: require Basic auth for admin UI and users API
function requireAdmin(req, res, next){
  // protect admin.html and the /api/users endpoint
  if(req.path === '/admin.html' || req.path.startsWith('/api/users')){
    const auth = req.headers['authorization'];
    if(!auth || !auth.startsWith('Basic ')){
      res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
      return res.status(401).send('Unauthorized');
    }
    const b64 = auth.split(' ')[1] || '';
    const txt = Buffer.from(b64, 'base64').toString('utf8');
    const [user, pass] = txt.split(':');
    if(user === ADMIN_USER && pass === ADMIN_PASS){
      return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Unauthorized');
  }
  return next();
}
app.use(requireAdmin);
app.use(express.static(path.join(__dirname)));

function readUsers(){
  try{
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){
    return [];
  }
}

function writeUsers(users){
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if(!name || !email || !password || password.length < 6){
    return res.status(400).json({ error: 'Invalid input' });
  }
  const users = readUsers();
  if(users.find(u => u.email === email.toLowerCase())){
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), name, email: email.toLowerCase(), passwordHash: hash };
  users.push(user);
  writeUsers(users);
  // don't send password hash back
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if(!email || !password){
    return res.status(400).json({ error: 'Invalid input' });
  }
  const users = readUsers();
  const user = users.find(u => u.email === email.toLowerCase());
  if(!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ id: user.id, name: user.name, email: user.email });
});

// Optional: expose users for debugging (not secure) - can be removed
app.get('/api/users', (req, res) => {
  const users = readUsers().map(u => ({ id: u.id, name: u.name, email: u.email }));
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
