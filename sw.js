// オフラインでも使えるようにするキャッシュ。
// 初回に「画面・全データ・全モーション・3D部品」をまとめて保存するので、電波が切れても連続再生が止まらない。
// 版（VERSION）を上げると古いキャッシュは消える。教材を追加したら必ず上げる。
const VERSION = 'v49-2026-10-24';
const SHELL = [
  './',
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/gate.js',
  'js/data.js',
  'js/stage.js',
  'js/speech.js',
  'js/player.js',
  'js/store.js',
  'js/ease.js',
  'js/kit2d.js',
  'js/tpl.js',
  'js/zukai.js',
  'icons/mame.svg',
  'js/kit3d.js',
  'vendor/three.js',
  'data/index.json',
  'data/search.json',
  'manifest.webmanifest',
  'fonts/nunito-latin-800-normal.woff2',
  'fonts/nunito-latin-700-normal.woff2',
  'icons/icon-192-mame.png'
];

async function precache() {
  const c = await caches.open(VERSION);
  await c.addAll(SHELL);
  // 一覧から、カテゴリ別データと全シーンを割り出して保存
  try {
    const idx = await (await fetch('data/index.json', { cache: 'reload' })).json();
    const files = idx.cats.map((x) => `data/items/${x.id}.json`).concat(idx.items.filter((i) => i.motion && i.motion !== 'tpl').map((i) => `js/scenes/${i.id}.js`));
    // 1件の失敗で全体を止めない
    await Promise.all(files.map((f) => c.add(f).catch(() => {})));
  } catch (e) {
    /* 一覧が取れなくても画面だけは保存済み */
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 通信優先。ただし電波が弱くて3秒たっても返ってこないときは、保存分を先に返す（読み込み中で止まらないように）
const networkFirst = (req) => {
  const net = fetch(req).then((res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(req, copy));
    }
    return res;
  });
  const cached = () => caches.match(req, { ignoreSearch: true });
  const timeout = new Promise((resolve) => setTimeout(() => cached().then((hit) => hit && resolve(hit)), 3000));
  return Promise.race([net.catch(() => cached().then((hit) => hit || Promise.reject(new Error('offline')))), timeout]);
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // 教材データは新しいものを優先（電波がないときは保存分）
  if (url.pathname.includes('/data/')) {
    e.respondWith(networkFirst(req));
    return;
  }
  // それ以外は保存分を優先、なければ取得して保存
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
