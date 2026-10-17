// オフラインでも開けるようにするキャッシュ。版を上げると古いキャッシュは消える。
const VERSION = 'v1-2026-10-17';
const SHELL = [
  './',
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/data.js',
  'js/stage.js',
  'js/speech.js',
  'js/player.js',
  'js/store.js',
  'js/ease.js',
  'js/kit2d.js',
  'data/index.json',
  'manifest.webmanifest',
  'fonts/nunito-latin-800-normal.woff2',
  'fonts/nunito-latin-700-normal.woff2',
  'icons/icon-192.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url);
  // 一覧データは新しいものを優先（オフライン時はキャッシュ）
  if (url.pathname.endsWith('/data/index.json')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  // それ以外はキャッシュ優先、なければ取得して保存（シーンや3D部品は初回表示時に保存される）
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
