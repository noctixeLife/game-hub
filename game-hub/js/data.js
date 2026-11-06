// ===== Настройки =====
var PER = 12; // игр на одной странице

// Цвета подсветки карточек: при каждом наведении выбирается случайный
var GLOW_COLORS = ['#2E7BFF', '#FF2E4D', '#35E5FF', '#A855F7', '#FF4FD8', '#2EE59D', '#FFC53D', '#FF8A3D'];

// ===== Жанры (слева) и теги каждого жанра (справа) =====
// Чтобы добавить жанр — допиши объект. icon — любой эмодзи.
var GENRES = [
  {id: 'vn',     name: 'Визуальные новеллы', icon: '📖', tags: ['2D', '2D анимация', 'CG анимация', 'Романтика', 'Комедия', 'Школа', 'Фэнтези', 'Повседневность', 'Сюжетная', 'С озвучкой', 'Длинный сюжет', 'Завершённые']},
  {id: 'rpg',    name: 'RPG',                icon: '⚔️', tags: ['RPG Maker', 'Фэнтези', 'Пиксель-арт', 'Приключения', 'Длинный сюжет', 'Эксклюзив', '2D', 'Для мобильных (APK)', 'Завершённые']},
  {id: 'sim',    name: 'Симуляторы',         icon: '🏠', tags: ['3D', 'SandBox', 'Повседневность', 'Офис', 'Школа', 'Комедия', 'Только для ПК', 'Для iOS', 'Эксклюзив']},
  {id: 'adv',    name: 'Приключения',        icon: '🧭', tags: ['2D', '3D', 'Детектив', 'Мистика', 'Киберпанк', 'Приключения', 'С озвучкой', 'Сюжетная', 'Эксклюзив']},
  {id: 'horror', name: 'Хоррор',             icon: '👻', tags: ['3D', 'Хоррор', 'Мистика', 'Детектив', 'Пиксель-арт', 'С озвучкой', 'Только для ПК', 'Завершённые']},
  {id: 'action', name: 'Экшен',              icon: '💥', tags: ['2D', '3D', 'Киберпанк', 'Пиксель-арт', 'Для мобильных (APK)', 'Только для ПК', 'Эксклюзив', 'Приключения']},
  {id: 'ai',     name: 'AI-арт',             icon: '🤖', tags: ['AI-арт', 'CG анимация', 'Фэнтези', 'Киберпанк', 'Романтика', 'Для iOS', 'Для мобильных (APK)']}
];

// Все теги подряд (для режима «Все игры»), без повторов
var ALL_TAGS = (function () {
  var seen = {}, out = [];
  GENRES.forEach(function (g) {
    g.tags.forEach(function (t) { if (!seen[t]) { seen[t] = 1; out.push(t); } });
  });
  return out;
})();

// ===== Игры =====
// Формат одной игры:
// {id:1, title:'Название', cover:'assets/images/1.jpg', genre:'vn', tags:['2D','Комедия'],
//  views:21300, downloads:4505, likes:47, date:'2026-10-30', size:'296MB', url:'game.html', h:210}
//  cover — путь к картинке (пусто = заглушка), date — дата выхода, h — оттенок заглушки (0–360)
// Ниже — тестовые игры. Когда будут настоящие — замени весь массив GAMES своим.
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

var GAMES = (function () {
  var r = rng(2026), out = [], i, j, g, pool, tags, n, dl, days;
  var names = ['Тёмный замок', 'Ночной город', 'Звёздный путь', 'Лесная тайна', 'Академия', 'Остров грёз', 'Кибер-офис', 'Древний храм', 'Летний лагерь', 'Пустошь', 'Морской бриз', 'Город теней', 'Последний рубеж', 'Тихий дом', 'Огни столицы'];
  var sizes = ['85MB', '120MB', '240MB', '450MB', '1.2GB', '2GB', '3.4GB'];
  for (i = 0; i < 120; i++) {
    g = GENRES[Math.floor(r() * GENRES.length)];
    pool = g.tags.slice(); tags = [];
    n = 2 + Math.floor(r() * 3);
    for (j = 0; j < n && pool.length; j++) tags.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    dl = Math.round(500 + r() * 9500);
    days = 1 + Math.floor(r() * 220);
    out.push({
      id: i + 1,
      title: names[i % names.length] + ' ' + (Math.floor(i / names.length) + 1),
      cover: '',
      genre: g.id,
      tags: tags,
      views: Math.round(dl * (2.5 + r() * 5)),
      downloads: dl,
      likes: Math.round(dl * (0.02 + r() * 0.12)),
      date: new Date(Date.now() - days * 864e5).toISOString().slice(0, 10),
      size: sizes[Math.floor(r() * sizes.length)],
      url: '#',
      h: Math.floor(r() * 360)
    });
  }
  return out;
})();
