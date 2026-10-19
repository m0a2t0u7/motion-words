// let：夜10時すぎ、子ども（まめ）が「まだ起きていたい」と頼み、ソファの両親が「OK」。まめは喜んで本を読み続ける（例文 My parents let me stay up late.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt, clock, sofa } from './run-after.js';
import { roomBg } from './look-over.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '夜おそい'], [1.6, 'いいよ'], [2.7, '起きていられる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240, 'evening');
  const ck = clock(k, 200, 62, 22);
  // スタンドの明かり
  el('ellipse', { cx: 40, cy: 150, rx: 60, ry: 40, fill: '#FFF3C4', opacity: 0.35 });
  el('rect', { x: 38, y: 130, width: 4, height: FY - 130, fill: pal.sub });
  el('path', { d: 'M 22 132 L 58 132 L 50 108 L 30 108 Z', fill: pal.yellow });
  k.shadow(40, FY + 1, 16, 3);
  const sf = sofa(k, 300, FY, 170);
  const mom = k.buddy({ x: 268, y: FY - 26, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const dad = k.buddy({ x: 332, y: FY - 26, scale: 0.9, facing: -1, color: pal.blue, dark: pal.blueDark });
  sf.front();
  const me = k.buddy({ x: 140, y: FY, scale: 0.68 });
  const book = g({});
  el('path', { d: 'M -14 -9 L 0 -6 L 14 -9 L 14 8 L 0 11 L -14 8 Z', fill: pal.violet }, book);
  el('path', { d: 'M -12 -7 L 0 -4 L 12 -7 L 12 6 L 0 9 L -12 6 Z', fill: '#fff' }, book);
  const ask = cue(k, '', 46, 32, -1); el('path', { d: 'M 4 -10 A 10 10 0 1 0 6 8 A 8 8 0 1 1 4 -10 Z', fill: pal.yellow }, ask.g); k.text(-8, 1, '?', { 'font-size': 16, fill: pal.blueDark }, ask.g);
  const ok = cue(k, 'OK', 50, 30, 1, 16);
  return {
    update(t) {
      ck.set(10, lerp(5, 40, seg(t, 0, 4.4)));
      const plead = hump(seg(t, 0.3, 1.6));
      const yay = hump(seg(t, 2.5, 3.0)), sit = 0;
      P(me, { facing: t < 2.9 ? 1 : 1, look: t < 2.9 ? 0.7 : 0.2, armR: lerp(8, 70, easeOut(seg(t, 0.3, 0.7))) * (1 - seg(t, 2.4, 2.6)) + 150 * yay + 62 * easeOut(seg(t, 3.0, 3.4)), armL: 8 + 130 * yay, lean: 8 * plead - 6 * yay, lift: 14 * yay, squash: 1 - 0.12 * sit + 0.05 * hump(seg(t, 2.95, 3.15)), mood: t > 2.4 ? 'grin' : 'flat', blink: blinkAt(t, 0.3) });
      const h = hp(me, 0.68, 'R', 24);
      tf(book, h.x + 6, h.y - 4, -10 * yay, 0.8);
      ask.show(seg(t, 0.4, 0.65) * (1 - seg(t, 1.6, 1.8)), 176, 140);
      const nod = Math.sin(seg(t, 1.6, 2.4) * Math.PI * 2) * 7 * (t > 1.6 && t < 2.4);
      P(mom, { lean: nod, look: 0.6, mood: talk(t, 1.7, 2.2) || 'smile', armR: 8 + 90 * hump(seg(t, 1.6, 2.6)), blink: blinkAt(t, 1.1) });
      P(dad, { lean: nod * 0.7, look: 0.5, mood: 'smile', blink: blinkAt(t, 0.6) });
      ok.show(seg(t, 1.7, 1.95) * (1 - seg(t, 2.8, 3.0)), 250, 128);
    }
  };
}
