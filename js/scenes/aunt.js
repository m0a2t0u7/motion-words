// aunt：おばさんからプレゼントが届く。配達の人から箱を受け取り、開けるとおばさんのカードが入っている（例文 My aunt sent me a present.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, heartP, pops, P, blinkAt, C } from './jam.js';
import { cloud } from './look-over.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, 'おばさんから'], [1.4, '届いた'], [3.0, 'プレゼントだ']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  // 自分の家の玄関
  el('rect', { x: 0, y: 70, width: 150, height: 166, fill: '#F6EADB' });
  el('path', { d: 'M -10 76 L 160 76 L 75 30 Z', fill: '#E86F57' });
  el('rect', { x: 40, y: 130, width: 60, height: 106, rx: 3, fill: '#8B5E3C' });
  // 考え雲：遠くのおばさんが送る
  const th = cloud(k, 110, 70, -1);
  const aunt = k.buddy({ x: 0, y: 0, scale: 0.4, parent: th.g, ...C(k, 'coral') });
  aunt.pose({ x: -14, y: 22, armR: 150, mood: 'grin' });
  const mini = k.g({}, th.g); el('rect', { x: 10, y: 4, width: 20, height: 16, rx: 2, fill: pal.violet }, mini); el('rect', { x: 18, y: 4, width: 4, height: 16, fill: pal.yellow }, mini);
  const me = k.buddy({ x: 120, y: FY, scale: 1.1 });
  const carrier = k.buddy({ x: 480, y: FY, scale: 1.1, facing: -1, ...C(k, 'blue') });
  // 箱（ふた付き）とカード
  const box = k.g({});
  el('rect', { x: -22, y: -34, width: 44, height: 34, rx: 3, fill: pal.violet }, box);
  el('rect', { x: -3, y: -34, width: 6, height: 34, fill: pal.yellow }, box);
  const lid = k.g({}, box); el('rect', { x: -25, y: -8, width: 50, height: 9, rx: 3, fill: '#8569D9' }, lid); el('path', { d: 'M 0 -8 q -10 -12 -14 0 M 0 -8 q 10 -12 14 0', stroke: pal.yellow, 'stroke-width': 3, fill: 'none' }, lid);
  const card = k.g({}); el('rect', { x: -14, y: -20, width: 28, height: 22, rx: 2, fill: '#fff', stroke: '#D9DFE7' }, card); el('circle', { cx: -4, cy: -9, r: 5, fill: pal.coral }, card); heartP(k, card, pal.red, 0.5).setAttribute('transform', 'translate(7 -9)');
  const A = arms(k, me, 1.1), B = arms(k, carrier, 1.1, { col: pal.blue, dark: pal.blueDark });
  const h = heartP(k);
  const xc = keys([[0.6, 480], [1.8, 200], [2.6, 200], [3.6, 480]]);
  return {
    update(t) {
      th.show(seg(t, 0.1, 0.5) * (1 - seg(t, 1.4, 1.7)), 250, 70);
      const g = gait(xc, t, 480);
      const leaving = t > 2.6;
      P(carrier, { x: g.x, walk: g.walk, lean: g.lean, facing: leaving ? 1 : -1, look: 0.5, blink: blinkAt(t, 1), mood: 'smile' });
      const hand = easeInOut(seg(t, 1.8, 2.3));
      // 箱：配達員の両手 → 2.2で自分の両手へ
      const bxC = { x: g.x - 36, y: FY - 30 }, bxMe = { x: lerp(170, 172, 0), y: FY - 30 };
      const bx = t < 2.2 ? { x: lerp(bxC.x, 172, hand), y: bxC.y } : bxMe;
      k.tf(box, bx.x, bx.y + 24);
      if (!leaving) { B.to('R', bx.x + 18, bx.y + 8); B.to('L', bx.x + 24, bx.y + 4); } else { B.ang('R', g.armR); B.ang('L', g.armL); }
      const open = easeOut(seg(t, 3.0, 3.4)), cd = easeOut(seg(t, 3.3, 3.8));
      P(me, { look: 0.6, blink: blinkAt(t), mood: t > 3.2 ? 'grin' : t > 1.8 ? 'open' : 'smile', lean: 4 * hand });
      if (t < 1.8) { A.ang('R', 10); A.ang('L', 10); }
      else if (t < 2.9) { const r = easeInOut(seg(t, 1.8, 2.2)); const pR = { x: 120 + 34, y: FY - 30 }, pL = { x: 120 - 34, y: FY - 30 }; A.to('R', lerp(pR.x, bx.x + 18, r), lerp(pR.y, bx.y + 10, r)); A.to('L', lerp(pL.x, bx.x - 18, r), lerp(pL.y, bx.y + 10, r)); }
      else { A.to('L', bx.x - 20, bx.y + 12); A.to('R', lerp(bx.x + 18, bx.x + 6, cd), lerp(bx.y + 10, FY - 100, cd)); }
      lid.setAttribute('transform', `translate(${(30 * open).toFixed(1)} ${(-34 - 26 * hump(open) + 30 * open).toFixed(1)}) rotate(${(60 * open).toFixed(1)})`);
      k.tf(card, lerp(bx.x, bx.x + 6, cd), lerp(bx.y + 10, FY - 96, cd), 0, t > 3.2 ? 1 : 0.001);
      const q = seg(t, 3.8, 4.3); k.tf(h, 210, 90 - 10 * q, 0, pops(q));
    }
  };
}
