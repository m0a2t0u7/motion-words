// look for：クッションの下、机の下をのぞいて鍵を探す。見つかる場面は描かない（例文 I'm looking for my keys.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '探し始める'], [2.1, 'あちこち見る'], [3.3, 'まだ探している']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const S = 0.85;
  // 壁：窓
  el('rect', { x: 312, y: 34, width: 68, height: 56, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 346, y1: 34, x2: 346, y2: 90, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('rect', { x: 40, y: 40, width: 46, height: 36, rx: 5, fill: '#FBE3D8' });
  el('circle', { cx: 63, cy: 58, r: 9, fill: pal.coral, opacity: 0.8 });
  // ソファ
  k.shadow(92, 238, 76, 7);
  el('rect', { x: 26, y: 128, width: 130, height: 64, rx: 18, fill: '#A9C8F5' });
  el('rect', { x: 14, y: 160, width: 30, height: 70, rx: 13, fill: '#8DB4EE' });
  el('rect', { x: 138, y: 160, width: 30, height: 70, rx: 13, fill: '#8DB4EE' });
  el('rect', { x: 36, y: 180, width: 108, height: 50, rx: 12, fill: '#BDD6F8' });
  el('rect', { x: 52, y: 226, width: 8, height: 10, rx: 3, fill: pal.woodDark });
  el('rect', { x: 122, y: 226, width: 8, height: 10, rx: 3, fill: pal.woodDark });
  // 机（下に空間）
  el('rect', { x: 268, y: 164, width: 114, height: 72, fill: '#D8D0C4' });
  el('ellipse', { cx: 325, cy: 238, rx: 52, ry: 5, fill: pal.shadow });
  el('rect', { x: 262, y: 148, width: 126, height: 16, rx: 6, fill: pal.wood });
  el('rect', { x: 262, y: 148, width: 126, height: 5, rx: 2.5, fill: pal.woodDark });
  el('rect', { x: 266, y: 162, width: 9, height: 74, rx: 3, fill: pal.woodDark });
  el('rect', { x: 375, y: 162, width: 9, height: 74, rx: 3, fill: pal.woodDark });
  el('rect', { x: 330, y: 128, width: 24, height: 20, rx: 4, fill: pal.mint });
  // 床のクッション（左側が持ち上がる：右下が蝶番）
  const cush = g({});
  el('rect', { x: -66, y: -20, width: 66, height: 20, rx: 9, fill: pal.yellow }, cush);
  el('rect', { x: -58, y: -16, width: 44, height: 4, rx: 2, fill: '#FFFFFF', opacity: 0.4 }, cush);
  const cushSh = k.shadow(199, 238, 36, 4);
  cush.parentNode.insertBefore(cushSh, cush);

  const b = k.buddy({ x: 128, y: FY, scale: S });
  // 吹き出し（鍵と？）
  const bub = g({});
  el('path', { d: 'M -8 22 L 0 34 L 8 22 Z', fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bub);
  el('rect', { x: -40, y: -22, width: 80, height: 46, rx: 22, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('rect', { x: -9, y: 20, width: 18, height: 6, fill: '#FFFFFF' }, bub);
  const key = g({ transform: 'translate(-17 0) rotate(-35)' }, bub);
  el('circle', { cx: -9, cy: 0, r: 7, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 4 }, key);
  el('line', { x1: -2, y1: 0, x2: 16, y2: 0, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, key);
  el('line', { x1: 11, y1: 0, x2: 11, y2: 6, stroke: pal.yellowDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, key);
  el('line', { x1: 16, y1: 0, x2: 16, y2: 5, stroke: pal.yellowDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, key);
  k.text(22, 2, '?', { 'font-size': 30, fill: pal.coralDark }, bub);

  // 肩から目標点へ腕を向ける角度（度）
  const reach = (x, y, tx, ty, f = 1) => {
    const sx = x + 27 * f * S, sy = y - 56 * S;
    return (Math.atan2(f * (tx - sx), ty - sy) * 180) / Math.PI;
  };

  return {
    update(t) {
      // ---- クッション ----
      const lift = easeOut(seg(t, 0.85, 1.3)) * (1 - easeInOut(seg(t, 1.75, 2.05)));
      const th = lift * 56;
      tf(cush, 232, 236, th);
      tf(cushSh, 199, 238, 0, 1 - lift * 0.3, 1);
      // ---- まめの位置・姿勢 ----
      let x = 128, lean = 0, sq = 1, look = 0, armL = 8, armR = 8, walk = 0, mood = 'smile';
      const rad = (th * Math.PI) / 180;
      const hx = 232 - 62 * Math.cos(rad), hy = 236 - 62 * Math.sin(rad) - 8;
      if (t < 0.45) {
        look = Math.sin(t / 0.45 * Math.PI * 2) * 0.8;
      } else if (t < 2.05) {
        const a = easeInOut(seg(t, 0.45, 0.85));
        const back = easeInOut(seg(t, 1.75, 2.05));
        x = lerp(128, 150, a);
        armR = lerp(8, reach(x, FY, hx, hy), a);
        lean = 8 * a * (1 - back) + 6 * lift;
        sq = 1 - 0.06 * a * (1 - back);
        look = 0.9 * a * (1 - back);
        armR = lerp(armR, 8, back);
      } else if (t < 2.7) {
        const p = seg(t, 2.05, 2.7);
        x = lerp(150, 242, easeInOut(p));
        walk = (t - 2.05) * 9;
        armR = 8 + Math.sin(walk) * 16; armL = 8 - Math.sin(walk) * 16;
        look = 0.5;
      } else {
        x = 242;
        const c = easeInOut(seg(t, 2.7, 3.1)) * (1 - easeInOut(seg(t, 3.45, 3.85)));
        lean = 13 * c; sq = 1 - 0.14 * c;
        look = 0.9 * c;
        if (t >= 3.45) look = Math.sin(seg(t, 3.45, 4.4) * Math.PI * 3) * 0.95;
        armR = 8 + 30 * c; armL = 8 + 4 * c;
        if (t >= 3.6) { const s = Math.sin(seg(t, 3.6, 4.4) * Math.PI * 3); armL = 22 + s * 10; armR = 22 - s * 10; }
      }
      b.pose({ x, lean, squash: sq, look, armR, armL, walk, mood });
      // ---- 吹き出し（頭上についてくる）----
      const pop = backOut(seg(t, 0.2, 0.6));
      const bob = Math.sin(t * 3) * 2;
      tf(bub, x + 8 * (1 - sq) * 0 + lean * 0.6, FY - 128 - bob + (1 - sq) * 40, 0, pop * 0.9, pop * 0.9);
    }
  };
}
