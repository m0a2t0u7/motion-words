// mattress：ベッドに腰かけたらマットレスが全然沈まず、手で押してもかたい（例文 This mattress is too hard.）
// 共通ヘルパー：bedroomBg（寝室の背景）、bedFrame（横から見たベッド。マットレスは厚く、キルト模様）
import { seg, lerp, easeInOut, easeOut, wobble, hump, clamp } from '../ease.js';
import { reach } from './dig.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';
import { star } from './get-on-with.js';

export function bedroomBg(k, opt = {}) {
  return homeBg(k, { wall: '#EEF1F8', curtain: '#B9C8EE', winX: 40, winW: 78, ...opt });
}
// ベッド（x0〜x1、マットレス上面 MT、厚さ TH）。頭側は左。mat はマットレスのグループ
export function bedFrame(k, x0, x1, MT, FY, { TH = 26, mat = '#F3F6FB', quilt = '#D5DCE8' } = {}) {
  const { el, g, pal } = k;
  k.shadow((x0 + x1) / 2, FY + 1, (x1 - x0) / 2 + 6, 5);
  el('rect', { x: x0 - 12, y: MT - 64, width: 14, height: FY - MT + 64, rx: 6, fill: pal.woodDark });
  el('rect', { x: x1 - 4, y: MT - 20, width: 12, height: FY - MT + 20, rx: 5, fill: pal.woodDark });
  el('rect', { x: x0, y: MT + TH, width: x1 - x0, height: 18, rx: 4, fill: pal.wood });
  [x0 + 4, x1 - 16].forEach((x) => el('rect', { x, y: MT + TH + 18, width: 10, height: FY - MT - TH - 18, fill: pal.woodDark }));
  const m = g({});
  el('rect', { x: x0, y: MT, width: x1 - x0, height: TH, rx: 9, fill: mat, stroke: quilt, 'stroke-width': 2 }, m);
  for (let x = x0 + 22; x < x1 - 10; x += 26) el('circle', { cx: x, cy: MT + TH / 2, r: 2, fill: quilt }, m);
  el('path', { d: `M ${x0 + 6} ${MT + 5} H ${x1 - 6} M ${x0 + 6} ${MT + TH - 5} H ${x1 - 6}`, stroke: quilt, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, m);
  return m;
}

export const meta = { duration: 4.4, beats: [[0, 'ベッドへ'], [1.5, 'ドスン！'], [2.4, 'もう一度…かたい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.84;
  const FY = bedroomBg(k);
  const MT = 178, TH = 38, X0 = 150, X1 = 372;
  bedFrame(k, X0, X1, MT, FY, { TH });
  el('ellipse', { cx: X0 + 34, cy: MT - 6, rx: 28, ry: 9, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const hits = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 L 8 -3 M 2 6 L 11 6 M 0 12 L 8 15', stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round', fill: 'none' }));
  const sts = [0, 1].map(() => star(k, null, 7, pal.yellow)); sts.forEach((s) => k.root.appendChild(s));
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const xf = (t) => lerp(70, 236, easeInOut(seg(t, 0.2, 1.1)));
  const SX = 236;
  return {
    update(t) {
      const w = gait(xf, t, 70, 16, 0.12);
      const s = easeIn2(seg(t, 1.2, 1.55));
      const bounce = 9 * hump(seg(t, 1.55, 1.85)) + 3 * hump(seg(t, 1.85, 2.0));
      const hit2 = seg(t, 2.75, 3.2), hitP = t < 2.7 ? seg(t, 1.55, 2.0) : hit2;
      const hop2 = 10 * hump(seg(t, 2.45, 2.75)) + 4 * hump(seg(t, 2.75, 2.95));
      const y = lerp(FY, MT + 7, s);
      const pose = { x: t < 1.2 ? w.x : SX, y, walk: w.walk * (1 - s), lift: bounce + hop2 + 12 * hump(seg(t, 1.2, 1.55)), lean: w.lean, squash: 1 - 0.12 * wobble(hitP, 2, 6), look: t > 1.6 ? 0.5 : 0.5, armL: lerp(w.armL, 30, s), armR: lerp(w.armR, 30, s), mood: t < 1.55 ? 'smile' : t < 2.3 ? 'open' : t < 2.75 ? 'flat' : t < 3.1 ? 'open' : 'sad', blink: (t > 1.55 && t < 1.8) || (t > 2.75 && t < 2.95) ? 1 : blinkAt(t) };
      P(b, pose);
      // ぶつかった線と星（全然沈まない）
      hits.forEach((h, i) => { tf(h, SX + (i - 1) * 44 + (i === 1 ? 0 : 0), MT - 4 + (i === 1 ? -22 : 0), i === 0 ? 180 : i === 1 ? -90 : 0, 1); h.setAttribute('opacity', hump(hitP)); });
      tf(hits[0], SX - 46, MT + 4, 180); tf(hits[2], SX + 46, MT - 4, 0); tf(hits[1], SX - 6, MT - 92, -90);
      sts.forEach((st, i) => { const q = t < 2.7 ? seg(t, 1.55 + i * 0.1, 2.2) : seg(t, 2.75 + i * 0.1, 3.4); tf(st, SX + (i ? 30 : -34), MT - 78 - 10 * q, 120 * q, hump(q) + 0.001); });
      // 押した手のまわり：へこまない（小さな線だけ）
      const sq = seg(t, 3.3, 4.4);
      tf(sweat, SX + 26, MT - 70 + 10 * sq, 0, sq > 0 ? 1 : 0.001);
      sweat.setAttribute('opacity', sq > 0 ? 1 - sq * 0.3 : 0);
    }
  };
}
const easeIn2 = (p) => p * p;
