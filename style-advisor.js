(() => {
  const $ = (id) => document.getElementById(id);

  const defaultProfile = {
    gender: 'women', age: 25, height_cm: 165, weight_kg: 55,
    colors: ['đen','trắng'], occasions: ['casual','office'],
    fit_preference: 'regular', climate: 'temperate', budget: 'mid'
  };

  function getProfile(){
    try{
      const p = JSON.parse(localStorage.getItem('sgb_style_profile')||'null');
      return p || defaultProfile;
    }catch(e){ return defaultProfile; }
  }

  function saveProfile(p){
    try{ localStorage.setItem('sgb_style_profile', JSON.stringify(p)); }catch(e){}
  }

  function fillForm(p){
    $('gender').value = p.gender || 'women';
    $('age').value = p.age || '';
    $('height_cm').value = p.height_cm || '';
    $('weight_kg').value = p.weight_kg || '';
    $('colors').value = Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || '');
    $('fit_preference').value = p.fit_preference || 'regular';
    $('climate').value = p.climate || 'temperate';
    $('budget').value = p.budget || 'mid';
    const occ = new Set((p.occasions||[]).map(String));
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
      occasions,
      colors
    };
  }

  function addMsg(role, text){
    const log = $('chatLog');
    const div = document.createElement('div');
    div.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  async function askAdvisor(userText){
    const profile = collectProfile();
    saveProfile(profile);
    const history = Array.from($('chatLog').querySelectorAll('.msg'))
      .map(el => ({ role: el.classList.contains('user') ? 'user' : 'assistant', content: el.textContent }));
    try{
      const res = await fetch('/api/style-advisor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, chatHistory: history.concat([{ role: 'user', content: userText }]) })
      });
      if(!res.ok) throw new Error('server error');
      const data = await res.json();
      if(data && data.source){ $('sourceBadge').textContent = `Nguồn: ${data.source === 'openai' ? 'AI Cloud' : 'Tư vấn nội bộ (server)'}`; }
      return data.reply || 'Xin lỗi, chưa có gợi ý phù hợp.';
    }catch(e){
      // Client-side rule-based fallback when server is unreachable
      const rb = buildRuleBasedAdvice(profile, userText);
      $('sourceBadge').textContent = 'Nguồn: Tư vấn nội bộ (client)';
      return rb.reply;
    }
  }

  function buildRuleBasedAdvice(profile, note){
    const {
      gender = 'unisex', age, height_cm, weight_kg,
      occasions = [], colors = [], fit_preference = 'regular',
      climate = 'temperate', budget = 'mid'
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

    const occs = (Array.isArray(occasions) && occasions.length ? occasions : ['casual','office']);
    const outfits = occs.map(occ=>({ occasion: occ, suggestions: byOccasion(occ) }));

    const tips = [
      bodyNote,
      `Bảng màu gợi ý: ${palette.join(', ')}`,
      climate === 'tropical' ? 'Chất liệu thoáng mát (cotton, linen), màu sáng.' : 'Layer hợp lý, chất liệu giữ ấm (len, dạ).',
      budget === 'low' ? 'Tập trung vào các món cơ bản dễ phối, bền.' : budget === 'high' ? 'Đầu tư một vài món signature chất lượng cao.' : 'Cân bằng cơ bản và một vài món điểm nhấn.'
    ];

    const head = note ? `Nhu cầu: ${note}` : '';
    const reply = [
      head,
      'Dựa trên thông tin của bạn, đây là gợi ý phong cách:',
      `Các món cơ bản nên có: ${basePieces.join(', ')}.`,
      'Một số set đồ theo dịp:',
      ...outfits.map(o=>`- ${o.occasion}: ${o.suggestions.join(' | ')}`),
      `Mẹo thêm: ${tips.join(' | ')}`
    ].filter(Boolean).join('\n');

    return { reply, data: { bmi, palette, basePieces, outfits, tips } };
  }

  // init
  const p = getProfile();
  fillForm(p);
  addMsg('assistant', 'Xin chào! Mô tả nhanh nhu cầu của bạn (ví dụ: set đồ đi làm, màu trung tính, phù hợp thời tiết nóng...).');

  $('saveProfile').addEventListener('click', () => {
    const updated = collectProfile();
    saveProfile(updated);
    addMsg('assistant', 'Đã lưu hồ sơ. Bạn muốn tư vấn cho dịp nào?');
  });

  $('sendBtn').addEventListener('click', async () => {
    const txt = $('userMsg').value.trim();
    if(!txt) return;
    $('userMsg').value = '';
    addMsg('user', txt);
    addMsg('assistant', 'Đang phân tích hồ sơ và nhu cầu…');
    try{
      const reply = await askAdvisor(txt);
      // replace last placeholder
      const log = $('chatLog');
      const last = log.lastElementChild;
      if(last && last.classList.contains('bot')) last.textContent = reply;
      else addMsg('assistant', reply);
    }catch(e){
      addMsg('assistant', 'Có lỗi khi tư vấn. Vui lòng thử lại.');
    }
  });
})();