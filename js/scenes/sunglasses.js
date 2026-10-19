// sunglasses：日ざしがまぶしくて手でひさしを作り、胸元のサングラスをかけてにっこり（例文 He wore sunglasses because the sun was bright.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, face } from './bag.js';
import { parkBg, tree } from './run-after.js';

// サングラス（中心＝鼻の位置）
export function shades(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('path', { d: 'M -20 -3 L 20 -3', stroke: pal.ink, 'stroke-width': 2.4 }, g);
  [-10, 10].forEach((x) => { el('rect', { x: x - 8.5, y: -5, width: 17, height: 11, rx: 5, fill: '#2A3242' }, g); el('rect', { x: x - 5, y: -3, width: 5, height: 3, rx: 1.5, fill: '#fff', opacity: 0.5 }, g); });
  return g;
}

export const meta = { duration: 4.2, beats: [[0, 'まぶしい！'], [1.4, 'サングラスをかける'], [2.8, 'これで平気']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.25, FY = 236, X = 170;
  parkBg(k, FY);
  tree(k, 60, FY, 0.9);
  const sun = k.g({}); tf(sun, 330, 56);
  const rays = k.g({}, sun);
  for (let i = 0; i < 12; i++) el('rect', { x: -3, y: -50, width: 6, height: 15, rx: 3, fill: '#FFD45C', transform: `rotate(${i * 30})` }, rays);
  el('circle', { r: 30, fill: '#FFE07A' }, sun); el('circle', { r: 22, fill: '#FFF0B0' }, sun);
  const glow = el('circle', { cx: 330, cy: 56, r: 60, fill: '#FFF6C8', opacity: 0.4 });
  const b = k.buddy({ x: X, y: FY, scale: S });
  const held = shades(k);
  const worn = shades(k, b.body.children[3]); tf(worn, 0, -54);
  return {
    update(t) {
      const squint = 1 - seg(t, 2.2, 2.5);
      const shade = easeInOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 1.1, 1.4)));
      P(b, { x: X, look: 0.7, blink: 0.72 * squint, mood: t > 2.4 ? 'grin' : 'flat', lean: -3 * squint + 2 * hump(seg(t, 2.4, 3.0)) });
      face(b, 4, 0);
      const eye = { x: X + 14 * S, y: FY - 74 * S };
      // 手でひさし → 胸元のサングラスを取る → 目元へ
      const chest = { x: X + 14 * S, y: FY - 24 * S };
      let tgt;
      if (t < 1.4) tgt = { x: lerp(X + 30, eye.x + 6, shade), y: lerp(FY - 30, eye.y - 14, shade) };
      else if (t < 1.8) tgt = { x: lerp(eye.x + 6, chest.x + 4, easeInOut(seg(t, 1.4, 1.8))), y: lerp(eye.y - 14, chest.y, easeInOut(seg(t, 1.4, 1.8))) };
      else if (t < 2.4) tgt = { x: lerp(chest.x + 4, eye.x + 8, easeInOut(seg(t, 1.8, 2.3))), y: lerp(chest.y, eye.y, easeInOut(seg(t, 1.8, 2.3))) };
      else tgt = { x: lerp(eye.x + 8, X + 40, easeInOut(seg(t, 2.4, 2.9))), y: lerp(eye.y, FY - 50, easeInOut(seg(t, 2.4, 2.9))) };
      if (t < 1.4 && shade < 0.02) b.pose({ armR: 8 }); else b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y) });
      const h = hp(b, S, 'R');
      if (t < 1.75) tf(held, chest.x, chest.y, 0, S * 0.6);
      else if (t < 2.3) tf(held, h.x - 6, h.y, 0, S * lerp(0.6, 1, seg(t, 1.8, 2.3)));
      held.setAttribute('opacity', t < 2.3 ? 1 : 0);
      worn.setAttribute('opacity', t < 2.3 ? 0 : 1);
      tf(rays, 0, 0, t * 12, 1 + 0.06 * Math.sin(t * 5));
      glow.setAttribute('opacity', 0.35 + 0.1 * Math.sin(t * 4));
    }
  };
}
