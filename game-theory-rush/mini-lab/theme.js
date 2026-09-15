/* ============================================================
   CBS Academy 全站主题（2026-09-05）
   - 默认浅色（未设置过则 light），用户手动切换后写入 localStorage['cbs_theme'] 并记忆
   - 在 <head> 同步引入：先于渲染设置 data-theme，避免深色用户看到白屏闪烁
   - 自动注入右下角浮动切换按钮；页面若自设按钮，请在引入本脚本前设置
       window.CBS_THEME_BTN = false;
   - 对外接口：window.CBSTheme.get() / .set('dark'|'light') / .toggle()
   ============================================================ */
(function () {
  var KEY = 'cbs_theme';

  function read() {
    try { return localStorage.getItem(KEY) || 'light'; } catch (e) { return 'light'; }
  }

  function paint(t) {
    try { document.documentElement.setAttribute('data-theme', t); } catch (e) { /* noop */ }
    var b = document.getElementById('cbsThemeBtn');
    if (b) {
      b.textContent = (t === 'dark') ? '\u2600\uFE0F' : '\uD83C\uDF19';   // ☀️ / 🌙
      b.title = (t === 'dark') ? '切换为浅色' : '切换为深色';
      b.setAttribute('aria-label', b.title);
    }
  }

  function set(t) {
    t = (t === 'dark') ? 'dark' : 'light';
    try { localStorage.setItem(KEY, t); } catch (e) { /* 隐私模式忽略 */ }
    paint(t);
  }

  paint(read());   // 同步执行，避免闪白

  window.CBSTheme = {
    get: read,
    set: set,
    toggle: function () { set(read() === 'dark' ? 'light' : 'dark'); }
  };

  // 同浏览器其它标签页同步
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) paint(e.newValue || 'light');
  });

  function mount() {
    if (window.CBS_THEME_BTN === false) return;
    if (document.getElementById('cbsThemeBtn')) return;
    var b = document.createElement('button');
    b.id = 'cbsThemeBtn';
    b.className = 'cbs-theme-btn';
    b.type = 'button';
    b.onclick = function () { window.CBSTheme.toggle(); };
    b.textContent = (read() === 'dark') ? '\u2600\uFE0F' : '\uD83C\uDF19';
    b.title = (read() === 'dark') ? '切换为浅色' : '切换为深色';
    b.setAttribute('aria-label', b.title);
    document.body.appendChild(b);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
