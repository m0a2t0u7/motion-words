// immigration：入国審査のブースの前に長い列。パスポートを持ったまめは最後尾で、列は少しずつしか進まない（例文 There was a long line at immigration.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt, hall, held, person, deskFront, drop } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '入国審査'], [1.4, '長い列'], [3.0, 'なかなか進まない']] };

export function passport(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -8, y: -11, width: 16, height: 22, rx: 2, fill: '#3E4E8C' }, g);
  k.el('circle', { cx: 0, cy: -2, r: 4, fill: 'none', stroke: '#FFE08A', 'stroke-width': 1.5 }, g);
  return g;
}
export function create(k) {
  const { el, pal } = k;
  const FY = 236;
  hall(k, FY, { win: false });
  // 審査ブース（パスポートの絵）
  el('rect', { x: 30, y: 30, width: 70, height: 40, rx: 6, fill: pal.blue });
  const pp = passport(k); k.tf(pp, 52, 50); el('rect', { x: 66, y: 44, width: 22, height: 12, rx: 2, fill: '#fff' });
  const off = k.buddy({ x: 60, y: FY - 26, scale: 0.78, facing: 1, color: pal.blue, dark: pal.blueDark });
  deskFront(k, 20, 90, FY - 56, FY, '#C9D1DC', '#9AA5B4');
  // 列の仕切りベルト
  el('line', { x1: 110, y1: FY - 30, x2: 400, y2: FY - 30, stroke: '#4A5468', 'stroke-width': 4 });
  [130, 210, 290, 370].forEach((x) => el('rect', { x: x - 3, y: FY - 34, width: 6, height: 34, fill: pal.sub }));
  const cols = ['coral', 'yellow', 'violet', 'blue', 'coral', 'yellow'];
  const line = cols.map((c, i) => person(k, c, { x: 140 + i * 44, y: FY + 8, scale: 0.7, facing: -1 }));
  const me = k.buddy({ x: 400, y: FY + 8, scale: 0.7, facing: -1 });
  const ps = passport(k);
  const sw = drop(k);
  return {
    update(t) {
      // 1歩だけ進む（1.8〜2.4、3.6〜4.2）
      const st = 18 * easeInOut(seg(t, 1.8, 2.4)) + 18 * easeInOut(seg(t, 3.6, 4.2));
      const moving = (t > 1.8 && t < 2.4) || (t > 3.6 && t < 4.2);
      line.forEach((b, i) => P(b, { x: 140 + i * 44 - st, facing: -1, walk: moving ? st * 0.3 : 0, look: 0.3, mood: 'flat', blink: blinkAt(t, i * 0.4) }));
      const mx = lerp(440, 404, easeInOut(seg(t, 0, 1.0))) - st;
      P(me, { x: mx, facing: -1, walk: t < 1.0 ? mx * 0.1 : moving ? st * 0.3 : 0, look: t > 1.2 && t < 2.6 ? 0.9 : 0.3, mood: t > 1.2 ? 'sad' : 'smile', blink: blinkAt(t), armR: 50, lean: t > 2.8 ? -4 : 0 });
      me.body.children[3].setAttribute('transform', t > 1.2 && t < 2.6 ? 'translate(0 -6)' : 'translate(0 0)');
      held(k, me, 0.7, ps, 'R', 90);
      P(off, { x: 60, y: FY - 26, look: 0.6, mood: 'flat', blink: blinkAt(t, 2), armR: 40 + 20 * hump((t * 0.8) % 1) });
      const sp = seg(t, 3.0, 4.2); k.tf(sw, mx - 20, FY - 80 + 10 * sp, 0, sp > 0 ? 1 : 0.001); sw.setAttribute('opacity', 1 - sp * 0.6);
    }
  };
}
