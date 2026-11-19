// オフラインで使うための仕組み（このファイルは tools/build-sw.mjs が作る。直接編集しない）
const VERSION = 'kyozai-234370fc5f9b';
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css",
  "data/index.json",
  "data/rika/6/01.json",
  "data/rika/6/02.json",
  "data/rika/6/03.json",
  "data/rika/6/04.json",
  "data/rika/6/05.json",
  "data/rika/6/06.json",
  "data/rika/6/07.json",
  "data/rika/6/08.json",
  "data/rika/6/09.json",
  "data/rika/6/10.json",
  "data/search-index.json",
  "figures/rika/6/01-2.svg",
  "figures/rika/6/01-3.svg",
  "figures/rika/6/01-4.svg",
  "figures/rika/6/01-5.svg",
  "figures/rika/6/01-6.svg",
  "figures/rika/6/02-2.svg",
  "figures/rika/6/02-3.svg",
  "figures/rika/6/02-4.svg",
  "figures/rika/6/02-5.svg",
  "figures/rika/6/02-6.svg",
  "figures/rika/6/02-7.svg",
  "figures/rika/6/03-2.svg",
  "figures/rika/6/03-3.svg",
  "figures/rika/6/03-4.svg",
  "figures/rika/6/03-6.svg",
  "figures/rika/6/04-2.svg",
  "figures/rika/6/04-4.svg",
  "figures/rika/6/04-5.svg",
  "figures/rika/6/05-3.svg",
  "figures/rika/6/05-4.svg",
  "figures/rika/6/05-5.svg",
  "figures/rika/6/05-7.svg",
  "figures/rika/6/05-9.svg",
  "figures/rika/6/06-2.svg",
  "figures/rika/6/06-3.svg",
  "figures/rika/6/06-4.svg",
  "figures/rika/6/07-12.svg",
  "figures/rika/6/07-2.svg",
  "figures/rika/6/07-6.svg",
  "figures/rika/6/07-9.svg",
  "figures/rika/6/08-2.svg",
  "figures/rika/6/08-5.svg",
  "figures/rika/6/08-7.svg",
  "figures/rika/6/09-10.svg",
  "figures/rika/6/09-2.svg",
  "figures/rika/6/09-4.svg",
  "figures/rika/6/09-6.svg",
  "figures/rika/6/09-8.svg",
  "figures/rika/6/10-2.svg",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "js/app.js",
  "js/config.js",
  "js/data.js",
  "js/draft.js",
  "js/draftview.js",
  "js/export.js",
  "js/materials.js",
  "js/memo.js",
  "js/memoview.js",
  "js/modal.js",
  "js/progress.js",
  "js/render.js",
  "js/router.js",
  "js/search.js",
  "js/store.js",
  "js/sync.js",
  "js/validate.js"
];

// ブラウザに残った古いファイルを混ぜないよう、保存するときは必ずサーバーから取り直す
self.addEventListener('install', (event) => {
  const fresh = ASSETS.map((url) => new Request(url, { cache: 'reload' }));
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(fresh)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('kyozai-') && k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// ページとデータは「まず通信、だめなら保存分」。図や画面の部品は「まず保存分」。
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  const fresh = req.mode === 'navigate' || url.pathname.endsWith('.json');
  event.respondWith(fresh ? networkFirst(req) : cacheFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req.mode === 'navigate' ? './' : req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req.mode === 'navigate' ? './' : req, { ignoreSearch: true });
    if (hit) return hit;
    throw new Error('offline');
  }
}

async function cacheFirst(req) {
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) (await caches.open(VERSION)).put(req, res.clone());
  return res;
}
