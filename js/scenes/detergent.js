// detergent：洗濯機の投入口に洗剤を注ぎ、スイッチを入れると泡立って回り出す（例文 Add some detergent to the washing machine.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, P, blinkAt } from './jam.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '洗剤を持つ'], [0.8, '投入口に注ぐ'], [2.6, '洗濯スタート']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const FY = homeBg(k, { winX: 30, winW: 70, wall: '#EEF4F7' });
  const MX = 270, MW = 110, MH = 104, MT = FY - MH;
  k.shadow(MX, FY + 1, 64, 5);
  el('rect', { x: MX - MW / 2, y: MT, width: MW, height: MH, rx: 10, fill: '#F7F9FB', stroke: '#D9DFE7', 'stroke-width': 2 });
  el('rect', { x: MX - MW / 2, y: MT, width: MW, height: 26, rx: 10, fill: '#E9EEF3' });
  // 投入口（引き出し）
  const drawer = k.g({});
  el('rect', { x: 0, y: 0, width: 34, height: 14, rx: 2, fill: '#D9DFE7', stroke: '#AEB8C6' }, drawer);
  const btn = el('circle', { cx: MX + 40, cy: MT + 13, r: 6, fill: '#AEB8C6' });
  // ドラム
  el('circle', { cx: MX, cy: MT + 62, r: 34, fill: '#C9D2DD' });
  const drum = k.g({});
  el('circle', { r: 27, fill: '#8FD3F4' }, drum);
  const foam = [0, 1, 2, 3, 4].map((i) => el('circle', { cx: Math.cos(i * 1.26) * 15, cy: Math.sin(i * 1.26) * 15, r: 6, fill: '#fff' }, drum));
  const clothes = el('path', { d: 'M -14 6 Q 0 -6 14 8 Q 4 18 -14 6 Z', fill: '#FF8E77' }, drum);
  el('circle', { cx: MX, cy: MT + 62, r: 27, fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.6 });
  const b = k.buddy({ x: 162, y: FY, scale: S });
  // 洗剤ボトル（原点＝握り、注ぎ口は上）
  const bt = k.g({});
  el('path', { d: 'M -10 20 L -10 -6 Q -10 -14 -2 -16 L -2 -22 L 6 -22 L 6 -14 Q 10 -12 10 -6 L 10 20 Z', fill: '#6AA8F7' }, bt);
  el('rect', { x: -10, y: 0, width: 20, height: 10, fill: '#fff' }, bt);
  el('circle', { cx: 0, cy: 5, r: 3, fill: '#A58BF3' }, bt);
  const stream = el('path', { stroke: '#7FB8FF', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const A = arms(k, b, S, { back: ['L'] });
  return {
    update(t) {
      const open = easeInOut(seg(t, 0.3, 0.7)) * (1 - easeInOut(seg(t, 2.0, 2.3)));
      const up = easeInOut(seg(t, 0.5, 1.0)) * (1 - easeInOut(seg(t, 2.0, 2.3)));
      const tilt = easeInOut(seg(t, 1.0, 1.3)) * (1 - easeInOut(seg(t, 1.8, 2.0)));
      const press = hump(seg(t, 2.4, 2.7));
      const run = seg(t, 2.7, 3.2);
      P(b, { look: 0.5, lean: 6 * up, blink: blinkAt(t), mood: t > 3 ? 'grin' : 'smile' });
      k.tf(drawer, MX - MW / 2 + 8 - 18 * open, MT + 6);
      // 左手：引き出しを引く（開いている間）
      A.to('L', lerp(178, MX - MW / 2 + 6 - 18 * open, Math.min(1, open * 3)), lerp(200, MT + 13, Math.min(1, open * 3)));
      // 右手：ボトルを持ち上げて投入口へ注ぐ → 下ろしてボタンを押す
      let hx = lerp(186, MX - MW / 2 - 6, up), hy = lerp(200, MT - 22, up);
      if (t > 2.2) { const q = easeInOut(seg(t, 2.2, 2.45)) * (1 - easeInOut(seg(t, 2.8, 3.1))); hx = lerp(186, MX + 40, q); hy = lerp(200, MT + 13 + press * 2, q); }
      A.to('R', hx, hy);
      if (t > 2.2) k.tf(bt, 120, FY - 20); else k.tf(bt, hx, hy, 115 * tilt);
      const a = (115 * tilt * Math.PI) / 180, sx = hx + 22 * Math.sin(a), sy = hy - 22 * Math.cos(a);
      k.set(stream, { d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${sx.toFixed(1)} ${MT + 8}`, opacity: tilt > 0.85 ? 1 : 0 });
      k.set(btn, { fill: t > 2.6 ? pal.green : '#AEB8C6' });
      const spin = run > 0 ? (t - 2.7) * 400 : 0;
      k.tf(drum, MX, MT + 62, spin);
      foam.forEach((f) => f.setAttribute('opacity', run.toFixed(2)));
      void clothes;
    }
  };
}
