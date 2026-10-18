// count on：重い箱に苦労する相手のところへまめが来て、胸をたたき「任せて」と反対側を持ち上げる（例文 You can count on me.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';
import { hp, reach, frontL, gait } from './dig.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.4, beats: [[0, '重くて困る'], [1.6, '任せて'], [3.4, '一緒に持つ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 60, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const S = 1;
  const C = k.buddy({ x: 120, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const bsh = k.shadow(190, FY, 40, 5);
  const box = g({});
  el('rect', { x: -40, y: -46, width: 80, height: 46, rx: 4, fill: pal.wood }, box);
  el('rect', { x: -40, y: -32, width: 80, height: 6, fill: pal.woodDark, opacity: 0.5 }, box);
  el('rect', { x: -14, y: -46, width: 28, height: 12, fill: '#F2DDBB' }, box);
  const A = k.buddy({ x: 420, y: FY, scale: S, facing: -1 });
  const fl = frontL(A, S);
  const gC = grip(k, pal.coral, pal.coralDark, S), gA = grip(k, pal.mint, pal.mintDark, S);
  const xf = (t) => lerp(420, 262, easeOut(seg(t, 0.3, 1.5)));
  return {
    update(t) {
      // 箱：最初は片側だけ浮いてぐらぐら → 2人で持つと水平に上がる
      const lift2 = easeInOut(seg(t, 3.0, 3.6));
      const strain = (1 - lift2) * seg(t, 0.1, 0.4);
      const tilt = lerp(-12 + 3 * Math.sin(t * 9) * strain, 0, lift2);
      const by = FY - lerp(0, 34, lift2) - 2 * hump(seg(t, 3.6, 3.9));
      tf(box, 192, by, tilt * strain + (lift2 > 0 ? 0 : 0), 1);
      bsh.setAttribute('rx', 40 - 10 * lift2); bsh.setAttribute('opacity', 1 - 0.4 * lift2);
      C.pose({ lean: lerp(16, 6, lift2), squash: lerp(0.9 + 0.02 * Math.sin(t * 9), 1, lift2), mood: t > 3.2 ? 'grin' : 'sad', look: t > 1.4 ? 0.8 : 0.3, armL: 10 });
      const lc = { x: 152 + 0, y: by - 18 + (1 - lift2) * -10 };
      C.pose({ armR: reach(C, S, 'R', lc.x, lc.y) }); gC(hp(C, S, 'R'));
      const p = gait(xf, t, 420);
      const tap = t > 1.6 && t < 2.6 ? hump(seg(t, 1.7, 1.9)) + hump(seg(t, 1.95, 2.15)) : 0;
      A.pose({ x: p.x, walk: p.walk, armR: p.armR, armL: p.armL, lean: p.lean - 4 * tap + 10 * easeInOut(seg(t, 2.6, 3.0)) * (1 - lift2 * 0.6), look: 0.7, mood: t > 1.6 ? 'grin' : 'smile', squash: 1 - 0.08 * easeInOut(seg(t, 2.6, 3.0)) * (1 - lift2) });
      const chest = easeInOut(seg(t, 1.55, 1.75)) * (1 - easeInOut(seg(t, 2.35, 2.6)));
      fl.set(lerp(lerp(8, -70, chest) + 8 * tap, 8, 0));
      const la = { x: 232, y: by - 18 };
      const go = easeInOut(seg(t, 2.6, 3.0));
      A.pose({ armR: lerp(p.armR, reach(A, S, 'R', la.x, la.y), go) });
      if (go > 0) fl.set(lerp(-70 * chest, 70, go));
      gA(go > 0.9 ? hp(A, S, 'R') : { x: -50, y: -50 });
    }
  };
}
