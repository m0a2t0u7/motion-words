// adult：入場券売り場。料金表は大人1000・子ども500。大人のまめは子どもより多くお金を払う（例文 Adults pay more than children.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, pops, P, blinkAt, C } from './jam.js';
import { gait } from './weigh.js';
import { coin } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, '料金表'], [1.2, '大人は1000'], [2.8, '子どもは500']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  // 売り場の小屋と料金表
  el('rect', { x: 230, y: 70, width: 160, height: 166, fill: '#F7EBDD' });
  el('path', { d: 'M 220 72 L 400 72 L 400 52 L 230 52 Z', fill: '#F2685B' });
  el('rect', { x: 250, y: 110, width: 70, height: 50, rx: 4, fill: '#DDEFFA', stroke: '#C98A5A', 'stroke-width': 4 });
  el('rect', { x: 236, y: 160, width: 100, height: 8, rx: 2, fill: '#C98A5A' });
  const seller = k.buddy({ x: 285, y: 196, scale: 0.6, facing: -1, ...C(k, 'blue') });
  el('rect', { x: 250, y: 160, width: 70, height: 2, fill: '#C98A5A' });
  el('rect', { x: 236, y: 168, width: 100, height: 68, fill: '#F7EBDD' });
  el('rect', { x: 236, y: 168, width: 100, height: 68, fill: 'none', stroke: '#E3CDB2', 'stroke-width': 2 });
  // 料金表（大きい人＝1000、小さい人＝500）
  el('rect', { x: 340, y: 96, width: 54, height: 92, rx: 6, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 });
  const rowA = k.g({}), rowC = k.g({});
  el('rect', { x: 349, y: 104, width: 13, height: 20, rx: 6, fill: pal.mint }, rowA); el('circle', { cx: 355.5, cy: 101, r: 0.1 }, rowA);
  k.text(377, 115, '1000', { 'font-size': 11 }, rowA);
  el('rect', { x: 351, y: 150, width: 9, height: 13, rx: 4.5, fill: pal.coral }, rowC);
  k.text(377, 157, '500', { 'font-size': 11 }, rowC);
  const hiA = el('rect', { x: 344, y: 99, width: 46, height: 30, rx: 5, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 });
  const hiC = el('rect', { x: 344, y: 142, width: 46, height: 30, rx: 5, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 });
  // 支払うお金（大人は2枚、子どもは1枚）
  const big = [0, 1].map(() => coin(k, undefined, 8)), small = coin(k, undefined, 8);
  const b = k.buddy({ x: -40, y: FY, scale: 1.2 });
  const kid = k.buddy({ x: -90, y: FY, scale: 0.7, ...C(k, 'coral') });
  const A = arms(k, b, 1.2, { back: ['L'] }), Kd = arms(k, kid, 0.7, { col: pal.coral, dark: pal.coralDark, back: ['L'] });
  const bx = keys([[0, -40], [1.0, 196], [2.4, 196], [3.0, 120]]), kx = keys([[0, -90], [1.2, 120], [2.4, 120], [3.0, 206]]);
  return {
    update(t) {
      const gb = gait(bx, t, -40), gk = gait(kx, t, -90);
      P(b, { x: gb.x, walk: gb.walk, lean: gb.lean, look: 0.5, blink: blinkAt(t), mood: 'smile', facing: t > 2.4 && t < 3.0 ? -1 : 1 });
      P(kid, { x: gk.x, walk: gk.walk, lean: gk.lean, look: 0.5, blink: blinkAt(t, 1), mood: t > 3.8 ? 'grin' : 'smile' });
      P(seller, { look: -0.4, blink: blinkAt(t, 0.5), facing: -1, mood: 'smile' });
      // 大人：1.2〜2.0 で2枚を窓口へ
      const pay = easeInOut(seg(t, 1.2, 1.7)), backA = easeInOut(seg(t, 1.8, 2.2));
      const ha = { x: lerp(gb.x + 30, 250, pay * (1 - backA)), y: lerp(200, 164, pay * (1 - backA)) };
      A.to('R', t < 2.4 ? ha.x : gb.x + 26, t < 2.4 ? ha.y : 204); A.to('L', gb.x - 20, 204);
      big.forEach((c, i) => { if (t < 1.7) k.tf(c, ha.x + i * 6, ha.y - 4 - i * 3); else k.tf(c, 254 + i * 14, 159); });
      // 子ども：3.2〜3.8 で1枚
      const pk = easeInOut(seg(t, 3.1, 3.5)), bk = easeInOut(seg(t, 3.6, 4.0));
      const hk = { x: lerp(gk.x + 18, 248, pk * (1 - bk)), y: lerp(212, 164, pk * (1 - bk)) };
      Kd.to('R', hk.x, hk.y); Kd.to('L', gk.x - 12, 214);
      if (t < 3.5) k.tf(small, hk.x, hk.y - 4, 0, 1); else k.tf(small, 296, 159);
      hiA.setAttribute('opacity', t > 1.0 && t < 2.4 ? 1 : 0);
      hiC.setAttribute('opacity', t > 2.9 ? 1 : 0);
      k.tf(rowA, 0, 0, 0, 1); k.tf(rowC, 0, 0, 0, 1);
      void pops; void hump;
    }
  };
}
