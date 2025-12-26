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

// AI Style Advisor endpoint
// Uses OpenAI if OPENAI_API_KEY is set; falls back to rule-based suggestions otherwise.
app.post('/api/style-advisor', async (req, res) => {
  try{
    const profile = (req.body && req.body.profile) || {};
    const chatHistory = Array.isArray(req.body && req.body.chatHistory) ? req.body.chatHistory : [];

    const useAI = !!process.env.OPENAI_API_KEY;

    if(useAI){
      // Build prompt for stylist assistant
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

      // Call OpenAI Chat Completions API via fetch (no SDK dependency)
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        })
      });

      if(!response.ok){
        const text = await response.text();
        return res.status(502).json({ error: 'AI provider error', detail: text });
      }
      const data = await response.json();
      const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
        ? data.choices[0].message.content
        : 'Xin lỗi, hiện chưa thể tư vấn. Vui lòng thử lại.';
      return res.json({ source: 'openai', reply });
    }

    // Rule-based fallback
    const rb = buildRuleBasedAdvice(profile);
    return res.json({ source: 'rule-based', reply: rb.reply, data: rb.data });
  }catch(err){
    console.error('style-advisor error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

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

app.listen(PORT, () => {
  console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
