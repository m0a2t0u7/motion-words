// rainbow：雨上がりの空に虹がかかる。まめが「見て！」と指さし、友だちもふり向いて見上げる（例文 Look, there's a rainbow!）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, cloudG, treeG, P, blinkAt, point, mark } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '雨上がり'], [1.2, '見て！'], [2.6, '虹だ']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.95;
  const { FY } = scene(k, { FY: 240, top: '#9FCDF0', bot: '#EAF5FC' });
  const cols = ['#F2685B', '#FF9A4C', '#FFCF5C', '#59C27A', '#6AA8F7', '#A58BF3'];
  const arcs = cols.map((c, i) => { const r = 150 - i * 9; return el('path', { d: `M ${250 - r} 220 A ${r} ${r} 0 0 1 ${250 + r} 220`, stroke: c, 'stroke-width': 9, fill: 'none', 'stroke-dasharray': `${Math.PI * r} ${Math.PI * r}`, 'stroke-dashoffset': Math.PI * r, opacity: 0.9 }); });
  tf(cloudG(k, 80, 28), 120, 60); tf(cloudG(k, 90, 30), 380, 90);
  hills(k, FY);
  tf(treeG(k, 0.9).g, 30, FY + 2);
  [[150, FY + 16, 30], [290, FY + 24, 40]].forEach(([x, y, rx]) => el('ellipse', { cx: x, cy: y, rx, ry: 5, fill: '#B9DEF2' }));
  const a = k.buddy({ x: 110, y: FY, scale: S });
  const c = k.buddy({ x: 190, y: FY, scale: S * 0.95, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const ex = mark(k, '!', pal.coralDark);
  return {
    update(t) {
      arcs.forEach((n, i) => { const r = 150 - i * 9; n.setAttribute('stroke-dashoffset', (Math.PI * r * (1 - easeInOut(seg(t, 0.3 + i * 0.05, 1.5 + i * 0.05)))).toFixed(1)); });
      const pt = easeOut(seg(t, 1.1, 1.5));
      P(a, { look: 0.6, lean: -4 * pt, mood: pt > 0.3 ? 'open' : 'smile', blink: blinkAt(t), lift: 6 * hump(seg(t, 1.1, 1.4)), armL: 8 + 10 * pt });
      a.body.children[3].setAttribute('transform', `translate(4 ${(-4 * pt).toFixed(1)})`);
      a.pose({ armR: lerp(8, point(a, S, 'R', 250, 90), pt), mood: t > 2.8 ? 'grin' : a.state.mood });
      ex.show(seg(t, 1.1, 1.4), 90, FY - 118);
      const turn = seg(t, 1.8, 2.0) > 0.5 ? 1 : -1, up = easeInOut(seg(t, 2.0, 2.6));
      P(c, { facing: turn, look: turn > 0 ? 0.6 : -0.5, lean: -5 * up, armL: 8 + 25 * up, armR: 8 + 25 * up, mood: up > 0.5 ? 'grin' : 'smile', blink: blinkAt(t, 1), lift: 4 * hump(seg(t, 1.8, 2.0)) });
      c.body.children[3].setAttribute('transform', `translate(${(4 * up).toFixed(1)} ${(-4 * up).toFixed(1)})`);
    }
  };
}
