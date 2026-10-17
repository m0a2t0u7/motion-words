// wake up：ベッドで眠っている→目覚ましが鳴る→目を開けて体を起こす（例文 I woke up at six this morning.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '眠っている'], [1.5, '目を開ける'], [2.8, '起き上がる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  // 窓と朝日
  el('rect', { x: 30, y: 40, width: 76, height: 66, rx: 8, fill: '#DDEFFA' });
  const sun = el('circle', { cx: 68, cy: 96, r: 14, fill: pal.yellow });
  el('line', { x1: 68, y1: 40, x2: 68, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 30, y1: 73, x2: 106, y2: 73, stroke: '#fff', 'stroke-width': 4 });
  // ベッド（奥）
  el('rect', { x: 338, y: 120, width: 14, height: 112, rx: 5, fill: pal.woodDark });
  el('rect', { x: 120, y: 206, width: 230, height: 26, rx: 6, fill: pal.wood });
  el('rect', { x: 126, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 332, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 124, y: 190, width: 220, height: 20, rx: 8, fill: '#EAF2FA' });
  el('ellipse', { cx: 300, cy: 170, rx: 34, ry: 15, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  // 目覚まし台
  el('rect', { x: 36, y: 200, width: 62, height: 50, rx: 5, fill: pal.wood });
  const clock = g({});
  el('circle', { cx: 0, cy: 0, r: 17, fill: '#fff', stroke: pal.red, 'stroke-width': 5 }, clock);
  el('circle', { cx: -14, cy: -17, r: 6, fill: pal.red }, clock);
  el('circle', { cx: 14, cy: -17, r: 6, fill: pal.red }, clock);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -12, stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, clock);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: pal.ink, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, clock);
  const rings = g({});
  [-1, 1].forEach((s) => {
    el('path', { d: `M ${s * 26} -8 q ${s * 6} 8 0 16`, fill: 'none', stroke: pal.red, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, rings);
    el('path', { d: `M ${s * 34} -14 q ${s * 9} 14 0 28`, fill: 'none', stroke: pal.red, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, rings);
  });
  // まめ（回転用グループ）
  const grp = g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0 });
  b.g.firstChild.setAttribute('display', 'none');
  // 毛布
  const bl = el('rect', { x: 150, y: 164, width: 112, height: 42, rx: 14, fill: pal.blue });
  el('rect', { x: 150, y: 164, width: 112, height: 9, rx: 4, fill: '#fff', opacity: 0.35 });
  const zz = g({});
  ['Z', 'z'].forEach((s, i) => k.text(i * 14, -i * 16, s, { 'font-size': 18 - i * 4, fill: pal.sub }, zz));
  const ex = k.text(300, 70, '!', { 'font-size': 26, fill: pal.red });

  return {
    update(t) {
      const sp = easeInOut(seg(t, 1.9, 2.7));
      const open = seg(t, 1.45, 1.6);
      tf(grp, 190, lerp(160, 192, sp), lerp(90, 0, sp));
      b.pose({
        blink: 1 - open,
        mood: t < 1.5 ? 'flat' : t < 2.7 ? 'smile' : 'open',
        armL: sp > 0 ? lerp(8, 150, easeOut(seg(t, 2.6, 3.3))) : 8,
        armR: sp > 0 ? lerp(8, 150, easeOut(seg(t, 2.6, 3.3))) : 8,
        squash: 1 + 0.03 * Math.sin(t * 2) * (1 - open),
        look: 0.3
      });
      tf(bl, 0, 0, 0, 1, 1);
      const pull = seg(t, 2.5, 3.2);
      bl.setAttribute('y', 164 + 14 * pull);
      bl.setAttribute('height', 42 - 14 * pull);
      // 目覚まし
      const ring = t > 0.6 && t < 1.9 ? Math.sin(t * 60) * 3 : 0;
      tf(clock, 67, 180, ring);
      rings.setAttribute('transform', `translate(67 180)`);
      rings.setAttribute('opacity', t > 0.6 && t < 1.9 ? (Math.sin(t * 30) > 0 ? 1 : 0.3) : 0);
      // 朝日
      sun.setAttribute('cy', lerp(100, 76, easeOut(seg(t, 0, 3.5))));
      tf(zz, 296, 110 - 6 * Math.sin(t * 3), 0);
      zz.setAttribute('opacity', t < 1.5 ? 1 : 0);
      const ep = seg(t, 1.5, 1.8);
      ex.setAttribute('opacity', ep > 0 && t < 2.8 ? 1 : 0);
      ex.setAttribute('y', 90 - 8 * easeOut(ep));
    }
  };
}
