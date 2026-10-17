"""data/staging の outX-NN.json（教材データ）と tplX-NN.json（型モーション）を data/items へ取り込む。
使い方：python3 tools/merge-staging.py outA-00 outA-01 ...（拡張子なし。tpl は名前の out を tpl に替えたもの）
既にある id は上書きしない（同じ語の別の意味は id に -2 などを付けて追加）。
"""
import json, os, sys

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
items_dir = os.path.join(root, 'data', 'items')
cats = {}
for f in os.listdir(items_dir):
    if f.endswith('.json'):
        cats[f[:-5]] = json.load(open(os.path.join(items_dir, f), encoding='utf-8'))
ids = {it['id'] for L in cats.values() for it in L}
srcs = {it.get('src') for L in cats.values() for it in L if it.get('src')}
added = skipped = tpl_n = 0
for name in sys.argv[1:]:
    data = json.load(open(os.path.join(root, 'data', 'staging', name + '.json'), encoding='utf-8'))
    tpath = os.path.join(root, 'data', 'staging', name.replace('out', 'tpl', 1) + '.json')
    tpls = json.load(open(tpath, encoding='utf-8')) if os.path.exists(tpath) else {}
    for it in data:
        if it.get('src') in srcs:
            skipped += 1
            continue
        base = it['id']
        n = 2
        while it['id'] in ids:
            it['id'] = f'{base}-{n}'
            n += 1
        tp = tpls.get(base)
        if isinstance(tp, dict) and tp.get('t'):
            it['motion'] = 'tpl'
            it['tpl'] = tp
            tpl_n += 1
        else:
            it.pop('motion', None)
        it.setdefault('other', [])
        cat = it.pop('cat', 'word')
        cats.setdefault(cat, []).append(it)
        ids.add(it['id'])
        added += 1
for c, L in cats.items():
    with open(os.path.join(items_dir, c + '.json'), 'w', encoding='utf-8') as f:
        json.dump(L, f, ensure_ascii=False, indent=2)
        f.write('\n')
print(f'added={added} skipped={skipped} tpl={tpl_n}')
