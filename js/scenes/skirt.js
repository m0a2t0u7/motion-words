// skirt：店で長いスカートを買い、体に当ててパーティーを思い描く（例文 She bought a long skirt for the party.）
// このファイルは服・身につける物シーンの共通ヘルパーも書き出す（wardrobe / hanger / skirtProp / teeProp / pantsProp / shopBg / clerk）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { hp, held, reach, gait } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { coin } from './get-on-with.js';
import { cloud } from './look-over.js';
export { hp, held, reach, gait, P, blinkAt };

// まめに服を着せる。体（body）の座標系：体は x -30〜30, y -80〜0。脚グループは y 0〜20、腕グループは y 0〜26（手）
export function wardrobe(k, b) {
  const { el, pal } = k, body = b.body;
  const cp = k.clip((c) => el('rect', { x: -30, y: -80, width: 60, height: 80, rx: 28 }, c));
  const torso = k.g({ 'clip-path': cp }, null);
  body.insertBefore(torso, body.children[3]);
  const over = k.g({}, null); body.insertBefore(over, body.children[4]); // 体の外にはみ出す服（スカートなど）。顔より下
  const flip = b.g.children[1], legs = [flip.children[0], flip.children[1]], arms = [b.armL, b.armR];
  const W = {
    torso, over, legs, arms,
    // 上の服。sleeve: 0 | 'short' | 'long'。to: 裾の y
    top({ color = pal.white, dark = pal.line, sleeve = 'short', to = -14, collar = false, buttons = 0, neck = 'round' } = {}) {
      const g = k.g({}, torso);
      const nk = neck === 'round' ? 'L -9 -35 Q 0 -27 9 -35' : 'L -8 -35 L 0 -24 L 8 -35';
      el('path', { d: `M -32 -35 ${nk} L 32 -35 L 32 ${to} L -32 ${to} Z`, fill: color }, g);
      el('rect', { x: -32, y: to - 2.5, width: 64, height: 2.5, fill: dark, opacity: 0.6 }, g);
      const cl = k.g({}, body); // 襟は体の上（はみ出し可）
      if (collar) {
        el('path', { d: 'M -1 -25 L -10 -36 L -15 -31 L -5 -21 Z', fill: color, stroke: dark, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, cl);
        el('path', { d: 'M 1 -25 L 10 -36 L 15 -31 L 5 -21 Z', fill: color, stroke: dark, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, cl);
      }
      body.insertBefore(cl, body.children[5]);
      const btn = [];
      for (let i = 0; i < buttons; i++) btn.push(el('circle', { cx: 0, cy: -19 + i * 8, r: 2.1, fill: dark, stroke: '#fff', 'stroke-width': 0.8 }, g));
      const sl = arms.map((a) => {
        if (!sleeve) return null;
        const s = k.g({}, null); a.a.insertBefore(s, a.hand);
        const r = el('rect', { x: -7, y: -5, width: 14, height: sleeve === 'long' ? 27 : 13, rx: 5.5, fill: color }, s);
        const cuff = el('rect', { x: -7.5, y: sleeve === 'long' ? 18 : 5, width: 15, height: 4, rx: 2, fill: dark, opacity: 0.7 }, s);
        return { s, r, cuff };
      });
      return { g, cl, btn, sl };
    },
    // 下の服。kind: 'trousers' | 'shorts' | 'jeans' | 'skirt' | 'longskirt'
    bottom({ kind = 'trousers', color = pal.blueDark, dark = '#3A6FB8', from = -17 } = {}) {
      const g = k.g({}, torso);
      const sk = kind === 'skirt' || kind === 'longskirt';
      el('rect', { x: -32, y: from, width: 64, height: 40, fill: color }, g);
      el('rect', { x: -32, y: from, width: 64, height: 3.5, fill: dark }, g);
      if (kind === 'jeans') {
        el('path', { d: `M -24 ${from + 5} Q -18 ${from + 12} -10 ${from + 5} M 24 ${from + 5} Q 18 ${from + 12} 10 ${from + 5}`, stroke: pal.yellowDark, 'stroke-width': 1.3, fill: 'none', 'stroke-dasharray': '2 2' }, g);
        el('line', { x1: 0, y1: from + 3, x2: 0, y2: 0, stroke: dark, 'stroke-width': 1.4 }, g);
      }
      const sk2 = k.g({}, over);
      if (sk) {
        const L = kind === 'longskirt' ? 27 : 6;
        el('path', { d: `M -30 ${from + 2} L 30 ${from + 2} L ${36 + L * 0.25} ${L} Q 0 ${L + 4} ${-36 - L * 0.25} ${L} Z`, fill: color }, sk2);
        [-14, 0, 14].forEach((x) => el('line', { x1: x * 0.8, y1: from + 6, x2: x * 1.15, y2: L, stroke: dark, 'stroke-width': 1.4, opacity: 0.55 }, sk2));
      }
      const lg = legs.map((l) => {
        if (sk) return null;
        const h = kind === 'shorts' ? 11 : 22, lgG = k.g({}, null);
        l.insertBefore(lgG, l.children[1] || null);
        el('rect', { x: -7.5, y: -6, width: 15, height: h, rx: 4, fill: color }, lgG);
        if (kind === 'shorts') el('rect', { x: -8, y: h - 9, width: 16, height: 3, rx: 1.5, fill: dark }, lgG);
        if (kind === 'jeans') el('line', { x1: 3, y1: -4, x2: 3, y2: 14, stroke: pal.yellowDark, 'stroke-width': 1.1, 'stroke-dasharray': '2 2' }, lgG);
        return lgG;
      });
      return { g, lg, sk: sk2 };
    },
    // 靴（脚の先）。kind: 'shoe' | 'boot' | 'sandal' | 'slipper' | 'foot'
    feet(kind = 'shoe', color = pal.ink, dark = pal.ink) {
      return legs.map((l) => {
        const g = k.g({}, l);
        if (kind !== 'boot' && kind !== 'shoe') el('path', { d: 'M -6 14 L 5 14 Q 12 15 12 19 Q 12 21.5 9 21.5 L -6 21.5 Q -8 21.5 -8 18 Z', fill: b.state ? b.armR.hand.getAttribute('fill') : pal.mint }, g);
        if (kind === 'shoe') el('path', { d: 'M -7 12 L 4 12 Q 14 13 14 19 Q 14 23 10 23 L -7 23 Q -9 23 -9 18 Z', fill: color }, g);
        if (kind === 'boot') {
          el('path', { d: 'M -8 -2 L 6 -2 L 6 11 Q 15 13 15 19 Q 15 23 11 23 L -8 23 Q -10 23 -10 18 Z', fill: color }, g);
          el('rect', { x: -9, y: -3, width: 16, height: 4, rx: 2, fill: dark }, g);
        }
        if (kind === 'sandal') {
          el('rect', { x: -9, y: 21, width: 23, height: 3.5, rx: 1.8, fill: color }, g);
          el('path', { d: 'M -2 22 L 2 14 L 8 22', fill: 'none', stroke: dark, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
        }
        if (kind === 'slipper') {
          el('path', { d: 'M -9 21 L 12 21 Q 15 21 15 23.5 L -9 23.5 Z', fill: dark }, g);
          el('path', { d: 'M 0 22 Q 0 13 8 14 Q 14 15 14 22 Z', fill: color }, g);
        }
        return g;
      });
    },
    // ネクタイ（体の上、えりの下から）
    tie(color = pal.blue, dark = pal.blueDark) {
      const g = k.g({}, null); body.insertBefore(g, body.children[6] || null);
      el('path', { d: 'M -3.5 -29 L 3.5 -29 L 2.6 -24 L -2.6 -24 Z', fill: dark }, g);
      el('path', { d: 'M -2.6 -24.5 L 2.6 -24.5 L 5 -6 L 0 -1 L -5 -6 Z', fill: color }, g);
      el('line', { x1: -2.4, y1: -18, x2: 3.4, y2: -14, stroke: dark, 'stroke-width': 1.2, opacity: 0.6 }, g);
      return g;
    },
    // 手袋（手の上）
    glove(side, color = pal.red, dark = '#C94B40') {
      const a = side === 'L' ? b.armL : b.armR, g = k.g({}, a.a);
      el('rect', { x: -8, y: 18, width: 16, height: 5, rx: 2, fill: dark }, g);
      el('path', { d: 'M -7 22 Q -8 33 0 34 Q 8 33 7 22 Z', fill: color }, g);
      el('ellipse', { cx: 7, cy: 26, rx: 3, ry: 4.5, fill: color, transform: 'rotate(-30 7 26)' }, g);
      return g;
    }
  };
  return W;
}
// ハンガー（原点＝フック上端）
export function hanger(k, parent) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M 0 6 Q 0 0 4 0 Q 7 1 5 4', fill: 'none', stroke: k.pal.sub, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
  k.el('path', { d: 'M 0 6 L -20 16 L 20 16 Z', fill: 'none', stroke: k.pal.sub, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
  return g;
}
// スカート単体（原点＝ウエスト中央）
export function skirtProp(k, parent, color, dark, L = 46) {
  const g = k.g({}, parent);
  k.el('path', { d: `M -14 0 L 14 0 L ${22 + L * 0.12} ${L} Q 0 ${L + 5} ${-22 - L * 0.12} ${L} Z`, fill: color }, g);
  k.el('rect', { x: -14, y: -2, width: 28, height: 5, rx: 2, fill: dark }, g);
  [-8, 0, 8].forEach((x) => k.el('line', { x1: x * 0.9, y1: 4, x2: x * 1.6, y2: L, stroke: dark, 'stroke-width': 1.4, opacity: 0.5 }, g));
  return g;
}
// Tシャツ・シャツ単体（原点＝えり中央）
export function teeProp(k, parent, color, dark, { long = false, collar = false, w = 1, h = 1 } = {}) {
  const g = k.g({}, parent);
  const s = long ? 'L 26 4 L 34 34 L 24 36 L 18 16' : 'L 26 4 L 32 18 L 22 22 L 18 16';
  const sm = long ? 'L -18 16 L -24 36 L -34 34 L -26 4' : 'L -18 16 L -22 22 L -32 18 L -26 4';
  k.el('path', { d: `M -8 0 Q 0 6 8 0 ${s} L 18 ${44 * h} L -18 ${44 * h} ${sm} Z`, fill: color, stroke: dark, 'stroke-width': 1.6, 'stroke-linejoin': 'round', transform: `scale(${w} 1)` }, g);
  if (collar) {
    k.el('path', { d: 'M -8 0 L 0 8 L -3 13 L -12 4 Z M 8 0 L 0 8 L 3 13 L 12 4 Z', fill: '#fff', stroke: dark, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
  }
  return g;
}
// ズボン単体（原点＝ウエスト中央）
export function pantsProp(k, parent, color, dark, L = 50) {
  const g = k.g({}, parent);
  k.el('path', { d: `M -15 0 L 15 0 L 17 ${L} L 3 ${L} L 0 14 L -3 ${L} L -17 ${L} Z`, fill: color, stroke: dark, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
  k.el('rect', { x: -15, y: -2, width: 30, height: 5, rx: 2, fill: dark }, g);
  return g;
}
// 洋服店（左にラック、右にレジカウンター）。front() で店員の腰を隠すカウンター前面
export function shopBg(k, FY = 236, cx = 300) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 30, width: 400, height: 14, fill: '#F0E4D6' });
  el('rect', { x: 20, y: 70, width: 120, height: 5, rx: 2, fill: pal.sub });
  el('rect', { x: 26, y: 75, width: 4, height: FY - 75, fill: pal.sub });
  el('rect', { x: 130, y: 75, width: 4, height: FY - 75, fill: pal.sub });
  k.shadow(80, FY + 1, 64, 4);
  [[44, pal.violet], [78, pal.yellow], [112, '#9ED3B2']].forEach(([x, c], i) => {
    const h = hanger(k);
    if (i % 2) k.tf(skirtProp(k, h, c, 'rgba(0,0,0,0.25)', 40), 0, 16); else k.tf(teeProp(k, h, c, 'rgba(0,0,0,0.15)', { w: 0.8 }), 0, 13);
    k.tf(h, x, 64, 0, 0.75);
  });
  return { FY, front() {
    k.shadow(cx + 25, FY + 2, 80, 4);
    el('rect', { x: cx - 50, y: FY - 50, width: 150, height: 8, rx: 3, fill: pal.woodDark });
    el('rect', { x: cx - 44, y: FY - 42, width: 140, height: 50, fill: pal.wood });
    el('rect', { x: cx - 44, y: FY - 42, width: 140, height: 4, fill: pal.woodDark, opacity: 0.4 });
  } };
}
export function clerk(k, x, FY, s = 0.9) {
  return k.buddy({ x, y: FY, scale: s, facing: -1, color: k.pal.blue, dark: k.pal.blueDark });
}
const party = (k, parent) => {
  const g = k.g({}, parent), pal = k.pal;
  [[-14, -4, pal.coral], [0, -10, pal.yellow], [14, -2, pal.violet]].forEach(([x, y, c]) => {
    k.el('path', { d: `M ${x} ${y + 9} q -3 8 2 14`, stroke: pal.sub, 'stroke-width': 1.2, fill: 'none' }, g);
    k.el('ellipse', { cx: x, cy: y, rx: 7, ry: 9, fill: c }, g);
  });
  return g;
};

export const meta = { duration: 4.4, beats: [[0, 'お金を払う'], [1.5, 'スカートを買う'], [3.0, 'パーティー用']] };

export function create(k) {
  const { pal, tf } = k, S = 1.15;
  const shop = shopBg(k, 236, 300);
  const FY = shop.FY;
  const c = clerk(k, 330, FY, 1.05);
  shop.front();
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const co = coin(k, k.root, 6);
  const sk = skirtProp(k, k.root, pal.coral, pal.coralDark, 40);
  const th = cloud(k, 74, 50, -1); party(k, th.c || th.g);
  const xf = (t) => lerp(150, 214, easeInOut(seg(t, 0.1, 0.9)));
  return {
    update(t) {
      const g = gait(xf, t, 150);
      const pay = hump(seg(t, 0.9, 1.6)), give = seg(t, 1.6, 2.4), hold = easeInOut(seg(t, 2.6, 3.1));
      const bx = g.x - 26 * hold;
      P(b, { x: bx, walk: g.walk, armL: g.armL, lean: g.lean, armR: t < 2.6 ? Math.max(8, 85 * pay, t > 1.9 ? 80 * easeOut(seg(t, 1.9, 2.3)) : 0) : lerp(80, 30, hold), look: 0.4, mood: t > 2.9 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (t > 2.6) { const wy = FY - 28 * S; b.pose({ armR: lerp(80, reach(b, S, 'R', bx + 16, wy), hold), armL: lerp(8, reach(b, S, 'L', bx - 12, wy), hold) }); }
      P(c, { x: 330, armR: Math.max(10, 80 * hump(seg(t, 1.5, 2.6))), look: 0.3, lean: 6 * hump(seg(t, 1.5, 2.5)), blink: blinkAt(t, 1) });
      // コイン：まめの手 → 台 → 店員の手元
      const h = hp(b, S, 'R');
      const cv = t < 1.3 ? 1 : 0;
      tf(co, t < 1.3 ? h.x : lerp(h.x, 268, easeOut(seg(t, 1.3, 1.5))), t < 1.3 ? h.y : lerp(h.y, FY - 54, seg(t, 1.3, 1.5)));
      co.setAttribute('opacity', t > 0.9 && t < 2.0 ? 1 : 0);
      // スカート：店員の手 → まめの手 → 腰に当てる
      const ch = hp(c, 1.05, 'R');
      const bh = hp(b, S, 'R');
      let sx, sy, r = 0, sc = 0.8;
      if (t < 2.05) { sx = ch.x; sy = ch.y + 2; }
      else if (t < 2.6) { const p = easeInOut(seg(t, 2.05, 2.3)); sx = lerp(ch.x, bh.x, p); sy = lerp(ch.y + 2, bh.y + 2, p); }
      else { const p = hold; sx = lerp(bh.x, bx + 2 * S, p); sy = lerp(bh.y + 2, FY - 28 * S, p); sc = lerp(0.8, 0.95, p); }
      tf(sk, sx, sy, r + 3 * Math.sin(t * 3) * (1 - hold), sc);
      sk.setAttribute('opacity', t > 1.5 ? clamp((t - 1.5) * 6) : 0);
      th.show(seg(t, 3.15, 3.6), bx - 40, FY - 140, 1);
      void cv;
    }
  };
}
