// water under the bridge：けんか中の二人が橋の上で仲直り→けんかの雲が橋の下を流れて去っていく（Don't worry about our fight. It's water under the bridge.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, 'けんかの最中'], [1.4, '仲直り'], [3.0, '流れ去った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 176;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  // 遠景の丘と対岸
  el('path', { d: 'M 0 150 Q 80 100 170 140 Q 260 96 400 146 L 400 214 L 0 214 Z', fill: '#DDEFE0' });
  el('rect', { x: 0, y: 190, width: 400, height: 30, fill: '#C9E6CF' });
  // 川
  el('rect', { x: 0, y: 214, width: 400, height: 86, fill: pal.water });
  const rip = g({});
  for (let i = -1; i < 11; i++) [[226, 0], [252, 22], [276, 8], [290, 30]].forEach(([y, o]) => el('path', { d: `M ${i * 44 + o} ${y} q 8 -4 16 0`, fill: 'none', stroke: '#fff', 'stroke-width': 2.2, opacity: 0.7, 'stroke-linecap': 'round' }, rip));
  // けんかの雲（水面を流れる）
  const puff = g({});
  const pg = g({}, puff);
  el('circle', { cx: -9, cy: -2, r: 10, fill: '#8E97A8' }, pg);
  el('circle', { cx: 3, cy: -8, r: 12, fill: '#8E97A8' }, pg);
  el('circle', { cx: 13, cy: -1, r: 9, fill: '#8E97A8' }, pg);
  el('path', { d: 'M -8 -3 l 5 -8 l 4 8 l 5 -8', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, pg);
  // 橋の土台（アーチ）
  el('path', { d: 'M 60 176 H 340 V 242 H 260 V 226 Q 260 192 200 192 Q 140 192 140 226 V 242 H 60 Z', fill: '#E4DDD2' });
  el('path', { d: 'M 140 226 Q 140 192 200 192 Q 260 192 260 226', fill: 'none', stroke: '#CFC6B8', 'stroke-width': 5 });
  el('rect', { x: 52, y: 174, width: 296, height: 8, rx: 3, fill: '#CFC6B8' });
  [[90, 210], [310, 210]].forEach(([x, y]) => el('path', { d: `M ${x - 18} ${y} h 36 M ${x - 12} ${y - 14} h 24 M ${x - 18} ${y + 14} h 36`, stroke: '#CFC6B8', 'stroke-width': 3 }));
  // 両岸
  el('rect', { x: 0, y: 176, width: 54, height: 38, fill: '#BFE0B8' });
  el('rect', { x: 346, y: 176, width: 54, height: 38, fill: '#BFE0B8' });
  // 水際の泡
  el('ellipse', { cx: 100, cy: 243, rx: 40, ry: 3.5, fill: '#fff', opacity: 0.8 });
  el('ellipse', { cx: 300, cy: 243, rx: 40, ry: 3.5, fill: '#fff', opacity: 0.8 });
  // 橋の手すり（奥）
  el('rect', { x: 60, y: 134, width: 280, height: 4, rx: 2, fill: pal.woodDark });
  for (let i = 0; i < 8; i++) el('rect', { x: 66 + i * 38, y: 134, width: 5, height: 42, fill: pal.woodDark });
  // 怒りマーク
  const mk = (cx) => { const m = g({}); el('path', { d: 'M -14 4 l 7 -12 l 7 12 l 7 -12 l 7 12', fill: 'none', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m); return m; };
  const m1 = mk(), m2 = mk();

  const a = k.buddy({ x: 150, y: FY, facing: -1 });
  const c = k.buddy({ x: 256, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      tf(rip, -((t * 26) % 44), 0);
      const px = lerp(10, 450, t / 3.8);
      tf(puff, px, 224 + 2 * Math.sin(t * 3), 0, 1.15);
      tf(pg, 0, 0, 5 * Math.sin(t * 2.4));
      // 仲直り
      const ta = easeInOut(seg(t, 0.9, 1.3)), tc = easeInOut(seg(t, 1.1, 1.5));
      const hold = easeOut(seg(t, 1.4, 1.8));
      const shake = Math.sin(t * 16) * 7 * hump(seg(t, 1.7, 2.5));
      const rel = easeOut(seg(t, 2.4, 3.0));
      const anger = 1 - easeIn(seg(t, 0.8, 1.2));
      a.pose({
        facing: lerp(-1, 1, ta), armR: lerp(8, 90, hold) + shake, armL: lerp(40, 8, ta),
        lean: lerp(0, 4, hold), look: lerp(0.3, 0.8, rel), squash: 1 - 0.015 * Math.sin(t * 5),
        mood: t < 0.9 ? 'sad' : t < 2.4 ? 'smile' : 'grin'
      });
      c.pose({
        facing: lerp(1, -1, tc), armR: lerp(8, 90, hold) - shake, armL: lerp(40, 8, tc),
        lean: lerp(0, 4, hold), look: lerp(0.3, 0.2, rel), squash: 1 - 0.015 * Math.sin(t * 5 + 1),
        mood: t < 1.1 ? 'sad' : t < 2.4 ? 'smile' : 'grin'
      });
      const jit = Math.sin(t * 30) * 1.2 * anger;
      tf(m1, 150 + jit, FY - 108 - 3 * (1 - anger), 0, anger);
      tf(m2, 256 - jit, FY - 108 - 3 * (1 - anger), 0, anger);
      m1.setAttribute('opacity', anger > 0.02 ? 1 : 0);
      m2.setAttribute('opacity', anger > 0.02 ? 1 : 0);
    }
  };
}
