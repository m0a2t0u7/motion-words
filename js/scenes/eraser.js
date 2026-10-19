// eraser：答え「2+2=5」のまちがいを消しゴムでこすって消し、鉛筆で「4」と書き直す（例文 I need an eraser to fix the mistake in my answer.）
import { seg, lerp, easeInOut, clamp } from '../ease.js';
import { held, reach, hp, P, blinkAt, face } from './bag.js';
import { pencil as pencilProp } from './check.js';
import { studyDesk } from './notebook.js';

export function eraserProp(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -6, y: -2, width: 12, height: 20, rx: 3, fill: '#fff', stroke: k.pal.line }, g);
  k.el('rect', { x: -6, y: -2, width: 12, height: 9, rx: 2, fill: k.pal.blue }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'まちがい！'], [0.8, '消しゴムで消す'], [2.8, '書き直した']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1;
  const { FY, top, SX, SY, SW, SH } = studyDesk(k, { SX: 196, SY: 118, SW: 80, SH: 66 });
  el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  k.text(SX + 30, SY + 32, '2+2=', { 'font-size': 16, fill: pal.ink });
  const five = k.text(SX + 58, SY + 32, '5', { 'font-size': 16, fill: pal.ink });
  const four = k.text(SX + 58, SY + 32, '4', { 'font-size': 16, fill: pal.blueDark });
  const xm = el('path', { d: `M ${SX + 66} ${SY + 22} l 8 8 m 0 -8 l -8 8`, stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  const crumbs = [0, 1, 2, 3].map(() => el('circle', { r: 1.6, fill: '#B9C3D0' }));
  const pc = pencilProp(k); 
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const er = eraserProp(k);
  return {
    update(t) {
      P(b, { x: 150, lean: 16, look: 0.9, blink: blinkAt(t), mood: t > 3.2 ? 'grin' : t < 0.8 ? 'flat' : 'smile' });
      face(b, 5, 2);
      const rub = seg(t, 0.8, 2.0);
      const swap = seg(t, 2.0, 2.6);
      let tx, ty;
      if (t < 0.8) { tx = lerp(SX + 30, SX + 58, easeInOut(seg(t, 0.3, 0.8))); ty = SY + 30; }
      else if (t < 2.0) { tx = SX + 58 + 6 * Math.sin((t - 0.8) * 18); ty = SY + 30 + 2 * Math.cos((t - 0.8) * 18); }
      else if (t < 2.6) { tx = lerp(SX + 58, SX + 4, Math.sin(swap * Math.PI)); ty = lerp(SY + 30, top - 4, Math.sin(swap * Math.PI)); }
      else { const w = seg(t, 2.7, 3.3); tx = SX + 54 + 8 * w; ty = SY + 26 + 10 * Math.sin(w * Math.PI); }
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      const inEr = t < 2.3;
      if (inEr) held(k, b, S, er, 'R', 0, 34); else tf(er, SX + 4, top - 10, 90);
      if (!inEr) held(k, b, S, pc, 'R', 0); else tf(pc, SX + 4, top - 4, 90, S);
      five.setAttribute('opacity', 1 - rub);
      xm.setAttribute('opacity', t < 0.8 ? 1 : 1 - rub * 2);
      four.setAttribute('opacity', seg(t, 2.8, 3.3));
      crumbs.forEach((c, i) => { k.set(c, { cx: SX + 52 + i * 5, cy: SY + 40 + 10 * seg(t, 1.2 + i * 0.15, 2.4) }); c.setAttribute('opacity', t > 1.1 && t < 2.6 ? 1 : 0); });
    }
  };
}
