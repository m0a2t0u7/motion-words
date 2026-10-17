// give up：びんのふたを2度ひねっても開かず、びんを置いて腕を下ろす（例文 He gave up trying to open the jar.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '開けようとする'], [1.7, 'もう一度'], [3.0, 'あきらめる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 252, mood: 'indoor' });
  // 壁：窓・棚
  el('rect', { x: 36, y: 40, width: 74, height: 62, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 73, y1: 40, x2: 73, y2: 102, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('rect', { x: 290, y: 78, width: 84, height: 7, rx: 3, fill: pal.woodDark });
  el('rect', { x: 300, y: 56, width: 16, height: 22, rx: 4, fill: pal.mint });
  el('rect', { x: 324, y: 62, width: 14, height: 16, rx: 4, fill: pal.yellow });
  el('rect', { x: 346, y: 52, width: 18, height: 26, rx: 5, fill: pal.coral });

  const X = 200, Y0 = 216, S = 1.35; // 机の天板の高さ・まめの拡大率
  const b = k.buddy({ x: X, y: Y0 + 5 * S, scale: S });
  b.g.firstChild.setAttribute('display', 'none');
  // 机
  k.shadow(200, 254, 150, 6);
  el('rect', { x: 50, y: Y0, width: 300, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 50, y: Y0, width: 300, height: 4, rx: 2, fill: '#F0D9B8' });
  el('rect', { x: 62, y: Y0 + 12, width: 276, height: 14, fill: '#D6B58A' });
  el('rect', { x: 66, y: Y0 + 12, width: 11, height: 28, rx: 3, fill: pal.woodDark });
  el('rect', { x: 323, y: Y0 + 12, width: 11, height: 28, rx: 3, fill: pal.woodDark });
  // びん（原点＝底の中央）
  const jarSh = k.shadow(X, Y0 + 3, 26, 4);
  const jar = g({});
  const jr = g({}, jar);
  el('rect', { x: -16, y: -28, width: 32, height: 28, rx: 8, fill: '#D9EEF9', stroke: '#B7D9EC', 'stroke-width': 2 }, jr);
  el('rect', { x: -13, y: -17, width: 26, height: 14, rx: 6, fill: pal.coral, opacity: 0.85 }, jr);
  el('rect', { x: -8, y: -23, width: 5, height: 14, rx: 2.5, fill: '#FFFFFF', opacity: 0.55 }, jr);
  const lid = g({}, jr);
  el('rect', { x: -17, y: -37, width: 34, height: 10, rx: 4, fill: pal.red }, lid);
  const ridges = [0, 1, 2, 3, 4].map(() => el('line', { x1: 0, y1: -35, x2: 0, y2: -29, stroke: '#FFFFFF', 'stroke-width': 2, opacity: 0.7, 'stroke-linecap': 'round' }, lid));
  // 力み線：ふたの左右
  const arrow = g({});
  [-1, 1].forEach((d) => {
    el('path', { d: `M ${d * 26} -6 Q ${d * 32} -12 ${d * 27} -19`, stroke: pal.sub, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, arrow);
    el('path', { d: `M ${d * 31} 0 Q ${d * 39} -9 ${d * 33} -19`, stroke: pal.sub, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, arrow);
  });
  const sweat = el('path', { d: 'M 0 -8 Q 6 0 0 6 Q -6 0 0 -8 Z', fill: pal.water });
  const puffs = [0, 1, 2].map(() => el('circle', { cx: 0, cy: 0, r: 6, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }));

  return {
    update(t) {
      const a1 = seg(t, 0.75, 1.4), a2 = seg(t, 1.75, 2.55);
      const strain = hump(a1) * 0.9 + hump(a2);
      const lift = easeOut(seg(t, 0.3, 0.65)) * 7 * (1 - easeInOut(seg(t, 3.15, 3.45)));
      const bump = t > 3.45 && t < 3.9 ? wobble(seg(t, 3.45, 3.9), 2, 5) * 1.6 : 0;
      const shake = Math.sin(t * 55) * 1.3 * strain;
      // ふたの筋：ひねると横にずれる（スリップして戻る）
      const off = hump(a1) * 10 * (a1 < 0.7 ? 1 : 0.4) + hump(a2) * 14;
      ridges.forEach((r, i) => { const x = -15 + (((i * 7 + off) % 35) + 35) % 35; r.setAttribute('x1', x); r.setAttribute('x2', x); });
      tf(jar, X + shake, Y0 - lift + bump, Math.sin(t * 40) * 1.5 * strain, S, S);
      tf(jr, 0, 0, 0, 1 + (strain > 0 ? 0.0 : 0), 1);
      tf(lid, 0, 0, hump(a1) * -2 + hump(a2) * -3, 1, 1);
      tf(jarSh, X, Y0 + 3, 0, 1 - lift / 40, 1);
      // 矢印
      const aOn = Math.max(hump(a1), hump(a2));
      tf(arrow, X + shake, Y0 - lift - 30 * S, 0, S, S);
      arrow.setAttribute('opacity', aOn > 0.2 && Math.sin(t * 30) > -0.3 ? 1 : 0);
      // まめ：力み → ため息 → 腕が下がる
      const slump = easeInOut(seg(t, 2.6, 3.1));
      const hold = (1 - easeInOut(seg(t, 3.2, 3.55)));
      const hands = -10 * hold + 4 * (1 - hold);
      b.pose({
        x: X + shake * 0.8,
        armL: hands - strain * 3 + slump * 0, armR: hands - strain * 3,
        squash: 1 - 0.07 * strain - 0.06 * slump,
        lean: Math.sin(t * 38) * 1.6 * strain - slump * 4,
        look: t > 3.0 ? 0.0 : 0,
        mood: t < 2.8 ? 'flat' : 'sad',
        blink: t > 2.85 && t < 3.05 ? 1 : 0
      });
      // 汗
      const sw = Math.max(seg(t, 1.0, 1.4), seg(t, 2.1, 2.55) * 0);
      const s2 = seg(t, 2.0, 2.6);
      const sp = t < 1.7 ? seg(t, 0.95, 1.45) : s2;
      const sOn = (t > 0.95 && t < 1.45) || (t > 2.0 && t < 2.6);
      tf(sweat, X + 46 + (sOn ? sp * 4 : 0), Y0 - 112 + (sOn ? sp * 24 : 0), 0, 1 + (sOn ? hump(sp) * 0.4 : 0));
      sweat.setAttribute('opacity', sOn ? 1 - sp * 0.5 : 0);
      // ため息のもや
      puffs.forEach((p, i) => {
        const q = seg(t, 2.8 + i * 0.12, 3.5 + i * 0.12);
        tf(p, X - 50 - q * 26 - i * 10, Y0 - 68 + q * 4 - i * 7, 0, 0.6 + q * 1.1);
        p.setAttribute('opacity', q > 0 && q < 1 ? 1 - q * q : 0);
      });
    }
  };
}
