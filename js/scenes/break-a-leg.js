// break a leg：舞台に出る友だちに「がんばって！」と励ます（例文 Break a leg tonight!）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '出番の前'], [1.2, '励ます'], [2.8, '舞台で拍手']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 舞台
  el('rect', { x: 180, y: FY - 10, width: 220, height: 12, fill: pal.wood });
  // スポットライト
  const spot = el('path', { d: 'M 290 0 L 240 232 L 340 232 Z', fill: '#FFF3B8', opacity: 0 });
  // カーテン
  el('path', { d: 'M 0 0 L 190 0 Q 150 80 160 170 Q 150 220 130 236 L 0 236 Z', fill: pal.red });
  el('path', { d: 'M 40 0 Q 60 120 40 236 M 90 0 Q 110 120 90 236', stroke: '#D44E42', 'stroke-width': 6, fill: 'none' });
  el('rect', { x: 0, y: 0, width: 400, height: 16, fill: '#C9443A' });

  const actor = k.buddy({ x: 215, y: FY - 10, scale: 1 });
  const friend = k.buddy({ x: 70, y: FY, scale: 1, color: pal.coral, dark: pal.coralDark });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0 };

  // 励ましの吹き出し（星）
  const bub = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 24, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('circle', { cx: 24, cy: 28, r: 5, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, bub);
  el('path', { d: 'M 0 -15 L 4.5 -5 L 15 -4 L 7 3 L 9 14 L 0 8 L -9 14 L -7 3 L -15 -4 L -4.5 -5 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bub);
  // 拍手のハート・星
  const hearts = [0, 1, 2, 3, 4].map((i) => {
    const h = el('path', { d: 'M 0 6 C -12 -4 -6 -14 0 -7 C 6 -14 12 -4 0 6 Z', fill: i % 2 ? pal.coral : pal.red });
    return h;
  });
  const thumbs = 0;

  return {
    update(t) {
      // 友だち：親指を立てて応援
      const cheer = seg(t, 1.0, 1.5);
      const wave = Math.sin(t * 9) * 8 * cheer * (t < 2.8 ? 1 : 0);
      friend.pose({ ...base, armR: lerp(8, 150, easeOut(cheer)) + wave, armL: lerp(8, 20, cheer), look: 0.7, lean: 3 * cheer, mood: cheer > 0.3 ? 'grin' : 'smile' });
      const bp = backOut(seg(t, 1.3, 1.7), 1.8) * (1 - seg(t, 2.6, 3.0));
      tf(bub, 120, 70, 0, Math.max(0, bp), Math.max(0, bp));
      // 俳優：最初は緊張、はげまされて胸を張る→両手を上げて笑顔
      const nerv = t < 1.7;
      const shake = nerv ? Math.sin(t * 22) * 1.6 : 0;
      const spp = easeOut(seg(t, 1.8, 2.5));
      const bow = easeInOut(seg(t, 3.0, 3.6));
      actor.pose({ ...base, x: 215 + shake + 20 * spp, y: FY - 10, facing: 1, armL: nerv ? 30 : lerp(30, 150, spp) - 100 * bow, armR: nerv ? 30 : lerp(30, 150, spp) - 100 * bow, lean: nerv ? 4 : -4 * spp + 28 * Math.sin(Math.PI * bow) * (t > 3.0 ? 1 : 0), mood: nerv ? 'sad' : 'grin', look: -0.3 });
      spot.setAttribute('opacity', 0.75 * easeOut(seg(t, 1.8, 2.4)));
      // 拍手のハート
      hearts.forEach((h, i) => {
        const p = seg(t, 3.0 + i * 0.12, 3.9 + i * 0.12);
        const s = p > 0 && p < 1 ? 1 : 0;
        tf(h, 250 + i * 28 - 40, lerp(190, 80, easeOut(p)) - (i % 2) * 20, 0, s * (0.8 + 0.3 * (i % 3) / 2), s * 1);
        h.setAttribute('opacity', 1 - seg(p, 0.7, 1));
      });
    }
  };
}
