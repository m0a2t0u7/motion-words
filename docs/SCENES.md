# モーションシーンの作り方

各項目のモーションは `js/scenes/<id>.js` の1ファイル。`<id>` は `data/items/*.json` の `id` と同じ。
データの `"motion"` が `"2d"` なら SVG、`"3d"` なら Three.js で描く。

## ファイルの形

```js
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = {
  duration: 3.6,                       // 動作が終わるまでの秒数（2.8〜4.4秒）
  beats: [[0, '前'], [1.2, '途中'], [2.6, '後']]  // 動作の前・途中・後。日本語で8文字以内
};

export function create(k) {
  // 図形をここで1回だけ作る
  return {
    update(t) {
      // t（秒, 0〜duration）だけから全図形の状態を決める
    }
  };
}
```

## 守ること

1. `update(t)` は t だけで状態が決まる純関数にする。前フレームの値を足し込まない（巻き戻し・先頭からの再生が必ずできるように）。乱数を使うなら t から決まる値にする。
2. 動作の「前・途中・後」で意味が分かる構成にする。`beats` の3語はその3場面の説明。
3. 例文と映像を一致させる。例文に出てくる物・人・結果を描き、例文にない結果を描かない（例：look for は見つかる前で終わる）。
4. 動きは実物らしく：動き出しは加速、止まり方は減速（easeOut / easeInOut）。接触・着地には小さなつぶれや余韻（wobble）。重い物は持ち上げる直前に一瞬ためる。影（`k.shadow`）を付け、高さに応じて小さく薄くする。
5. 最終状態（t=duration）は結果がはっきり分かる形で止める。
6. 文字は最小限。数字・記号・短いラベル程度。
7. 実在のキャラクター・ロゴ・商品名・他社教材の名前やデザインを描かない。
8. 1ファイルおおむね200行以内。外部画像・外部通信なし。

## 2D の道具（`k` = js/kit2d.js）

- 画面は 400×300。`k.backdrop({ floorY: 236, mood: 'outdoor' | 'indoor' | 'evening' })` で背景と床。戻り値は床の y。
- `k.el(tag, attrs, parent)` SVG要素を作る。`k.g(attrs, parent)` グループ。`k.set(node, attrs)` 属性更新。
- `k.tf(node, x, y, rotDeg, sx, sy)` 平行移動・回転・拡大（原点は要素のローカル原点）。回転させたい図形は、回転中心を原点にして描き、外側のグループを `tf` で動かす。
- `k.shadow(cx, cy, rx, ry)` 接地影。`k.gradient([[0,c1],[1,c2]])` は fill に渡す url を返す。`k.clip(fn)` はクリップパス。`k.text(x, y, str, attrs)`。
- `k.pal` 色：ink, sub, line, mint/mintDark, coral/coralDark, blue/blueDark, yellow/yellowDark, violet, wood/woodDark, white, paper, water, coffee, milk, red, green, shadow, floor, floorEdge。
- キャラクター「まめ」：`const b = k.buddy({ x, y, scale, facing: 1 | -1, color, dark })`（原点は足元）。
  `b.pose({ x, y, armL, armR, lean, squash, walk, look, mood, blink, lift, facing })`
  - armL/armR：腕の角度（度）。0=下、90=水平に前（体の外側）、180=真上。
  - lean：体の傾き（度、+で前のめり）。squash：上下のつぶれ（1=通常）。walk：歩行の位相（ラジアン、t×9 程度で自然な歩き）。
  - look：目線（-1〜1）。mood：'smile' | 'flat' | 'sad' | 'open' | 'grin'。blink：0〜1。lift：体を浮かせる量（px）。
  - `b.handPos('R')` 手先のおおよその座標（物を持たせる位置合わせ用）。
  - 2人目は `color: k.pal.coral, dark: k.pal.coralDark`。

## 3D の道具（`k` = js/kit3d.js）

`k.THREE`, `k.scene`, `k.camera`, `k.ground()`, `k.rbox(w,h,d,r,color)`, `k.sphere`, `k.capsule`, `k.cyl`, `k.hand()`（`userData.grip(0..1)`）, `k.buddy()`（`userData.pose({...})`）, `k.vehicle()`（`userData.door(0..1)`）, 色 `k.C`。

## 確認

リポジトリ直下で `python3 -m http.server 8765` を起動し、
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tools/snap.py <出力先> <id>:2d` でコマ送り画像を作って見る。
（確認用ブラウザには日本語フォントがないため、画像下の日本語ラベルは文字化けする。スマホでは正しく出る）
