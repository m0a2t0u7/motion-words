// late：始業のチャイムが鳴り終わるころ、まめが走って校門に着く。門はもう閉まり、校庭に子どもはいない（例文 I was late for school.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, run, parkBg, clock, tree } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, '走る'], [1.8, '門が閉まる'], [2.8, '遅刻した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 240);
  // 校舎
  el('rect', { x: 200, y: 70, width: 190, height: 130, rx: 6, fill: '#F3E3C7' }); el('rect', { x: 200, y: 62, width: 190, height: 14, rx: 4, fill: pal.coral });
  [220, 270, 320].forEach((x) => el('rect', { x, y: 106, width: 38, height: 34, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 }));
  const ck = clock(k, 295, 44, 17);
  el('rect', { x: 200, y: 200, width: 190, height: 40, fill: '#E7DCC6' });
  tree(k, 365, FY - 2, 0.6);
  // 門（左右の扉）
  const gl = g({}), gr = g({});
  [[gl, 0], [gr, 1]].forEach(([n, s]) => { for (let i = 0; i < 5; i++) el('rect', { x: s ? 4 + i * 10 : -54 + i * 10, y: -70, width: 4, height: 70, rx: 2, fill: pal.sub }, n); el('rect', { x: s ? 0 : -58, y: -66, width: 58, height: 5, fill: pal.sub }, n); el('rect', { x: s ? 0 : -58, y: -14, width: 58, height: 5, fill: pal.sub }, n); });
  const b = k.buddy({ x: 30, y: FY + 8, scale: 1 });
  const sw = [0, 1, 2].map(() => el('ellipse', { rx: 2.5, ry: 4, fill: pal.water }));
  const bell = k.text(0, 0, '♪', { 'font-size': 20, fill: pal.yellowDark, 'font-weight': 700 });
  return {
    update(t) {
      const gx = (tt) => lerp(20, 150, easeOut(seg(tt, 0.1, 2.4)));
      const r = run(gx, t, 20);
      const close = easeInOut(seg(t, 1.3, 2.2)), stop = seg(t, 2.1, 2.6);
      const end = easeOut(seg(t, 2.6, 3.2));
      const sx = lerp(0.12, 1, close); tf(gl, 218, FY + 2, 0, sx, 1); tf(gr, 224, FY + 2, 0, sx, 1);
      ck.set(8, 32 + Math.floor(seg(t, 0, 3) * 8));
      P(b, { ...r, lean: r.m > 0.2 ? r.lean : 22 * end, armL: r.m > 0.2 ? r.armL : 30, armR: r.m > 0.2 ? r.armR : 30, squash: 1 + (r.m < 0.2 ? Math.sin(t * 14) * 0.03 * end : 0), mood: end > 0.3 ? 'sad' : 'open', look: 0.6, blink: blinkAt(t) });
      sw.forEach((s, i) => { const u = (t * 1.3 + i / 3) % 1; tf(s, b.state.x + 12, FY - 80 + u * 40); s.setAttribute('opacity', (r.m > 0.3 ? 0.9 : end) * (1 - u)); });
      tf(bell, 296, 20 - hump(seg(t, 1.3, 2.4)) * 4, wobble(seg(t, 1.3, 2.4), 3, 1) * 10); bell.setAttribute('opacity', hump(seg(t, 1.0, 2.6)));
    }
  };
}
