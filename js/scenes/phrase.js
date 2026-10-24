// phrase：会議で、ホワイトボードの短い英語のかたまりに枠が付き、何人もが同じ吹き出しで使う（例文 This phrase is often used in business.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, hp, say } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, 'フレーズを書く'], [1.4, '枠で囲む'], [2.8, '皆が同じ言葉']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.82;
  const FY = roomBg(k, 'office', 240);
  el('rect', { x: 120, y: 30, width: 160, height: 84, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 4 });
  const words = ['Let’s', 'touch', 'base'].map((s, i) => k.text(152 + i * 48, 78, s, { 'font-size': 17, fill: pal.ink, 'font-weight': 700 }));
  const frame = el('rect', { x: 128, y: 56, width: 144, height: 32, rx: 8, fill: 'none', stroke: pal.coral, 'stroke-width': 3.5, 'stroke-dasharray': '352', });
  const tag = k.text(200, 46, 'phrase', { 'font-size': 11, fill: pal.coralDark });
  const m = k.buddy({ x: 70, y: FY, scale: S });
  const a = k.buddy({ x: 190, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 300, y: FY, scale: S, facing: -1, color: pal.blue, dark: pal.blueDark });
  const bub = [[a, 150], [b, 150], [m, 150]].map(([p, y]) => { const s = say(k, 74, 30, p === b ? 1 : -1); k.text(0, 5, 'touch base', { 'font-size': 11, fill: pal.ink }, s.g); return s; });
  return {
    update(t) {
      const wr = seg(t, 0.2, 1.3), fr = easeInOut(seg(t, 1.5, 2.3));
      words.forEach((w, i) => w.setAttribute('opacity', seg(wr, i / 3, (i + 1) / 3)));
      frame.setAttribute('stroke-dashoffset', 352 * (1 - fr)); frame.setAttribute('opacity', fr > 0 ? 1 : 0);
      tag.setAttribute('opacity', seg(t, 2.1, 2.5));
      P(m, { armR: lerp(8, 150, hump(seg(t, 0.1, 1.4))) + (wr < 1 && t > 0.2 ? Math.sin(t * 14) * 8 : 0), look: 1, blink: blinkAt(t), mood: t > 3 ? 'open' : 'smile' });
      P(a, { facing: 1, armR: 8 + hump(seg(t, 2.8, 3.4)) * 40, look: -1, mood: hump(seg(t, 2.8, 3.4)) > 0.3 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      P(b, { facing: -1, armR: 8 + hump(seg(t, 3.3, 3.9)) * 40, look: -1, mood: hump(seg(t, 3.3, 3.9)) > 0.3 ? 'open' : 'smile', blink: blinkAt(t, 2) });
      bub[0].show(seg(t, 2.8, 3.1) * (1 - seg(t, 3.9, 4.1) * 0), 188, 150);
      bub[1].show(seg(t, 3.3, 3.6), 292, 150);
      bub[2].show(seg(t, 3.7, 4.0), 92, 150);
    }
  };
}
