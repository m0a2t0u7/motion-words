// run off：男の子がベンチのかばんをつかみ、走ってその場から去っていく（例文 The boy grabbed his bag and ran off.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { P, blinkAt, run, tree, parkBg } from './run-after.js';
import { hp, reach } from './weigh.js';

export const meta = { duration: 3.8, beats: [[0, 'かばんをつかむ'], [1.4, '走り出す'], [3.0, '走り去った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 236);
  tree(k, 330, FY - 4, 0.95);
  // ベンチ
  el('rect', { x: 92, y: FY - 62, width: 92, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 92, y: FY - 48, width: 92, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 88, y: FY - 34, width: 100, height: 8, rx: 3, fill: pal.wood });
  [98, 172].forEach((x) => el('rect', { x, y: FY - 28, width: 6, height: 28, fill: pal.woodDark }));
  k.shadow(138, FY, 56, 5);
  const S = 0.82;
  const b = k.buddy({ x: 214, y: FY, scale: S, facing: -1 });
  const bag = g({});
  el('path', { d: 'M -8 2 Q 0 -10 8 2', stroke: pal.coffee, 'stroke-width': 3, fill: 'none' }, bag);
  el('rect', { x: -15, y: 2, width: 30, height: 24, rx: 5, fill: pal.coralDark }, bag);
  el('rect', { x: -15, y: 8, width: 30, height: 5, fill: pal.coral }, bag);
  const puffs = [0, 1, 2].map(() => el('circle', { r: 8, fill: '#E7ECEF' }));
  const lines = g({});
  [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: i * 12, x2: 30 - i * 6, y2: i * 12, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, lines));
  const xf = (t) => lerp(214, 470, easeIn(seg(t, 1.25, 2.9)) * 0.6 + seg(t, 1.25, 2.9) * 0.4);
  const BAG = { x: 150, y: FY - 60 };
  return {
    update(t) {
      const r = run(xf, t, 214, -1);
      const turn = t > 1.2;
      const lean = turn ? r.lean : 14 * hump(seg(t, 0.35, 1.15));
      P(b, { ...r, facing: turn ? 1 : -1, lean, mood: turn ? 'grin' : 'flat', look: turn ? 0.8 : 0.6, blink: blinkAt(t) });
      if (!turn) {
        const ra = reach(b, S, 'R', BAG.x, BAG.y);
        const a = t < 0.75 ? lerp(8, ra, easeInOut(seg(t, 0.3, 0.75))) : lerp(ra, 40, easeInOut(seg(t, 0.85, 1.2)));
        P(b, { x: 214, facing: -1, lean, armR: a, mood: 'flat', look: 0.6, blink: blinkAt(t) });
      }
      const h = hp(b, S, 'R');
      const p = t < 0.75 ? BAG : { x: h.x, y: h.y - 2 };
      tf(bag, p.x, p.y, t < 0.75 ? 0 : clamp((p.x - 214) * 0.05, -8, 8) * 0);
      // 走り出しの土ぼこり・去ったあとの線
      puffs.forEach((c, i) => {
        const q = seg(t, 1.3 + i * 0.12, 2.0 + i * 0.12);
        tf(c, 200 - i * 14 - q * 20, FY - 6 - q * 10, 0, 0.3 + q);
        c.setAttribute('opacity', q > 0 && q < 1 ? (1 - q) : 0);
      });
      tf(lines, 350, FY - 70);
      lines.setAttribute('opacity', seg(t, 2.75, 3.1) * (1 - seg(t, 3.5, 3.8) * 0.4) * 0.8);
    }
  };
}
