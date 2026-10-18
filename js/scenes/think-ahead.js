// think ahead：出かける前に立ち止まり、先の雨を考えて、傘立てから傘を手に取る（例文 You should think ahead before you leave.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach, gait } from './dig.js';
import { thought, rain } from './work-on.js';

export const meta = { duration: 4.4, beats: [[0, '出かける前'], [1.2, '先を考える'], [3.0, '傘を持った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 316, y: 108, width: 70, height: 128, rx: 4, fill: pal.woodDark });
  el('rect', { x: 322, y: 114, width: 58, height: 122, rx: 3, fill: pal.wood });
  el('circle', { cx: 330, cy: 178, r: 4, fill: pal.yellowDark });
  el('rect', { x: 40, y: 60, width: 70, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 120, y: 150, width: 34, height: 6, rx: 3, fill: pal.woodDark });
  // 傘（原点＝持ち手。+y が石突き側）
  const umb = g({}); const umbI = g({}, umb); k.tf(umbI, 0, 0, 0, 1.35);
  el('path', { d: 'M 0 0 Q -7 0 -7 6', stroke: pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, umbI);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 58, stroke: pal.sub, 'stroke-width': 2.5 }, umbI);
  el('path', { d: 'M -1 14 Q -9 34 -1 52 L 2 52 Q 9 34 2 14 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 1.5 }, umbI);
  k.shadow(272, FY, 22, 4);
  const stand = g({});
  el('path', { d: `M 258 ${FY} L 260 ${FY - 40} L 284 ${FY - 40} L 286 ${FY} Z`, fill: pal.coral }, stand);
  el('rect', { x: 256, y: FY - 44, width: 32, height: 6, rx: 3, fill: pal.coralDark }, stand);
  const S = 0.95;
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const tb = thought(k, 104, 64, -1);
  const cl = g({}, tb.inner);
  [[-14, -6, 14], [2, -10, 17], [18, -6, 13]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#AEB8C6' }, cl));
  const drops = [0, 1, 2, 3].map((i) => el('line', { x1: -14 + i * 10, y1: 0, x2: -16 + i * 10, y2: 8, stroke: pal.blue, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, tb.inner));
  const xf = (t) => lerp(120, 222, easeInOut(seg(t, 0.1, 1.0))) - 40 * easeInOut(seg(t, 3.4, 4.1));
  return {
    update(t) {
      const p = gait(xf, t, 120);
      const think = seg(t, 1.1, 1.4) * (1 - seg(t, 3.4, 3.7));
      const rch = easeInOut(seg(t, 2.3, 2.8)), lift = easeInOut(seg(t, 2.9, 3.4));
      b.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean + 8 * rch * (1 - lift), look: think > 0.2 ? -0.4 : 0.5,
        mood: t > 3.3 ? 'grin' : think > 0.5 ? 'flat' : 'smile', squash: 1 - 0.04 * rch * (1 - lift) });
      if (t > 1.1 && t < 2.3) b.pose({ armL: 8 + 140 * hump(seg(t, 1.2, 2.2)) * 0.0, armR: lerp(8, 150, easeOut(seg(t, 1.2, 1.5))) * (1 - easeInOut(seg(t, 2.0, 2.3))) + 8 * seg(t, 2.0, 2.3) });
      const H = { x: 272, y: FY - 80 };
      if (t >= 2.3) {
        const tgt = { x: lerp(H.x, H.x + 10, lift), y: lerp(H.y, H.y - 70, lift) };
        const a = reach(b, S, 'R', tgt.x, tgt.y);
        b.pose({ armR: lerp(b.state.armR, a, rch) });
      }
      const h = hp(b, S, 'R');
      const held = t > 2.8;
      tf(umb, held ? h.x : H.x, held ? h.y : H.y, held ? 4 * Math.sin(t * 3) * seg(t, 3.4, 3.6) : 0);
      const sc = backOut(seg(t, 1.1, 1.45));
      tb.g.setAttribute('opacity', think);
      tf(tb.g, 290, 64, 0, Math.max(0.01, sc));
      tf(cl, 0, -6);
      drops.forEach((d, i) => tf(d, 0, 6 + ((t * 30 + i * 6) % 14)));
    }
  };
}
