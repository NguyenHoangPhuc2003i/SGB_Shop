(function(){
  const refreshBtn = document.getElementById('refresh');
  const table = document.getElementById('list');
  const tbody = table.querySelector('tbody');
  const empty = document.getElementById('empty');
  const guard = document.getElementById('guard');
  const detailBox = document.getElementById('detailBox');
  const detailContent = document.getElementById('detailContent');

  function getLogged(){ try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; } }
  function requireAdmin(){ const l = getLogged(); const ok = !!(l && l.role==='admin'); guard.style.display = ok ? 'none' : ''; return ok; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function fmtTs(ts){ try{ const d=new Date(ts); return d.toLocaleString('vi-VN'); }catch(_){ return ts; } }

  async function load(){
    tbody.innerHTML = ''; table.style.display = 'none'; empty.textContent = 'Đang tải...'; detailBox.style.display='none';
    if(!requireAdmin()) return;
    const logged = getLogged();
    const res = await fetch('/api/ai/logs', { headers:{ 'X-User-Email': logged?.email || '' } });
    if(!res.ok){ empty.textContent = 'Không thể tải'; return; }
    const logs = await res.json();
    if(!Array.isArray(logs) || logs.length===0){ empty.textContent = 'Chưa có nhật ký.'; return; }
    logs.sort((a,b)=> b.id - a.id);
    logs.forEach(x=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${x.id}</td>
        <td>${fmtTs(x.ts||x.createdAt)}</td>
        <td>${escapeHtml(x.userEmail||'')}</td>
        <td>${escapeHtml(x.source||'')}</td>
        <td>
          <button class="btn" data-act="view" data-id="${x.id}">Xem</button>
          <button class="btn" data-act="delete" data-id="${x.id}">Xóa</button>
        </td>`;
      tbody.appendChild(tr);
    });
    table.style.display = '';
    empty.textContent = '';
  }

  async function view(id){
    const logged = getLogged();
    const res = await fetch(`/api/ai/logs/${id}`, { headers:{ 'X-User-Email': logged?.email || '' } });
    if(!res.ok){ alert('Không tải được chi tiết'); return; }
    const e = await res.json();
    const content = [
      `ID: ${e.id}`,
      `Thời gian: ${fmtTs(e.ts||e.createdAt)}`,
      `Email: ${e.userEmail||''}`,
      `Nguồn: ${e.source||''}`,
      '',
      'Hồ sơ:',
      escapeHtml(JSON.stringify(e.profile||{}, null, 2)),
      '',
      'Chat:',
      escapeHtml(JSON.stringify(e.chatHistory||[], null, 2)),
      '',
      'Trả lời:',
      escapeHtml(e.reply||'')
    ].join('\n');
    detailContent.textContent = content;
    detailBox.style.display = '';
    window.scrollTo({ top: document.body.scrollHeight, behavior:'smooth' });
  }

  tbody.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-act]'); if(!btn) return;
    const act = btn.dataset.act; const id = Number(btn.dataset.id);
    if(act==='view'){
      view(id);
    }else if(act==='delete'){
      if(!requireAdmin()) return; const logged = getLogged();
      const ok = confirm('Xóa nhật ký này?'); if(!ok) return;
      const res = await fetch(`/api/ai/logs/${id}`, { method:'DELETE', headers:{ 'X-User-Email': logged?.email || '' } });
      if(!res.ok){ alert('Xóa thất bại'); return; }
      await load();
    }
  });

  refreshBtn.addEventListener('click', (e)=>{ e.preventDefault(); load(); });
  load();
})();
