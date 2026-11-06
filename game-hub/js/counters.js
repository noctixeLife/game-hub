// Счётчики просмотров, лайков и загрузок.
// Режим «server»: числа общие для всех (нужен /api/stats, см. README).
// Режим «local»: если сервера нет — считается в браузере посетителя (сайт работает и так).
var Stats = (function () {
  var API = '/api/stats', LKEY = 'statsLocal';
  var KEYS = {v: 'views', l: 'likes', d: 'downloads'};
  var mode = 'local', delta = {}, base = {}, seen = {};
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  GAMES.forEach(function (g) { base[g.id] = {v: g.views || 0, l: g.likes || 0, d: g.downloads || 0}; });

  function loadLocal() { try { delta = JSON.parse(localStorage.getItem(LKEY) || '{}'); } catch (e) { delta = {}; } }
  function saveLocal() { if (mode === 'local') { try { localStorage.setItem(LKEY, JSON.stringify(delta)); } catch (e) {} } }

  function get(id, k) {
    var b = base[id] ? base[id][k] : 0, d = delta[id] ? delta[id][k] : 0;
    return Math.max(0, b + d);
  }
  function fmtN(n) { return Math.round(n).toLocaleString('ru-RU'); }

  // Плавный «разгон» числа от from до to
  function animate(el, to, from, dur) {
    if (el._raf) cancelAnimationFrame(el._raf);
    el.setAttribute('data-cur', to);
    if (calm || from === to) { el.textContent = fmtN(to); return; }
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtN(from + (to - from) * e);
      if (p < 1) el._raf = requestAnimationFrame(step); else el.textContent = fmtN(to);
    }
    el._raf = requestAnimationFrame(step);
  }

  // Обновить на экране все числа одной игры / одного вида
  function refresh(id, k, pulse) {
    var q = '.num[data-id="' + id + '"]' + (k ? '[data-k="' + k + '"]' : '');
    [].forEach.call(document.querySelectorAll(q), function (el) {
      var to = get(id, el.getAttribute('data-k')), from = +el.getAttribute('data-cur') || 0;
      if (to === from) return;
      animate(el, to, from, 600);
      if (pulse) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
  }
  function refreshAll() { GAMES.forEach(function (g) { refresh(g.id, null, false); }); }

  // Числа в только что нарисованных карточках: стартуют с 0 и разгоняются, когда карточка видна
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (!it.isIntersecting) return;
      io.unobserve(it.target);
      var el = it.target, to = +el.getAttribute('data-cur') || 0;
      animate(el, to, 0, 900 + Math.random() * 300);
    });
  }, {threshold: .25}) : null;

  function observe(root) {
    [].forEach.call(root.querySelectorAll('.num'), function (el) {
      var to = get(el.getAttribute('data-id'), el.getAttribute('data-k'));
      el.setAttribute('data-cur', to);
      if (io && !calm) { el.textContent = '0'; io.observe(el); } else { el.textContent = fmtN(to); }
    });
  }

  function send(id, type) {
    if (mode !== 'server') return;
    try {
      fetch(API, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id: +id, type: type}), keepalive: true})['catch'](function () {});
    } catch (e) {}
  }
  function bump(id, k, n, type) {
    var d = delta[id] || (delta[id] = {v: 0, l: 0, d: 0});
    d[k] += n; saveLocal(); refresh(id, k, true); send(id, type);
  }

  // Просмотр: один раз за визит на каждую игру
  function view(id) {
    var key = 'v' + id;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch (e) { if (seen[key]) return; seen[key] = 1; }
    bump(id, 'v', 1, 'view');
  }
  function like(id, on) { bump(id, 'l', on ? 1 : -1, on ? 'like' : 'unlike'); }
  function download(id) { bump(id, 'd', 1, 'download'); } // вызывай при клике на кнопку «Скачать»

  // Пробуем подключиться к серверу счётчиков; не вышло — остаёмся на локальных
  function init() {
    loadLocal();
    if (!window.fetch || location.protocol === 'file:') return;
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 4000);
    fetch(API, {cache: 'no-store', signal: ctl ? ctl.signal : undefined}).then(function (r) {
      var ct = r.headers.get('content-type') || '';
      if (!r.ok || ct.indexOf('json') < 0) throw new Error('no api');
      return r.json();
    }).then(function (data) {
      clearTimeout(timer);
      mode = 'server'; delta = {};
      Object.keys(data).forEach(function (id) {
        var s = data[id] || {};
        delta[id] = {v: s.views | 0, l: s.likes | 0, d: s.downloads | 0};
      });
      refreshAll();
    })['catch'](function () { clearTimeout(timer); });
  }

  init();
  return {get: get, observe: observe, view: view, like: like, download: download, mode: function () { return mode; }};
})();
