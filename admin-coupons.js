(function(){
  const refreshBtn = document.getElementById('refresh');
  const table = document.getElementById('list');
  const tbody = table.querySelector('tbody');
  const empty = document.getElementById('empty');
  const guard = document.getElementById('guard');

  const codeEl = document.getElementById('code');
  const typeEl = document.getElementById('type');
  const valueEl = document.getElementById('value');
  const expiresEl = document.getElementById('expiresAt');
  const activeEl = document.getElementById('active');
  const submitBtn = document.getElementById('submit');
  const resetBtn = document.getElementById('reset');

  let editingId = null;

  function getLogged(){ try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; } }
  function requireAdmin(){ const l = getLogged(); const ok = !!(l && l.role==='admin'); guard.style.display = ok ? 'none' : ''; return ok; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  async function load(){
    tbody.innerHTML = ''; table.style.display = 'none'; empty.textContent = 'Đang tải...';
    if(!requireAdmin()) return;
    const logged = getLogged();
    const res = await fetch('/api/coupons', { headers:{ 'X-User-Email': logged?.email || '' } });
    if(!res.ok){ empty.textContent = 'Không thể tải'; return; }
    const coupons = await res.json();
    if(!Array.isArray(coupons) || coupons.length===0){ empty.textContent = 'Chưa có mã giảm giá.'; return; }
    coupons.forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${escapeHtml(c.code)}</td>
        <td>${escapeHtml(c.type)}</td>
        <td>${c.type==='percent'? c.value+'%' : c.type==='amount'? c.value+'đ' : '—'}</td>
        <td>${c.expiresAt ? escapeHtml(c.expiresAt.slice(0,10)) : '—'}</td>
        <td>${c.active? 'Đang dùng' : 'Ẩn'}</td>
        <td>
            <button class="btn btn-primary" data-act="edit" data-id="${c.id}">Sửa</button>
            <button class="btn btn-danger" data-act="delete" data-id="${c.id}">Xóa</button>
        </td>`;
      tbody.appendChild(tr);
    });
    table.style.display = '';
    empty.textContent = '';
  }

  async function submit(){
    if(!requireAdmin()) return;
    const b = {
      code: codeEl.value.trim().toUpperCase(),
      type: typeEl.value,
      value: Number(valueEl.value||0),
      expiresAt: expiresEl.value ? (new Date(expiresEl.value)).toISOString() : null,
      active: !!activeEl.checked
    };
    if(!b.code){ alert('Vui lòng nhập mã'); return; }
    const logged = getLogged();
    const headers = { 'Content-Type':'application/json', 'X-User-Email': logged?.email || '' };
    let url = '/api/coupons'; let method = 'POST';
    if(editingId){ url = `/api/coupons/${editingId}`; method = 'PUT'; }
    const res = await fetch(url, { method, headers, body: JSON.stringify(b) });
    if(!res.ok){ alert('Lưu thất bại'); return; }
    clearForm(); await load();
  }

  function clearForm(){ editingId = null; codeEl.value=''; typeEl.value='percent'; valueEl.value=''; expiresEl.value=''; activeEl.checked=true; }

  tbody.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-act]'); if(!btn) return;
    const act = btn.dataset.act; const id = Number(btn.dataset.id);
    if(act==='delete'){
      if(!requireAdmin()) return; const logged = getLogged();
      const ok = confirm('Xóa mã này?'); if(!ok) return;
      const res = await fetch(`/api/coupons/${id}`, { method:'DELETE', headers:{ 'X-User-Email': logged?.email || '' } });
      if(!res.ok){ alert('Xóa thất bại'); return; }
      await load();
    }else if(act==='edit'){
      const res = await fetch('/api/coupons', { headers:{ 'X-User-Email': getLogged()?.email || '' } });
      if(!res.ok) return;
      const list = await res.json();
      const c = list.find(x=> Number(x.id)===id); if(!c) return;
      editingId = id; codeEl.value = c.code; typeEl.value=c.type; valueEl.value=c.value; activeEl.checked=!!c.active; expiresEl.value = c.expiresAt ? c.expiresAt.slice(0,10) : '';
      window.scrollTo({ top:0, behavior:'smooth' });
    }
  });

  document.getElementById('submit').addEventListener('click', (e)=>{ e.preventDefault(); submit(); });
  document.getElementById('reset').addEventListener('click', (e)=>{ e.preventDefault(); clearForm(); });
  refreshBtn.addEventListener('click', (e)=>{ e.preventDefault(); load(); });
  load();
})();
