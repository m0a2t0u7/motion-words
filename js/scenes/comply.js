// comply：入口の「ヘルメット必須」の標識に従い、まめ3人が順にヘルメットをかぶって✓（例文 All staff must comply with the safety rules.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.3, beats: [[0, '規則がある'], [1.0, '従う'], [3.0, '全員守った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 工場の入口
  el('rect', { x: 0, y: 56, width: 400, height: 184, fill: '#E3E9F1' });
  for (let i = 0; i < 4; i++) el('path', { d: `M ${i * 100} 56 L ${i * 100} 30 L ${i * 100 + 100} 56 Z`, fill: '#CBD3DE' });
  el('rect', { x: 0, y: 54, width: 400, height: 6, fill: '#B9C4D4' });
  el('rect', { x: 20, y: 150, width: 70, height: 90, rx: 4, fill: '#CBD3DE' });
  for (let i = 0; i < 5; i++) el('line', { x1: 24, y1: 160 + i * 16, x2: 86, y2: 160 + i * 16, stroke: '#B9C4D4', 'stroke-width': 3 });
  el('rect', { x: 310, y: 120, width: 76, height: 120, rx: 4, fill: '#CBD3DE' });
  el('rect', { x: 318, y: 128, width: 60, height: 44, rx: 3, fill: '#DDEFFA' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#EDF0F5' });
  // 黄黒のライン
  for (let i = 0; i < 20; i++) el('path', { d: `M ${i * 20} ${FY + 2} l 10 0 l -6 8 l -10 0 Z`, fill: i % 2 ? '#8E99AB' : '#B9C4D4', opacity: 0.0 });

  // 標識（青い丸・ヘルメットのマーク）
  const sign = g({});
  tf(sign, 200, 88);
  el('rect', { x: -2, y: 34, width: 4, height: 12, fill: '#8795AB', opacity: 0 }, sign);
  el('circle', { r: 36, fill: pal.shadow, cx: 3, cy: 4 }, sign);
  el('circle', { r: 36, fill: pal.blue }, sign);
  el('circle', { r: 30, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 3 }, sign);
  el('path', { d: 'M -17 6 Q -17 -17 0 -17 Q 17 -17 17 6 Z', fill: '#FFFFFF' }, sign);
  el('rect', { x: -21, y: 3, width: 42, height: 7, rx: 3.5, fill: '#FFFFFF' }, sign);
  el('rect', { x: -2.5, y: -17, width: 5, height: 12, fill: pal.blue }, sign);
  el('rect', { x: -26, y: 40, width: 52, height: 15, rx: 5, fill: pal.red }, sign);
  k.text(0, 48, 'HELMET', { 'font-size': 10, fill: '#FFFFFF' }, sign);
  const bigCheck = g({});
  el('circle', { r: 17, fill: pal.green, stroke: '#FFFFFF', 'stroke-width': 4 }, bigCheck);
  el('path', { d: 'M -8 1 L -2 7 L 9 -7', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bigCheck);

  // まめ3人
  const MS = 0.8, MY = 262;
  const XS = [104, 200, 296];
  const cols = [[pal.mint, pal.mintDark], [pal.coral, pal.coralDark], [pal.blue, pal.blueDark]];
  const crew = XS.map((x, i) => {
    const b = k.buddy({ x, y: MY, scale: MS, color: cols[i][0], dark: cols[i][1] });
    const h = g({});
    el('path', { d: 'M -24 0 Q -24 -29 0 -29 Q 24 -29 24 0 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, h);
    el('rect', { x: -29, y: -4, width: 58, height: 7, rx: 3.5, fill: pal.yellowDark }, h);
    el('rect', { x: -3, y: -29, width: 6, height: 24, fill: '#FFFFFF', opacity: 0.55 }, h);
    const ck = g({});
    el('circle', { r: 13, fill: pal.green, stroke: '#FFFFFF', 'stroke-width': 3 }, ck);
    el('path', { d: 'M -6 1 L -2 5 L 7 -5', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ck);
    return { b, h, ck, x };
  });
  const sparks = [[60, 120], [340, 100], [200, 160]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  return {
    update(t) {
      crew.forEach((c, i) => {
        const tw = 1.2 + 0.65 * i;
        const up = easeInOut(seg(t, tw - 0.4, tw - 0.12));
        const down = easeInOut(seg(t, tw + 0.05, tw + 0.4));
        const a = 8 + 142 * up * (1 - down);
        const worn = t >= tw + 0.15;
        const fin = t >= 3.3;
        const hop = fin ? 8 * Math.abs(Math.sin((t - 3.3 - i * 0.12) * 7)) * (1 - seg(t, 3.3, 4.3) * 0.5) : 0;
        const land = t >= tw + 0.15 ? wobble(seg(t, tw + 0.15, tw + 0.55), 2, 5) : 0;
        c.b.pose({
          armR: a, armL: fin ? 125 + 10 * Math.sin((t - 3.3) * 11 + i) : 8,
          look: t < tw - 0.4 ? 0 : 0.3, lean: 0, mood: worn ? 'grin' : 'smile',
          squash: 1 - 0.05 * Math.abs(land), lift: hop
        });
        const hp = c.b.handPos('R');
        const head = [c.x, MY - (91 + hop) * MS * (1 - 0.05 * Math.abs(land)) + 6];
        let pos, sc = 0.82;
        if (t < tw - 0.12) pos = [hp.x + 1, hp.y - 2];
        else if (t < tw + 0.12) {
          const u = easeOut(seg(t, tw - 0.12, tw + 0.12));
          pos = [lerp(hp.x + 1, head[0], u), lerp(hp.y - 2, head[1], u) - 12 * hump(u)];
        } else pos = head;
        tf(c.h, pos[0], pos[1], t < tw - 0.12 ? 0 : (t < tw + 0.12 ? 0 : 0), sc, sc);
        const cp = t < tw + 0.4 ? 0 : backOut(seg(t, tw + 0.4, tw + 0.7), 2.2);
        tf(c.ck, c.x, head[1] - 34 - 4 * hump(seg(t, tw + 0.4, tw + 0.7)), 0, cp, cp);
      });
      const bp = t < 3.05 ? 0 : backOut(seg(t, 3.05, 3.4), 2.2);
      tf(bigCheck, 242, 62, 0, bp, bp);
      tf(sign, 200, 88 + 2 * Math.sin(t * 2) * 0, 0, 1 + 0.04 * hump(seg(t, 3.05, 3.6)), 1 + 0.04 * hump(seg(t, 3.05, 3.6)));
      sparks.forEach((q, i) => {
        const u = seg(t, 3.2 + i * 0.1, 3.7 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
