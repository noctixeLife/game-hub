// Панель фильтра: жанры слева, теги выбранного жанра справа
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var fbox = $('fbox'), genresEl = $('genres'), chipsEl = $('chips'), tagq = '';
  var SORT_NAMES = {likes: 'по лайкам', dl: 'по загрузкам', views: 'по просмотрам'};

  var COUNT = {};
  GAMES.forEach(function (g) { COUNT[g.genre] = (COUNT[g.genre] || 0) + 1; });

  function genreById(id) {
    var r = null;
    GENRES.forEach(function (g) { if (g.id === id) r = g; });
    return r;
  }
  function availableTags() {
    return state.genre === 'all' ? ALL_TAGS : genreById(state.genre).tags;
  }

  // Левая колонка: список жанров
  function drawGenres() {
    var items = [{id: 'all', name: 'Все игры', icon: '🎮', count: GAMES.length}].concat(GENRES.map(function (g) {
      return {id: g.id, name: g.name, icon: g.icon, count: COUNT[g.id] || 0};
    }));
    genresEl.innerHTML = items.map(function (g) {
      return '<button class="gitem' + (state.genre === g.id ? ' on' : '') + '" data-g="' + g.id + '">'
        + '<span class="gi">' + g.icon + '</span><span class="gn">' + esc(g.name) + '</span><span class="gc">' + g.count + '</span></button>';
    }).join('');
  }

  // Правая часть: теги выбранного жанра
  function drawChips() {
    var q = tagq.toLowerCase();
    var tags = availableTags().filter(function (t) { return !q || t.toLowerCase().indexOf(q) > -1; });
    var g = genreById(state.genre);
    $('tptitle').textContent = 'Теги: ' + (g ? g.name : 'все жанры');
    chipsEl.innerHTML = tags.length ? tags.map(function (t) {
      return '<button class="chip' + (state.tags[t] ? ' on' : '') + '" data-t="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('') : '<span class="nochip">Такого тега нет</span>';
  }

  // Подпись под фильтром, счётчик активных фильтров, кнопка «Сбросить»
  function sync() {
    var n = update(false), tags = activeTags(), g = genreById(state.genre);
    var parts = ['Найдено игр: ' + n];
    if (g) parts.push('жанр: ' + g.name);
    if (tags.length) parts.push('теги: ' + tags.join(', '));
    if (state.sort) parts.push('сортировка ' + SORT_NAMES[state.sort]);
    if (state.q) parts.push('поиск: «' + state.q + '»');
    $('fnote').textContent = parts.join(' · ');
    var active = (g ? 1 : 0) + tags.length;
    $('fcount').textContent = active;
    $('fcount').style.display = active ? '' : 'none';
    $('reset').style.visibility = (active || state.sort || state.q) ? 'visible' : 'hidden';
  }

  function resetAll() {
    state.genre = 'all'; state.tags = {}; state.sort = ''; state.q = ''; state.page = 1; tagq = '';
    $('tagq').value = ''; $('q').value = '';
    [].forEach.call(document.querySelectorAll('.sbtn'), function (b) { b.classList.remove('on'); });
    drawGenres(); drawChips(); sync();
  }

  // Выбор жанра
  genresEl.addEventListener('click', function (e) {
    var b = e.target.closest('.gitem');
    if (!b) return;
    state.genre = b.getAttribute('data-g');
    var ok = availableTags(), keep = {};
    activeTags().forEach(function (t) { if (ok.indexOf(t) > -1) keep[t] = true; });
    state.tags = keep; state.page = 1; tagq = ''; $('tagq').value = '';
    drawGenres(); drawChips(); sync();
  });

  // Выбор тегов (можно несколько)
  chipsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    var t = b.getAttribute('data-t');
    state.tags[t] = !state.tags[t];
    b.classList.toggle('on', !!state.tags[t]);
    state.page = 1; sync();
  });

  $('tagq').addEventListener('input', function (e) { tagq = e.target.value.trim(); drawChips(); });
  $('q').addEventListener('input', function (e) { state.q = e.target.value.trim(); state.page = 1; sync(); });

  // Сортировка
  [].forEach.call(document.querySelectorAll('.sbtn'), function (b) {
    b.onclick = function () {
      var s = b.getAttribute('data-s'), on = state.sort !== s;
      state.sort = on ? s : '';
      [].forEach.call(document.querySelectorAll('.sbtn'), function (x) { x.classList.toggle('on', x === b && on); });
      state.page = 1; sync();
    };
  });

  $('reset').onclick = resetAll;
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#empty-reset')) resetAll();
  });

  // Сворачивание всей панели по клику на треугольник
  $('ftoggle').onclick = function () {
    var closed = fbox.classList.toggle('closed');
    this.setAttribute('aria-expanded', !closed);
  };

  drawGenres(); drawChips(); sync();
})();
