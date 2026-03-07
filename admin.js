(function(){
  function fixMojibakeText(){
    // Decode only when classic mojibake markers are present.
    const suspiciousPattern = /[ÃÂÆÄÅÐØ]|ï¿½|�/;
    const utf8Decoder = new TextDecoder('utf-8', { fatal: false });

    function recoverUtf8FromLatin1(input){
      let out = String(input || '');
      if(!out || !suspiciousPattern.test(out)) return out;

      // Some strings are doubly-encoded; decode a few passes until stable.
      for(let i = 0; i < 3; i += 1){
        let allLatin1 = true;
        const bytes = new Uint8Array(out.length);
        for(let j = 0; j < out.length; j += 1){
          const code = out.charCodeAt(j);
          if(code > 255){ allLatin1 = false; break; }
          bytes[j] = code;
        }
        if(!allLatin1) break;
        const decoded = utf8Decoder.decode(bytes);
        if(!decoded || decoded === out) break;
        out = decoded;
      }
      return out;
    }

    const fixes = [
      ['NgÆ°á»i dÃ¹ng','Người dùng'],
      ['Tá»•ng quan','Tổng quan'],
      ['Sáº£n pháº©m','Sản phẩm'],
      ['Danh má»¥c','Danh mục'],
      ['ÄÆ¡n hÃ ng','Đơn hàng'],
      ['MÃ£ giáº£m giÃ¡','Mã giảm giá'],
      ['Trá»Ÿ láº¡i trang chá»§','Trở lại trang chủ'],
      ['LÃ m má»›i','Làm mới'],
      ['Nháº­t kÃ½','Nhật ký'],
      ['Quáº£n lÃ½','Quản lý'],
      ['ThÃªm/Sá»­a','Thêm/Sửa'],
      ['TÃªn','Tên'],
      ['GiÃ¡','Giá'],
      ['Khuyáº¿n mÃ£i','Khuyến mãi'],
      ['KÃ­ch hoáº¡t','Kích hoạt'],
      ['Sáº¯p xáº¿p','Sắp xếp'],
      ['TiÃªu Ä‘á»','Tiêu đề'],
      ['Báº¡n cáº§n Ä‘Äƒng nháº­p','Bạn cần đăng nhập'],
      ['ÄÄƒng nháº­p','Đăng nhập'],
      ['Cáº§n quyá»n admin','Cần quyền admin'],
      ['ChÆ°a cÃ³','Chưa có'],
      ['thÃ¡ng','tháng'],
      ['thÃ´ng','thông'],
      ['MÃ£ Ä‘Æ¡n','Mã đơn'],
      ['há»‡ thá»‘ng','hệ thống'],
      ['hiá»ƒn thá»‹','hiển thị'],
      ['má»›i','mới'],
      ['XÃ³a form','Xóa form'],
      ['LÆ°u','Lưu'],
      ['Thá»‘ng kÃª','Thống kê'],
      ['MÃ´ táº£ AI','Mô tả AI'],
      ['LÃ m má»›i danh sÃ¡ch','Làm mới danh sách'],
      ['Dá»± bÃ¡o flash sale AI','Dự báo flash sale AI'],
      ['TÃ³m táº¯t AI hÃ´m nay','Tóm tắt AI hôm nay'],
      ['Quáº£n lÃ½ Hero Video','Quản lý Hero Video'],
      ['T�.ng quan','Tổng quan'],
      ['Tr�Y lại trang chủ','Trở lại trang chủ'],
      ['Làm m�>i','Làm mới'],
      ['�\'ã �\'�fng ký','đã đăng ký'],
      ['�\'�fng nhập','đăng nhập'],
      ['Đ�fng nhập','Đăng nhập'],
      ['v�>i','với'],
      ['�\'�f','để'],
      ['�\'ơn','đơn'],
      ['�\'ặt','đặt'],
      ['�\'iền','điền'],
      ['�\'ầy','đầy'],
      ['�\'ủ','đủ'],
      ['Tạo tài khoản Admin m�>i','Tạo tài khoản Admin mới'],
      ['t�\'i thi�fu','tối thiểu'],
      ['Không th�f','Không thể'],
      ['dữ li�?u','dữ liệu'],
      ['L�-i','Lỗi'],
      ['hợp l�?!','hợp lệ!'],
      ['Hi�fn th�</ẩn','Hiển thị/ẩn'],
      ['hi�fn th�<','hiển thị'],
      ['h�? th�\'ng','hệ thống'],
      ['Thương hi�?u','Thương hiệu'],
      ['Giá g�\'c','Giá gốc'],
      ['li�?u','liệu'],
      ['Biến th�f','Biến thể'],
      ['biến th�f','biến thể'],
      ['T�"n kho','Tồn kho'],
      ['B�T sưu tập','Bộ sưu tập'],
      ['Tiêu �\'ề','Tiêu đề'],
      ['Ngu�"n','Nguồn'],
      ['Phần tr�fm','Phần trăm'],
      ['S�\' tiền','Số tiền'],
      ['Mi�.n','Miễn'],
      ['Giá tr�<','Giá trị'],
      ['Th�\'ng kê','Thống kê'],
      ['T�.ng hợp','Tổng hợp'],
      ['T�.ng �\'ơn','Tổng đơn'],
      ['Doanh thu (�\')','Doanh thu (đ)'],
      ['S�\' lượng','Số lượng'],
      ['Chuy�fn khoản','Chuyển khoản'],
      ['Ví �\'i�?n tử','Ví điện tử'],
      ['0�\'','0đ'],
      ['�O ','❌ '],
      ['�o. ','✅ '],
      ['Tï¿½.ng quan','Tổng quan'],
      ['Trï¿½Y láº¡i trang chá»§','Trở lại trang chủ'],
      ['LÃ m mï¿½>i','Làm mới'],
      ['Báº¡n cáº§n ï¿½\'ï¿½fng nháº­p vï¿½>i quyá»n admin ï¿½\'ï¿½f','Bạn cần đăng nhập với quyền admin để'],
      ['Äï¿½fng nháº­p','Đăng nhập'],
      ['ThÃ¡ng trÆ°ï¿½>c','Tháng trước'],
      ['Nháº­p ï¿½\'Æ¡n local tá»« trÃ¬nh duyï¿½?t','Nhập đơn local từ trình duyệt'],
      ['Nháº­p ï¿½\'Æ¡n local','Nhập đơn local'],
      ['Tï¿½.ng ï¿½\'Æ¡n','Tổng đơn'],
      ['0ï¿½\'','0đ'],
      ['GiÃ¡ trï¿½< ï¿½\'Æ¡n trung bÃ¬nh','Giá trị đơn trung bình'],
      ['Cáº£nh bÃ¡o tï¿½"n kho tháº¥p','Cảnh báo tồn kho thấp'],
      ['KhÃ´ng thï¿½f táº£i dá»¯ liï¿½?u ï¿½\'Æ¡n hÃ ng','Không thể tải dữ liệu đơn hàng'],
      ['ÄÃ£ hoÃ n táº¥t: ${count} ï¿½\'Æ¡n','Đã hoàn tất: ${count} đơn'],
      ['Doanh thu (ï¿½\')','Doanh thu (đ)'],
      ['Sï¿½\' lÆ°á»£ng','Số lượng'],
      ['Chuyï¿½fn khoáº£n','Chuyển khoản'],
      ['VÃ­ ï¿½\'iï¿½?n tá»­','Ví điện tử'],
      ['T�n','Tên'],
      ['tr�','trò'],
      ['t�c','tác'],
      ['X�a','Xóa'],
      ['t�i kho�n','tài khoản'],
      ['�ã �ăng k�','đã đăng ký'],
      ['�ăng','đăng'],
      ['k�','ký']
    ];

    function normalizeString(raw){
      let txt = recoverUtf8FromLatin1(raw);
      fixes.forEach(([bad, good]) => {
        if(txt.includes(bad)) txt = txt.split(bad).join(good);
      });
      return txt;
    }

    function normalizeNodeText(node){
      if(!node || typeof node.nodeValue !== 'string') return;
      const current = node.nodeValue;
      const fixed = normalizeString(current);
      if(fixed !== current) node.nodeValue = fixed;
    }

    function normalizeAttributes(root){
      root.querySelectorAll('*').forEach(el => {
        ['placeholder','title','value'].forEach(attr => {
          const raw = el.getAttribute && el.getAttribute(attr);
          if(!raw) return;
          const fixed = normalizeString(raw);
          if(fixed !== raw) el.setAttribute(attr, fixed);
        });
      });
    }

    function normalizeTree(root){
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(normalizeNodeText);
      normalizeAttributes(root);
    }

    normalizeTree(document.body);

    if(document.title){
      document.title = normalizeString(document.title);
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if(mutation.type === 'characterData'){
          normalizeNodeText(mutation.target);
        }
        if(mutation.type === 'childList'){
          mutation.addedNodes.forEach((node) => {
            if(node.nodeType === Node.TEXT_NODE){
              normalizeNodeText(node);
            }else if(node.nodeType === Node.ELEMENT_NODE){
              normalizeTree(node);
            }
          });
        }
      });
      if(document.title) document.title = normalizeString(document.title);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function injectIconFont(){
    if(document.getElementById('admin-icon-font')) return;
    const link = document.createElement('link');
    link.id = 'admin-icon-font';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    document.head.appendChild(link);
  }

  function applyNavIcons(){
    const iconMap = {
      '/admin.html': 'fa-solid fa-users',
      '/admin-dashboard.html': 'fa-solid fa-chart-line',
      '/admin-products.html': 'fa-solid fa-shirt',
      '/admin-inventory.html': 'fa-solid fa-warehouse',
      '/admin-categories.html': 'fa-solid fa-layer-group',
      '/admin-orders.html': 'fa-solid fa-box-open',
      '/admin-coupons.html': 'fa-solid fa-ticket',
      '/admin-banners.html': 'fa-solid fa-photo-film',
      '/admin-ai-logs.html': 'fa-solid fa-microchip'
    };
    document.querySelectorAll('.admin-nav a').forEach(a => {
      if(a.dataset.iconized === '1') return;
      const href = String(a.getAttribute('href') || '').toLowerCase();
      const iconClass = iconMap[href] || 'fa-solid fa-circle';
      const label = (a.textContent || '').trim();
      a.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i><span>${label}</span>`;
      a.dataset.iconized = '1';
    });
  }

  function normalizeStatusText(raw){
    const text = String(raw || '').trim().toLowerCase();
    const has = (k) => text.includes(k);
    if(has('chờ') || has('pending')) return { type:'pending', label: raw };
    if(has('đóng gói') || has('packing')) return { type:'packing', label: raw };
    if(has('đang giao') || has('shipping')) return { type:'shipping', label: raw };
    if(has('hoàn thành') || has('completed') || has('active') || has('đang dùng') || has('hiển thị')) return { type:'success', label: raw };
    if(has('hủy') || has('cancel') || has('ẩn') || has('inactive') || has('tắt')) return { type:'danger', label: raw };
    if(has('hết hạn') || has('expired')) return { type:'warning', label: raw };
    return null;
  }

  function decorateStatusCells(scope){
    const root = scope || document;
    root.querySelectorAll('table.table tbody tr').forEach(tr => {
      tr.querySelectorAll('td').forEach(td => {
        if(td.querySelector('select,button,img,.status-badge')) return;
        const raw = (td.textContent || '').trim();
        if(!raw || raw.length > 26) return;
        const info = normalizeStatusText(raw);
        if(!info) return;
        td.innerHTML = `<span class="status-badge status-${info.type}">${raw}</span>`;
      });
    });
  }

  function ensurePaginationContainer(table){
    if(!table || !table.parentElement) return null;
    let wrap = table.parentElement.querySelector(`.admin-pagination[data-for="${table.id || 'table'}"]`);
    if(wrap) return wrap;
    wrap = document.createElement('div');
    wrap.className = 'admin-pagination';
    wrap.dataset.for = table.id || 'table';
    wrap.innerHTML = `
      <button type="button" class="btn btn-outline" data-act="prev">Trước</button>
      <span class="admin-pagination-info">Trang 1/1</span>
      <button type="button" class="btn btn-outline" data-act="next">Sau</button>
    `;
    table.insertAdjacentElement('afterend', wrap);
    return wrap;
  }

  function paginateTable(table, pageSize){
    if(!table) return;
    const body = table.querySelector('tbody');
    if(!body) return;
    const rows = Array.from(body.querySelectorAll('tr'));
    const total = rows.length;
    const size = Math.max(1, Number(pageSize) || 8);
    const pages = Math.max(1, Math.ceil(total / size));
    const pager = ensurePaginationContainer(table);
    if(!pager) return;

    if(total <= size){
      pager.style.display = 'none';
      rows.forEach(r => { r.style.display = ''; });
      return;
    }
    pager.style.display = 'flex';

    let page = Math.min(Number(table.dataset.page || 1), pages);
    const info = pager.querySelector('.admin-pagination-info');
    const prev = pager.querySelector('[data-act="prev"]');
    const next = pager.querySelector('[data-act="next"]');

    const render = () => {
      const start = (page - 1) * size;
      const end = start + size;
      rows.forEach((r, idx) => { r.style.display = (idx >= start && idx < end) ? '' : 'none'; });
      if(info) info.textContent = `Trang ${page}/${pages} (${total} dòng)`;
      if(prev) prev.disabled = page <= 1;
      if(next) next.disabled = page >= pages;
      table.dataset.page = String(page);
    };

    if(!pager.dataset.bound){
      pager.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-act]');
        if(!btn) return;
        const act = btn.dataset.act;
        if(act === 'prev' && page > 1) page -= 1;
        if(act === 'next' && page < pages) page += 1;
        render();
      });
      pager.dataset.bound = '1';
    }
    render();
  }

  function enhanceTable(table, opts){
    if(!table) return;
    const options = opts || {};
    decorateStatusCells(table);
    paginateTable(table, options.pageSize || 8);
  }

  function setActiveNav(){
    try{
      const path = (location.pathname||'').split('/').pop().toLowerCase();
      document.querySelectorAll('.admin-nav a').forEach(a=>{
        const href = a.getAttribute('href')||'';
        a.classList.toggle('active', href.toLowerCase().endsWith(path));
      });
    }catch(e){/* noop */}
  }
  function applyTheme(theme){
    const root = document.documentElement;
    root.dataset.theme = theme;
    try{
      localStorage.setItem('adminTheme', theme);
      const btn = document.getElementById('adminThemeToggle');
      if(btn){ btn.textContent = theme==='dark' ? 'Theme 🌙' : 'Theme 🌞'; }
    }catch(e){/* noop */}
  }
  function initTheme(){
    try{
      const saved = localStorage.getItem('adminTheme');
      if(saved=== 'light' || saved=== 'dark') return applyTheme(saved);
    }catch(e){/* ignore */}
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }
  function toggleTheme(){
    const current = document.documentElement.dataset.theme||'dark';
    applyTheme(current==='dark' ? 'light' : 'dark');
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    injectIconFont();
    fixMojibakeText();
    applyNavIcons();
    setActiveNav();
    initTheme();
    const btn = document.getElementById('adminThemeToggle');
    if(btn){ btn.addEventListener('click', toggleTheme); }
    document.querySelectorAll('table.table').forEach(table => enhanceTable(table, { pageSize: 8 }));
  });

  window.AdminUI = {
    enhanceTable,
    decorateStatusCells,
    paginateTable,
    applyNavIcons
  };
})();
