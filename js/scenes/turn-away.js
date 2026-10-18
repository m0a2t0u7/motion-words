// turn away：満席のレストラン。店員が手のひらで止めて首をふり、ふたりは向きを変えて帰っていく（例文 The restaurant was full, so they turned us away.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 4.6, beats: [[0, '店に着く'], [1.8, '満席で断られる'], [3.6, '帰される']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E3E8EE' });
  // 店の外観
  el('rect', { x: 210, y: 70, width: 190, height: 166, fill: '#FFF1D2' });
  for (let i = 0; i < 10; i++) el('path', { d: `M ${210 + i * 19} 78 h 19 v 18 q -9.5 8 -19 0 Z`, fill: i % 2 ? '#fff' : pal.green });
  el('rect', { x: 206, y: 70, width: 198, height: 10, rx: 3, fill: '#3E9C5E' });
  el('rect', { x: 300, y: 112, width: 86, height: 70, rx: 5, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 3 });
  [[318, pal.coral], [342, pal.violet], [366, pal.blue]].forEach(([x, c]) => { el('circle', { cx: x, cy: 150, r: 10, fill: c, opacity: 0.85 }); el('rect', { x: x - 12, y: 160, width: 24, height: 22, rx: 8, fill: c, opacity: 0.85 }); });
  el('rect', { x: 300, y: 168, width: 86, height: 6, fill: pal.woodDark });
  el('rect', { x: 228, y: 120, width: 58, height: 116, rx: 3, fill: '#8A5A3C' });
  // 満席の札
  el('rect', { x: 236, y: 140, width: 42, height: 22, rx: 4, fill: pal.red });
  k.text(257, 151.5, 'FULL', { 'font-size': 12, fill: '#fff' });
  const S = 0.82;
  const staff = k.buddy({ x: 256, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const tie = el('path', { d: 'M -4 -40 L 4 -40 L 0 -30 Z', fill: pal.ink }, null); staff.body.appendChild(tie);
  const a = k.buddy({ x: -20, y: FY, scale: S });
  const c = k.buddy({ x: -70, y: FY, scale: S * 0.94, color: pal.blue, dark: pal.blueDark });
  const xa = (t) => t < 2.6 ? lerp(-20, 186, easeInOut(seg(t, 0.1, 1.6))) : lerp(186, 30, easeInOut(seg(t, 2.8, 4.5)));
  const xc = (t) => t < 2.6 ? lerp(-70, 136, easeInOut(seg(t, 0.1, 1.6))) : lerp(136, -20, easeInOut(seg(t, 2.7, 4.4)));
  return {
    update(t) {
      const stop = easeOut(seg(t, 1.5, 1.9)) * (1 - easeInOut(seg(t, 3.0, 3.4)));
      const shake = Math.sin(seg(t, 1.9, 2.7) * Math.PI * 4) * (t > 1.9 && t < 2.7 ? 1 : 0);
      P(staff, { x: 256, facing: -1, armR: lerp(8, 92, stop), armL: 8, look: 0.5 + 0.5 * shake, lean: 3 * stop, mood: t > 1.6 ? 'flat' : 'smile', blink: blinkAt(t, 1) });
      const wa = walkTo(xa, t, -20, 1), wc = walkTo(xc, t, -70, 1);
      const turned = t > 2.6;
      P(a, { ...wa, facing: turned ? -1 : 1, look: 0.6, mood: t > 1.9 ? 'sad' : 'smile', squash: 1 - 0.04 * hump(seg(t, 1.9, 2.6)), blink: blinkAt(t) });
      P(c, { ...wc, facing: t > 2.55 ? -1 : 1, look: 0.6, mood: t > 2.0 ? 'sad' : 'smile', blink: blinkAt(t, 2) });
    }
  };
}
