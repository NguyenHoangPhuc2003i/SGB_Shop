(function(){
  const refreshBtn = document.getElementById('refresh');
  const presetEl = document.getElementById('preset');
  const fromEl = document.getElementById('from');
  const toEl = document.getElementById('to');
  const importLocalBtn = document.getElementById('importLocalBtn');

  let charts = { day:null, week:null, month:null, top:null, payment:null };

  function getLogged(){ try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; } }
  function requireAdmin(){ const l = getLogged(); const ok = !!(l && l.role==='admin'); document.getElementById('guard').style.display = ok ? 'none' : ''; return ok; }
  function formatVND(n){ try{ return Number(n).toLocaleString('vi-VN',{style:'currency',currency:'VND'}); }catch{ return String(n)+'đ'; } }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function setPreset(p){
    const today = new Date();
    if(p === 'day'){
      const d = today.toISOString().slice(0,10);
      fromEl.value = d; toEl.value = d;
    }else if(p === 'week'){
      const to = today; const from = new Date(today); from.setDate(from.getDate()-6);
      fromEl.value = from.toISOString().slice(0,10);
      toEl.value = to.toISOString().slice(0,10);
    }else if(p === 'month'){
      const y = today.getFullYear(); const m = today.getMonth();
      const from = new Date(y, m, 1);
      const to = new Date(y, m+1, 0);
      fromEl.value = from.toISOString().slice(0,10);
      toEl.value = to.toISOString().slice(0,10);
    }else if(p === 'lastMonth'){
      const y = today.getFullYear(); const m = today.getMonth()-1;
      const from = new Date(y, m, 1);
      const to = new Date(y, m+1, 0);
      fromEl.value = from.toISOString().slice(0,10);
      toEl.value = to.toISOString().slice(0,10);
    }
  }

  async function load(){
    if(!requireAdmin()) return;
    const from = fromEl.value; const to = toEl.value;
    const logged = getLogged();
    // orders in range
    const url = `/api/orders?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url, { headers: { 'X-User-Email': logged?.email || '' } });
    if(!res.ok){ alert('Không thể tải đơn hàng'); return; }
    const orders = await res.json();
    renderOrders(orders, { from, to });
    // low inventory
    const lowRes = await fetch(`/api/inventory/low?threshold=5`, { headers: { 'X-User-Email': logged?.email || '' } });
    if(lowRes.ok){ const data = await lowRes.json(); renderLowStock(data.items||[]); }
  }

  function renderOrders(orders, range){
    const count = orders.length;
    const revenue = orders.reduce((s,o)=> s + (Number(o.total)||0), 0);
    const avg = count ? Math.round(revenue / count) : 0;
    document.getElementById('ordersCount').textContent = count;
    document.getElementById('revenueTotal').textContent = formatVND(revenue);
    document.getElementById('avgOrder').textContent = formatVND(avg);
    document.getElementById('ordersNote').textContent = `${range.from} → ${range.to}`;
    document.getElementById('revenueNote').textContent = `${count} đơn trong khoảng`;

    // Day chart
    const byDay = groupBy(orders, o=> new Date(o.createdAt).toISOString().slice(0,10), o=> Number(o.total)||0, (a,b)=> a+b);
    charts.day && charts.day.destroy();
    charts.day = new Chart(document.getElementById('chartDay'), { type:'line', data:{ labels:Object.keys(byDay), datasets:[{ data:Object.values(byDay), label:'Doanh thu/ngày', borderColor:'#0ea5a4', backgroundColor:'rgba(14,165,164,0.15)', tension:0.2 }] }, options:{ plugins:{ legend:{ display:false } } } });

    // Week chart
    const byWeek = groupBy(orders, o=> weekKey(new Date(o.createdAt)), o=> Number(o.total)||0, (a,b)=> a+b);
    charts.week && charts.week.destroy();
    charts.week = new Chart(document.getElementById('chartWeek'), { type:'bar', data:{ labels:Object.keys(byWeek), datasets:[{ data:Object.values(byWeek), label:'Doanh thu/tuần', backgroundColor:'#3b82f6' }] }, options:{ plugins:{ legend:{ display:false } } } });

    // Month chart
    const byMonth = groupBy(orders, o=> monthKey(new Date(o.createdAt)), o=> Number(o.total)||0, (a,b)=> a+b);
    charts.month && charts.month.destroy();
    charts.month = new Chart(document.getElementById('chartMonth'), { type:'bar', data:{ labels:Object.keys(byMonth), datasets:[{ data:Object.values(byMonth), label:'Doanh thu/tháng', backgroundColor:'#f59e0b' }] }, options:{ plugins:{ legend:{ display:false } } } });

    // Top products by qty in range
    const qtyMap = new Map();
    orders.forEach(o=>{ (o.items||[]).forEach(it=>{ qtyMap.set(it.name||`#${it.id}`, (qtyMap.get(it.name||`#${it.id}`)||0) + (Number(it.qty)||0)); }); });
    const top = Array.from(qtyMap.entries()).sort((a,b)=> b[1]-a[1]).slice(0,8);
    charts.top && charts.top.destroy();
    charts.top = new Chart(document.getElementById('chartTop'), { type:'bar', data:{ labels: top.map(t=> t[0]), datasets:[{ label:'Số lượng', data: top.map(t=> t[1]), backgroundColor:'#10b981' }] }, options:{ plugins:{ legend:{ display:false } }, indexAxis:'y' } });

    // Payment methods
    const pm = { cod:0, bank:0, wallet:0 };
    orders.forEach(o=>{ const k = (String(o.payment||'cod')); pm[k] = (pm[k]||0) + 1; });
    charts.payment && charts.payment.destroy();
    charts.payment = new Chart(document.getElementById('chartPayment'), { type:'doughnut', data:{ labels:['COD','Chuyển khoản','Ví điện tử'], datasets:[{ data:[pm.cod||0, pm.bank||0, pm.wallet||0], backgroundColor:['#111','#3b82f6','#ef4444'] }] }, options:{ plugins:{ legend:{ position:'bottom' } } } });
  }

  function renderLowStock(items){
    const wrap = document.getElementById('lowStock');
    wrap.innerHTML = '';
    if(!items || items.length===0){ wrap.textContent = 'Tạm thời không có cảnh báo.'; return; }
    items.slice(0,20).forEach(x=>{
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `${x.cover?`<img src="${escapeHtml(x.cover)}">`:''}<span>${escapeHtml(x.productName)}</span><span class="status">${escapeHtml(x.size)} | ${escapeHtml(x.color)}</span><span>Còn: ${x.stock}</span>`;
      wrap.appendChild(div);
    });
  }

  function groupBy(arr, keyFn, valFn, reduceFn){
    const m = new Map();
    arr.forEach(x=>{ const k = keyFn(x); const v = valFn(x); m.set(k, m.has(k) ? reduceFn(m.get(k), v) : v); });
    return Object.fromEntries(Array.from(m.entries()).sort((a,b)=> (''+a[0]).localeCompare(''+b[0])));
  }
  function weekKey(d){
    const day = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = day.getUTCDay() || 7;
    day.setUTCDate(day.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(day.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((day - yearStart) / 86400000) + 1) / 7);
    return `${day.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
  }
  function monthKey(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }

  // events
  presetEl.addEventListener('change', ()=>{ setPreset(presetEl.value); load(); });
  refreshBtn.addEventListener('click', ()=> load());
  importLocalBtn.addEventListener('click', async ()=>{
    if(!requireAdmin()) return;
    try{
      const local = JSON.parse(localStorage.getItem('sgb_orders')||'[]');
      if(!Array.isArray(local) || local.length===0){ alert('Không có đơn local để nhập.'); return; }
      for(const o of local){
        await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(o) });
      }
      alert('Đã nhập đơn local lên server.');
      await load();
    }catch(e){ alert('Nhập thất bại: ' + e.message); }
  });

  // init
  if(requireAdmin()){
    setPreset('month');
    load();
  }
})();
