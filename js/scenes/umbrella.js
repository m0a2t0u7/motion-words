// umbrella：出かけようとすると、家の人が曇り空を見て傘を手渡す。まめは傘を持って出る（例文 Take an umbrella with you, because it might rain this afternoon.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, walkTo, face, homeBg, track } from './bag.js';
import { umbrella as umbProp } from './so-far-so-good.js';
import { door } from './queue-up.js';
import { say } from './look-over.js';

// 雨雲（中心原点）
export function rainCloud(k, parent, s = 1) {
  const g = k.g({}, parent), { el } = k;
  [[-10, 0, 12], [4, -6, 14], [16, 2, 10]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#A9B4C2' }, g));
  el('rect', { x: -20, y: 0, width: 46, height: 12, rx: 6, fill: '#A9B4C2' }, g);
  [-10, 2, 14].forEach((x) => el('line', { x1: x, y1: 17, x2: x - 3, y2: 25, stroke: k.pal.water, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g));
  k.tf(g, 0, 0, 0, s);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '雨が降るかも'], [1.6, '傘を渡す'], [3.2, '傘を持って出る']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1, FY = 236;
  homeBg(k, { FY, winX: 40, winW: 96, sky: '#D3DAE3' });
  const wc = k.g({}); [[64, 70], [104, 84]].forEach(([x, y]) => { const c = rainCloud(k, wc, 0.7); tf(c, x, y, 0, 0.7); });
  el('rect', { x: 318, y: FY - 136, width: 70, height: 136, fill: '#E8DCCB' });
  const dr = door(k, { x: 322, y: FY - 130, w: 62, h: 130, hinge: 'R', color: '#7FA8D9' });
  const mom = k.buddy({ x: 110, y: FY, scale: 1.05, facing: 1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 220, y: FY, scale: S });
  const um = umbProp(k, pal.blue, null);
  const bub = say(k, 66, 46, -1); rainCloud(k, bub.g, 0.8);
  const bx = track([[0, 220, 0], [0.7, 280, 0], [3.3, 280, 0], [4.1, 300, 0]]);
  const mx = track([[0, 110, 0], [1.1, 110, 0], [1.9, 190, 0]]);
  const H = { x: 236, y: FY - 70 };
  return {
    update(t) {
      const w = walkTo((tt) => bx(tt).x, t, 220, 1);
      const turn = t > 0.95 && t < 3.25;
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, facing: turn ? -1 : 1, look: 0.5, blink: blinkAt(t), mood: t > 2.5 ? 'grin' : t > 1 ? 'open' : 'smile' });
      const m = walkTo((tt) => mx(tt).x, t, 110, 1);
      const offer = easeInOut(seg(t, 1.8, 2.3)) * (1 - easeInOut(seg(t, 2.6, 3.0)));
      P(mom, { x: m.x, walk: m.walk, armL: m.armL + 40 * hump(seg(t, 0.2, 1.0)), look: 0.5, blink: blinkAt(t, 1), mood: 'smile' });
      // 窓の雲を指さしてから、傘を差し出す
      if (t < 1.1) mom.pose({ facing: -1, look: 0.6, armL: 8 + 130 * hump(seg(t, 0.2, 1.05)) });
      const mh0 = hp(mom, 1.05, 'R');
      mom.pose({ armR: lerp(mom.state.armR + 25, reach(mom, 1.05, 'R', H.x, H.y), offer) });
      const take = easeInOut(seg(t, 2.1, 2.4)) * (1 - easeInOut(seg(t, 3.0, 3.3)));
      if (turn) b.pose({ armR: lerp(b.state.armR, reach(b, S, 'R', H.x, H.y), take) });
      if (t >= 3.25) b.pose({ armR: 30 });
      const mh = hp(mom, 1.05, 'R'), bh = hp(b, S, 'R');
      const inB = t > 2.4;
      const h = inB ? bh : mh;
      tf(um, h.x, h.y - 3, 180 + (inB ? 0 : 4 * Math.sin(t * 3)) + (t > 3.25 ? -20 : 0), 0.9);
      dr.set(easeInOut(seg(t, 3.5, 4.1)) * 0.8);
      bub.show(seg(t, 0.4, 0.8) - seg(t, 1.6, 1.8), 150, FY - 150);
      face(b, turn ? 2 : 4, 0);
      void mh0;
    }
  };
}
