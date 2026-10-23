// 語彙データ。一覧（index.json）だけ先に読み、詳細はカテゴリ単位で必要になったときに読む。
let index = null;
const shards = new Map();

export async function loadIndex() {
  if (index) return index;
  const res = await fetch('data/index.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('index ' + res.status);
  index = await res.json();
  index.byId = new Map(index.items.map((it) => [it.id, it]));
  index.catLabel = Object.fromEntries(index.cats.map((c) => [c.id, c.label]));
  return index;
}

function loadShard(cat) {
  if (!shards.has(cat)) {
    shards.set(
      cat,
      fetch(`data/items/${cat}.json`)
        .then((r) => {
          if (!r.ok) throw new Error('shard ' + r.status);
          return r.json();
        })
        .then((list) => new Map(list.map((it) => [it.id, { ...it, cat }])))
        .catch((e) => {
          shards.delete(cat);
          throw e;
        })
    );
  }
  return shards.get(cat);
}

export async function getItem(id) {
  const meta = index.byId.get(id);
  if (!meta) throw new Error('unknown id ' + id);
  let it = (await loadShard(meta.cat)).get(id);
  if (!it) {
    // 一覧だけ新しく、カテゴリのデータが古い（保存データの食い違い）ときは取り直す
    shards.set(
      meta.cat,
      fetch(`data/items/${meta.cat}.json`, { cache: 'reload' })
        .then((r) => {
          if (!r.ok) throw new Error('shard ' + r.status);
          return r.json();
        })
        .then((list) => new Map(list.map((x) => [x.id, { ...x, cat: meta.cat }])))
        .catch((e) => {
          shards.delete(meta.cat);
          throw e;
        })
    );
    it = (await shards.get(meta.cat)).get(id);
    if (!it) throw new Error('missing ' + id);
  }
  return it;
}

// 次に表示しそうな項目のデータを先に読んでおく
export function prefetch(id) {
  const meta = index?.byId.get(id);
  if (meta) loadShard(meta.cat).catch(() => {});
}

// 例文の検索用データ（id・英語の例文・日本語訳）。最初に検索したときだけ読む。
let exMap = null, exLoading = null;
export function loadSearchData() {
  if (exMap) return Promise.resolve(exMap);
  exLoading ||= fetch('data/search.json')
    .then((r) => (r.ok ? r.json() : []))
    .then((rows) => (exMap = new Map(rows.map(([id, en, ja]) => [id, { en: en.toLowerCase(), ja }]))))
    .catch(() => { exLoading = null; return null; });
  return exLoading;
}
export const searchReady = () => !!exMap;
// 並び順：英語が前方一致 → 英語・意味の一部一致 → 例文だけ一致
export function search(q) {
  const raw = q.trim(), s = raw.toLowerCase();
  if (!s) return index.items;
  const a = [], b = [], c = [];
  for (const it of index.items) {
    const en = it.en.toLowerCase();
    if (en.startsWith(s)) a.push(it);
    else if (en.includes(s) || it.ja.includes(raw)) b.push(it);
    else if (exMap) { const x = exMap.get(it.id); if (x && (x.en.includes(s) || x.ja.includes(raw))) c.push(it); }
  }
  return a.concat(b, c);
}
