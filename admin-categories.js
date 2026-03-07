(function(){
  const refreshBtn = document.getElementById('refresh');
  const table = document.getElementById('list');
  const tbody = table.querySelector('tbody');
  const empty = document.getElementById('empty');
  const guard = document.getElementById('guard');

  const nameEl = document.getElementById('name');
  const descEl = document.getElementById('description');
  const activeEl = document.getElementById('active');
  const submitBtn = document.getElementById('submit');
  const resetBtn = document.getElementById('reset');

  let editingId = null;

  function getLogged(){ try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; } }
  function requireAdmin(){
    const l = getLogged();
    const ok = !!(l && l.role === 'admin');
    guard.style.display = ok ? 'none' : '';
    return ok;
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  async function load(){
    tbody.innerHTML = '';
    table.style.display = 'none';
    empty.textContent = 'Đang tải...';
    try{
      const res = await fetch('/api/categories');
      if(!res.ok) throw new Error('Không thể tải danh mục');
      const cats = await res.json();
      if(!Array.isArray(cats) || cats.length === 0){ empty.textContent = 'Chưa có danh mục.'; return; }
      cats.forEach(c=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.id}</td>
          <td>${escapeHtml(c.name)}</td>
          <td>${c.active ? 'Đang dùng' : 'Ẩn'}</td>
          <td>${escapeHtml(c.description||'')}</td>
          <td>
            <button class="btn" data-act="edit" data-id="${c.id}">Sửa</button>
            <button class="btn" data-act="delete" data-id="${c.id}">Xóa</button>
          </td>`;
        tbody.appendChild(tr);
      });
      table.style.display = '';
      empty.textContent = '';
    }catch(err){ empty.textContent = 'Lỗi: ' + err.message; }
  }

  async function submit(){
    if(!requireAdmin()) return;
    const name = nameEl.value.trim();
    const description = descEl.value.trim();
    const active = !!activeEl.checked;
    if(!name){ alert('Vui lòng nhập tên'); return; }
    const logged = getLogged();
    const headers = { 'Content-Type':'application/json', 'X-User-Email': logged?.email || '' };
    let url = '/api/categories'; let method = 'POST';
    if(editingId){ url = `/api/categories/${editingId}`; method = 'PUT'; }
    const res = await fetch(url, { method, headers, body: JSON.stringify({ name, description, active }) });
    if(!res.ok){ const txt = await res.text(); alert('Lưu thất bại: ' + txt); return; }
    clearForm();
    await load();
  }

  function clearForm(){
    editingId = null;
    nameEl.value = '';
    descEl.value = '';
    activeEl.checked = true;
  }

  tbody.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const act = btn.dataset.act;
    const id = Number(btn.dataset.id);
    const logged = getLogged();
    if(act === 'delete'){
      if(!requireAdmin()) return;
      const ok = confirm('Xóa danh mục này?'); if(!ok) return;
      const res = await fetch(`/api/categories/${id}`, { method:'DELETE', headers: { 'X-User-Email': logged?.email || '' } });
      if(!res.ok){ alert('Xóa thất bại'); return; }
      await load();
    }else if(act === 'edit'){
      const res = await fetch(`/api/categories/${id}`);
      if(!res.ok){ alert('Không lấy được danh mục'); return; }
      const c = await res.json();
      editingId = id;
      nameEl.value = c.name || '';
      descEl.value = c.description || '';
      activeEl.checked = !!c.active;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  submitBtn.addEventListener('click', (e)=>{ e.preventDefault(); submit(); });
  resetBtn.addEventListener('click', (e)=>{ e.preventDefault(); clearForm(); });
  refreshBtn.addEventListener('click', (e)=>{ e.preventDefault(); load(); });

  load();
})();
