// Общие счётчики просмотров / лайков / загрузок для Cloudflare Pages.
// Нужна база Cloudflare D1, подключённая к проекту под именем DB (см. README).
// Хранит только прибавки к числам из js/data.js.

const COLUMN = {view: 'views', like: 'likes', unlike: 'likes', download: 'downloads'};
const SQL = {
  view:     'INSERT INTO stats (id, views) VALUES (?, 1) ON CONFLICT(id) DO UPDATE SET views = views + 1',
  like:     'INSERT INTO stats (id, likes) VALUES (?, 1) ON CONFLICT(id) DO UPDATE SET likes = likes + 1',
  unlike:   'INSERT INTO stats (id, likes) VALUES (?, 0) ON CONFLICT(id) DO UPDATE SET likes = MAX(likes - 1, 0)',
  download: 'INSERT INTO stats (id, downloads) VALUES (?, 1) ON CONFLICT(id) DO UPDATE SET downloads = downloads + 1'
};

let ready = false;
async function ensureTable(db) {
  if (ready) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY, views INTEGER NOT NULL DEFAULT 0, likes INTEGER NOT NULL DEFAULT 0, downloads INTEGER NOT NULL DEFAULT 0)').run();
  ready = true;
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {'Content-Type': 'application/json; charset=utf-8', ...extra}
  });
}

// GET /api/stats -> {"12": {"views": 5, "likes": 2, "downloads": 1}, ...}
export async function onRequestGet({env}) {
  if (!env.DB) return json({error: 'DB binding is missing'}, 500);
  await ensureTable(env.DB);
  const {results} = await env.DB.prepare('SELECT id, views, likes, downloads FROM stats').all();
  const out = {};
  for (const r of results) out[r.id] = {views: r.views, likes: r.likes, downloads: r.downloads};
  return json(out, 200, {'Cache-Control': 'public, max-age=10'});
}

// POST /api/stats  {"id": 12, "type": "view" | "like" | "unlike" | "download"}
export async function onRequestPost({request, env}) {
  if (!env.DB) return json({error: 'DB binding is missing'}, 500);

  // принимаем запросы только с самого сайта
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({error: 'forbidden'}, 403);

  let body;
  try { body = await request.json(); } catch (e) { return json({error: 'bad json'}, 400); }
  const id = Number(body && body.id), type = String(body && body.type);
  if (!Number.isInteger(id) || id < 1 || id > 10000000 || !COLUMN[type]) return json({error: 'bad request'}, 400);

  await ensureTable(env.DB);
  await env.DB.prepare(SQL[type]).bind(id).run();
  return json({ok: true});
}
