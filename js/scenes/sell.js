// sell：パン屋の店主が客の硬貨を受け取り、焼きたてのパンを渡す（例文 They sell fresh bread every morning.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach, gait } from './weigh.js';

export const meta = { duration: 5.0, beats: [[0, '客が来る'], [1.5, '代金を払う'], [4.2, 'パンを渡す']] };

function loaf(k, parent, kind) {
  const p = k.g({}, parent), c = '#E2A55B', d = '#C98438';
  if (kind === 'long') {
    k.el('rect', { x: -22, y: -7, width: 44, height: 14, rx: 7, fill: c }, p);
    [-12, 0, 12].forEach((x) => k.el('line', { x1: x - 3, y1: -4, x2: x + 3, y2: 4, stroke: d, 'stroke-width': 2, 'stroke-linecap': 'round' }, p));
  } else {
    k.el('ellipse', { rx: 14, ry: 11, fill: c }, p);
    k.el('path', { d: 'M -7 -4 Q 0 -8 7 -4', stroke: d, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, p);
  }
  return p;
}
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 朝の窓と看板
  el('rect', { x: 24, y: 40, width: 96, height: 70, rx: 6, fill: '#FCE9C8', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 86, cy: 88, r: 14, fill: pal.yellow });
  el('rect', { x: 150, y: 46, width: 60, height: 22, rx: 6, fill: pal.coral });
  [0, 1, 2].forEach((i) => el('circle', { cx: 166 + i * 14, cy: 57, r: 3.4, fill: '#fff' }));
  // 棚（奥）
  el('rect', { x: 250, y: 120, width: 140, height: 6, rx: 3, fill: pal.woodDark });
  const sh = g({}); loaf(k, sh, 'round'); tf(sh, 280, 112); const sh2 = loaf(k, g({}), 'long'); tf(sh2.parentNode, 330, 114, -8); const sh3 = loaf(k, g({}), 'round'); tf(sh3.parentNode, 372, 112);
  const S = 1.1;
  const baker = k.buddy({ x: 300, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // カウンター
  el('rect', { x: 205, y: 204, width: 195, height: FY - 198, fill: pal.wood });
  el('rect', { x: 200, y: 198, width: 200, height: 8, rx: 3, fill: pal.woodDark });
  k.shadow(300, FY + 2, 105, 4);
  // かご（パン）
  el('path', { d: 'M 330 198 L 336 180 L 384 180 L 390 198 Z', fill: '#C79A62' });
  const bk = [loaf(k, g({}), 'round'), loaf(k, g({}), 'round')];
  tf(bk[0].parentNode, 348, 178); tf(bk[1].parentNode, 372, 178);
  const take = loaf(k, g({}), 'long'); tf(take, 400, 0);
  // トレイ（硬貨）
  el('rect', { x: 262, y: 195, width: 26, height: 4, rx: 2, fill: pal.sub });
  const coinTray = el('circle', { cx: 272, cy: 193, r: 3.4, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1 });
  const coin = el('circle', { r: 4, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 });
  // 湯気
  const steam = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q 4 -6 0 -12 q -4 -6 0 -12', stroke: '#fff', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }));
  const cust = k.buddy({ x: 60, y: FY, scale: S });
  return {
    update(t) {
      const p = gait((tt) => lerp(40, 168, easeInOut(seg(tt, 0.1, 1.5))), t, 40);
      cust.pose({ armR: 0 });
      const cAim = reach(cust, S, 'R', 228, 190);
      let ca;
      if (t < 1.5) ca = p.armR; else if (t < 2.4) ca = lerp(p.armR, cAim, easeInOut(seg(t, 1.5, 1.9)));
      else if (t < 3.7) ca = lerp(cAim, 8, easeInOut(seg(t, 2.4, 2.9)));
      else if (t < 4.4) ca = lerp(8, cAim, easeInOut(seg(t, 3.7, 4.3)));
      else ca = lerp(cAim, 75, easeInOut(seg(t, 4.5, 5.0)));
      cust.pose({ x: p.x, walk: p.walk, armL: p.armL, lean: p.lean, look: 0.5, mood: 'smile', armR: ca });
      const ch = hp(cust, S, 'R', 30);
      // 店主：硬貨をトレイへ、パンを取って渡す
      const a1 = easeInOut(seg(t, 2.1, 2.6)), a2 = easeInOut(seg(t, 2.7, 3.1)), a3 = easeInOut(seg(t, 3.1, 3.6)), a4 = easeInOut(seg(t, 3.8, 4.3)), a5 = easeInOut(seg(t, 4.5, 5.0));
      const tg = t < 2.7 ? [lerp(300, 232, a1), lerp(180, 192, a1)] : t < 3.1 ? [lerp(232, 270, a2), lerp(192, 186, a2)] : t < 3.8 ? [lerp(270, 348, a3), lerp(186, 172, a3)] : t < 4.5 ? [lerp(348, 232, a4), lerp(172, 186, a4)] : [lerp(232, 300, a5), lerp(186, 180, a5)];
      baker.pose({ armR: 0 });
      baker.pose({ armR: t < 2.1 ? 8 : reach(baker, S, 'R', tg[0], tg[1]), armL: 8, mood: 'grin', look: -0.4, squash: 1 + 0.015 * Math.sin(t * 4) });
      const bh = hp(baker, S, 'R', 30);
      // 硬貨：客の手→カウンター→店主の手→トレイ
      let cx = 0, cy = 0, cv = 1;
      if (t < 1.5) cv = 0; else if (t < 2.2) { cx = ch.x; cy = ch.y; } else if (t < 2.7) { cx = 232; cy = 194; } else if (t < 3.1) { cx = bh.x; cy = bh.y; } else cv = 0;
      coin.setAttribute('opacity', cv); tf(coin, cx, cy);
      coinTray.setAttribute('opacity', t > 3.05 ? 1 : 0);
      // パン：かごから店主の手、そして客の手
      const pos = t < 3.3 ? null : t < 4.4 ? bh : ch;
      take.setAttribute('opacity', pos ? 1 : 0);
      if (pos) tf(take, pos.x, pos.y - 2);
      steam.forEach((s, i) => { const p2 = (t * 0.5 + i / 3) % 1; tf(s, 340 + i * 18, 160 - 10 * p2); s.setAttribute('opacity', 0.9 * Math.sin(p2 * Math.PI)); });
    }
  };
}
