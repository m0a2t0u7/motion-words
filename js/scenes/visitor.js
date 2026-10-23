// visitor：美術館。受付のまめがカウンターで数えると、絵を見に来る訪問者が次々と入ってきて数が増えていく（例文 The museum gets many visitors.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, pops, P, blinkAt, C } from './jam.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '美術館'], [0.6, '次々と来る'], [3.6, 'たくさんの訪問者']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EFEAF4' });
  // 柱と絵
  [[150, '#FFCF5C', '#6AA8F7'], [250, '#FF8E77', '#59C27A'], [350, '#A58BF3', '#FFCF5C']].forEach(([x, c1, c2]) => {
    el('rect', { x: x - 34, y: 56, width: 68, height: 56, fill: '#fff', stroke: '#C9A577', 'stroke-width': 6 });
    el('circle', { cx: x - 10, cy: 78, r: 10, fill: c1 }); el('path', { d: `M ${x - 30} 108 L ${x - 6} 86 L ${x + 30} 108 Z`, fill: c2 });
  });
  el('text', { x: 0, y: 0 });
  // 受付カウンター（左）
  const st = k.buddy({ x: 50, y: FY, scale: 1.1 });
  el('rect', { x: 10, y: 186, width: 90, height: 50, rx: 4, fill: '#C98A5A' });
  // カウンター表示
  el('rect', { x: 26, y: 30, width: 70, height: 34, rx: 6, fill: pal.ink });
  const num = k.text(61, 48, '0', { 'font-size': 20, fill: '#9BE1C8' });
  const clicker = k.g({}); el('rect', { x: -7, y: -8, width: 14, height: 16, rx: 4, fill: '#AEB8C6' }, clicker); el('circle', { cx: 0, cy: -9, r: 3, fill: pal.red }, clicker);
  const A = arms(k, st, 1.1);
  const n = 7, vs = [...Array(n)].map((_, i) => ({ b: k.buddy({ x: 70, y: FY, scale: 0.8 + (i % 3) * 0.12, ...C(k, i % 2 ? 'blue' : 'coral') }), xf: keys([[0.2 + i * 0.5, -40], [3.0 + i * 0.5, 450]]), t0: 0.2 + i * 0.5 }));
  return {
    update(t) {
      let cnt = 0;
      vs.forEach(({ b, xf, t0 }, i) => {
        const g = gait(xf, t, -40);
        // 絵の前で少しゆっくり（見上げる）
        P(b, { x: g.x, walk: g.walk, armL: g.armL, armR: g.armR, lean: g.lean, look: 0.3, blink: blinkAt(t, i * 0.3), mood: 'smile' });
        b.g.setAttribute('opacity', t > t0 ? 1 : 0);
        if (t > t0 + 0.2) cnt++;
      });
      num.textContent = String(cnt * 12 + Math.floor(seg(t, 0, 4.4) * 3));
      const click = vs.some(({ t0 }) => t > t0 + 0.1 && t < t0 + 0.3);
      P(st, { look: 0.6, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'smile' });
      const h = A.to('R', 92, 170 + (click ? 4 : 0)); A.to('L', 30, 190);
      k.tf(clicker, h.x, h.y - 6);
      num.setAttribute('transform', `translate(61 48) scale(${click ? 1.15 : 1}) translate(-61 -48)`);
    }
  };
}
