(() => {
  const $ = (id) => document.getElementById(id);
  function safeAddMsg(role, text){
    try{
      const log = $('chatLog');
      if(!log) return;
      const div = document.createElement('div');
      div.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
      div.textContent = String(text||'');
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }catch(_){ /* ignore */ }
  }
  // Surface runtime errors into the chat for easier debugging
  try{
    window.addEventListener('error', (e)=>{
      safeAddMsg('assistant', 'Có lỗi script: ' + (e && e.message ? e.message : 'unknown'));
    });
    window.addEventListener('unhandledrejection', (e)=>{
      const msg = (e && e.reason && (e.reason.message||e.reason)) || 'unknown';
      safeAddMsg('assistant', 'Có lỗi (promise): ' + msg);
    });
  }catch(_){ /* ignore */ }

  const defaultProfile = {
    gender: 'women', age: 25, height_cm: 165, weight_kg: 55,
    colors: ['đen','trắng'], occasions: ['casual','office'],
    fit_preference: 'regular', climate: 'temperate', budget: 'mid'
  };

  function normArray(val){
    if(Array.isArray(val)) return val;
    if(typeof val === 'string') return val.split(',').map(s=>s.trim()).filter(Boolean);
    return [];
  }

  function normalizeProfile(p){
    const out = { ...(p||{}) };
    out.colors = normArray(out.colors);
    out.occasions = normArray(out.occasions);
    return out;
  }

  function getProfile(){
    try{
      const p = JSON.parse(localStorage.getItem('sgb_style_profile')||'null');
      const prof = normalizeProfile(p || defaultProfile);
      // persist normalized to avoid future shape issues
      try{ localStorage.setItem('sgb_style_profile', JSON.stringify(prof)); }catch(_){ }
      return prof;
    }catch(e){ return defaultProfile; }
  }

  function saveProfile(p){
    try{ localStorage.setItem('sgb_style_profile', JSON.stringify(p)); }catch(e){}
  }

  function fillForm(p){
    p = normalizeProfile(p);
    $('gender').value = p.gender || 'women';
    $('age').value = p.age || '';
    $('height_cm').value = p.height_cm || '';
    $('weight_kg').value = p.weight_kg || '';
    $('colors').value = Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || '');
    $('fit_preference').value = p.fit_preference || 'regular';
    $('climate').value = p.climate || 'temperate';
    $('budget').value = p.budget || 'mid';
    const occ = new Set(normArray(p.occasions).map(String));
    Array.from($('occasions').querySelectorAll('input[type=checkbox]')).forEach(cb => {
      cb.checked = occ.has(cb.value) || (!occ.size && cb.checked);
    });
  }

  function collectProfile(){
    const occ = Array.from($('occasions').querySelectorAll('input[type=checkbox]'))
      .filter(cb => cb.checked).map(cb => cb.value);
    const colors = ($('colors').value || '')
      .split(',').map(s=>s.trim()).filter(Boolean);
    return {
      gender: $('gender').value,
      age: Number($('age').value) || undefined,
      height_cm: Number($('height_cm').value) || undefined,
      weight_kg: Number($('weight_kg').value) || undefined,
      fit_preference: $('fit_preference').value,
      climate: $('climate').value,
      budget: $('budget').value,
      occasions: occ,
      colors
    };
  }

  function addMsg(role, text){
    const log = $('chatLog');
    if(!log){ safeAddMsg(role, text); return; }
    const div = document.createElement('div');
    div.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function addHtmlMsg(html){
    const log = $('chatLog');
    if(!log) return;
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = html;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function simplifyText(text){
    return String(text||'')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }
  function rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h,s,l = (max+min)/2;
    if(max === min){ h = s = 0; }
    else {
      const d = max-min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h = (g-b)/d + (g < b ? 6 : 0); break;
        case g: h = (b-r)/d + 2; break;
        default: h = (r-g)/d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }

  function hueToColorName(h, s, l){
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
      buckets.set(name, (buckets.get(name)||0)+1);
    }
    return Array.from(buckets.entries()).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  }

  function detectStyleFromImageStats({avg, saturation, contrast, palette}){
    const avgLight = (avg.r + avg.g + avg.b) / 3;
    if(contrast > 60 && avgLight < 90) return 'Formal / Evening';
    if(saturation > 55) return 'Streetwear / Party';
    if(avgLight > 170 && saturation < 35) return 'Minimal / Office';
    if(palette.includes('đen') || palette.includes('xám')) return 'Smart Casual';
    return 'Casual';
  }

  function getImageFallback(name, category){
    try{
      if(typeof getImageForProduct !== 'undefined') return getImageForProduct(name, category);
    }catch(_){ /* ignore */ }
    return 'https://images.unsplash.com/photo-1520974692088-5cb9130b7003';
  }

  function normalizeProduct(p){
    const name = p.name || `#${p.id}`;
    const category = String(p.category||'').toLowerCase();
    const price = (p.salePrice != null ? Number(p.salePrice) : Number(p.price)) || 0;
    const img = (p.images && (p.images.cover || (p.images.gallery && p.images.gallery[0]))) || p.image || '';
    return { id:Number(p.id)||Date.now(), name, category, price, image: img || getImageFallback(name, category) };
  }

  let catalogCache = null;
  async function getCatalog(){
    if(Array.isArray(catalogCache) && catalogCache.length) return catalogCache;
    try{
      if(typeof products !== 'undefined' && Array.isArray(products) && products.length){
        catalogCache = products.map(p => normalizeProduct(p));
        return catalogCache;
      }
    }catch(_){ /* ignore */ }
    try{
      const res = await fetch('/api/products');
      if(res.ok){
        const list = await res.json();
        if(Array.isArray(list)){
          catalogCache = list.map(p => normalizeProduct(p));
          return catalogCache;
        }
      }
    }catch(_){ /* ignore */ }
    return [];
  }

  function renderProductCards(container, items){
    if(!container) return;
    container.innerHTML = (items||[]).map(p => {
      const price = Number(p.price||0).toLocaleString('vi-VN') + 'đ';
      return `
        <div class="product-card-mini" data-id="${p.id}">
          <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='${getImageFallback(p.name, p.category)}'">
          <div class="info">
            <div class="name">${p.name}</div>
            <div class="price">${price}</div>
            <div class="actions">
              <button class="btn-secondary js-add-to-cart" data-id="${p.id}">Thêm vào giỏ</button>
              <a class="btn-secondary" href="product.html?id=${p.id}">Xem</a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.js-add-to-cart').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.id || 0);
        if(!id) return;
        try{
          if(typeof addToCart !== 'undefined') await addToCart(id);
          else if(window && window.addToCart) await window.addToCart(id);
          try{ window.updateCartCount && window.updateCartCount(); }catch(_){ }
          try{ window.showToast && window.showToast('Đã thêm vào giỏ hàng!','success'); }catch(_){ }
        }catch(_){ /* ignore */ }
      });
    });
  }

  function addProductCardsToChat(title, items){
    if(!items || !items.length) return;
    const html = `
      <div><strong>${title}</strong></div>
      <div class="product-cards">${items.map(p => {
        const price = Number(p.price||0).toLocaleString('vi-VN') + 'đ';
        return `
          <div class="product-card-mini" data-id="${p.id}">
            <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='${getImageFallback(p.name, p.category)}'">
            <div class="info">
              <div class="name">${p.name}</div>
              <div class="price">${price}</div>
              <div class="actions">
                <button class="btn-secondary js-add-to-cart" data-id="${p.id}">Thêm vào giỏ</button>
                <a class="btn-secondary" href="product.html?id=${p.id}">Xem</a>
              </div>
            </div>
          </div>
        `;
      }).join('')}</div>
    `;
    addHtmlMsg(html);
    const log = $('chatLog');
    if(!log) return;
    const latest = log.lastElementChild;
    if(latest){ renderProductCards(latest.querySelector('.product-cards'), items); }
  }

  function scoreProductByText(product, text){
    const t = simplifyText(text);
    const name = simplifyText(product.name);
    let score = 0;
    const rules = [
      { keys: ['ao', 'shirt', 'so mi', 'polo', 'hoodie', 'blazer', 'khoac', 'cardigan'], boost: 3, test: /ao|shirt|so mi|polo|hoodie|blazer|khoac|cardigan/ },
      { keys: ['quan', 'jean', 'chinos', 'jogger', 'short'], boost: 3, test: /quan|jean|chinos|jogger|short/ },
      { keys: ['vay', 'dam', 'dress', 'skirt'], boost: 3, test: /vay|dam|dress|skirt/ },
      { keys: ['giay', 'sneaker', 'loafer', 'boot'], boost: 3, test: /giay|sneaker|loafer|boot/ },
      { keys: ['tui', 'vi', 'bag', 'wallet'], boost: 3, test: /tui|vi|bag|wallet/ },
      { keys: ['that lung', 'belt'], boost: 3, test: /that lung|belt/ },
      { keys: ['phu kien', 'accessory'], boost: 2, test: /phu kien|accessory/ }
    ];
    rules.forEach(r => {
      if(r.test.test(t) && r.test.test(name)) score += r.boost;
    });
    if(t.includes('nam') && product.category === 'men') score += 2;
    if(t.includes('nu') && product.category === 'women') score += 2;
    if(t.includes('phu kien') && product.category === 'accessories') score += 2;
    return score;
  }

  async function getSuggestedProducts(text, profile, limit=4){
    const catalog = await getCatalog();
    if(!catalog.length) return [];
    const scored = catalog.map(p => ({ p, s: scoreProductByText(p, text) }))
      .sort((a,b)=>b.s-a.s);
    let picks = scored.filter(x => x.s > 0).slice(0, limit).map(x=>x.p);
    if(picks.length < limit){
      const gender = (profile && profile.gender) || 'unisex';
      const pool = catalog.filter(p => gender === 'unisex' || p.category === gender);
      while(picks.length < limit && pool.length){
        const cand = pool[Math.floor(Math.random()*pool.length)];
        if(!picks.find(x=>x.id===cand.id)) picks.push(cand);
      }
    }
    return picks.slice(0, limit);
  }

  // Infer gender from free text and update the form/profile
  function applyGenderOverrideFromText(text){
    try{
      const t = String(text||'').toLowerCase();
      let override = null;
      if(t.includes('nam') || t.includes('men') || t.includes('male')) override = 'men';
      else if(t.includes('nữ') || t.includes('women') || t.includes('female')) override = 'women';
      else if(t.includes('unisex')) override = 'unisex';
      if(override){
        const current = $('gender').value;
        if(current !== override){
          $('gender').value = override;
          const updated = collectProfile();
          saveProfile(updated);
          try{ window.showToast && window.showToast(`Đã nhận diện yêu cầu và chuyển giới tính sang "${override==='men'?'Nam':override==='women'?'Nữ':'Unisex'}".`, 'info'); }catch(_){ }
        }
      }
    }catch(_){ /* ignore */ }
  }

  async function askAdvisor(userText, imageBase64 = null, imageMimeType = null){
    const profile = collectProfile();
    saveProfile(profile);
    const history = Array.from($('chatLog').querySelectorAll('.msg'))
      .map(el => ({ role: el.classList.contains('user') ? 'user' : 'assistant', content: el.textContent }));
    const res = await fetch('/api/tu-van-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hoSoKhachHang: profile,
        cauHoi: userText,
        history,
        imageBase64,
        imageMimeType
      })
    });
    const data = await res.json();
    if(!res.ok || (data && data.error)){
      throw new Error((data && data.error) || 'Server error');
    }
    $('sourceBadge').textContent = 'Nguồn: Gemini';
    return data || {};
  }

  function findProductsByKeywords(catalog, keywords, limit=6, gender=''){
    if(!Array.isArray(catalog) || !catalog.length) return [];
    const raw = Array.isArray(keywords)
      ? keywords
      : String(keywords||'').split(/[,;\n]/g);
    const keys = raw.map(k=>simplifyText(k)).filter(Boolean);
    if(!keys.length) return [];

    const mapWord = (k) => {
      const repl = [
        ['white','trang'],['black','den'],['beige','be'],['gray','xam'],['grey','xam'],
        ['shirt','ao'],['tshirt','ao thun'],['t-shirt','ao thun'],['tee','ao thun'],
        ['polo','ao polo'],['dress','dam'],['skirt','vay'],['pants','quan'],['trousers','quan tay'],
        ['jeans','jean'],['jacket','ao khoac'],['blazer','blazer'],['coat','ao khoac'],
        ['bag','tui'],['handbag','tui'],['wallet','vi'],['belt','that lung'],
        ['shoes','giay'],['loafer','loafer'],['sneaker','sneaker']
      ];
      let out = k;
      repl.forEach(([a,b]) => { out = out.replace(new RegExp(`\\b${a}\\b`,'g'), b); });
      return out;
    };

    const genderKey = gender === 'women' ? 'nu' : (gender === 'men' ? 'nam' : '');
    const expanded = keys.flatMap(k => {
      const mapped = simplifyText(mapWord(k));
      const base = [k, mapped].filter(Boolean);
      if(genderKey){
        return base.concat(base.map(b => `${b} ${genderKey}`));
      }
      return base;
    });

    const scored = catalog.map(p=>{
      const name = simplifyText(p.name);
      let score = 0;
      expanded.forEach(k=>{ if(name.includes(k)) score += 4; });
      return { p, score };
    }).sort((a,b)=>b.score-a.score);
    return scored.filter(x=>x.score>0).slice(0, limit).map(x=>x.p);
  }

  function buildRuleBasedAdvice(profile, note){
    const {
      gender = 'unisex', age, height_cm, weight_kg,
      occasions = [], colors = [], fit_preference = 'regular',
      climate = 'temperate', budget = 'mid'
    } = profile || {};

    // Heuristics: infer gender/occasion/colors from free-text "note"
    const text = String(note||'').toLowerCase();
    const hasAny = (arr)=>arr.some(k=>text.includes(k));
    const genderOverride = hasAny(['nam','men','male']) ? 'men' : (hasAny(['nữ','women','female']) ? 'women' : null);
    const occHints = new Set(occasions);
    if(hasAny(['công sở','office','đi làm'])) occHints.add('office');
    if(hasAny(['đi chơi','casual'])) occHints.add('casual');
    if(hasAny(['tiệc','party'])) occHints.add('party');
    if(hasAny(['lễ','formal','sự kiện trang trọng'])) occHints.add('formal');
    const wantNeutral = hasAny(['trung tính','neutral']);

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

    let palette = colors.length ? colors : (climate === 'tropical' ? ['trắng','be','pastel','xanh biển'] : ['đen','xám','navy','trắng']);
    if(wantNeutral){ palette = ['đen','xám','trắng','navy']; }

    const effGender = genderOverride || gender;
    const basePieces = (()=>{
      const common = ['áo thun chất lượng', 'quần jean vừa vặn', 'áo sơ mi cổ điển', 'giày đa dụng'];
      if(effGender === 'women') return ['váy midi', 'áo blouse', 'quần ống rộng', ...common];
      if(effGender === 'men') return ['áo polo', 'quần chinos', 'áo khoác nhẹ', ...common];
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
          effGender==='men' ? `Sơ mi ${fit}, quần tây/chinos` : `Sơ mi/blouse ${fit}, quần tây/đầm công sở`,
          effGender==='men' ? `Giày tây/loafer, thắt lưng cùng tông` : `Giày cao gót/loafer, túi tối giản`,
        ],
        party: [
          `Áo/blouse thời thượng, quần/váy nhấn nhá`,
          `Giày cao gót/boot (nữ) hoặc loafer (nam)`,
        ],
        formal: [
          effGender==='men' ? `Suit ${fit}, sơ mi trắng` : `Vest/suit ${fit}, sơ mi/blouse trắng`,
          `Giày da, thắt lưng/túi cùng tông`,
        ]
      };
      return pick[occ] || pick.casual;
    };

    const effOccs = Array.from(occHints);
    const occs = (effOccs.length ? effOccs : ['casual','office']);
    const outfits = occs.map(occ=>({ occasion: occ, suggestions: byOccasion(occ) }));

    const tips = [
      bodyNote,
      `Bảng màu gợi ý: ${palette.join(', ')}`,
      climate === 'tropical' ? 'Chất liệu thoáng mát (cotton, linen), màu sáng.' : 'Layer hợp lý, chất liệu giữ ấm (len, dạ).',
      budget === 'low' ? 'Tập trung vào các món cơ bản dễ phối, bền.' : budget === 'high' ? 'Đầu tư một vài món signature chất lượng cao.' : 'Cân bằng cơ bản và một vài món điểm nhấn.'
    ];

    const head = note ? `Nhu cầu: ${note}` : '';
    const intentNote = genderOverride ? `Đã nhận diện "${genderOverride==='men'?'nam':'nữ'}" trong yêu cầu và tối ưu gợi ý theo giới tính này.` : '';
    const reply = [
      head,
      intentNote,
      'Dựa trên thông tin của bạn, đây là gợi ý phong cách:',
      `Các món cơ bản nên có: ${basePieces.join(', ')}.`,
      'Một số set đồ theo dịp:',
      ...outfits.map(o=>`- ${o.occasion}: ${o.suggestions.join(' | ')}`),
      `Mẹo thêm: ${tips.join(' | ')}`
    ].filter(Boolean).join('\n');

    return { reply, data: { bmi, palette, basePieces, outfits, tips } };
  }

  function boot(){
    try{
      const p = getProfile();
      fillForm(p);
      addMsg('assistant', 'Xin chào! Mô tả nhanh nhu cầu của bạn (ví dụ: set đồ đi làm, màu trung tính, phù hợp thời tiết nóng...).');

      const saveBtn = $('saveProfile');
      if(saveBtn){
        saveBtn.addEventListener('click', () => {
          const updated = collectProfile();
          saveProfile(updated);
          addMsg('assistant', 'Đã lưu hồ sơ. Bạn muốn tư vấn cho dịp nào?');
        });
      }

      const send = $('sendBtn');
      if(send){
        send.addEventListener('click', async () => {
          const input = $('userMsg');
          const txt = input && input.value ? input.value.trim() : '';
          if(!txt) return;
          if(input) input.value = '';
          addMsg('user', txt);
          applyGenderOverrideFromText(txt);
          addMsg('assistant', 'Đang phân tích hồ sơ và nhu cầu…');
          try{
            const data = await askAdvisor(txt, cachedImageBase64, cachedImageMime);
            const replyText = data.loi_tu_van || data.reply || 'Xin lỗi, chưa có gợi ý phù hợp.';
            const log = $('chatLog');
            const last = log && log.lastElementChild;
            if(last && last.classList.contains('bot')) last.textContent = replyText;
            else addMsg('assistant', replyText);
            // Suggest matching products in chat
            try{
              const catalog = await getCatalog();
              const picks = findProductsByKeywords(catalog, data.tu_khoa_tim_kiem, 6, profile.gender);
              if(picks.length){
                addProductCardsToChat('Sản phẩm đề xuất từ AI', picks);
              } else {
                const profile = collectProfile();
                const fallback = await getSuggestedProducts(`${txt} ${replyText}`, profile, 4);
                if(fallback.length){ addProductCardsToChat('Gợi ý bổ sung', fallback); }
              }
            }catch(_){ /* ignore */ }
          }catch(e){
            $('sourceBadge').textContent = 'Nguồn: Lỗi kết nối';
            addMsg('assistant', 'Không kết nối được tới AI. Vui lòng kiểm tra server và thử lại.');
          }
        });
      }

      // Image search feature
      const imgInput = $('imageSearchInput');
      const imgTrigger = $('imageSearchTrigger');
      const imgPreview = $('imagePreview');
      const imgNote = $('imageSearchNote');
      const imgResults = $('imageSearchResults');

      let cachedImageFile = null;
      let cachedImageBase64 = null;
      let cachedImageMime = null;
      function previewImage(file){
        if(!imgPreview) return;
        if(!file){ imgPreview.textContent = 'Chọn ảnh để phân tích'; return; }
        const url = URL.createObjectURL(file);
        imgPreview.innerHTML = `<img src="${url}" alt="preview">`;
      }

      function fileToResizedBase64(file, maxSize=1000){
        return new Promise((resolve, reject)=>{
          const img = new Image();
          const reader = new FileReader();
          reader.onload = () => { img.src = String(reader.result || ''); };
          reader.onerror = reject;
          img.onload = () => {
            const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
            const w = Math.round(img.width * ratio);
            const h = Math.round(img.height * ratio);
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
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

      function getAvgColor(img){
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 40;
        canvas.width = size; canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0,0,size,size).data;
        let r=0,g=0,b=0,count=0;
        let varR=0,varG=0,varB=0;
        for(let i=0;i<data.length;i+=4){
          r += data[i]; g += data[i+1]; b += data[i+2]; count++;
        }
        const avg = { r:Math.round(r/count), g:Math.round(g/count), b:Math.round(b/count) };
        for(let i=0;i<data.length;i+=4){
          varR += Math.pow(data[i]-avg.r,2);
          varG += Math.pow(data[i+1]-avg.g,2);
          varB += Math.pow(data[i+2]-avg.b,2);
        }
        const contrast = Math.sqrt((varR+varG+varB)/(count*3));
        const { s } = rgbToHsl(avg.r, avg.g, avg.b);
        const palette = colorPaletteFromPixels(data);
        return { avg, saturation: s, contrast, palette };
      }

      function colorToLabel({r,g,b}){
        const max = Math.max(r,g,b);
        const min = Math.min(r,g,b);
        const light = (r+g+b)/3;
        if(light < 80) return 'dark';
        if(light > 180) return 'light';
        if(max === r) return 'warm';
        if(max === b) return 'cool';
        return 'neutral';
      }

      async function findSimilarByImage(file){
        if(!file) return [];
        const img = new Image();
        const url = URL.createObjectURL(file);
        return new Promise((resolve) => {
          img.onload = async () => {
            try{
              const stats = getAvgColor(img);
              const label = colorToLabel(stats.avg);
              const style = detectStyleFromImageStats(stats);
              if(imgNote){
                const palette = stats.palette.join(', ');
                imgNote.textContent = `Phong cách: ${style}. Màu chủ đạo: ${palette}.`;
              }
              addMsg('assistant', `AI nhận diện phong cách ảnh: ${style}. Bảng màu chính: ${stats.palette.join(', ')}.`);
              const catalog = await getCatalog();
              const profile = collectProfile();
              const gender = profile.gender || 'unisex';
              const scored = catalog.map(p => {
                const name = simplifyText(p.name);
                let score = 0;
                if(gender !== 'unisex' && p.category === gender) score += 2;
                if(label === 'dark' && /(den|black)/.test(name)) score += 3;
                if(label === 'light' && /(trang|white|be|kem)/.test(name)) score += 3;
                if(label === 'warm' && /(nau|brown|vang|gold)/.test(name)) score += 2;
                if(label === 'cool' && /(xanh|blue)/.test(name)) score += 2;
                if(style.includes('Formal') && /(so mi|blazer|vest|tui|giay|loafer|quan tay)/.test(name)) score += 3;
                if(style.includes('Streetwear') && /(hoodie|oversize|jogger|sneaker)/.test(name)) score += 3;
                if(style.includes('Minimal') && /(so mi|quan tay|ao polo|tui|giay)/.test(name)) score += 2;
                if(style.includes('Casual') && /(ao thun|jean|polo|sneaker)/.test(name)) score += 2;
                return { p, score };
              }).sort((a,b)=>b.score-a.score);
              const picks = scored.filter(x=>x.score>0).slice(0,4).map(x=>x.p);
              if(picks.length < 4){
                const pool = catalog.slice();
                while(picks.length < 4 && pool.length){
                  const cand = pool.splice(Math.floor(Math.random()*pool.length),1)[0];
                  if(!picks.find(x=>x.id===cand.id)) picks.push(cand);
                }
              }
              resolve(picks);
            }catch(_){ resolve([]); }
          };
          img.onerror = () => resolve([]);
          img.src = url;
        });
      }

      async function handleImageSearch(){
        if(!cachedImageFile){ if(imgNote) imgNote.textContent = 'Vui lòng chọn ảnh trước.'; return; }
        if(imgNote) imgNote.textContent = 'Đang phân tích ảnh...';
        const picks = await findSimilarByImage(cachedImageFile);
        if(imgNote){
          const base = imgNote.textContent && !/Đang phân tích/.test(imgNote.textContent) ? imgNote.textContent : '';
          const tail = picks.length ? 'Gợi ý sản phẩm tương tự bên dưới.' : 'Chưa tìm thấy sản phẩm phù hợp.';
          imgNote.textContent = base ? `${base} ${tail}` : tail;
        }
        renderProductCards(imgResults, picks);
      }

      if(imgInput){
        imgInput.addEventListener('change', async (e)=>{
          cachedImageFile = e.target.files && e.target.files[0] ? e.target.files[0] : null;
          cachedImageBase64 = null;
          cachedImageMime = cachedImageFile ? (cachedImageFile.type || 'image/jpeg') : null;
          previewImage(cachedImageFile);
          if(cachedImageFile){
            try{
              const resized = await fileToResizedBase64(cachedImageFile, 1000);
              cachedImageBase64 = resized.base64;
              cachedImageMime = resized.mime;
            }catch(_){ cachedImageBase64 = null; }
            handleImageSearch();
          }
        });
      }
      if(imgTrigger){ imgTrigger.addEventListener('click', ()=>{ imgInput && imgInput.click(); }); }

      window.sgbStyleAdvisorBooted = true;
    }catch(err){
      safeAddMsg('assistant', 'Khởi tạo AI gặp lỗi: ' + (err && err.message ? err.message : err));
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  }else{
    // run soon to ensure DOM exists
    setTimeout(boot, 0);
  }
})();