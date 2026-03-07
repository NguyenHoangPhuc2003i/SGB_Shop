(function(){
  const refreshBtn = document.getElementById('refresh');
  const table = document.getElementById('list');
  const tbody = table.querySelector('tbody');
  const empty = document.getElementById('empty');
  const guard = document.getElementById('guard');

  const titleEl = document.getElementById('title');
  const sortEl = document.getElementById('sortOrder');
  const activeEl = document.getElementById('active');
  const imageFileEl = document.getElementById('imageFile');
  const imagePreviewEl = document.getElementById('imagePreview');
  const submitBtn = document.getElementById('submit');
  const resetBtn = document.getElementById('reset');
  const formCard = titleEl.closest('fieldset');

  let heroTypeEl = null;
  let heroSrcEl = null;
  let heroMediaFileEl = null;
  let heroPreviewEl = null;
  let heroSaveBtn = null;
  let heroUploadBtn = null;

  let editingId = null;
  let pendingImageFile = null;

  function getLogged(){ try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; } }
  function requireAdmin(){ const l = getLogged(); const ok = !!(l && l.role==='admin'); guard.style.display = ok ? 'none' : ''; return ok; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function ensureHeroSection(){
    if(document.getElementById('heroMediaCard')) return;
    const card = document.createElement('fieldset');
    card.id = 'heroMediaCard';
    card.className = 'card';
    card.style.padding = '0';
    card.innerHTML = `
      <div class="card-header"><div class="card-title">Quản lý Hero Video</div></div>
      <div class="card-body">
        <div class="grid-2">
          <div>
            <label>Loại media</label>
            <select id="heroType">
              <option value="video">Video</option>
              <option value="image">Ảnh</option>
            </select>
          </div>
          <div>
            <label>URL media (tuỳ chọn)</label>
            <input id="heroSrc" type="text" placeholder="/uploads/hero.mp4 hoặc URL">
          </div>
        </div>
        <div style="margin-top:10px">
          <label>Tải file Hero mới</label>
          <input id="heroMediaFile" type="file" accept="video/*,image/*">
        </div>
        <div class="media-preview" id="heroPreview" style="margin-top:10px;color:#a8adbf">Chưa có media.</div>
        <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap">
          <button id="heroUploadBtn" class="btn btn-outline" type="button">Upload file</button>
          <button id="heroSaveBtn" class="btn btn-primary" type="button">Lưu Hero</button>
        </div>
      </div>
    `;
    formCard.insertAdjacentElement('afterend', card);
    heroTypeEl = document.getElementById('heroType');
    heroSrcEl = document.getElementById('heroSrc');
    heroMediaFileEl = document.getElementById('heroMediaFile');
    heroPreviewEl = document.getElementById('heroPreview');
    heroSaveBtn = document.getElementById('heroSaveBtn');
    heroUploadBtn = document.getElementById('heroUploadBtn');

    heroMediaFileEl.addEventListener('change', ()=>{
      const f = heroMediaFileEl.files && heroMediaFileEl.files[0];
      if(!f) return;
      const url = URL.createObjectURL(f);
      const type = String(f.type||'').startsWith('image/') ? 'image' : 'video';
      heroTypeEl.value = type;
      if(type === 'image'){
        heroPreviewEl.innerHTML = `<img src="${url}" class="banner-thumb" alt="hero preview">`;
      }else{
        heroPreviewEl.innerHTML = `<video src="${url}" controls muted playsinline></video>`;
      }
    });
  }

  async function loadHeroMedia(){
    ensureHeroSection();
    if(!requireAdmin()) return;
    const logged = getLogged();
    const res = await fetch('/api/hero-media', { headers:{ 'X-User-Email': logged?.email || '' } });
    if(!res.ok){ heroPreviewEl.textContent = 'Không tải được Hero media'; return; }
    const hero = await res.json();
    heroTypeEl.value = hero.type || 'video';
    heroSrcEl.value = hero.src || '';
    renderHeroPreview(hero.type, hero.src);
  }

  function renderHeroPreview(type, src){
    if(!src){ heroPreviewEl.textContent = 'Chưa có media.'; return; }
    if(type === 'image'){
      heroPreviewEl.innerHTML = `<img src="${escapeHtml(src)}" class="banner-thumb" alt="hero image">`;
    }else{
      heroPreviewEl.innerHTML = `<video src="${escapeHtml(src)}" controls muted playsinline></video>`;
    }
  }

  async function uploadHeroMedia(){
    if(!requireAdmin()) return;
    const file = heroMediaFileEl.files && heroMediaFileEl.files[0];
    if(!file){ alert('Vui lòng chọn file video/ảnh Hero'); return; }
    const logged = getLogged();
    const fd = new FormData();
    fd.append('media', file);
    const res = await fetch('/api/hero-media/upload', { method:'POST', headers:{ 'X-User-Email': logged?.email || '' }, body: fd });
    if(!res.ok){ alert('Upload Hero thất bại'); return; }
    const saved = await res.json();
    heroTypeEl.value = saved.type || 'video';
    heroSrcEl.value = saved.src || '';
    renderHeroPreview(saved.type, saved.src);
    alert('Đã upload Hero media');
  }

  async function saveHeroMedia(){
    if(!requireAdmin()) return;
    const payload = { type: heroTypeEl.value || 'video', src: (heroSrcEl.value || '').trim() };
    if(!payload.src){ alert('Vui lòng nhập hoặc upload media Hero'); return; }
    const logged = getLogged();
    const res = await fetch('/api/hero-media', {
      method:'PUT',
      headers:{ 'Content-Type':'application/json', 'X-User-Email': logged?.email || '' },
      body: JSON.stringify(payload)
    });
    if(!res.ok){ alert('Lưu Hero thất bại'); return; }
    const saved = await res.json();
    renderHeroPreview(saved.type, saved.src);
    alert('Đã lưu Hero media');
  }

  imageFileEl.addEventListener('change', ()=>{
    const f = imageFileEl.files && imageFileEl.files[0];
    pendingImageFile = f || null;
    if(f){
      const url = URL.createObjectURL(f);
      imagePreviewEl.innerHTML = `<img src="${url}" class="banner-thumb" alt="preview">`;
    }else{
      imagePreviewEl.innerHTML = '';
    }
  });

  async function load(){
    tbody.innerHTML = ''; table.style.display = 'none'; empty.textContent = 'Đang tải...';
    if(!requireAdmin()) return;
    const logged = getLogged();
    const res = await fetch('/api/banners/admin', { headers:{ 'X-User-Email': logged?.email || '' } });
    if(!res.ok){ empty.textContent = 'Không thể tải'; return; }
    const banners = await res.json();
    if(!Array.isArray(banners) || banners.length===0){ empty.textContent = 'Chưa có banner.'; return; }
    banners.sort((a,b)=> (a.sortOrder||0)-(b.sortOrder||0));
    banners.forEach(b=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.id}</td>
        <td>${escapeHtml(b.title)}</td>
        <td>${b.image ? `<img src="${escapeHtml(b.image)}" class="banner-thumb">` : '—'}</td>
        <td>${b.active? 'Hiển thị' : 'Ẩn'}</td>
        <td>${b.sortOrder||0}</td>
        <td>
            <button class="btn btn-primary" data-act="edit" data-id="${b.id}">Sửa</button>
            <button class="btn btn-danger" data-act="delete" data-id="${b.id}">Xóa</button>
            <button class="btn btn-outline" data-act="upload" data-id="${b.id}">Tải ảnh</button>
        </td>`;
      tbody.appendChild(tr);
    });
    table.style.display = '';
    empty.textContent = '';
    if(window.AdminUI && window.AdminUI.enhanceTable){
      window.AdminUI.enhanceTable(table, { pageSize: 8 });
    }
  }

  function clearForm(){ editingId=null; titleEl.value=''; sortEl.value=''; activeEl.checked=true; imageFileEl.value=''; imagePreviewEl.innerHTML=''; pendingImageFile=null; }

  async function submit(){
    if(!requireAdmin()) return;
    const b = { title: titleEl.value.trim(), sortOrder: Number(sortEl.value||0), active: !!activeEl.checked };
    if(!b.title){ alert('Vui lòng nhập tiêu đề'); return; }
    const logged = getLogged();
    const headers = { 'Content-Type':'application/json', 'X-User-Email': logged?.email || '' };
    let url = '/api/banners'; let method = 'POST';
    if(editingId){ url = `/api/banners/${editingId}`; method = 'PUT'; }
    const res = await fetch(url, { method, headers, body: JSON.stringify(b) });
    if(!res.ok){ alert('Lưu thất bại'); return; }
    const saved = await res.json();
    // If we have an image selected, upload after save/update
    const id = editingId || saved.id;
    if(pendingImageFile && id){
      const fd = new FormData(); fd.append('image', pendingImageFile);
      const upRes = await fetch(`/api/banners/${id}/image`, { method:'POST', headers:{ 'X-User-Email': logged?.email || '' }, body: fd });
      if(!upRes.ok){ alert('Tải ảnh thất bại'); }
    }
    clearForm(); await load();
  }

  tbody.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-act]'); if(!btn) return;
    const act = btn.dataset.act; const id = Number(btn.dataset.id);
    if(act==='delete'){
      if(!requireAdmin()) return; const logged = getLogged();
      const ok = confirm('Xóa banner này?'); if(!ok) return;
      const res = await fetch(`/api/banners/${id}`, { method:'DELETE', headers:{ 'X-User-Email': logged?.email || '' } });
      if(!res.ok){ alert('Xóa thất bại'); return; }
      await load();
    }else if(act==='edit'){
      const logged = getLogged();
      const res = await fetch('/api/banners/admin', { headers:{ 'X-User-Email': logged?.email || '' } });
      if(!res.ok) return;
      const list = await res.json();
      const b = list.find(x=> Number(x.id)===id); if(!b) return;
      editingId = id; titleEl.value = b.title||''; sortEl.value = b.sortOrder||0; activeEl.checked = !!b.active;
      imagePreviewEl.innerHTML = b.image ? `<img src="${escapeHtml(b.image)}" class="banner-thumb">` : '';
      window.scrollTo({ top:0, behavior:'smooth' });
    }else if(act==='upload'){
      // focus file input for quick upload
      imageFileEl.focus(); imageFileEl.click(); editingId = id;
    }
  });

  document.getElementById('submit').addEventListener('click', (e)=>{ e.preventDefault(); submit(); });
  document.getElementById('reset').addEventListener('click', (e)=>{ e.preventDefault(); clearForm(); });
  refreshBtn.addEventListener('click', (e)=>{ e.preventDefault(); load(); });
  ensureHeroSection();
  if(heroUploadBtn) heroUploadBtn.addEventListener('click', (e)=>{ e.preventDefault(); uploadHeroMedia(); });
  if(heroSaveBtn) heroSaveBtn.addEventListener('click', (e)=>{ e.preventDefault(); saveHeroMedia(); });
  load();
  loadHeroMedia();
})();
