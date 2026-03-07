(function(){
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
    setActiveNav();
    initTheme();
    const btn = document.getElementById('adminThemeToggle');
    if(btn){ btn.addEventListener('click', toggleTheme); }
  });
})();
