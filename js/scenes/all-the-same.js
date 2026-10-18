// all the same：玄関の外は雨。2人は顔を見合わせるが、それでも傘を開いて雨の中へ出かける（例文 It was raining, but we went out all the same.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { streetBg } from './weigh.js';
import { rain } from './work-on.js';
import { hp } from './dig.js';

// 傘（原点＝持ち手。open 0..1）
export function umbrella(k, color, dark) {
  const g = k.g({});
  k.el('line', { x1: 0, y1: 0, x2: 0, y2: -58, stroke: k.pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  k.el('path', { d: 'M 0 0 Q 0 6 -6 6', stroke: k.pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
  const can = k.g({}, g);
  k.el('path', { d: 'M -40 0 Q -38 -30 0 -32 Q 38 -30 40 0 Q 33 -6 27 0 Q 20 -6 13 0 Q 7 -6 0 0 Q -7 -6 -13 0 Q -20 -6 -27 0 Q -33 -6 -40 0 Z', fill: color, stroke: dark, 'stroke-width': 2 }, can);
  return { g, set(x, y, open, rot = 0) { k.tf(g, x, y, rot); k.tf(can, 0, -50, 0, lerp(0.12, 1, open), lerp(1.4, 1, open)); } };
}

export const meta = { duration: 4.4, beats: [[0, '外は雨'], [1.3, '見合わせる'], [2.4, 'それでも出る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  el('rect', { x: 0, y: 0, width: 400, height: FY - 6, fill: '#5A6680', opacity: 0.22 });
  // 家の玄関（左）とひさし
  el('rect', { x: 0, y: 60, width: 130, height: FY - 60, fill: '#FBE9DC' });
  el('rect', { x: 30, y: FY - 112, width: 70, height: 112, rx: 3, fill: '#8B6A55' });
  el('rect', { x: 34, y: FY - 108, width: 62, height: 108, fill: pal.blue });
  el('rect', { x: -4, y: 104, width: 190, height: 10, rx: 4, fill: pal.coralDark });
  el('rect', { x: 0, y: FY, width: 190, height: 6, fill: '#D5DCE5' });
  const R = rain(k, 40, FY, 150, 420);
  const c = k.buddy({ x: 92, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 150, y: FY, facing: 1 });
  const ub = umbrella(k, pal.blue, pal.blueDark), uc = umbrella(k, pal.yellow, pal.yellowDark);
  return {
    update(t) {
      R(t, 1);
      const look = seg(t, 1.0, 1.9);
      const turn = look > 0 && look < 1;
      const op = easeOut(seg(t, 2.0, 2.4));
      const xb = (tt) => lerp(150, 330, easeInOut(seg(tt, 2.5, 4.3)));
      const xc = (tt) => lerp(92, 250, easeInOut(seg(tt, 2.6, 4.4)));
      const wb = walkTo(xb, t, 150, 1), wc = walkTo(xc, t, 92, 1);
      const raise = easeOut(seg(t, 1.95, 2.3));
      P(b, { ...wb, facing: turn ? -1 : 1, armR: lerp(30, 150, raise), armL: wb.armL, look: turn ? 0.6 : t < 1.0 ? 0.2 : 0.5, mood: t < 1.0 ? 'flat' : turn ? 'flat' : 'grin', blink: blinkAt(t) });
      P(c, { ...wc, facing: 1, armR: lerp(30, 150, raise), armL: wc.armL, look: turn ? 0.8 : 0.4, mood: t < 1.0 ? 'sad' : turn ? 'flat' : 'grin', blink: blinkAt(t, 1) });
      // 首をかしげる
      b.body.setAttribute('transform', b.body.getAttribute('transform') + ` rotate(${(turn ? 6 * hump(look) : 0).toFixed(2)})`);
      const hb = hp(b, 1), hc = hp(c, 1);
      ub.set(hb.x, hb.y + 4, op); uc.set(hc.x, hc.y + 4, op);
    }
  };
}
