// hate：まだ暗い早朝5時、目覚まし時計が鳴る。まめはふとんをかぶって嫌がり、しぶしぶ起き上がるが、しかめっ面で雨雲を背負う（例文 I hate getting up early.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg, cloud } from './look-over.js';

// ベッド（原点＝床、左が枕）。front() で掛けぶとん
export function bed(k, x, FY, w = 170, color) {
  const { el, g, pal } = k;
  k.shadow(x + w / 2, FY + 1, w / 2 + 6, 5);
  el('rect', { x, y: FY - 80, width: 12, height: 80, rx: 4, fill: pal.woodDark });
  el('rect', { x: x + w - 10, y: FY - 50, width: 10, height: 50, rx: 4, fill: pal.woodDark });
  el('rect', { x, y: FY - 34, width: w, height: 22, rx: 6, fill: pal.wood });
  el('rect', { x: x + 6, y: FY - 44, width: w - 12, height: 12, rx: 6, fill: '#fff' });
  el('rect', { x: x + 14, y: FY - 58, width: 40, height: 16, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  return {
    front(fill = color || pal.blue) {
      const f = g({});
      el('path', { d: `M ${x + 68} ${FY - 46} Q ${x + w / 2 + 20} ${FY - 66} ${x + w - 6} ${FY - 48} L ${x + w - 4} ${FY - 22} L ${x + 64} ${FY - 22} Z`, fill, stroke: '#fff', 'stroke-width': 2 }, f);
      el('path', { d: `M ${x + 80} ${FY - 40} L ${x + w - 14} ${FY - 40}`, stroke: '#fff', 'stroke-width': 3, opacity: 0.4 }, f);
      return f;
    }
  };
}

export const meta = { duration: 4.4, beats: [[0, '朝5時のアラーム'], [1.4, '起きたくない'], [2.8, '早起きは大嫌い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240, 'evening');
  const B = bed(k, 110, FY, 190);
  // 横たわる→起き上がるまめ（腰を中心に回す）
  const pivot = g({});
  const me = k.buddy({ x: 0, y: 0, scale: 0.85, parent: pivot });
  me.g.firstChild.setAttribute('display', 'none');
  const quilt = B.front();
  // ナイトテーブルと目覚まし
  el('rect', { x: 314, y: FY - 56, width: 60, height: 56, rx: 4, fill: pal.wood });
  el('rect', { x: 314, y: FY - 56, width: 60, height: 6, rx: 3, fill: pal.woodDark });
  const al = g({});
  const ck = clock(k, 0, 0, 16, al); ck.set(5, 0);
  [-12, 12].forEach((x) => el('circle', { cx: x, cy: -16, r: 6, fill: pal.red }, al));
  el('rect', { x: -12, y: 14, width: 4, height: 6, fill: pal.ink }, al); el('rect', { x: 8, y: 14, width: 4, height: 6, fill: pal.ink }, al);
  const rings = [0, 1].map(() => el('path', { d: 'M 0 -10 Q 7 0 0 10', stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  const cl = cloud(k, 74, 40, 1);
  const drops = [0, 1, 2].map(() => el('line', { x1: 0, y1: 0, x2: -2, y2: 7, stroke: '#7FB3E0', 'stroke-width': 2, 'stroke-linecap': 'round' }, cl.g));
  return {
    update(t) {
      const ring = t > 0.3 && t < 2.6;
      const sh = ring ? Math.sin(t * 50) * 6 : 0;
      tf(al, 344, FY - 78 - (ring ? Math.abs(Math.sin(t * 25)) * 2 : 0), sh);
      rings.forEach((r, i) => { const d = i ? -1 : 1; tf(r, 344 + d * (24 + 4 * Math.sin(t * 25)), FY - 80, 0, d, 1); r.setAttribute('opacity', ring ? 0.9 : 0); });
      // 体の角度：-90=寝ている → 0.5-1.4 ふとんの中でもぞもぞ → 2.2-2.8 しぶしぶ起き上がる（-15度）
      const up = easeInOut(seg(t, 2.2, 2.9));
      const wrig = t > 0.5 && t < 1.9 ? Math.sin(t * 9) * 3 : 0;
      tf(pivot, 210 + 22 * up, FY - 34, lerp(-92, -6, up) + wrig);
      P(me, { mood: t < 0.4 ? 'flat' : 'sad', blink: t < 0.35 ? 1 : t < 2.2 ? (Math.sin(t * 5) > 0 ? 1 : 0.6) : 0.55, armR: t < 2.2 ? 8 + 140 * easeOut(seg(t, 0.6, 1.0)) : lerp(140, 20, easeOut(seg(t, 2.2, 2.6))), armL: 8 + 140 * easeOut(seg(t, 0.6, 1.0)) * (1 - seg(t, 2.2, 2.6)), squash: 1 - 0.04 * hump(seg(t, 2.9, 3.4)) + (t > 2.9 ? -0.03 * Math.sin(t * 2) : 0), look: t > 2.9 ? -0.3 : 0 });
      const cp = seg(t, 2.9, 3.3);
      cl.show(cp, 234, 116);
      drops.forEach((d, i) => { const q = (t * 1.6 + i / 3) % 1; tf(d, -16 + i * 16, 18 + 12 * q); d.setAttribute('opacity', (1 - q) * (t > 3.2)); });
    }
  };
}
