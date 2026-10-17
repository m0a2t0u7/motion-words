// get out of hand：パーティーが盛り上がりすぎて、主催者の手に負えなくなる（例文 The party got out of hand.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, backOut } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '楽しいパーティー'], [1.6, '盛り上がりすぎ'], [3.0, '手に負えない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const host = k.buddy({ x: 200, y: FY, scale: 1.1 });
  const guests = [
    k.buddy({ x: 70, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark }),
    k.buddy({ x: 330, y: FY, scale: 0.9, color: pal.yellow, dark: pal.yellowDark }),
    k.buddy({ x: 128, y: FY, scale: 0.8, color: pal.violet, dark: '#8468DB' })
  ];
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0 };
  const cols = [pal.red, pal.blue, pal.yellow, pal.green, pal.violet];
  // 風船（ホストの手から）
  const balloons = cols.map((c, i) => {
    const bg = g({});
    el('line', { x1: 0, y1: 0, x2: 0, y2: 34, stroke: pal.sub, 'stroke-width': 1.5 }, bg);
    el('ellipse', { cx: 0, cy: -14, rx: 12, ry: 15, fill: c }, bg);
    el('ellipse', { cx: -4, cy: -19, rx: 3, ry: 5, fill: '#fff', opacity: 0.4 }, bg);
    return bg;
  });
  // 紙吹雪
  const conf = [];
  for (let i = 0; i < 26; i++) conf.push(el('rect', { x: -3, y: -2, width: 6, height: 4, fill: cols[i % 5] }));
  // 飛ぶカップ
  const cup = g({});
  el('path', { d: 'M -8 -10 L 8 -10 L 6 8 L -6 8 Z', fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2 }, cup);
  const sweat = el('path', { d: 'M 0 -8 Q 5 0 0 5 Q -5 0 0 -8 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.3 });

  return {
    update(t) {
      const heat = easeIn(seg(t, 0.3, 3.0));    // 盛り上がり度
      // ゲストは次第に高く跳ぶ
      guests.forEach((gb, i) => {
        const s = Math.sin(t * (6 + i * 1.7) + i * 2);
        const amp = 6 + 46 * heat;
        const lift = Math.max(0, s) * amp;
        gb.pose({ ...base, lift, armL: 120 + 40 * Math.sin(t * 9 + i), armR: 120 + 40 * Math.cos(t * 8 + i), mood: 'grin', squash: 1 + 0.06 * Math.min(0, s) * -1, lean: Math.sin(t * 5 + i) * 10 * heat, x: [70, 330, 128][i] + Math.sin(t * 2 + i) * 22 * heat });
      });
      // ホスト：最初はにこにこ→あわてて両手で止めようとする
      const panic = easeOut(seg(t, 1.6, 2.2));
      const rel = seg(t, 1.8, 2.3);
      host.pose({ ...base, armR: lerp(120, 90, panic) + (panic > 0 ? Math.sin(t * 12) * 12 : 0), armL: lerp(15, 100, panic) + (panic > 0 ? Math.sin(t * 12 + 2) * 12 : 0), mood: panic > 0.3 ? 'open' : 'smile', lean: Math.sin(t * 9) * 3 * panic, look: Math.sin(t * 3) * 0.8 * panic, blink: 0 });
      const hh = host.handPos('R');
      // 風船：最初は手に束ねる→手を離れて舞い上がる
      balloons.forEach((bg, i) => {
        const rel_ = seg(t, 1.9 + i * 0.12, 3.6);
        const ox = hh.x + (i - 2) * 9, oy = hh.y - 28;
        const fx = ox + (i - 2) * 50 * easeOut(rel_) + Math.sin(t * 3 + i) * 6 * rel_;
        const fy = oy - 240 * easeIn(rel_) ;
        tf(bg, rel_ > 0 ? fx : hh.x + (i - 2) * 9, rel_ > 0 ? fy : oy, (i - 2) * 6 * (1 - rel_) + Math.sin(t * 4 + i) * 6 * rel_, 1, 1);
      });
      // 紙吹雪：時間とともに増える
      conf.forEach((c, i) => {
        const start = 0.8 + (i / conf.length) * 2.2;
        const p = ((t - start) * 0.9);
        const on = t > start;
        const px = 20 + ((i * 53) % 360) + Math.sin(t * 3 + i) * 12;
        const py = -10 + ((p % 1.4) / 1.4) * 260;
        tf(c, px, py, t * 200 + i * 40, 1, 1);
        c.setAttribute('opacity', on ? 1 : 0);
      });
      // 飛ぶカップ
      const cp = seg(t, 2.3, 3.5);
      tf(cup, lerp(330, 130, cp), lerp(FY - 40, FY - 40, cp) - 130 * hump(cp), cp * 700, 1, 1);
      cup.setAttribute('opacity', cp > 0 && cp < 1 ? 1 : 0);
      tf(sweat, 224, 128 + ((t * 2) % 1) * 12, 0, panic > 0.3 ? 1 : 0, 1);
    }
  };
}
