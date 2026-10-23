// folder：机の上の写真を1枚ずつ拾って、1つのフォルダーに入れていく（例文 Put all the photos in one folder.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach, faceAt } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '写真が3枚'], [1.2, '1枚ずつ入れる'], [3.6, '全部入った']] };
const SKY = ['#BFE3F5', '#FBD9C8', '#D9CCF5'];
const PX = [276, 296, 316], FX = 358, FT = 158;

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.25;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 255, y: FY, scale: S });
  desk(k, -10, 420, 200);
  const fb = g({}); tf(fb, FX, 200);
  el('path', { d: 'M -34 -62 L -34 0 L 34 0 L 34 -62 L 10 -62 L 4 -70 L -26 -70 L -30 -62 Z', fill: pal.yellowDark }, fb);
  const ph = [0, 1, 2].map((i) => {
    const p = g({});
    el('rect', { x: -12, y: -20, width: 24, height: 20, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, p);
    el('rect', { x: -9, y: -17, width: 18, height: 14, fill: SKY[i] }, p);
    el('path', { d: 'M -9 -3 L -2 -11 L 3 -6 L 6 -9 L 9 -3 Z', fill: '#7FD3A0' }, p);
    el('circle', { cx: 5, cy: -13, r: 2, fill: pal.yellow }, p);
    return p;
  });
  const front = g({});
  // 写真は後ろ、手前のポケットが前
  el('path', { d: 'M -34 -42 L 34 -42 L 34 0 L -34 0 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, front);
  tf(front, FX, 200);
  const st = (i) => 0.4 + i * 1.15;
  return {
    update(t) {
      const o = { lean: 14, armL: 10, look: 0.6, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' };
      let tg = [PX[0], 190], gi = -1, u = 0;
      for (let i = 0; i < 3; i++) if (t >= st(i) && t < st(i) + 1.15) { gi = i; u = (t - st(i)) / 1.15; }
      if (gi >= 0) {
        const pk = [PX[gi], 195], up = [FX - 4, 150], dn = [FX - 4, 170];
        if (u < 0.3) tg = pk;
        else if (u < 0.7) { const p = easeInOut((u - 0.3) / 0.4); tg = [lerp(pk[0], up[0], p), lerp(pk[1], up[1], p)]; }
        else { const p = easeInOut(seg(u, 0.7, 0.9)); tg = [up[0], lerp(up[1], dn[1], p) - 6 * hump(seg(u, 0.9, 1) )]; }
      } else if (t >= st(2) + 1.15) tg = [FX - 20, 166];
      else if (t < st(0)) tg = [PX[0], 190];
      P(b, o);
      P(b, { ...o, armR: reach(b, S, 'R', tg[0], tg[1]) });
      const h = hp(b, S, 'R');
      ph.forEach((p, i) => {
        const done = t >= st(i) + 1.15 || (gi === i && u >= 0.9);
        if (done) tf(p, FX - 18 + i * 18, 200 - 34 - i * 1, 0, 1, 1);
        else if (gi === i && u >= 0.15) tf(p, h.x, h.y + 3, 0, 1, lerp(0.3, 1, seg(u, 0.15, 0.4)));
        else tf(p, PX[i], 200, 0, 1, 0.3);
      });
      faceAt(b, 4, 4);
    }
  };
}
