// opinion：私の意見は「映画は長すぎた」。まめの吹き出しの中でフィルムが長く伸び、サムズダウンが出る（例文 In my opinion, the movie was too long.）
import { seg, lerp, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, say } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '意見を言う'], [1.2, '映画は…'], [2.6, '長すぎた']] };
const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 90, y: FY, scale: 0.95 });
  const f = k.buddy({ x: 330, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sp = say(k, 190, 96, -1);
  el('rect', { x: -80, y: -8, width: 160, height: 28, rx: 4, fill: pal.ink }, sp.g);
  const strip = el('rect', { x: -80, y: -8, width: 20, height: 28, rx: 4, fill: pal.ink }, sp.g);
  const hole = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => el('rect', { x: -76 + i * 20, y: -4, width: 8, height: 5, rx: 1, fill: '#fff' }, sp.g));
  const mv = g({}, sp.g); tf(mv, -62, -30); k.text(0, 0, '🎬', { 'font-size': 22, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, mv);
  const th = g({}, sp.g); k.text(0, 0, '❌', { 'font-size': 26, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, th);
  return {
    update(t) {
      const w = easeOut(seg(t, 1.2, 2.6));
      hole.forEach((h, i) => h.setAttribute('opacity', (i * 20) / 160 <= w ? 1 : 0));
      k.set(strip, { width: 160 * w });
      sp.show(seg(t, 0.4, 0.8), 190, 100);
      tf(th, 60, -30, 0, backOut(seg(t, 2.7, 3.1)));
      P(b, { armR: lerp(20, 90, seg(t, 0.3, 0.8)), mood: t > 2.7 ? 'flat' : 'open', look: 0.5, blink: blinkAt(t) });
      P(f, { facing: -1, look: -0.5, mood: t > 2.7 ? 'smile' : 'flat', blink: blinkAt(t, 1) });
    }
  };
}
