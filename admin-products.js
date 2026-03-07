(function(){
  const refreshBtn = document.getElementById('refresh');
  const listTable = document.getElementById('list');
  const tbody = listTable.querySelector('tbody');
  const empty = document.getElementById('empty');
  const guard = document.getElementById('guard');

  const nameEl = document.getElementById('name');
  const categoryEl = document.getElementById('category');
  let categories = [];
  const brandEl = document.getElementById('brand');
  const priceEl = document.getElementById('price');
  const salePriceEl = document.getElementById('salePrice');
  const descEl = document.getElementById('description');
  const descRow = descEl ? descEl.parentElement : null;
  const coverEl = document.getElementById('cover');
  const galleryEl = document.getElementById('gallery');
  const imagesPreview = document.getElementById('imagesPreview');

  const variantsWrap = document.getElementById('variants');
  const addVariantBtn = document.getElementById('addVariant');
  const varSizeEl = document.getElementById('varSize');
  const varColorEl = document.getElementById('varColor');
  const varStockEl = document.getElementById('varStock');
  const varSkuEl = document.getElementById('varSku');
  const submitBtn = document.getElementById('submit');
  const resetBtn = document.getElementById('reset');
  let aiDescResult = null;

  let editingId = null;
  let currentVariants = [];

  function getLogged(){
    try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; }
  }
  function isAdmin(){
    const l = getLogged();
    return !!(l && l.role === 'admin');
  }
  function requireAdminGuard(){
    if(!isAdmin()){
      guard.style.display = '';
      return false;
    }
    guard.style.display = 'none';
    return true;
  }

  function renderVariants(){
    variantsWrap.innerHTML = '';
    currentVariants.forEach((v, idx)=>{
      const row = document.createElement('div');
      row.className = 'variant-row';
      row.innerHTML = `
        <span class="badge">${escapeHtml(v.size)}</span>
        <span class="badge">${escapeHtml(v.color)}</span>
        <span>Tồn: ${Number(v.stock)||0}</span>
        ${v.sku ? `<span>SKU: ${escapeHtml(v.sku)}</span>` : ''}
        <button class="btn" data-act="edit" data-idx="${idx}">Sửa</button>
        <button class="btn" data-act="remove" data-idx="${idx}">Xóa</button>
      `;
      variantsWrap.appendChild(row);
    });
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c])); }

  addVariantBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    const v = {
      size: varSizeEl.value || 'S',
      color: varColorEl.value || '',
      stock: Number(varStockEl.value || 0),
      sku: varSkuEl.value || undefined
    };
    if(!v.color){ alert('Vui lòng nhập màu.'); return; }
    currentVariants.push(v);
    varColorEl.value = '';
    varStockEl.value = '';
    varSkuEl.value = '';
    renderVariants();
  });

  variantsWrap.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const act = btn.dataset.act;
    const idx = Number(btn.dataset.idx);
    if(act === 'remove'){
      currentVariants.splice(idx,1);
      renderVariants();
    }else if(act === 'edit'){
      const v = currentVariants[idx];
      varSizeEl.value = v.size;
      varColorEl.value = v.color;
      varStockEl.value = v.stock;
      varSkuEl.value = v.sku || '';
      currentVariants.splice(idx,1);
      renderVariants();
    }
  });

  coverEl.addEventListener('change', ()=>{
    imagesPreview.innerHTML = '';
    const files = [...(coverEl.files || [])];
    files.forEach(f=>{
      const url = URL.createObjectURL(f);
      const img = document.createElement('img');
      img.src = url; imagesPreview.appendChild(img);
    });
  });
  galleryEl.addEventListener('change', ()=>{
    const files = [...(galleryEl.files || [])];
    files.forEach(f=>{
      const url = URL.createObjectURL(f);
      const img = document.createElement('img');
      img.src = url; imagesPreview.appendChild(img);
    });
  });

  async function loadProducts(){
    tbody.innerHTML = '';
    listTable.style.display = 'none';
    empty.textContent = 'Đang tải...';
    try{
      const res = await fetch('/api/products');
      if(!res.ok) throw new Error('Không thể tải danh sách');
      const products = await res.json();
      if(!Array.isArray(products) || products.length === 0){ empty.textContent = 'Chưa có sản phẩm.'; return; }
      products.forEach(p=>{
        const tr = document.createElement('tr');
        const price = formatCurrency(p.salePrice != null ? p.salePrice : p.price) + (p.salePrice != null ? ` (gốc ${formatCurrency(p.price)})` : '');
        const cover = p.images && p.images.cover ? `<img src="${escapeHtml(p.images.cover)}" style="max-height:40px">` : '';
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.category||'')}</td>
          <td>${escapeHtml(p.brand||'')}</td>
          <td>${price}</td>
          <td>${cover}</td>
          <td>
            <button class="btn" data-act="edit" data-id="${p.id}">Sửa</button>
            <button class="btn" data-act="upload" data-id="${p.id}">Ảnh</button>
            <button class="btn" data-act="delete" data-id="${p.id}">Xóa</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      listTable.style.display = '';
      empty.textContent = '';
      if(window.AdminUI && window.AdminUI.enhanceTable){
        window.AdminUI.enhanceTable(listTable, { pageSize: 8 });
      }
    }catch(err){
      empty.textContent = 'Lỗi: ' + err.message;
    }
  }

  function formatCurrency(n){
    try{ return Number(n).toLocaleString('vi-VN', { style:'currency', currency:'VND' }); }catch{ return String(n); }
  }

  function ensureAIDescriptionTools(){
    if(!descRow || document.getElementById('genDescAI')) return;
    const wrap = document.createElement('div');
    wrap.style.marginTop = '8px';
    wrap.innerHTML = `
      <button id="genDescAI" class="btn btn-outline" type="button">Mô tả AI</button>
      <div id="aiDescResult" class="ai-result">Nhấn "Mô tả AI" để tạo mô tả tự động.</div>
    `;
    descRow.appendChild(wrap);
    aiDescResult = document.getElementById('aiDescResult');
    const btn = document.getElementById('genDescAI');
    if(btn){ btn.addEventListener('click', generateDescriptionWithAI); }
  }

  async function generateDescriptionWithAI(){
    if(!requireAdminGuard()) return;
    const payload = {
      name: (nameEl.value || '').trim(),
      category: (categoryEl.value || '').trim(),
      brand: (brandEl.value || '').trim() || 'SGB',
      tone: 'sang trọng, gọn, dễ bán'
    };
    if(!payload.name){ alert('Nhập tên sản phẩm trước khi tạo mô tả AI'); return; }
    const logged = getLogged();
    if(aiDescResult) aiDescResult.textContent = 'AI đang tạo mô tả...';
    try{
      const res = await fetch('/api/admin/ai/generate-product-description', {
        method:'POST',
        headers: { 'Content-Type':'application/json', 'X-User-Email': logged?.email || '' },
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('Không gọi được AI');
      const data = await res.json();
      if(data.description){
        descEl.value = String(data.description);
        if(aiDescResult) aiDescResult.textContent = `Đã tạo mô tả (${data.source || 'AI'}).`;
      }else if(aiDescResult){
        aiDescResult.textContent = 'AI chưa trả về mô tả.';
      }
    }catch(err){
      if(aiDescResult) aiDescResult.textContent = `Lỗi AI: ${err.message}`;
    }
  }

  async function submitProduct(){
    if(!requireAdminGuard()) return;
    const body = {
      name: nameEl.value.trim(),
      description: descEl.value.trim(),
      category: categoryEl.value,
      brand: brandEl.value.trim(),
      price: Number(priceEl.value || 0),
      salePrice: salePriceEl.value ? Number(salePriceEl.value) : null,
      variants: currentVariants.slice(),
      images: { cover: '', gallery: [] }
    };
    if(!body.name || !body.price){ alert('Vui lòng nhập tên và giá.'); return; }
    if(!editingId && !coverEl.files[0]){ alert('Vui lòng chọn ảnh bìa cho sản phẩm.'); return; }

    const logged = getLogged();
    const headers = { 'Content-Type':'application/json', 'X-User-Email': logged?.email || '' };
    let url = '/api/products'; let method = 'POST';
    if(editingId){ url = `/api/products/${editingId}`; method = 'PUT'; }
    const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
    if(!res.ok){ alert('Lưu thất bại'); return; }
    const saved = await res.json();

    // upload images if chosen
    await uploadImages(saved.id);

    clearForm();
    await loadProducts();
  }

  async function uploadImages(id){
    if(!requireAdminGuard()) return;
    const coverFile = coverEl.files && coverEl.files[0];
    const galleryFiles = galleryEl.files ? [...galleryEl.files] : [];
    if(!coverFile && galleryFiles.length === 0) return;
    const fd = new FormData();
    if(coverFile) fd.append('cover', coverFile);
    galleryFiles.forEach(f=>fd.append('gallery', f));
    const logged = getLogged();
    const res = await fetch(`/api/products/${id}/images`, { method:'POST', headers: { 'X-User-Email': logged?.email || '' }, body: fd });
    if(!res.ok){ alert('Upload ảnh thất bại'); }
  }

  function clearForm(){
    editingId = null;
    nameEl.value = '';
    // default to first active category
    const firstActive = categories.find(c=>c.active);
    categoryEl.value = firstActive ? firstActive.name : '';
    brandEl.value = '';
    priceEl.value = '';
    salePriceEl.value = '';
    descEl.value = '';
    coverEl.value = '';
    galleryEl.value = '';
    imagesPreview.innerHTML = '';
    currentVariants = [];
    renderVariants();
  }

  tbody.addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-act]');
    if(!btn) return;
    const act = btn.dataset.act;
    const id = Number(btn.dataset.id);
    if(act === 'delete'){
      if(!requireAdminGuard()) return;
      const ok = confirm('Xóa sản phẩm này?'); if(!ok) return;
      const logged = getLogged();
      const res = await fetch(`/api/products/${id}`, { method:'DELETE', headers: { 'X-User-Email': logged?.email || '' } });
      if(!res.ok){ alert('Xóa thất bại'); return; }
      await loadProducts();
    }else if(act === 'edit'){
      const res = await fetch(`/api/products/${id}`);
      if(!res.ok){ alert('Không lấy được sản phẩm'); return; }
      const p = await res.json();
      editingId = id;
      nameEl.value = p.name || '';
      categoryEl.value = p.category || 'Áo thun';
      brandEl.value = p.brand || '';
      priceEl.value = p.price || '';
      salePriceEl.value = p.salePrice != null ? p.salePrice : '';
      descEl.value = p.description || '';
      currentVariants = Array.isArray(p.variants) ? p.variants.slice() : [];
      renderVariants();
      imagesPreview.innerHTML = '';
      if(p.images){
        if(p.images.cover){ const img = document.createElement('img'); img.src = p.images.cover; imagesPreview.appendChild(img); }
        (p.images.gallery||[]).forEach(src=>{ const img = document.createElement('img'); img.src = src; imagesPreview.appendChild(img); });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }else if(act === 'upload'){
      // Open file inputs focus
      coverEl.focus();
    }
  });

  submitBtn.addEventListener('click', (e)=>{ e.preventDefault(); submitProduct(); });
  resetBtn.addEventListener('click', (e)=>{ e.preventDefault(); clearForm(); });
  refreshBtn.addEventListener('click', (e)=>{ e.preventDefault(); loadProducts(); });

  async function loadCategories(){
    try{
      const res = await fetch('/api/categories');
      if(!res.ok) throw new Error('Không thể tải danh mục');
      categories = await res.json();
      const active = categories.filter(c=>c.active);
      const opts = active.length ? active : categories;
      categoryEl.innerHTML = opts.map(c=>`<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('') || '<option value="">(Chưa có danh mục)</option>';
      const firstActive = categories.find(c=>c.active);
      categoryEl.value = firstActive ? firstActive.name : (opts[0]?.name || '');
    }catch(err){
      categoryEl.innerHTML = '<option value="Khác">Khác</option>';
    }
  }

  // init
  ensureAIDescriptionTools();
  loadCategories().then(loadProducts);
})();
