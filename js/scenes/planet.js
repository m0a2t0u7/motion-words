// planet：夜空の月のすぐ近くで、明るい惑星（輪のある星）が光る。2人で見つけて指さす（例文 We can see a bright planet near the moon tonight.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { nightBg, hills, P, blinkAt, point, popIn } from './nature.js';

export function planetG(k, r = 9, parent) {
  const g = k.g({}, parent);
  const glow = k.el('circle', { r: r * 2.6, fill: '#FFE9A8', opacity: 0.25 }, g);
  k.el('path', { d: `M ${-r * 1.9} 2 A ${r * 1.9} ${r * 0.6} -12 0 0 ${r * 1.9} -2`, stroke: '#F4D58A', 'stroke-width': 2.5, fill: 'none' }, g);
  k.el('circle', { r, fill: '#F6C979' }, g);
  k.el('path', { d: `M ${-r} -2 Q 0 1 ${r} -2`, stroke: '#E0A85B', 'stroke-width': 2, fill: 'none' }, g);
  k.el('path', { d: `M ${-r * 1.9} 2 A ${r * 1.9} ${r * 0.6} -12 0 1 ${r * 1.9} -2`, stroke: '#F4D58A', 'stroke-width': 2.5, fill: 'none', transform: 'rotate(-12)' }, g);
  return { g, glow };
}

export const meta = { duration: 4.2, beats: [[0, '月を見る'], [1.4, '明るい星？'], [2.6, '月の近くの惑星']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.95;
  const { FY } = nightBg(k, { FY: 240, n: 18 });
  // 三日月
  const MX = 250, MY = 70;
  el('circle', { cx: MX, cy: MY, r: 30, fill: '#FFF3C4' });
  el('circle', { cx: MX + 13, cy: MY - 8, r: 27, fill: '#22305A' });
  const pl = planetG(k, 9); tf(pl.g, MX + 52, MY + 30);
  const ring = el('circle', { cx: MX + 52, cy: MY + 30, r: 22, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: 0 });
  hills(k, FY, '#2F4157', '#384B62');
  const a = k.buddy({ x: 120, y: FY, scale: S });
  const c = k.buddy({ x: 60, y: FY, scale: S * 0.9, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      const br = easeOut(seg(t, 1.2, 2.2)), pt = easeInOut(seg(t, 1.8, 2.4)), turn = easeInOut(seg(t, 2.4, 2.9));
      pl.glow.setAttribute('r', 9 * (1.6 + 1.4 * br + 0.2 * Math.sin(t * 6)));
      pl.glow.setAttribute('opacity', 0.06 + 0.16 * br);
      ring.setAttribute('opacity', 0.8 * easeOut(seg(t, 2.6, 3.0)));
      ring.setAttribute('r', 22 + 3 * Math.sin(t * 5));
      P(a, { look: 0.7, lean: -5, mood: t > 2.0 ? 'open' : 'smile', blink: blinkAt(t), armL: 14 });
      a.body.children[3].setAttribute('transform', 'translate(4 -4)');
      a.pose({ armR: lerp(8, point(a, S, 'R', MX + 52, MY + 30), pt), mood: t > 3.2 ? 'grin' : a.state.mood });
      P(c, { look: lerp(0.7, 0.8, turn), lean: -5 * turn, mood: turn > 0.5 ? 'open' : 'smile', blink: blinkAt(t, 1.2), armR: lerp(8, 40, turn) });
      c.body.children[3].setAttribute('transform', `translate(${(4 * turn).toFixed(1)} ${(-4 * turn).toFixed(1)})`);
    }
  };
}
