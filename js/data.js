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
        .then((r) => r.json())
        .then((list) => new Map(list.map((x) => [x.id, { ...x, cat: meta.cat }])))
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

export function search(q) {
  const s = q.trim().toLowerCase();
  if (!s) return index.items;
  return index.items.filter((it) => it.en.toLowerCase().includes(s) || it.ja.includes(q.trim()));
}
