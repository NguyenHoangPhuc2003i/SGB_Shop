(function(){
  function getLogged(){
    try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; }
  }
  function getStyleProfile(){
    try{ return JSON.parse(localStorage.getItem('sgb_style_profile')||'null'); }catch(e){ return null; }
  }
  function setStyleProfile(p){
    try{ localStorage.setItem('sgb_style_profile', JSON.stringify(p)); }catch(e){ }
  }
  function getProfileStore(){
    try{ return JSON.parse(localStorage.getItem('sgb_profile_store')||'{}'); }catch(e){ return {}; }
  }
  function saveProfileStore(store){
    try{ localStorage.setItem('sgb_profile_store', JSON.stringify(store)); }catch(e){ }
  }
  function normalizeProfile(p){
    return {
      fullName: p?.fullName || p?.name || '',
      phone: p?.phone || '',
      gender: p?.gender || 'unisex',
      height_cm: p?.height_cm || '',
      weight_kg: p?.weight_kg || '',
      colors: p?.colors || '',
      climate: p?.climate || 'temperate',
      budget: p?.budget || 'mid'
    };
  }

  function bindMenu(){
    const items = document.querySelectorAll('.menu-item');
    items.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        items.forEach(i=>i.classList.remove('active'));
        btn.classList.add('active');
        const section = btn.dataset.section;
        document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
        const target = document.getElementById(`section-${section}`);
        if(target) target.classList.add('active');
      });
    });
  }

  function renderHeader(logged){
    const nameEl = document.getElementById('displayName');
    const emailEl = document.getElementById('displayEmail');
    if(nameEl) nameEl.textContent = logged?.name || logged?.fullName || 'Khách';
    if(emailEl) emailEl.textContent = logged?.email || '—';
  }

  function fillForm(data){
    const map = {
      fullName: 'fullName',
      email: 'email',
      phone: 'phone',
      gender: 'gender',
      height_cm: 'height',
      weight_kg: 'weight',
      colors: 'colors',
      climate: 'climate',
      budget: 'budget'
    };
    Object.keys(map).forEach(k=>{
      const el = document.getElementById(map[k]);
      if(!el) return;
      el.value = data[k] ?? '';
    });
  }

  function collectForm(){
    return {
      fullName: document.getElementById('fullName')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      phone: document.getElementById('phone')?.value.trim() || '',
      gender: document.getElementById('gender')?.value || 'unisex',
      height_cm: Number(document.getElementById('height')?.value) || '',
      weight_kg: Number(document.getElementById('weight')?.value) || '',
      colors: document.getElementById('colors')?.value.trim() || '',
      climate: document.getElementById('climate')?.value || 'temperate',
      budget: document.getElementById('budget')?.value || 'mid'
    };
  }

  function syncToStyleProfile(profile){
    const current = getStyleProfile() || {};
    const colors = String(profile.colors || '').split(',').map(s=>s.trim()).filter(Boolean);
    const merged = {
      ...current,
      gender: profile.gender || current.gender,
      height_cm: profile.height_cm ? Number(profile.height_cm) : current.height_cm,
      weight_kg: profile.weight_kg ? Number(profile.weight_kg) : current.weight_kg,
      climate: profile.climate || current.climate,
      budget: profile.budget || current.budget,
      colors
    };
    setStyleProfile(merged);
  }

  function loadOrders(logged, profile){
    const el = document.getElementById('ordersList');
    if(!el) return;
    let orders = [];
    try{ orders = JSON.parse(localStorage.getItem('sgb_orders')||'[]'); }catch(e){ orders = []; }
    const email = logged?.email || '';
    const name = (profile?.fullName || logged?.name || '').toLowerCase();
    const phone = (profile?.phone || '').toLowerCase();
    const filtered = orders.filter(o=>{
      if(email && String(o.email||'').toLowerCase() === email.toLowerCase()) return true;
      if(name && String(o.name||'').toLowerCase() === name) return true;
      if(phone && String(o.phone||'').toLowerCase() === phone) return true;
      return false;
    });

    if(!filtered.length){
      el.className = 'empty';
      el.textContent = 'Chưa có đơn hàng.';
      return;
    }

    el.className = '';
    el.innerHTML = filtered.map(o=>{
      const items = (o.items || []).map(it=>{
        return `
          <div class="order-item">
            <img src="${it.image || ''}" alt="${it.name || ''}">
            <div>
              <div><strong>${it.name || ''}</strong></div>
              <div class="muted">${it.qty || 1} x ${Number(it.price||0).toLocaleString('vi-VN')}đ</div>
            </div>
          </div>
        `;
      }).join('');
      return `
        <div class="order-card">
          <div><strong>Mã đơn:</strong> ${o.id || ''}</div>
          <div><strong>Tổng:</strong> ${Number(o.total||0).toLocaleString('vi-VN')}đ</div>
          <div class="muted">${o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''}</div>
          <div class="order-items">${items}</div>
        </div>
      `;
    }).join('');
  }

  async function loadVouchers(){
    const el = document.getElementById('voucherList');
    if(!el) return;
    try{
      const res = await fetch('/api/coupons/public');
      if(!res.ok) throw new Error('Không thể tải voucher');
      const list = await res.json();
      if(!Array.isArray(list) || list.length === 0){
        el.className = 'empty';
        el.textContent = 'Hiện chưa có voucher.';
        return;
      }
      el.className = '';
      el.innerHTML = list.map(v=>{
        const value = v.type === 'percent' ? `${v.value}%` : v.type === 'amount' ? `${Number(v.value||0).toLocaleString('vi-VN')}đ` : 'Freeship';
        const exp = v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('vi-VN') : 'Không hết hạn';
        return `
          <div class="voucher-card">
            <div class="voucher-code">${v.code || ''}</div>
            <div>Giá trị: <strong>${value}</strong></div>
            <div class="muted">Hết hạn: ${exp}</div>
          </div>
        `;
      }).join('');
    }catch(e){
      el.className = 'empty';
      el.textContent = 'Không thể tải voucher.';
    }
  }

  function bindLogout(){
    const btn = document.getElementById('logoutBtn');
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      localStorage.removeItem('sgb_logged_in');
      window.location.href = 'auth.html';
    });
  }

  function init(){
    bindMenu();
    bindLogout();

    const logged = getLogged();
    renderHeader(logged);

    const guestBlock = document.getElementById('guestBlock');
    if(!logged || !logged.email){
      if(guestBlock) guestBlock.style.display = 'block';
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
      const acc = document.getElementById('section-account');
      if(acc) acc.classList.add('active');
      return;
    }

    const store = getProfileStore();
    const saved = store[logged.email] || {};
    const styleProfile = getStyleProfile();
    const merged = normalizeProfile({
      fullName: logged.name || logged.fullName,
      email: logged.email,
      ...styleProfile,
      ...saved
    });
    merged.email = logged.email || '';

    fillForm(merged);

    const form = document.getElementById('profileForm');
    const saveMsg = document.getElementById('saveMsg');
    if(form){
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const data = collectForm();
        const updated = normalizeProfile(data);
        const store = getProfileStore();
        store[logged.email] = { ...store[logged.email], ...updated };
        saveProfileStore(store);

        // update logged in name
        try{
          const newLogged = { ...logged, name: updated.fullName };
          localStorage.setItem('sgb_logged_in', JSON.stringify(newLogged));
        }catch(e){ }

        syncToStyleProfile(updated);
        if(saveMsg){
          saveMsg.textContent = 'Đã lưu hồ sơ.';
          setTimeout(()=>{ saveMsg.textContent = ''; }, 2000);
        }
      });
    }

    loadOrders(logged, merged);
    loadVouchers();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
