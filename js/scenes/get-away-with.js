// get away with：「芝生に入るな」の札。見張りが居眠りしている間に、まめが芝生を横切ってにんまり。見張りは最後まで気づかない（例文 He got away with breaking the rule.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { gait, faceAt } from './weigh.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '立入禁止の芝生'], [1.6, 'こっそり横切る'], [3.6, 'おとがめなし']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 芝生（手前の床に）
  el('rect', { x: 104, y: 238, width: 150, height: 36, rx: 10, fill: '#A8DDB0' });
  for (let i = 0; i < 14; i++) el('path', { d: `M ${114 + i * 10} 262 l 3 -8 l 3 8`, stroke: '#6BC48F', 'stroke-width': 2, fill: 'none' });
  // 札：足あと＋斜線
  el('rect', { x: 128, y: 196, width: 5, height: 46, fill: pal.woodDark });
  el('circle', { cx: 130, cy: 188, r: 17, fill: '#fff', stroke: pal.red, 'stroke-width': 4 });
  el('ellipse', { cx: 127, cy: 190, rx: 4, ry: 7, fill: pal.ink }); el('ellipse', { cx: 134, cy: 185, rx: 3.4, ry: 6, fill: pal.ink });
  el('line', { x1: 118, y1: 176, x2: 142, y2: 200, stroke: pal.red, 'stroke-width': 4 });
  // 見張り（帽子）
  const gd = k.buddy({ x: 368, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark, facing: 1 });
  const cap = g({}, gd.body);
  el('rect', { x: -30, y: -84, width: 60, height: 12, rx: 5, fill: pal.blueDark }, cap);
  el('rect', { x: 18, y: -76, width: 22, height: 5, rx: 2, fill: pal.blueDark }, cap);
  const zz = [0, 1, 2].map((i) => k.text(0, 0, 'z', { 'font-size': 12 + i * 4, fill: pal.sub }));
  const b = k.buddy({ x: 50, y: 250, scale: 0.9 });
  const steps = g({});
  const prints = [0, 1, 2, 3].map((i) => el('ellipse', { cx: 130 + i * 30, cy: 258 + (i % 2) * 6, rx: 5, ry: 3, fill: '#6BAF7A', opacity: 0 }, steps));
  const xf = (t) => lerp(50, 290, easeInOut(seg(t, 0.4, 3.2)));
  return {
    update(t) {
      const p = gait(xf, t, 50, 14);
      const sneak = hump(seg(p.x, 110, 270));
      b.pose({ x: p.x, y: 250, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean + 8 * sneak, squash: 1 - 0.06 * sneak, look: lerp(0.5, 1, sneak),
        mood: t > 3.2 ? 'grin' : sneak > 0.3 ? 'flat' : 'smile', facing: 1 });
      prints.forEach((pr, i) => pr.setAttribute('opacity', p.x > 130 + i * 30 ? 0.6 * (1 - seg(t, 3.0, 3.6)) : 0));
      // 見張り：ずっと居眠り（ゆっくり呼吸、Zが浮かぶ）
      gd.pose({ facing: -1, blink: 1, mood: 'flat', armL: 6, armR: 6, lean: 8 + Math.sin(t * 2) * 2, squash: 1 - 0.03 * (1 + Math.sin(t * 2)) / 2, look: 0.2 });
      zz.forEach((z, i) => { const q = (t * 0.4 + i / 3) % 1; k.set(z, { x: 372 + q * 18 + i * 4, y: 150 - q * 40, opacity: Math.sin(q * Math.PI) }); });
      tf(cap, 0, 0);
    }
  };
}
