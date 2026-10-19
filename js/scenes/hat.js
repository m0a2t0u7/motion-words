// hat：つばの広い大きな帽子をかぶって、ビーチへ歩いて来る（例文 She wore a big hat to the beach.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { gait, reach, P, blinkAt } from './skirt.js';
import { beachBg } from './sandal.js';

export const meta = { duration: 4.2, beats: [[0, '大きな帽子'], [1.0, 'ビーチへ歩く'], [3.0, 'ビーチに着く']] };

export function bigHat(k, parent, c = '#F5D78E', band = '#FF8E77') {
  const g = k.g({}, parent);
  k.el('ellipse', { cx: 0, cy: -76, rx: 54, ry: 9, fill: c, stroke: '#D8B35E', 'stroke-width': 2 }, g);
  k.el('path', { d: 'M -24 -78 Q -24 -108 0 -108 Q 24 -108 24 -78 Z', fill: c, stroke: '#D8B35E', 'stroke-width': 2 }, g);
  k.el('path', { d: 'M -24 -84 L 24 -84 L 24 -78 L -24 -78 Z', fill: band }, g);
  k.el('ellipse', { cx: 0, cy: -73, rx: 46, ry: 4, fill: 'rgba(0,0,0,0.08)' }, g);
  return g;
}

export function create(k) {
  const { el, pal, tf } = k, S = 1.15;
  const FY = 240;
  const waves = beachBg(k, FY);
  // 遊歩道（左）→ 砂浜
  el('rect', { x: 0, y: FY - 30, width: 120, height: 90, fill: '#D9CFC2' });
  for (let x = 0; x < 120; x += 24) el('line', { x1: x, y1: FY - 30, x2: x, y2: 300, stroke: '#C7BBAC', 'stroke-width': 2 });
  // パラソル
  k.shadow(330, FY + 4, 40, 5);
  el('rect', { x: 328, y: 150, width: 4, height: FY - 146, fill: pal.sub });
  el('path', { d: 'M 280 160 Q 330 112 380 160 Z', fill: pal.coral });
  el('path', { d: 'M 313 160 Q 330 116 347 160 Z', fill: '#fff' });
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const hat = bigHat(k, b.body);
  const xf = (t) => lerp(40, 230, easeInOut(seg(t, 0.2, 2.9)));
  return {
    update(t) {
      waves(t);
      const p = gait(xf, t, 40);
      const hold = easeInOut(seg(t, 3.0, 3.4));
      P(b, { x: p.x, walk: p.walk, lean: p.lean, armL: p.armL, armR: p.armR, look: lerp(0.3, -0.2, hold), mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (hold > 0) b.pose({ armR: lerp(p.armR, reach(b, S, 'R', p.x + 44 * S, FY - 88 * S), hold) });
      // 帽子のつばが歩くたびに少しはずむ
      tf(hat, 0, Math.abs(Math.sin(p.walk)) * 1.5 + 2 * hump(seg(t, 3.0, 3.3)), Math.sin(p.walk) * 2 - 5 * hold);
    }
  };
}
