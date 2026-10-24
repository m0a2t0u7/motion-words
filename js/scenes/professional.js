// professional：プロの写真家に助けを頼む。まめが頼むと、カメラを下げたプロが来て、撮影してくれる（例文 She asked a professional photographer for help.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, say } from './look-over.js';
import { held } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '助けを頼む'], [1.4, 'プロが来る'], [2.9, '撮ってくれた']] };
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 100, y: FY, scale: S });
  const p = k.buddy({ x: 400, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const badge = g({}, p.body); tf(badge, 0, -42);
  el('path', { d: 'M 0 -7 L 2 -2 L 7 -2 L 3 1 L 5 6 L 0 3 L -5 6 L -3 1 L -7 -2 L -2 -2 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1 }, badge);
  const cam = g({});
  el('rect', { x: -22, y: -14, width: 44, height: 28, rx: 6, fill: pal.ink }, cam);
  el('circle', { cx: 0, cy: 2, r: 10, fill: '#2B3A55', stroke: '#9FB4CC', 'stroke-width': 3 }, cam);
  const sp = say(k, 52, 40, -1); const ic = g({}, sp.g); k.text(0, 0, '📷', { 'font-size': 22, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, ic);
  const fl = el('circle', { cx: 130, cy: 150, r: 80, fill: '#fff', opacity: 0 });
  const ph = g({}); k.el('rect', { x: -22, y: -28, width: 44, height: 56, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, ph);
  el('rect', { x: -17, y: -23, width: 34, height: 38, fill: '#DDEFFA' }, ph); el('circle', { cx: 6, cy: -11, r: 5, fill: pal.yellow }, ph); el('path', { d: 'M -17 15 L -4 0 L 6 10 L 17 -2 L 17 15 Z', fill: '#7FD3A0' }, ph);
  const xf = (t) => lerp(400, 250, easeInOut(seg(t, 1.0, 2.4)));
  return {
    update(t) {
      sp.show(seg(t, 0.2, 0.6) * (1 - seg(t, 1.8, 2.0)), 120, 110);
      const w = walkTo(xf, t, 400, -1);
      P(p, { ...w, facing: -1, armR: lerp(w.armR, 80, seg(t, 2.3, 2.7)), mood: 'smile', look: -0.5, blink: blinkAt(t, 1) });
      held(k, p, S, cam, 'R', 0, 22);
      fl.setAttribute('opacity', 0.85 * hump(seg(t, 2.8, 3.1)));
      tf(ph, 330, 120, 6, backOut(seg(t, 3.2, 3.7)));
      P(b, { armR: lerp(10, 100, seg(t, 0.2, 0.5)) * (1 - seg(t, 1.8, 2.2)) + 10, mood: t > 3.0 ? 'grin' : 'open', look: 0.6, blink: blinkAt(t) });
    }
  };
}
