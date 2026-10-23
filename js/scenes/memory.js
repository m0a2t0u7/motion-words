// memory：名前を聞いたのに、次に会ったときまめは相手の名前が思い出せない（例文 I have a bad memory for names.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.2, beats: [[0, '名前を聞く'], [1.4, '次に会う'], [2.8, '思い出せない']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const b = k.buddy({ x: 100, y: FY, scale: S });
  const o = k.buddy({ x: 290, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const tg = g({}); tf(tg, 290, FY - 62);
  el('rect', { x: -22, y: -10, width: 44, height: 20, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, tg);
  const nm = k.text(0, 5, 'Mia', { 'font-size': 13, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle' }, tg);
  const cl = cloud(k, 100, 62, -1), q = em('❓', 32, cl.g), nm2 = k.text(0, 6, 'Mia', { 'font-size': 18, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle' }, cl.g);
  const fog = em('🌫️', 40);
  return { update(t) {
    const fade = seg(t, 1.8, 2.8);
    nm2.setAttribute('opacity', 1 - fade); q.setAttribute('opacity', fade);
    tg.setAttribute('opacity', 1 - 0.0);
    o.pose({ x: 290, y: FY, facing: -1, armL: 8, armR: 8 + 90 * hump(seg(t, 0.3, 1.0)) + 70 * hump(seg(t, 1.4, 2.0)), lean: 0, squash: 1, walk: 0, look: -0.5, mood: 'smile', blink: blinkAt(t, 1), lift: 0 });
    cl.show(seg(t, 0.4, 0.9), 200, 80);
    P(b, { look: 0.6, armR: t > 2.4 ? lerp(8, 160, easeOut(seg(t, 2.4, 2.9))) + 10 * Math.sin(t * 10) * seg(t, 2.9, 3.6) : 8, mood: t > 2.2 ? 'sad' : 'smile', blink: blinkAt(t) });
    tf(fog, 200, 80, 0, 0.9 * fade * (0.9 + 0.1 * Math.sin(t * 4)));
  } };
}
