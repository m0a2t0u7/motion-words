// theater：劇場で幕が開き、舞台の役者が演じておじぎ。客席の2人が拍手する（例文 We saw a play at the theater.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './restaurant.js';

// 後ろ姿の観客（頭と肩だけ。原点＝座席の上端中央）
export function seatHead(k, color, dark, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -22, y: -40, width: 44, height: 48, rx: 20, fill: color }, g);
  k.el('ellipse', { cx: -8, cy: -26, rx: 6, ry: 10, fill: '#fff', opacity: 0.18 }, g);
  return g;
}
// 赤い座席の背もたれの列
export function seatRow(k, y, xs, c = '#C9504A', dark = '#A63E39') {
  xs.forEach((x) => { k.el('rect', { x: x - 26, y, width: 52, height: 60, rx: 10, fill: c }); k.el('rect', { x: x - 26, y, width: 52, height: 8, rx: 4, fill: dark }); });
}

export const meta = { duration: 4.4, beats: [[0, '幕が開く'], [1.3, '劇を見る'], [3.2, '拍手']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#2B2238' });
  // 舞台
  el('rect', { x: 40, y: 40, width: 320, height: 150, fill: '#F7E7C8' });
  el('rect', { x: 40, y: 170, width: 320, height: 22, fill: '#B98A5B' });
  el('rect', { x: 40, y: 190, width: 320, height: 8, fill: '#8C6440' });
  // 背景の書き割り：木と月
  el('circle', { cx: 300, cy: 72, r: 16, fill: '#FFF3C4' });
  [[100, 150], [140, 156]].forEach(([x, y]) => { el('rect', { x: x - 4, y: y - 30, width: 8, height: 30, fill: pal.woodDark }); el('circle', { cx: x, cy: y - 44, r: 22, fill: '#7FCB92' }); });
  const light = el('ellipse', { cx: 200, cy: 168, rx: 90, ry: 14, fill: '#FFF6D8', opacity: 0.8 });
  // 役者2人（青・黄）
  const a1 = k.buddy({ x: 170, y: 172, scale: 0.7, facing: 1, color: pal.blue, dark: pal.blueDark });
  const a2 = k.buddy({ x: 250, y: 172, scale: 0.7, facing: -1, color: pal.yellow, dark: pal.yellowDark });
  // 幕（左右に開く）
  const cL = g({}), cR = g({});
  const drape = (p) => { el('rect', { x: 0, y: 0, width: 170, height: 160, fill: '#C9504A' }, p); for (let x = 14; x < 170; x += 24) el('rect', { x, y: 0, width: 8, height: 160, fill: '#A63E39', opacity: 0.6 }, p); };
  drape(cL); drape(cR);
  el('path', { d: 'M 30 30 H 370 V 52 Q 200 70 30 52 Z', fill: '#A63E39' });
  el('rect', { x: 26, y: 26, width: 348, height: 8, fill: '#E9B43A' });
  // 客席（後ろ姿）
  seatRow(k, 236, [40, 360]);
  const me = seatHead(k, pal.mint), you = seatHead(k, pal.coral);
  seatRow(k, 236, [146, 254]);
  const hands = [0, 1, 2, 3].map((i) => el('circle', { r: 7, fill: i < 2 ? pal.mint : pal.coral, stroke: i < 2 ? pal.mintDark : pal.coralDark, 'stroke-width': 2.5 }));
  return {
    update(t) {
      const op = easeInOut(seg(t, 0.2, 1.3));
      tf(cL, 40 - 140 * op, 34, 0, 1 - 0.5 * op, 1); tf(cR, 360 - 170 * (1 - 0.5 * op) + 140 * op, 34, 0, 1 - 0.5 * op, 1);
      light.setAttribute('opacity', 0.3 + 0.5 * op);
      // 演技：剣ではなく身ぶりで会話 → 最後におじぎ
      const act = seg(t, 1.3, 3.0), bow = easeInOut(seg(t, 3.0, 3.4)) * (1 - easeInOut(seg(t, 3.9, 4.3)));
      const g1 = Math.sin(act * Math.PI * 4);
      P(a1, { x: 170 + 8 * Math.sin(act * Math.PI * 2), armR: 60 + 50 * Math.max(0, g1), armL: 20, lean: 30 * bow, mood: act > 0 && act < 1 && g1 > 0 ? 'open' : 'smile', blink: bow, look: 0.4 });
      P(a2, { x: 250 - 8 * Math.sin(act * Math.PI * 2), armR: 60 + 50 * Math.max(0, -g1), armL: 120 * hump(seg(act, 0.4, 0.7)), lean: 30 * bow, mood: act > 0 && act < 1 && g1 < 0 ? 'open' : 'grin', blink: bow, look: 0.4 });
      if (t > 3.0) { a1.pose({ facing: 1 }); a2.pose({ facing: -1 }); }
      // 観客の頭：見入る→拍手で弾む
      const clap = t > 3.1 ? Math.abs(Math.sin((t - 3.1) * 16)) : 0, on = t > 3.1;
      tf(me, 150, 240 - 3 * clap); tf(you, 250, 242 - 3 * clap, 0, 0.92);
      [[150, 0], [150, 1], [250, 0], [250, 1]].forEach(([x, i], j) => { const sp = on ? 4 + 8 * clap : 0; k.set(hands[j], { cx: x + (i ? sp : -sp), cy: 192 - 4 * clap, opacity: on ? 1 : 0 }); });
    }
  };
}
