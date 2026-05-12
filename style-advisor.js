(() => {
  const $ = (id) => document.getElementById(id);

  const defaultProfile = {
    gender: 'women',
    age: 25,
    height_cm: 165,
    weight_kg: 55,
    colors: ['đen', 'trắng'],
    occasions: ['casual'],
    fit_preference: 'regular',
    climate: 'temperate',
    budget: 'mid'
  };

  const state = {
    step: 0,
    cachedImageFile: null,
    cachedImageBase64: null,
    cachedImageMime: null
  };

  function normArray(val){
    if(Array.isArray(val)) return val;
    if(typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }

  function getProfile(){
    try{
      const p = JSON.parse(localStorage.getItem('sgb_style_profile') || 'null');
      if(!p) return { ...defaultProfile };
      return {
        ...defaultProfile,
        ...p,
        colors: normArray(p.colors),
        occasions: normArray(p.occasions)
      };
    }catch(_){ return { ...defaultProfile }; }
  }

  function saveProfile(profile){
    try{ localStorage.setItem('sgb_style_profile', JSON.stringify(profile)); }catch(_){ }
  }

  function simplifyText(text){
    return String(text || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function setTheme(theme){
    document.body.dataset.theme = theme;
    const btn = $('themeToggle');
    if(btn){
      if(theme === 'dark'){
        btn.innerHTML = '<i class="fa-solid fa-sun"></i> Chế độ sáng';
      }else{
        btn.innerHTML = '<i class="fa-solid fa-moon"></i> Chế độ tối';
      }
    }
    try{ localStorage.setItem('sgb_style_theme', theme); }catch(_){ }
  }

  function initTheme(){
    let theme = 'light';
    try{ theme = localStorage.getItem('sgb_style_theme') || 'light'; }catch(_){ }
    setTheme(theme === 'dark' ? 'dark' : 'light');
    $('themeToggle')?.addEventListener('click', () => {
      const current = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  function setRangeValue(){
    $('heightValue').textContent = $('height_cm').value;
    $('weightValue').textContent = $('weight_kg').value;
  }

  function validateAgeInput(report = false){
    const ageEl = $('age');
    if(!ageEl) return { valid: true, value: undefined };

    const raw = String(ageEl.value || '').trim();
    if(!raw){
      ageEl.setCustomValidity('');
      return { valid: true, value: undefined };
    }

    const age = Number(raw);
    let message = '';

    if(!Number.isFinite(age)){
      message = 'Tuổi không hợp lệ.';
    }else if(age < 0){
      message = 'Tuổi không được là số âm.';
    }else if(!Number.isInteger(age)){
      message = 'Tuổi phải là số nguyên.';
    }else if(age < 10 || age > 100){
      message = 'Tuổi hợp lệ từ 10 đến 100.';
    }

    ageEl.setCustomValidity(message);
    if(message && report) ageEl.reportValidity();
    return { valid: !message, value: message ? undefined : age };
  }

  function bindStepper(){
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const dots = Array.from(document.querySelectorAll('.step-dot'));

    function renderStep(){
      steps.forEach((el, idx) => el.classList.toggle('active', idx === state.step));
      dots.forEach((el, idx) => el.classList.toggle('active', idx === state.step));
      $('prevStep').disabled = state.step === 0;
      $('nextStep').innerHTML = state.step === steps.length - 1
        ? 'Hoàn tất <i class="fa-solid fa-check"></i>'
        : 'Tiếp tục <i class="fa-solid fa-arrow-right"></i>';
    }

    $('prevStep')?.addEventListener('click', () => {
      state.step = Math.max(0, state.step - 1);
      renderStep();
    });

    $('nextStep')?.addEventListener('click', () => {
      if(state.step < steps.length - 1){
        state.step += 1;
        renderStep();
        return;
      }
      const p = collectProfile({ reportAgeError: true });
      if(!p) return;
      saveProfile(p);
      $('sourceBadge').textContent = 'Nguồn: Hồ sơ đã lưu';
      addMessage('assistant', 'Mình đã lưu hồ sơ. Bạn có thể bắt đầu nhắn nhu cầu để nhận set đồ phù hợp.');
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        state.step = Number(dot.dataset.step || 0);
        renderStep();
      });
    });

    renderStep();
  }

  function bindInteractiveInputs(){
    $('height_cm')?.addEventListener('input', setRangeValue);
    $('weight_kg')?.addEventListener('input', setRangeValue);
    $('age')?.addEventListener('input', () => { validateAgeInput(false); });
    $('age')?.addEventListener('blur', () => { validateAgeInput(true); });

    const climateWrap = $('climateChoices');
    climateWrap?.querySelectorAll('.chip-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        climateWrap.querySelectorAll('.chip-btn').forEach((x) => x.classList.remove('active'));
        btn.classList.add('active');
        $('climate').value = btn.dataset.value || 'temperate';
      });
    });

    const colorGrid = $('colorGrid');
    colorGrid?.querySelectorAll('.color-chip').forEach((chip) => {
      chip.addEventListener('click', () => chip.classList.toggle('active'));
    });

    const occWrap = $('occasions');
    occWrap?.querySelectorAll('.occasion-btn').forEach((btn) => {
      btn.addEventListener('click', () => btn.classList.toggle('active'));
    });

    $('saveProfile')?.addEventListener('click', () => {
      const p = collectProfile({ reportAgeError: true });
      if(!p) return;
      saveProfile(p);
      $('sourceBadge').textContent = 'Nguồn: Hồ sơ đã lưu';
      addMessage('assistant', 'Đã lưu hồ sơ thành công. Nói nhu cầu cụ thể để mình tư vấn set đồ nhé.');
    });
  }

  function fillForm(profile){
    $('gender').value = profile.gender || 'women';
    const age = Number(profile.age);
    $('age').value = Number.isFinite(age) && age >= 0 ? age : '';
    $('height_cm').value = profile.height_cm || 165;
    $('weight_kg').value = profile.weight_kg || 55;
    $('budget').value = profile.budget || 'mid';
    $('fit_preference').value = profile.fit_preference || 'regular';
    setRangeValue();

    const colors = normArray(profile.colors).map((c) => c.toLowerCase());
    $('colors').value = colors.join(', ');
    document.querySelectorAll('.color-chip').forEach((chip) => {
      chip.classList.toggle('active', colors.includes(String(chip.dataset.color || '').toLowerCase()));
    });

    const climateVal = profile.climate || 'temperate';
    $('climate').value = climateVal;
    document.querySelectorAll('#climateChoices .chip-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.value === climateVal);
    });

    const occasions = new Set(normArray(profile.occasions).map((x) => String(x).toLowerCase()));
    document.querySelectorAll('#occasions .occasion-btn').forEach((btn) => {
      btn.classList.toggle('active', occasions.has(String(btn.dataset.value || '').toLowerCase()));
    });
    if(!document.querySelector('#occasions .occasion-btn.active')){
      const first = document.querySelector('#occasions .occasion-btn');
      if(first) first.classList.add('active');
    }
  }

  function collectProfile(opts = {}){
    const ageCheck = validateAgeInput(!!opts.reportAgeError);
    if(!ageCheck.valid) return null;

    const pickedColors = Array.from(document.querySelectorAll('.color-chip.active')).map((x) => x.dataset.color).filter(Boolean);
    const custom = String($('colors').value || '').split(',').map((x) => x.trim()).filter(Boolean);
    const colors = Array.from(new Set([...pickedColors, ...custom]));
    const occasions = Array.from(document.querySelectorAll('#occasions .occasion-btn.active')).map((x) => x.dataset.value).filter(Boolean);

    return {
      gender: $('gender').value,
      age: ageCheck.value,
      height_cm: Number($('height_cm').value) || undefined,
      weight_kg: Number($('weight_kg').value) || undefined,
      colors,
      climate: $('climate').value || 'temperate',
      budget: $('budget').value,
      fit_preference: $('fit_preference').value,
      occasions: occasions.length ? occasions : ['casual']
    };
  }

  function createChatRow(role, htmlContent){
    const row = document.createElement('div');
    row.className = `chat-row ${role === 'user' ? 'user' : 'ai'}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar-ai';
    avatar.innerHTML = '<i class="fa-solid fa-robot" aria-hidden="true"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = htmlContent;

    row.appendChild(avatar);
    row.appendChild(bubble);
    return row;
  }

  function addMessage(role, text){
    const log = $('chatLog');
    if(!log) return;
    const row = createChatRow(role, escapeHtml(text).replace(/\n/g, '<br>'));
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function addHtmlMessage(html){
    const log = $('chatLog');
    if(!log) return null;
    const row = createChatRow('assistant', html);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  function showTyping(){
    const log = $('chatLog');
    if(!log || $('typingRow')) return;
    const row = createChatRow('assistant', '<div class="typing"><span></span><span></span><span></span></div>');
    row.id = 'typingRow';
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function hideTyping(){
    const t = $('typingRow');
    if(t) t.remove();
  }

  function getImageFallback(name, category){
    try{
      if(typeof getImageForProduct !== 'undefined') return getImageForProduct(name, category);
    }catch(_){ }
    return 'https://images.unsplash.com/photo-1520974692088-5cb9130b7003';
  }

  function normalizeProduct(p){
    const name = p.name || `#${p.id}`;
    const category = String(p.category || '').toLowerCase();
    const price = (p.salePrice != null ? Number(p.salePrice) : Number(p.price)) || 0;
    const image = (p.images && (p.images.cover || (p.images.gallery && p.images.gallery[0]))) || p.image || getImageFallback(name, category);
    return { id: Number(p.id) || Date.now(), name, category, price, image };
  }

  let catalogCache = null;
  async function getCatalog(){
    if(Array.isArray(catalogCache) && catalogCache.length) return catalogCache;
    try{
      if(typeof products !== 'undefined' && Array.isArray(products) && products.length){
        catalogCache = products.map(normalizeProduct);
        return catalogCache;
      }
    }catch(_){ }
    try{
      const res = await fetch('/api/products');
      if(res.ok){
        const list = await res.json();
        if(Array.isArray(list)){
          catalogCache = list.map(normalizeProduct);
          return catalogCache;
        }
      }
    }catch(_){ }
    return [];
  }

  function findProductsByKeywords(catalog, keywords, limit = 6, gender = ''){
    if(!Array.isArray(catalog) || !catalog.length) return [];
    const raw = Array.isArray(keywords) ? keywords : String(keywords || '').split(/[,;\n]/g);
    const keys = raw.map((k) => simplifyText(k)).filter(Boolean);
    if(!keys.length) return [];

    const translated = keys.map((k) => k
      .replace(/\bwhite\b/g, 'trang')
      .replace(/\bblack\b/g, 'den')
      .replace(/\bshirt\b/g, 'ao')
      .replace(/\bdress\b/g, 'dam')
      .replace(/\bpants\b/g, 'quan')
      .replace(/\bshoes\b/g, 'giay')
      .replace(/\bbag\b/g, 'tui')
    );

    const expanded = [...keys, ...translated];
    const scored = catalog.map((p) => {
      const name = simplifyText(p.name);
      let score = 0;
      expanded.forEach((k) => { if(name.includes(k)) score += 4; });
      if(gender && gender !== 'unisex' && p.category === gender) score += 2;
      return { p, score };
    }).sort((a,b) => b.score - a.score);

    return scored.filter((x) => x.score > 0).slice(0, limit).map((x) => x.p);
  }

  function getBudgetRange(budget){
    const b = String(budget || 'mid').toLowerCase();
    if(b === 'low') return { min: 0, max: 500000 };
    if(b === 'high') return { min: 900000, max: Infinity };
    return { min: 300000, max: 1200000 };
  }

  function parseMoneyValue(text){
    const t = simplifyText(text).replace(/\s+/g, ' ').trim();
    if(!t) return null;

    const mUnit = t.match(/(\d+(?:[\.,]\d+)?)\s*(trieu|cu|m)\b/);
    if(mUnit){
      const base = Number(String(mUnit[1]).replace(',', '.'));
      if(Number.isFinite(base)) return Math.round(base * 1000000);
    }

    const kUnit = t.match(/(\d{2,4})\s*k\b/);
    if(kUnit){
      const base = Number(kUnit[1]);
      if(Number.isFinite(base)) return base * 1000;
    }

    const plain = t.match(/\b(\d{5,8})\b/);
    if(plain){
      const num = Number(plain[1]);
      if(Number.isFinite(num)) return num;
    }
    return null;
  }

  function extractPriceRangeFromText(text, profileBudget){
    const fallback = getBudgetRange(profileBudget);
    const t = simplifyText(text);
    if(!t) return fallback;

    const between = t.match(/(?:tu|khoang)\s*(\d+(?:[\.,]\d+)?\s*(?:k|trieu|cu|m)?)\s*(?:den|-|toi)\s*(\d+(?:[\.,]\d+)?\s*(?:k|trieu|cu|m)?)/);
    if(between){
      const a = parseMoneyValue(between[1]);
      const b = parseMoneyValue(between[2]);
      if(a != null && b != null){
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        return { min, max };
      }
    }

    const under = t.match(/(?:duoi|toi da|khong qua|max)\s*(\d+(?:[\.,]\d+)?\s*(?:k|trieu|cu|m)?)/);
    if(under){
      const max = parseMoneyValue(under[1]);
      if(max != null) return { min: 0, max };
    }

    const above = t.match(/(?:tren|tu)\s*(\d+(?:[\.,]\d+)?\s*(?:k|trieu|cu|m)?)\s*(?:tro len|up|\+)/);
    if(above){
      const min = parseMoneyValue(above[1]);
      if(min != null) return { min, max: Infinity };
    }

    const around = t.match(/(?:tam|khoang|gan)\s*(\d+(?:[\.,]\d+)?\s*(?:k|trieu|cu|m)?)/);
    if(around){
      const center = parseMoneyValue(around[1]);
      if(center != null){
        const delta = Math.max(120000, Math.round(center * 0.25));
        return { min: Math.max(0, center - delta), max: center + delta };
      }
    }

    if(/re|tiet kiem|sinh vien/.test(t)) return { min: 0, max: 500000 };
    if(/cao cap|hang xin|sang|premium/.test(t)) return { min: 900000, max: Infinity };

    return fallback;
  }

  function withinRange(product, range){
    const price = Number(product && product.price) || 0;
    return price >= range.min && price <= range.max;
  }

  function withinBudget(product, budget){
    const { min, max } = getBudgetRange(budget);
    const price = Number(product && product.price) || 0;
    return price >= min && price <= max;
  }

  function applyBudgetFilter(items, budget){
    if(!Array.isArray(items) || !items.length) return [];
    return items.filter((item) => withinBudget(item, budget));
  }

  function applyPriceRangeFilter(items, range){
    if(!Array.isArray(items) || !items.length || !range) return [];
    return items.filter((item) => withinRange(item, range));
  }

  function buildThumbGrid(title, items){
    if(!items || !items.length) return '';
    return `
      <div class="product-suggest">
        <div class="product-suggest-title">${escapeHtml(title)}</div>
        <div class="thumb-grid">
          ${items.map((p) => `
            <div class="thumb-card">
              <a href="product.html?id=${p.id}">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null;this.src='${escapeHtml(getImageFallback(p.name, p.category))}'">
                <div class="thumb-info">
                  <div class="thumb-name">${escapeHtml(p.name)}</div>
                  <div class="thumb-price">${Number(p.price || 0).toLocaleString('vi-VN')}đ</div>
                </div>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function askAdvisor(userText){
    const profile = collectProfile();
    if(!profile) throw new Error('Tuổi không hợp lệ');
    saveProfile(profile);
    const history = Array.from(document.querySelectorAll('#chatLog .bubble')).map((el) => ({ role: el.closest('.chat-row')?.classList.contains('user') ? 'user' : 'assistant', content: el.textContent }));
    let logged = null;
    try{ logged = JSON.parse(localStorage.getItem('sgb_logged_in') || 'null'); }catch(_){ logged = null; }

    const res = await fetch('/api/tu-van-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': (logged && logged.email) ? String(logged.email) : ''
      },
      body: JSON.stringify({
        hoSoKhachHang: profile,
        cauHoi: userText,
        history,
        imageBase64: state.cachedImageBase64,
        imageMimeType: state.cachedImageMime
      })
    });

    const data = await res.json();
    if(!res.ok || (data && data.error)){
      throw new Error((data && data.error) || 'Server error');
    }
    return data || {};
  }

  function fileToResizedBase64(file, maxSize = 1000){
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => { img.src = String(reader.result || ''); };
      reader.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const mime = file.type || 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, 0.85);
        resolve({ base64: dataUrl.split(',')[1], mime });
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){ h=0; s=0; }
    else {
      const d=max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=(g-b)/d + (g<b?6:0); break;
        case g: h=(b-r)/d + 2; break;
        default: h=(r-g)/d + 4; break;
      }
      h/=6;
    }
    return { h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100) };
  }

  function hueToColorName(h,s,l){
    if(l < 20) return 'đen';
    if(l > 80) return 'trắng';
    if(s < 15) return 'xám';
    if(h < 15 || h >= 345) return 'đỏ';
    if(h < 45) return 'cam';
    if(h < 70) return 'vàng';
    if(h < 150) return 'xanh lá';
    if(h < 210) return 'xanh dương';
    if(h < 280) return 'tím';
    return 'hồng';
  }

  function colorPaletteFromPixels(data){
    const buckets = new Map();
    for(let i=0;i<data.length;i+=16){
      const r = data[i], g = data[i+1], b = data[i+2];
      const {h,s,l} = rgbToHsl(r,g,b);
      const name = hueToColorName(h,s,l);
      buckets.set(name, (buckets.get(name) || 0) + 1);
    }
    return Array.from(buckets.entries()).sort((a,b)=>b[1]-a[1]).slice(0,3).map((x)=>x[0]);
  }

  async function findSimilarByImage(file){
    if(!file) return [];
    const img = new Image();
    const url = URL.createObjectURL(file);

    return new Promise((resolve) => {
      img.onload = async () => {
        try{
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 60;
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0,0,size,size).data;
          const palette = colorPaletteFromPixels(data);
          $('imageSearchNote').textContent = `Màu nổi bật từ ảnh: ${palette.join(', ')}.`;

          const catalog = await getCatalog();
          const profile = collectProfile();
          let picks = findProductsByKeywords(catalog, palette, 6, profile.gender);
          picks = applyBudgetFilter(picks, profile.budget).slice(0, 4);
          if(!picks.length){
            const budgetPool = catalog.filter((p) => withinBudget(p, profile.budget));
            const genderPool = budgetPool.filter((p) => profile.gender === 'unisex' || p.category === profile.gender);
            const fallbackPool = genderPool.length ? genderPool : budgetPool;
            picks = fallbackPool.slice(0, 4);
          }
          resolve(picks);
        }catch(_){ resolve([]); }
      };
      img.onerror = () => resolve([]);
      img.src = url;
    });
  }

  function renderImageResults(items){
    const wrap = $('imageSearchResults');
    if(!wrap) return;
    wrap.innerHTML = buildThumbGrid('Sản phẩm tương tự từ ảnh', items);
  }

  function addGenderOverrideFromText(text){
    const t = String(text || '').toLowerCase();
    let override = null;
    if(t.includes('nam') || t.includes('men')) override = 'men';
    else if(t.includes('nữ') || t.includes('women')) override = 'women';
    else if(t.includes('unisex')) override = 'unisex';
    if(override && $('gender').value !== override){
      $('gender').value = override;
    }
  }

  function isGreetingOnly(text){
    const t = simplifyText(text);
    if(!t) return true;
    const greetingTokens = [
      'hi', 'hello', 'hey', 'yo', 'xin chao', 'chao', 'alo', 'ad oi', 'shop oi'
    ];
    const cleaned = t.replace(/[^a-z0-9\s]/g, ' ').trim();
    if(cleaned.length <= 14 && greetingTokens.some((g) => cleaned === g || cleaned.startsWith(g + ' '))){
      return true;
    }
    return false;
  }

  function pickFallbackProducts(catalog, profile, text, limit = 4){
    if(!Array.isArray(catalog) || !catalog.length) return [];
    const t = simplifyText(text);
    const gender = (profile && profile.gender) || 'unisex';
    const pool = catalog.filter((p) => gender === 'unisex' || p.category === gender);
    const source = pool.length ? pool : catalog;

    const scored = source.map((p) => {
      const name = simplifyText(p.name);
      let score = 0;

      if(/di lam|cong so|office/.test(t) && /so mi|shirt|blazer|quan tay|chinos|loafer/.test(name)) score += 4;
      if(/di choi|casual/.test(t) && /ao thun|tshirt|jean|sneaker|polo/.test(name)) score += 4;
      if(/party|tiec/.test(t) && /dam|vay|blazer|ao khoac|boot/.test(name)) score += 4;
      if(/formal|su kien/.test(t) && /suit|vest|so mi|quan tay|giay/.test(name)) score += 4;

      if(/ao|shirt|polo|blazer|khoac/.test(t) && /ao|shirt|polo|blazer|khoac/.test(name)) score += 3;
      if(/quan|jean|chinos|jogger|short/.test(t) && /quan|jean|chinos|jogger|short/.test(name)) score += 3;
      if(/giay|loafer|sneaker|boot/.test(t) && /giay|loafer|sneaker|boot/.test(name)) score += 3;
      if(/tui|vi|that lung|phu kien/.test(t) && /tui|vi|that lung|phu kien|bag|wallet|belt/.test(name)) score += 3;

      return { p, score };
    }).sort((a,b) => b.score - a.score);

    const out = scored.filter((x) => x.score > 0).slice(0, limit).map((x) => x.p);
    if(out.length >= limit) return out;

    for(const item of source){
      if(out.length >= limit) break;
      if(!out.find((x) => x.id === item.id)) out.push(item);
    }
    return out.slice(0, limit);
  }

  function shouldSuggestProductsFromText(text){
    const t = simplifyText(text);
    if(!t) return false;

    // Only suggest products when user explicitly mentions product needs.
    const productTerms = [
      'ao', 'ao thun', 'ao so mi', 'polo', 'hoodie', 'blazer', 'ao khoac',
      'quan', 'jean', 'chinos', 'jogger', 'short',
      'vay', 'dam', 'chan vay',
      'giay', 'sneaker', 'loafer', 'boot',
      'tui', 'vi', 'that lung', 'phu kien',
      'set do', 'outfit'
    ];

    return productTerms.some((term) => t.includes(term));
  }

  async function onSend(){
    const input = $('userMsg');
    const text = String(input?.value || '').trim();
    if(!text) return;
    input.value = '';

    addMessage('user', text);
    addGenderOverrideFromText(text);

    const ageCheck = validateAgeInput(true);
    if(!ageCheck.valid){
      addMessage('assistant', 'Tuổi đang không hợp lệ. Vui lòng nhập tuổi từ 10 đến 100 và không dùng số âm.');
      return;
    }

    showTyping();

    try{
      const data = await askAdvisor(text);
      hideTyping();

      const reply = data.loi_tu_van || data.reply || 'Mình chưa có gợi ý chính xác, bạn mô tả thêm bối cảnh nhé.';
      addMessage('assistant', reply);

      // Show products for real consulting requests; skip only pure greetings.
      const wantsProducts = !isGreetingOnly(text);
      if(wantsProducts){
        const profile = collectProfile();
        const catalog = await getCatalog();
        const requestedRange = extractPriceRangeFromText(text, profile.budget);
        let picks = findProductsByKeywords(catalog, data.tu_khoa_tim_kiem, 6, profile.gender);
        if(!picks.length){
          picks = findProductsByKeywords(catalog, `${text} ${reply}`, 4, profile.gender);
        }
        if(!picks.length){
          picks = pickFallbackProducts(catalog, profile, `${text} ${reply}`, 4);
        }

        // Respect price needed from chat text first, then profile budget.
        const rangedPicks = applyPriceRangeFilter(picks, requestedRange);
        if(rangedPicks.length){
          picks = rangedPicks.slice(0, 4);
        }else{
          const budgetPool = catalog.filter((p) => withinRange(p, requestedRange));
          const genderPool = budgetPool.filter((p) => profile.gender === 'unisex' || p.category === profile.gender);
          const fallbackPool = genderPool.length ? genderPool : budgetPool;
          if(fallbackPool.length){
            picks = pickFallbackProducts(fallbackPool, profile, `${text} ${reply}`, 4);
          }
        }

        if(picks.length){
          const row = addHtmlMessage(buildThumbGrid('Sản phẩm để bạn chọn', picks));
          if(row){
            const log = $('chatLog');
            log.scrollTop = log.scrollHeight;
          }
        }
      }
      $('sourceBadge').textContent = 'Nguồn: Gemini';
    }catch(err){
      hideTyping();
      $('sourceBadge').textContent = 'Nguồn: Lỗi kết nối';
      addMessage('assistant', `Không kết nối được tới AI (${err.message || 'unknown error'}). Vui lòng thử lại.`);
    }
  }

  function boot(){
    const profile = getProfile();
    fillForm(profile);

    addMessage('assistant', 'Xin chào! Mình là Stylist AI của SGB. Hãy cho mình biết dịp sử dụng, vibe bạn muốn và giới hạn ngân sách nhé.');

    bindStepper();
    bindInteractiveInputs();
    initTheme();

    $('sendBtn')?.addEventListener('click', onSend);
    $('userMsg')?.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') onSend();
    });

    $('imageSearchTrigger')?.addEventListener('click', () => $('imageSearchInput')?.click());
    $('imageSearchInput')?.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
      state.cachedImageFile = file;
      state.cachedImageBase64 = null;
      state.cachedImageMime = file ? (file.type || 'image/jpeg') : null;

      const preview = $('imagePreview');
      if(!file){
        preview.textContent = 'Chọn ảnh outfit để AI nhận diện màu và vibe';
        $('imageSearchResults').innerHTML = '';
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${objectUrl}" alt="preview">`;

      try{
        const resized = await fileToResizedBase64(file, 1000);
        state.cachedImageBase64 = resized.base64;
        state.cachedImageMime = resized.mime;
      }catch(_){ }

      $('imageSearchNote').textContent = 'Đang phân tích ảnh...';
      const picks = await findSimilarByImage(file);
      if(!picks.length){
        $('imageSearchNote').textContent = 'Chưa tìm được sản phẩm tương tự từ ảnh này.';
      }
      renderImageResults(picks);
    });

    try{
      const logged = JSON.parse(localStorage.getItem('sgb_logged_in') || 'null');
      if(!logged){
        addMessage('assistant', 'Bạn đang dùng chế độ khách. Hồ sơ sẽ được lưu cục bộ trên trình duyệt này.');
      }
    }catch(_){ }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    boot();
  }
})();
