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

  let editingId = null;
  let pendingImageFile = null;

  function getLogged(){ try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; } }
  function requireAdmin(){ const l = getLogged(); const ok = !!(l && l.role==='admin'); guard.style.display = ok ? 'none' : ''; return ok; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

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
  load();
})();
