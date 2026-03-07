(function(){
  const refreshBtn = document.getElementById('refresh');
  const table = document.getElementById('list');
  const tbody = table.querySelector('tbody');
  const empty = document.getElementById('empty');
  const guard = document.getElementById('guard');
  const detailBox = document.getElementById('detailBox');
  const detailContent = document.getElementById('detailContent');
  let autoRefreshTimer = null;
  let isLoading = false;

  let summaryResult = null;

  function getLogged(){ try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; } }
  function requireAdmin(){ const l = getLogged(); const ok = !!(l && l.role==='admin'); guard.style.display = ok ? 'none' : ''; return ok; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function fmtTs(ts){ try{ const d=new Date(ts); return d.toLocaleString('vi-VN'); }catch(_){ return ts; } }

  function ensureSummaryBox(){
    if(document.getElementById('aiSummaryCard')) return;
    const card = document.createElement('div');
    card.id = 'aiSummaryCard';
    card.className = 'summary-box';
    card.style.marginTop = '12px';
    card.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap">
        <button id="aiSummaryBtn" class="btn btn-outline" type="button">Tóm tắt AI hôm nay</button>
        <small class="muted">Tổng hợp số lượt, nguồn và user chính.</small>
      </div>
      <pre id="aiSummaryResult">Chưa có tóm tắt.</pre>
    `;
    table.insertAdjacentElement('afterend', card);
    summaryResult = document.getElementById('aiSummaryResult');
    const btn = document.getElementById('aiSummaryBtn');
    if(btn){ btn.addEventListener('click', runSummary); }
  }

  async function runSummary(){
    if(!requireAdmin()) return;
    if(summaryResult) summaryResult.textContent = 'Đang tổng hợp...';
    const logged = getLogged();
    try{
      const res = await fetch('/api/admin/ai/logs-summary', { headers:{ 'X-User-Email': logged?.email || '' } });
      if(!res.ok) throw new Error('Không gọi được endpoint tóm tắt');
      const data = await res.json();
      const topUsers = (data.data?.topUsers || []).map(x => `- ${x.email}: ${x.count}`).join('\n');
      const sourceLines = Object.entries(data.data?.bySource || {}).map(([k,v]) => `- ${k}: ${v}`).join('\n');
      const lines = [
        `Ngày: ${data.data?.date || ''}`,
        `Tổng logs: ${data.data?.totalLogs || 0}`,
        'Nguồn:',
        sourceLines || '- Chưa có',
        'Top user:',
        topUsers || '- Chưa có',
        '',
        'Tóm tắt AI:',
        data.summary || 'Không có'
      ];
      if(summaryResult) summaryResult.textContent = lines.join('\n');
    }catch(err){
      if(summaryResult) summaryResult.textContent = `Lỗi tóm tắt: ${err.message}`;
    }
  }

  async function load(){
    if(isLoading) return;
    isLoading = true;
    tbody.innerHTML = ''; table.style.display = 'none'; empty.textContent = 'Đang tải...'; detailBox.style.display='none';
    if(!requireAdmin()) return;
    try{
      const logged = getLogged();
      const res = await fetch('/api/ai/logs', { headers:{ 'X-User-Email': logged?.email || '' } });
      if(!res.ok){
        empty.textContent = 'Không thể tải';
        return;
      }
      const logs = await res.json();
      if(!Array.isArray(logs) || logs.length===0){
        empty.textContent = 'Chưa có nhật ký.';
        return;
      }
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
      if(window.AdminUI && window.AdminUI.enhanceTable){
        window.AdminUI.enhanceTable(table, { pageSize: 8 });
      }
    }finally{
      isLoading = false;
    }
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

  function setupAutoRefresh(){
    if(autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(() => {
      if(document.hidden) return;
      if(!requireAdmin()) return;
      load();
    }, 7000);

    document.addEventListener('visibilitychange', () => {
      if(document.hidden) return;
      if(!requireAdmin()) return;
      load();
    });
  }

  window.addEventListener('beforeunload', () => {
    if(autoRefreshTimer) clearInterval(autoRefreshTimer);
  });

  setupAutoRefresh();
  ensureSummaryBox();
  load();
})();
