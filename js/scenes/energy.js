// energy：長い一日のあと、夕方に帰ってきたまめの電池マークが空になり、ソファにぐったり沈む（例文 I have no energy after a long day.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { hp, gait } from './dig.js';
import { sofa } from './run-after.js';

// 電池マーク（原点＝中心）。set(level 0..1)
export function battery(k, parent) {
  const { el, g, pal } = k;
  const o = g({}, parent || k.root);
  el('rect', { x: -22, y: -11, width: 44, height: 22, rx: 5, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, o);
  el('rect', { x: 22, y: -5, width: 5, height: 10, rx: 2, fill: pal.ink }, o);
  const bar = el('rect', { x: -18, y: -7, width: 36, height: 14, rx: 2, fill: pal.green }, o);
  return { g: o, set(v) { k.set(bar, { width: Math.max(0.5, 36 * v), fill: v > 0.5 ? pal.green : v > 0.25 ? pal.yellowDark : pal.red }); } };
}

export const meta = { duration: 4.4, beats: [[0, '長い一日'], [1.4, '元気がない'], [2.8, 'ぐったり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('rect', { x: 150, y: 40, width: 90, height: 64, rx: 6, fill: '#F6B98E', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 210, cy: 92, r: 12, fill: '#F7895B' });
  el('rect', { x: 150, y: 88, width: 90, height: 16, fill: '#E8A27C' });
  el('line', { x1: 195, y1: 40, x2: 195, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 10, y: FY - 116, width: 60, height: 116, rx: 3, fill: '#C9B08F' });
  el('circle', { cx: 60, cy: FY - 58, r: 4, fill: pal.yellowDark });
  const SX = 308, sf = sofa(k, SX, FY, 150);
  const S = 0.95, b = k.buddy({ x: 50, y: FY, scale: S });
  sf.front();
  const bag = g({});
  el('rect', { x: -12, y: 4, width: 24, height: 18, rx: 3, fill: pal.coffee }, bag);
  el('path', { d: 'M -6 4 V 0 H 6 V 4', fill: 'none', stroke: '#5E3B25', 'stroke-width': 2.5 }, bag);
  const bat = battery(k);
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const xf = (t) => lerp(50, 300, easeInOut(seg(t, 0.1, 2.3)));
  return {
    update(t) {
      const p = gait(xf, t, 50, 8, 0.08);
      const turn = easeInOut(seg(t, 2.3, 2.55)), sit = easeIn(seg(t, 2.55, 2.85)), land = seg(t, 2.85, 3.6);
      const fc = lerp(1, -1, turn), face = Math.sign(fc || 1) * Math.max(0.1, Math.abs(fc));
      const y = FY - 22 * sit;
      b.pose({ x: p.x, y, walk: p.walk, facing: face, lean: lerp(10 + p.lean, -14, sit), squash: lerp(0.95, 0.86, sit) + 0.05 * wobble(land, 2, 4),
        armR: lerp(p.armR * 0.5 + 6, 24, sit), armL: lerp(p.armL * 0.5 + 6, 30, sit), mood: 'sad', blink: lerp(0.3, 0.75, seg(t, 1.0, 2.0)), look: lerp(0, -0.5, sit) });
      const h = hp(b, S, 'R', 28);
      if (t < 2.4) tf(bag, h.x, h.y - 4, 0, S);
      else { const q = easeIn(seg(t, 2.4, 2.65)); tf(bag, lerp(h.x, 262, q), lerp(h.y - 4, FY - 22, q), 0, S); }
      const lv = lerp(0.5, 0.06, easeInOut(seg(t, 0.2, 2.8)));
      bat.set(lv);
      const blink = t > 2.8 && Math.sin(t * 10) < 0 ? 0.35 : 1;
      tf(bat.g, b.state.x, y - 112 - 4 * Math.sin(t * 2), 0, 1); bat.g.setAttribute('opacity', blink);
      const sq = seg(t, 1.2, 2.2);
      tf(sweat, b.state.x - 22 * face, y - 84 + 18 * sq, 0, 1); sweat.setAttribute('opacity', hump(sq));
    }
  };
}
