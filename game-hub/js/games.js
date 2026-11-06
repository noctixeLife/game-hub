// Состояние фильтра: жанр, выбранные теги, поиск по названию, сортировка, страница
var state = {genre: 'all', tags: {}, q: '', sort: '', page: 1};

// Лайки пользователя хранятся в его браузере (localStorage)
var LIKED = (function () {
  try { return JSON.parse(localStorage.getItem('liked') || '{}'); } catch (e) { return {}; }
})();
function saveLiked() { try { localStorage.setItem('liked', JSON.stringify(LIKED)); } catch (e) {} }

// ===== Вспомогательные функции =====
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
  });
}
function fmt(n) { return n.toLocaleString('ru-RU'); }
function daysAgo(date) { return Math.floor((Date.now() - new Date(date)) / 864e5); }
function ago(date) {
  var d = daysAgo(date);
  if (d < 1) return 'сегодня';
  if (d < 7) return d + ' дн. назад';
  if (d < 30) return Math.floor(d / 7) + ' нед. назад';
  if (d < 365) return Math.floor(d / 30) + ' мес. назад';
  return Math.floor(d / 365) + ' г. назад';
}
function isNew(g) { return daysAgo(g.date) <= 7; } // «NEW» ставится сам: игре меньше недели

var ICON_HEART = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 2.6 5 6 5c2 0 3.4 1.1 4 2.2h4C14.6 6.1 16 5 18 5c3.4 0 5.1 3.5 3.6 6.8C19.5 16.4 12 21 12 21z"/></svg>';
var ICON_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>';
var ICON_INFO = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
var ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.2 12.6l-5.2-3V6h1.8v4.6l4.3 2.5-.9 1.5z"/></svg>';
var ICON_DISK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3h12l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 2v5h9V5H7zm5 8a3 3 0 100 6 3 3 0 000-6z"/></svg>';

// ===== Карточка игры =====
function card(g, rank) {
  var liked = !!LIKED[g.id];
  var cover = g.cover
    ? '<img src="' + esc(g.cover) + '" alt="' + esc(g.title) + '" loading="lazy">'
    : '<span class="ph">Обложка</span>';
  var tags = g.tags.slice(0, 3).map(function (t) { return '<span class="ctag">' + esc(t) + '</span>'; }).join('');
  return '<article class="card" data-id="' + g.id + '">'
    + '<a class="cover" href="' + esc(g.url) + '" style="--h1:' + g.h + ';--h2:' + ((g.h + 50) % 360) + '">' + cover
    + (rank ? '<span class="rank' + (rank < 4 ? ' r' + rank : '') + '">' + rank + '</span>' : '')
    + (!rank && isNew(g) ? '<span class="badge">NEW</span>' : '')
    + '<span class="more-btn">' + ICON_INFO + 'Подробнее</span></a>'
    + '<button class="heart' + (liked ? ' on' : '') + '" data-id="' + g.id + '" aria-label="В избранное" aria-pressed="' + liked + '">' + ICON_HEART + '</button>'
    + '<div class="info"><h3><a href="' + esc(g.url) + '">' + esc(g.title) + '</a></h3>'
    + '<div class="ctags">' + tags + '</div>'
    + '<div class="pills"><span class="pill dl">' + ICON_DL + '<b>' + fmt(g.downloads) + '</b></span>'
    + '<span class="pill lk">' + ICON_HEART + '<b class="lkn">' + fmt(g.likes + (liked ? 1 : 0)) + '</b></span></div>'
    + '<div class="foot"><span>' + ICON_CLOCK + ago(g.date) + '</span><span>' + ICON_DISK + esc(g.size) + '</span></div>'
    + '</div></article>';
}

function fillGrid(id, list, ranked) {
  var el = document.getElementById(id);
  el.innerHTML = list.map(function (g, i) { return card(g, ranked ? i + 1 : 0); }).join('');
  [].forEach.call(el.children, function (c, i) {
    c.classList.add('pop');
    c.style.animationDelay = (i * 40) + 'ms';
  });
}

// ===== Фильтрация и сортировка =====
function activeTags() { return Object.keys(state.tags).filter(function (k) { return state.tags[k]; }); }

function filtered() {
  var q = state.q.toLowerCase(), keys = activeTags();
  var list = GAMES.filter(function (g) {
    if (state.genre !== 'all' && g.genre !== state.genre) return false;
    if (q && g.title.toLowerCase().indexOf(q) < 0) return false;
    return keys.every(function (t) { return g.tags.indexOf(t) > -1; });
  });
  var s = state.sort;
  list.sort(function (a, b) {
    if (s === 'likes') return b.likes - a.likes;
    if (s === 'dl') return b.downloads - a.downloads;
    return new Date(b.date) - new Date(a.date);
  });
  return list;
}

// ===== Пагинация =====
function pageList(p, n) {
  var out = [], i;
  if (n <= 7) { for (i = 1; i <= n; i++) out.push(i); return out; }
  out.push(1);
  if (p > 3) out.push('…');
  for (i = Math.max(2, p - 1); i <= Math.min(n - 1, p + 1); i++) out.push(i);
  if (p < n - 2) out.push('…');
  out.push(n);
  return out;
}

function renderPager(pages) {
  var el = document.getElementById('pager');
  if (pages <= 1) { el.innerHTML = ''; return; }
  var h = '<a data-p="' + (state.page - 1) + '" class="' + (state.page === 1 ? 'dis' : '') + '" aria-label="Назад">‹</a>';
  pageList(state.page, pages).forEach(function (p) {
    h += p === '…' ? '<a class="dots">…</a>' : '<a data-p="' + p + '" class="' + (p === state.page ? 'on' : '') + '">' + p + '</a>';
  });
  h += '<a data-p="' + (state.page + 1) + '" class="' + (state.page === pages ? 'dis' : '') + '" aria-label="Вперёд">›</a>';
  el.innerHTML = h;
}

// Главная функция: перерисовывает список «Все игры» по текущему состоянию
function update(scroll) {
  var list = filtered();
  var pages = Math.max(1, Math.ceil(list.length / PER));
  if (state.page > pages) state.page = pages;
  var g3 = document.getElementById('g3');
  if (!list.length) {
    g3.innerHTML = '<div class="empty"><b>Ничего не найдено</b><span>Попробуй убрать часть тегов или сменить жанр</span><button class="btn btn-ghost" id="empty-reset">Сбросить фильтры</button></div>';
  } else {
    fillGrid('g3', list.slice((state.page - 1) * PER, state.page * PER), false);
  }
  renderPager(pages);
  document.getElementById('pinfo').textContent = '(' + list.length + ' игр · страница ' + state.page + ' из ' + pages + ')';
  if (scroll) document.getElementById('all').scrollIntoView({behavior: 'smooth', block: 'start'});
  return list.length;
}

document.getElementById('pager').addEventListener('click', function (e) {
  var a = e.target.closest('a[data-p]');
  if (!a || a.classList.contains('dis')) return;
  state.page = +a.getAttribute('data-p');
  update(true);
});

// ===== Первый показ: топ-10 и список =====
fillGrid('g1', GAMES.slice().sort(function (a, b) { return b.downloads - a.downloads; }).slice(0, 10), true);
fillGrid('g2', GAMES.slice().sort(function (a, b) { return b.likes - a.likes; }).slice(0, 10), true);
update(false);
