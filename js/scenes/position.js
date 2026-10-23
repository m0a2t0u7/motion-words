// position：組織図のいちばん上の「MANAGER」の席が空いている。まめは応募書類を書いて担当者に出し、自分がその席に入る姿を思い描く（例文 He applied for a manager position.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, hold, person, officeBg, paper, pencil, desk, sym } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '空いた役職'], [1.34, '応募書類を書く'], [2.87, '応募した']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = officeBg(k, 236, 400);
  // 組織図ボード
  el('rect', { x: 20, y: 18, width: 220, height: 128, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const top = { x: 130, y: 40 };
  el('path', { d: 'M 130 52 v 14 M 70 66 h 120 M 70 66 v 12 M 130 66 v 12 M 190 66 v 12 M 70 100 v 10 M 190 100 v 10 M 50 110 h 40 M 170 110 h 40 M 50 110 v 8 M 90 110 v 8 M 170 110 v 8 M 210 110 v 8', stroke: pal.sub, 'stroke-width': 2, fill: 'none' });
  const slot = el('rect', { x: 92, y: 26, width: 76, height: 26, rx: 5, fill: '#FFF7E0', stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
  k.text(130, 34, 'MANAGER', { 'font-size': 9, fill: pal.yellowDark });
  const q = k.text(130, 45, '?', { 'font-size': 11, fill: pal.yellowDark });
  const cell = (x, y, c) => { el('rect', { x: x - 16, y, width: 32, height: 22, rx: 4, fill: c }); el('circle', { cx: x, cy: y + 9, r: 5, fill: '#fff', opacity: 0.8 }); };
  [[70, 78, pal.coral], [130, 78, pal.blue], [190, 78, pal.yellow]].forEach(([x, y, c]) => cell(x, y, c));
  [[50, 118], [90, 118], [170, 118], [210, 118]].forEach(([x, y]) => { el('rect', { x: x - 12, y, width: 24, height: 18, rx: 3, fill: '#CFE7DF' }); });
  // 小さなまめの顔（席に入る想像）
  const ghost = g({}); el('rect', { x: -10, y: -10, width: 20, height: 18, rx: 8, fill: pal.mint }, ghost); el('circle', { cx: -3.5, cy: -3, r: 1.6, fill: pal.ink }, ghost); el('circle', { cx: 3.5, cy: -3, r: 1.6, fill: pal.ink }, ghost);
  const hr = person(k, 'violet', { x: 345, y: FY, scale: 0.95, facing: -1 });
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const dtop = desk(k, 70, 110, FY);
  const form = g({}); paper(k, form, 24, 30, 4, '#fff');
  const pn = pencil(k);
  const xf = (t) => lerp(120, 290, easeInOut(seg(t, 2.0, 2.9)));
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      const writing = t > 0.9 && t < 1.9, x = xf(t), walking = t > 2.0 && t < 2.9;
      P(b, { x, walk: walking ? (x - 120) * 0.107 : 0, lean: writing ? 12 : 3 * walking, look: t < 0.9 ? 0 : 0.7, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t), armL: 10, armR: 10 });
      if (t < 0.9) b.pose({ facing: 1, look: -0.3 });
      // 書く → 持って行く → 手渡す
      if (writing) aim(b, S, 'R', 150 + 8 * Math.sin(t * 22), dtop - 6);
      hold(k, b, S, pn, 'R', -30); pn.setAttribute('opacity', writing ? 1 : 0);
      const give = seg(t, 2.9, 3.3);
      if (t > 2.8) { aim(b, S, 'R', lerp(310, 318, give), FY - 64); aim(hr, 0.95, 'R', 322, FY - 64); }
      let fp;
      if (t < 1.9) fp = { x: 150, y: dtop - 2, flat: 1 };
      else if (give < 1) { const h = hp(b, S, t < 2.8 ? 'R' : 'R'); fp = { x: h.x, y: h.y - 6 }; }
      else { const h = hp(hr, 0.95, 'R'); fp = { x: h.x, y: h.y - 6 }; }
      if (fp.flat) tf(form, fp.x, fp.y, 0, 1.1, 0.16); else tf(form, fp.x, fp.y, 0, 0.9);
      P(hr, { x: 345, facing: -1, look: 0.5, mood: 'smile', blink: blinkAt(t, 1), armL: 8, armR: t > 2.8 ? 60 : 8 });
      if (t > 3.6) hr.pose({ armR: 50, lean: 4 });
      // 応募後：空席に自分の姿が浮かぶ（まだ「？」）
      const im = seg(t, 3.4, 3.9);
      tf(ghost, 118, 40, 0, im > 0 ? easeOut(im) * (1 + 0.05 * Math.sin(t * 6)) : 0.001); ghost.setAttribute('opacity', 0.75);
      tf(q, 0, 0, 0, 1); q.setAttribute('x', lerp(130, 146, im));
      slot.setAttribute('stroke-dashoffset', -t * 12);
    }
  };
}
