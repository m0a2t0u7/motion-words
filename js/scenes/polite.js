// polite：ベンチに座っていたまめが、杖のおばあさんが来ると立ち上がっておじぎし、手で席をすすめる（例文 He is always polite to older people.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, walkTo, path, person, elder, scene, treeG, heart } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, 'ベンチに座る'], [1.53, '立っておじぎ'], [3.25, '席をゆずる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, E = 0.92;
  const { FY } = scene(k);
  const tr = treeG(k, 0.9); tf(tr.g, 340, FY);
  // バス停のベンチ
  const SEAT = FY - 26;
  k.shadow(150, FY + 1, 70, 5);
  el('rect', { x: 84, y: SEAT - 34, width: 132, height: 10, rx: 4, fill: pal.woodDark });
  el('rect', { x: 84, y: SEAT, width: 132, height: 8, rx: 3, fill: pal.wood });
  [92, 202].forEach((x) => el('rect', { x, y: SEAT + 8, width: 6, height: 18, fill: pal.sub }));
  el('rect', { x: 40, y: FY - 120, width: 5, height: 120, fill: pal.sub });
  el('circle', { cx: 42, cy: FY - 124, r: 14, fill: pal.blue });
  const b = k.buddy({ x: 150, y: SEAT + 16, scale: S });
  const gran = person(k, 'coral', { x: 460, y: FY, scale: E, facing: -1 });
  elder(k, gran);
  const cane = el('line', { stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const hs = [0, 1].map(() => heart(k));
  const gx = path([[0.2, 460], [2.0, 270], [3.6, 270], [4.3, 160]]), bx = path([[2.2, 150], [2.6, 220]]);
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const up = easeInOut(seg(t, 1.6, 2.0)), bow = hump(seg(t, 2.6, 3.4)), offer = easeOut(seg(t, 3.2, 3.6));
      const w = walkTo(bx, t, 150, 1);
      P(b, { x: w.x, y: lerp(SEAT + 16, FY, up), walk: w.walk, facing: t > 2.62 ? -1 : 1, lean: w.lean + 34 * bow, armL: lerp(w.armL, 70, offer) , armR: w.armR,
        mood: 'smile', look: t > 1.0 ? (t > 2.62 ? 0.5 : 0.8) : 0.2, blink: bow > 0.5 ? 1 : blinkAt(t) });
      // おばあさん：ゆっくり歩き、座る
      const gw = walkTo(gx, t, 460, -1), sit = easeInOut(seg(t, 4.2, 4.6));
      P(gran, { x: gw.x, y: lerp(FY, SEAT + 16, sit), walk: gw.walk * 0.7, facing: gw.facing, lean: 8 + gw.lean, armR: 30, armL: 8, mood: t > 3.0 ? 'grin' : 'smile', look: 0.5, blink: blinkAt(t, 1), lift: 0 });
      const h = hp(gran, E, 'R');
      k.set(cane, { x1: h.x, y1: h.y, x2: h.x - 4 * gran.state.facing, y2: Math.min(FY, h.y + 40), opacity: sit > 0.5 ? 0 : 1 });
      hs.forEach((n, i) => { const q = seg(t, 3.4 + i * 0.3, 4.6); tf(n, 230 + i * 30, FY - 130 - 20 * q, 0, q > 0 ? 1.2 * hump(q * 0.7 + 0.3) : 0.001); });
    }
  };
}
