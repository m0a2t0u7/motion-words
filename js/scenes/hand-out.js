// hand out：先生が列の生徒に1人ずつテストを配って歩く（例文 The teacher handed out the tests.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, grip, papers } from './hand-over.js';

export const meta = { duration: 4.6, beats: [[0, '束を持つ'], [1.0, '1人目に配る'], [3.2, '全員に配った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 120, y: 38, width: 160, height: 70, rx: 6, fill: '#3F7F6B' });
  el('rect', { x: 120, y: 38, width: 160, height: 70, rx: 6, fill: 'none', stroke: pal.woodDark, 'stroke-width': 5 });
  el('line', { x1: 140, y1: 62, x2: 230, y2: 62, stroke: '#fff', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round' });
  el('line', { x1: 140, y1: 80, x2: 200, y2: 80, stroke: '#fff', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round' });
  const cols = [[pal.coral, pal.coralDark], [pal.blue, pal.blueDark], [pal.yellow, pal.yellowDark]];
  const SX = [215, 280, 345], SS = 0.62, SY = FY - 14;
  const stu = SX.map((x, i) => k.buddy({ x, y: SY, scale: SS, color: cols[i][0], dark: cols[i][1], facing: -1 }));
  SX.forEach((x) => {
    el('rect', { x: x - 30, y: SY - 18, width: 60, height: 8, rx: 3, fill: pal.wood });
    el('rect', { x: x - 26, y: SY - 10, width: 6, height: 24, fill: pal.woodDark });
    el('rect', { x: x + 20, y: SY - 10, width: 6, height: 24, fill: pal.woodDark });
  });
  const T = k.buddy({ x: 128, y: FY + 8, scale: 1.0 });
  const stack = papers(k, 4);
  const sheets = [0, 1, 2].map(() => papers(k, 1));
  const gT = grip(k, pal.mint, pal.mintDark, 1);
  const gS = stu.map((b, i) => grip(k, cols[i][0], cols[i][1], SS));
  const A = [1.15, 2.25, 3.35], B = [1.5, 2.6, 3.7];
  return {
    update(t) {
      const T0 = [128, 193, 258];
      const mv = [easeInOut(seg(t, 1.7, 2.2)), easeInOut(seg(t, 2.8, 3.3))];
      const tx = lerp(lerp(T0[0], T0[1], mv[0]), T0[2], mv[1]);
      const moving = (mv[0] > 0 && mv[0] < 1) || (mv[1] > 0 && mv[1] < 1);
      const ext = Math.max(...A.map((a, i) => hump(seg(t, a - 0.25, B[i] + 0.25))));
      T.pose({ x: tx, walk: moving ? t * 9 : 0, armR: lerp(50, 96, easeInOut(Math.min(1, ext * 1.4))), armL: 12, look: 0.4, mood: t > 4 ? 'grin' : 'smile', lean: 3 * ext });
      const hT = hp(T, 1);
      tf(stack, hT.x + 3, hT.y - 10, -8);
      stu.forEach((b, i) => {
        const reach = easeInOut(seg(t, A[i] - 0.15, A[i] + 0.15)), read = easeInOut(seg(t, B[i], B[i] + 0.5));
        b.pose({ armR: lerp(lerp(10, 92, reach), 55, read), armL: 8, look: 0.3, mood: t > B[i] ? 'grin' : 'smile', squash: 1 - 0.05 * hump(seg(t, B[i] - 0.1, B[i] + 0.3)) });
        const hs = hp(b, SS);
        const m = easeInOut(seg(t, A[i], B[i]));
        tf(sheets[i], lerp(hT.x + 3, hs.x - 2, m), lerp(hT.y - 11, hs.y - 7, m), lerp(-8, 4, m), lerp(1, 0.75, m));
        sheets[i].setAttribute('opacity', t < A[i] ? 0 : 1);
        gS[i](hs);
      });
      gT(hT);
    }
  };
}
