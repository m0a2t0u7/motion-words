// park：公園で子どもたちが遊ぶ。1人はブランコをこぎ、1人はすべり台をすべる（例文 The kids are playing in the park.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt } from './restaurant.js';
import { parkBg } from './bench.js';

export const meta = { duration: 4.4, beats: [[0, '公園で'], [1.4, '遊んでいる'], [3.0, 'すべり台へ']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  parkBg(k, FY);
  // ブランコ（支柱は動かない）
  el('path', { d: `M 40 ${FY} L 70 70 L 100 ${FY} M 150 ${FY} L 180 70 L 210 ${FY}`, stroke: '#E86F57', 'stroke-width': 7, fill: 'none', 'stroke-linejoin': 'round' });
  el('rect', { x: 64, y: 66, width: 122, height: 8, rx: 4, fill: '#E86F57' });
  k.shadow(125, FY + 2, 70, 4);
  const sw = g({});
  el('line', { x1: -14, y1: 0, x2: -14, y2: 120, stroke: pal.sub, 'stroke-width': 2.5 }, sw);
  el('line', { x1: 14, y1: 0, x2: 14, y2: 120, stroke: pal.sub, 'stroke-width': 2.5 }, sw);
  const kid1 = k.buddy({ x: 0, y: 132, scale: 0.6, parent: sw, color: pal.yellow, dark: pal.yellowDark });
  kid1.g.children[0].setAttribute('opacity', 0);
  el('rect', { x: -20, y: 120, width: 40, height: 6, rx: 3, fill: pal.woodDark }, sw);
  // すべり台
  el('rect', { x: 300, y: 120, width: 6, height: FY - 120, fill: pal.sub });
  el('rect', { x: 336, y: 120, width: 6, height: FY - 120, fill: pal.sub });
  for (let y = 140; y < FY; y += 22) el('line', { x1: 300, y1: y, x2: 342, y2: y, stroke: pal.sub, 'stroke-width': 4 });
  el('rect', { x: 292, y: 116, width: 56, height: 8, rx: 3, fill: pal.blue });
  el('path', { d: `M 296 120 Q 270 130 250 ${FY - 30} Q 236 ${FY - 6} 214 ${FY - 6}`, stroke: pal.yellow, 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' });
  k.shadow(290, FY + 2, 60, 4);
  const kid2 = k.buddy({ x: 320, y: 116, scale: 0.6, facing: -1, color: pal.coral, dark: pal.coralDark });
  // すべり台の道すじ（座った位置）
  const pt = (q) => { const x = lerp(296, 222, q); const y = q < 0.7 ? lerp(116, FY - 34, easeIn(q / 0.7) * 0.6 + q / 0.7 * 0.4) : lerp(FY - 34, FY - 10, (q - 0.7) / 0.3); return { x, y }; };
  return {
    update(t) {
      const a = 28 * Math.sin(t * 2.6);
      tf(sw, 125, 72, a);
      P(kid1, { armL: 160, armR: 160, lean: -a * 0.4, mood: 'grin', blink: blinkAt(t) });
      // 上で待つ → すべる → 下で立ち上がる
      const q = easeIn(seg(t, 1.6, 2.8)), stand = easeOut(seg(t, 3.0, 3.5));
      if (t < 1.6) P(kid2, { x: 320 - 20 * easeInOut(seg(t, 0.4, 1.4)), y: 116, armL: 40, armR: 40, mood: 'smile', blink: blinkAt(t, 1), facing: -1 });
      else { const p = pt(q); P(kid2, { x: t > 2.8 ? 222 - 10 * stand : p.x, y: t > 2.8 ? lerp(FY - 10, FY, stand) : p.y + 10, armL: lerp(150, 10, stand), armR: lerp(150, 120, stand), lean: lerp(-14, 0, stand), mood: 'grin', facing: -1, blink: 0 }); }
    }
  };
}
