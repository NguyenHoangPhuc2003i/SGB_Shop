(function(){
  const refreshBtn = document.getElementById('refresh');
  const table = document.getElementById('inventoryTable');
  const tbody = table.querySelector('tbody');
  const empty = document.getElementById('empty');
  const guard = document.getElementById('guard');
  const lowStockList = document.getElementById('lowStockList');
  const historyList = document.getElementById('historyList');
  const searchName = document.getElementById('searchName');
  const filterCategory = document.getElementById('filterCategory');
  const clearFilter = document.getElementById('clearFilter');

  let autoRefreshTimer = null;
  let isLoading = false;
  let allItems = [];

  function getLogged(){
    try{ return JSON.parse(localStorage.getItem('sgb_logged_in') || 'null'); }catch(_){ return null; }
  }

  function requireAdmin(){
    const logged = getLogged();
    const ok = !!(logged && logged.role === 'admin');
    guard.style.display = ok ? 'none' : '';
    return ok;
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function formatTs(ts){
    try{ return new Date(ts).toLocaleString('vi-VN'); }catch(_){ return String(ts || ''); }
  }

  function variantKey(productId, size, color){
    return `${String(productId)}|${String(size || '').toLowerCase()}|${String(color || '').toLowerCase()}`;
  }

  async function request(url, opts){
    const logged = getLogged();
    const headers = Object.assign({}, (opts && opts.headers) || {}, { 'X-User-Email': logged?.email || '' });
    const res = await fetch(url, { ...(opts || {}), headers });
    if(!res.ok){
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res.json();
  }

  async function loadLowStock(){
    const data = await request('/api/inventory/low?threshold=5');
    const items = Array.isArray(data.items) ? data.items : [];
    if(!items.length){
      lowStockList.textContent = 'Không có biến thể nào dưới ngưỡng.';
      return;
    }
    lowStockList.innerHTML = items.slice(0, 12).map((x) => (
      `<div class="list-item">${escapeHtml(x.productName)} - ${escapeHtml(x.size)}/${escapeHtml(x.color)}: <b>${Number(x.stock) || 0}</b> (ngưỡng ${Number(x.threshold) || 0})</div>`
    )).join('');
  }

  async function loadHistory(){
    const logs = await request('/api/inventory/history?limit=20');
    if(!Array.isArray(logs) || !logs.length){
      historyList.textContent = 'Chưa có lịch sử.';
      return;
    }
    historyList.innerHTML = logs.map((x) => (
      `<div class="list-item">${formatTs(x.ts)} - ${escapeHtml(x.product_name || x.product_id)} - ${escapeHtml(x.size)}/${escapeHtml(x.color)}: ${Number(x.delta) > 0 ? '+' : ''}${Number(x.delta) || 0} (${escapeHtml(x.reason || '')})</div>`
    )).join('');
  }

  function normalizeText(s){
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function updateCategoryFilter(items){
    if(!filterCategory) return;
    const current = filterCategory.value;
    const categories = Array.from(new Set((Array.isArray(items) ? items : [])
      .map((x) => String(x.category || '').trim())
      .filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'vi'));

    filterCategory.innerHTML = '<option value="">Tất cả danh mục</option>' +
      categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
    if(categories.includes(current)) filterCategory.value = current;
  }

  function getFilteredItems(){
    const keyword = normalizeText(searchName && searchName.value);
    const category = String(filterCategory && filterCategory.value || '').trim();
    return allItems.filter((row) => {
      const nameOk = !keyword || normalizeText(row.product_name).includes(keyword);
      const catOk = !category || String(row.category || '') === category;
      return nameOk && catOk;
    });
  }

  function renderRows(items){
    tbody.innerHTML = '';

    items.forEach((row) => {
      const detail = Array.isArray(row.stock_detail) ? row.stock_detail : [];
      const detailHtml = detail.map((v) => {
        const q = Number(v.quantity) || 0;
        const cls = q <= Number(row.low_stock_threshold || 5) ? 'status-badge status-danger' : 'status-badge status-success';
        return `<div style="margin-bottom:4px"><span class="badge">${escapeHtml(v.size)}</span> <span class="badge">${escapeHtml(v.color)}</span> <span class="${cls}">${q}</span></div>`;
      }).join('') || '<i>Không có biến thể</i>';

      const thumb = row.cover
        ? `<img src="${escapeHtml(row.cover)}" alt="${escapeHtml(row.product_name || '')}" style="width:42px;height:42px;object-fit:cover;border-radius:8px;border:1px solid var(--border)" onerror="this.onerror=null;this.style.display='none'">`
        : '<div style="width:42px;height:42px;border-radius:8px;border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;color:#98a3c7">N/A</div>';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            ${thumb}
            <div>
              <div><b>${escapeHtml(row.product_name || '')}</b></div>
              <div style="font-size:12px;color:#888">${escapeHtml(row.category || '')} ${row.brand ? ('- ' + escapeHtml(row.brand)) : ''}</div>
            </div>
          </div>
        </td>
        <td>${Number(row.total_qty) || 0}</td>
        <td>${Number(row.low_stock_threshold) || 5}</td>
        <td>${detailHtml}</td>
        <td>
          <div style="display:grid;gap:6px;min-width:210px">
            <input type="hidden" data-field="productId" value="${escapeHtml(row.product_id)}">
            <input data-field="size" class="form-control" placeholder="Size vd: M">
            <input data-field="color" class="form-control" placeholder="Màu vd: Black">
            <input data-field="quantity" class="form-control" type="number" min="0" step="1" placeholder="Số lượng mới">
            <input data-field="importQty" class="form-control" type="number" min="1" step="1" placeholder="Nhập thêm">
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn" data-act="quick" title="Ghi đè số mới">Cập nhật nhanh (ghi đè)</button>
              <button class="btn btn-primary" data-act="import" title="Cộng thêm vào số cũ">Nhập kho (+)</button>
            </div>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if(window.AdminUI && window.AdminUI.enhanceTable){
      window.AdminUI.enhanceTable(table, { pageSize: 6 });
    }
  }

  async function load(){
    if(isLoading) return;
    isLoading = true;
    table.style.display = 'none';
    empty.textContent = 'Đang tải...';
    if(!requireAdmin()){
      isLoading = false;
      return;
    }
    try{
      const items = await request('/api/inventory');
      allItems = Array.isArray(items) ? items : [];
      updateCategoryFilter(allItems);
      const filtered = getFilteredItems();
      if(!filtered.length){
        empty.textContent = 'Chưa có dữ liệu kho.';
      }else{
        renderRows(filtered);
        table.style.display = '';
        empty.textContent = '';
      }
      await Promise.all([loadLowStock(), loadHistory()]);
    }catch(err){
      empty.textContent = 'Lỗi: ' + err.message;
    }finally{
      isLoading = false;
    }
  }

  function getRowValues(btn){
    const wrap = btn.closest('tr');
    if(!wrap) return null;
    const productId = wrap.querySelector('[data-field="productId"]')?.value || '';
    const size = wrap.querySelector('[data-field="size"]')?.value || '';
    const color = wrap.querySelector('[data-field="color"]')?.value || '';
    const quantity = Number(wrap.querySelector('[data-field="quantity"]')?.value);
    const importQty = Number(wrap.querySelector('[data-field="importQty"]')?.value);
    return { productId, size, color, quantity, importQty };
  }

  tbody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    if(!requireAdmin()) return;
    const values = getRowValues(btn);
    if(!values || !values.productId) return;
    const act = btn.dataset.act;

    try{
      btn.disabled = true;
      if(act === 'quick'){
        if(!values.size || !values.color || !Number.isFinite(values.quantity) || values.quantity < 0){
          throw new Error('Nhập size/màu/số lượng hợp lệ để cập nhật nhanh.');
        }
        await request(`/api/inventory/${encodeURIComponent(values.productId)}/quick-update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ size: values.size, color: values.color, quantity: values.quantity })
        });
      }
      if(act === 'import'){
        if(!values.size || !values.color || !Number.isFinite(values.importQty) || values.importQty <= 0){
          throw new Error('Nhập size/màu/số lượng nhập hợp lệ.');
        }
        await request(`/api/inventory/${encodeURIComponent(values.productId)}/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ size: values.size, color: values.color, quantity: values.importQty })
        });
      }
      await load();
    }catch(err){
      alert(err.message);
    }finally{
      btn.disabled = false;
    }
  });

  function setupAutoRefresh(){
    if(autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(() => {
      if(document.hidden) return;
      if(!requireAdmin()) return;
      load();
    }, 9000);

    document.addEventListener('visibilitychange', () => {
      if(document.hidden) return;
      if(!requireAdmin()) return;
      load();
    });

    window.addEventListener('beforeunload', () => {
      if(autoRefreshTimer) clearInterval(autoRefreshTimer);
    });
  }

  refreshBtn.addEventListener('click', (e) => {
    e.preventDefault();
    load();
  });

  if(searchName){
    searchName.addEventListener('input', () => {
      const filtered = getFilteredItems();
      table.style.display = filtered.length ? '' : 'none';
      empty.textContent = filtered.length ? '' : 'Không tìm thấy sản phẩm phù hợp.';
      renderRows(filtered);
    });
  }

  if(filterCategory){
    filterCategory.addEventListener('change', () => {
      const filtered = getFilteredItems();
      table.style.display = filtered.length ? '' : 'none';
      empty.textContent = filtered.length ? '' : 'Không tìm thấy sản phẩm phù hợp.';
      renderRows(filtered);
    });
  }

  if(clearFilter){
    clearFilter.addEventListener('click', () => {
      if(searchName) searchName.value = '';
      if(filterCategory) filterCategory.value = '';
      const filtered = getFilteredItems();
      table.style.display = filtered.length ? '' : 'none';
      empty.textContent = filtered.length ? '' : 'Không tìm thấy sản phẩm phù hợp.';
      renderRows(filtered);
    });
  }

  setupAutoRefresh();
  load();
})();
