// Поведение карточек: случайная подсветка, подсветка под курсором, наклон, лайки
(function () {
  var last = '';

  // Новый цвет каждый раз, когда курсор заходит на карточку (не такой же, как в прошлый раз)
  function pick() {
    var c;
    do { c = GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)]; } while (c === last && GLOW_COLORS.length > 1);
    last = c;
    return c;
  }

  document.addEventListener('mouseover', function (e) {
    var c = e.target.closest && e.target.closest('.card');
    if (!c || c.contains(e.relatedTarget)) return;
    c.style.setProperty('--glow', pick());
  });

  var tilt = !window.matchMedia('(hover:none)').matches;
  document.addEventListener('mousemove', function (e) {
    var c = e.target.closest && e.target.closest('.card');
    if (!c) return;
    var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--mx', (x * 100) + '%');
    c.style.setProperty('--my', (y * 100) + '%');
    if (tilt) c.style.transform = 'translateY(-6px) perspective(800px) rotateY(' + ((x - .5) * 5) + 'deg) rotateX(' + ((.5 - y) * 5) + 'deg)';
  });
  document.addEventListener('mouseout', function (e) {
    var c = e.target.closest && e.target.closest('.card');
    if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
  });

  // Лайк: меняет сердечко и счётчик на всех карточках этой игры
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.heart');
    if (!b) return;
    e.preventDefault();
    var id = b.getAttribute('data-id'), g = null;
    GAMES.forEach(function (x) { if (String(x.id) === id) g = x; });
    if (!g) return;
    var on = !LIKED[id];
    if (on) LIKED[id] = 1; else delete LIKED[id];
    saveLiked();
    [].forEach.call(document.querySelectorAll('.heart[data-id="' + id + '"]'), function (h) {
      h.classList.toggle('on', on);
      h.setAttribute('aria-pressed', on);
      h.closest('.card').querySelector('.lkn').textContent = fmt(g.likes + (on ? 1 : 0));
      h.classList.remove('beat'); void h.offsetWidth; h.classList.add('beat');
    });
  });
})();
