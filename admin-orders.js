(function(){
  const refreshBtn = document.getElementById('refresh');
  const table = document.getElementById('list');
  const tbody = table.querySelector('tbody');
  const empty = document.getElementById('empty');
  const guard = document.getElementById('guard');
  const detail = document.getElementById('detail');

  const STATUSES = [
    { value:'pending', label:'Chờ xác nhận' },
    { value:'packing', label:'Đang đóng gói' },
    { value:'shipping', label:'Đang giao' },
    { value:'completed', label:'Hoàn thành' },
    { value:'canceled', label:'Đã hủy' }
  ];

  function getLogged(){ try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; } }
  function requireAdmin(){
    const l = getLogged();
    const ok = !!(l && l.role === 'admin');
    guard.style.display = ok ? 'none' : '';
    return ok;
  }
  function formatCurrency(n){ try{ return Number(n).toLocaleString('vi-VN',{style:'currency',currency:'VND'}); }catch{ return String(n); } }
  function formatDate(iso){ try{ const d = new Date(iso); return d.toLocaleString('vi-VN'); }catch{ return String(iso||''); } }
  function statusLabel(v){ const s = STATUSES.find(x=>x.value===String(v)); return s ? s.label : v; }

  async function load(){
    tbody.innerHTML = '';
    table.style.display = 'none';
    detail.style.display = 'none';
    empty.textContent = 'Đang tải...';
    if(!requireAdmin()) return;
    try{
      const logged = getLogged();
      const res = await fetch('/api/orders', { headers: { 'X-User-Email': logged?.email || '' } });
      if(!res.ok) throw new Error('Không thể tải đơn hàng');
      const orders = await res.json();
      if(!Array.isArray(orders) || orders.length===0){ empty.textContent = 'Chưa có đơn hàng.'; return; }
      orders.forEach(o=>{
        const tr = document.createElement('tr');
        const statusSel = `<select data-act="status" data-id="${o.id}">` + STATUSES.map(s=>`<option value="${s.value}" ${o.status===s.value?'selected':''}>${s.label}</option>`).join('') + `</select>`;
        tr.innerHTML = `
          <td>${o.id}</td>
          <td>${escapeHtml(o.name||'')}</td>
          <td>${formatCurrency(o.total||0)}</td>
          <td>${formatDate(o.createdAt)}</td>
          <td>${statusSel}</td>
          <td>
            <button class="btn" data-act="view" data-id="${o.id}">Xem</button>
            <button class="btn" data-act="update" data-id="${o.id}">Cập nhật</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      table.style.display = '';
      empty.textContent = '';
    }catch(err){ empty.textContent = 'Lỗi: ' + err.message; }
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  tbody.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const act = btn.dataset.act;
    const id = String(btn.dataset.id);
    if(act === 'view'){
      await showDetail(id);
    }else if(act === 'update'){
      const sel = tbody.querySelector(`select[data-act="status"][data-id="${id}"]`);
      if(!sel) return;
      await updateStatus(id, sel.value);
    }
  });

  async function showDetail(id){
    if(!requireAdmin()) return;
    detail.innerHTML = 'Đang tải chi tiết...';
    detail.style.display = '';
    try{
      const logged = getLogged();
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { headers: { 'X-User-Email': logged?.email || '' } });
      if(!res.ok) throw new Error('Không thể tải chi tiết');
      const o = await res.json();
      const itemsHtml = (Array.isArray(o.items)?o.items:[]).map(it=>{
        const img = it.image ? `<img src="${escapeHtml(it.image)}">` : '';
        const qty = Number(it.qty || 1);
        const line = Number(it.price||0) * qty;
        return `<div class="item">${img}<span>${escapeHtml(it.name||'')}</span><span class="badge">SL: ${qty}</span><span>${formatCurrency(line)}</span></div>`;
      }).join('');
      detail.innerHTML = `
        <div class="grid">
          <div>
            <div><b>Mã đơn:</b> ${o.id}</div>
            <div><b>Khách:</b> ${escapeHtml(o.name||'')}</div>
            <div><b>Điện thoại:</b> ${escapeHtml(o.phone||'')}</div>
            <div><b>Địa chỉ:</b> ${escapeHtml(o.address||'')}, ${escapeHtml(o.district||'')}, ${escapeHtml(o.city||'')}</div>
            <div><b>Ngày đặt:</b> ${formatDate(o.createdAt)}</div>
            <div><b>Thanh toán:</b> ${escapeHtml(o.payment||'')}</div>
          </div>
          <div>
            <div><b>Trạng thái:</b> <span class="status">${statusLabel(o.status)}</span></div>
            <div><b>Tạm tính:</b> ${formatCurrency(o.subtotal||0)}</div>
            <div><b>Phí ship:</b> ${formatCurrency(o.shippingFee||0)}</div>
            <div><b>Giảm giá:</b> ${formatCurrency(o.discount||0)}</div>
            <div><b>Tổng:</b> ${formatCurrency(o.total||0)}</div>
          </div>
        </div>
        <div class="items">
          <div><b>Mặt hàng:</b></div>
          ${itemsHtml || '<div>Không có mặt hàng.</div>'}
        </div>
      `;
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }catch(err){ detail.innerHTML = 'Lỗi: ' + err.message; }
  }

  async function updateStatus(id, status){
    if(!requireAdmin()) return;
    try{
      const logged = getLogged();
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
        method:'PUT',
        headers: { 'Content-Type':'application/json', 'X-User-Email': logged?.email || '' },
        body: JSON.stringify({ status })
      });
      if(!res.ok) throw new Error('Cập nhật trạng thái thất bại');
      await load();
      await showDetail(id);
    }catch(err){ alert(err.message); }
  }

  refreshBtn.addEventListener('click', (e)=>{ e.preventDefault(); load(); });
  load();
})();
