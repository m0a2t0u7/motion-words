// all along：引き出しやソファの下を探しても鍵がない。ふとポケットを触ると、鍵は最初からそこにあった（例文 My keys were in my pocket all along.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, sofa } from './run-after.js';
import { roomBg } from './look-over.js';
import { path } from './queue-up.js';
import { hp, reach } from './dig.js';

export function keys(k, parent) {
  const g = k.g({}, parent);
  k.el('circle', { cx: 0, cy: 0, r: 5, fill: 'none', stroke: k.pal.yellowDark, 'stroke-width': 2.4 }, g);
  k.el('path', { d: 'M 3 3 L 12 12 M 9 9 L 12 6 M 11 11 L 14 8', stroke: k.pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  k.el('path', { d: 'M -2 4 L -4 16 M -4 12 L -1 12', stroke: k.pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '鍵がない'], [1.5, 'あちこち探す'], [3.0, 'ずっとポケットに']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const so = sofa(k, 80, FY, 120);
  so.front();
  // 引き出し付きの棚
  k.shadow(330, FY + 1, 40, 4);
  el('rect', { x: 290, y: FY - 80, width: 80, height: 80, rx: 4, fill: pal.wood });
  el('rect', { x: 296, y: FY - 36, width: 68, height: 30, rx: 3, fill: '#EAD3B0' });
  const drawer = g({});
  el('rect', { x: 0, y: 0, width: 68, height: 30, rx: 3, fill: '#F2DDBB', stroke: pal.woodDark, 'stroke-width': 2 }, drawer);
  el('rect', { x: 26, y: 12, width: 16, height: 5, rx: 2, fill: pal.woodDark }, drawer);
  el('rect', { x: 300, y: FY - 108, width: 22, height: 28, rx: 3, fill: pal.violet });
  const b = k.buddy({ x: 200, y: FY, facing: 1 });
  // ポケット（体の前）と、はみ出した鍵の輪
  const kin = keys(k, b.body); tf(kin, 12, -32, -20, 0.9);
  el('path', { d: 'M 2 -30 L 24 -30 L 22 -14 Q 13 -10 4 -14 Z', fill: pal.mintDark, opacity: 0.9 }, b.body);
  const kout = keys(k);
  const q = [0, 1].map(() => k.text(0, 0, '?', { 'font-size': 22, fill: pal.sub }));
  const xf = path([[0, 200], [0.2, 200], [0.8, 262], [1.6, 262], [2.1, 160], [3.0, 160]]);
  return {
    update(t) {
      const w = walkTo(xf, t, 200, 1);
      const pull = easeInOut(seg(t, 0.85, 1.15)) * (1 - easeInOut(seg(t, 1.4, 1.6)));
      const bend = easeInOut(seg(t, 2.05, 2.35)) * (1 - easeInOut(seg(t, 2.5, 2.7)));
      const pat = seg(t, 2.75, 3.1);
      const take = easeOut(seg(t, 3.1, 3.5));
      const palm = easeOut(seg(t, 3.7, 4.0));
      let armR = w.armR, armL = w.armL, lean = w.lean, facing = w.facing, look = 0.5;
      if (t > 0.8 && t < 1.6) { armR = lerp(20, 70, pull); look = 0.8; }
      if (t > 2.0 && t < 2.75) { facing = -1; lean = 34 * bend; armR = 40 + 30 * bend; look = 0.6; }
      if (t >= 2.75) { facing = 1; armR = lerp(-10 + 8 * Math.sin(pat * 18), 150, take); armL = lerp(8, 170, palm); look = t < 3.1 ? -0.2 : 0.4; }
      P(b, { ...w, facing, armR, armL, lean, look, mood: t > 3.15 ? 'grin' : t > 0.9 ? 'flat' : 'smile', blink: blinkAt(t), squash: 1 - 0.03 * hump(seg(t, 3.7, 4.1)) });
      if (t >= 2.75 && t < 3.1) b.body.children[3].setAttribute('transform', 'translate(2 6)');
      tf(drawer, 296 + 0, FY - 36, 0, 1); drawer.setAttribute('transform', `translate(${(296 - 34 * pull).toFixed(2)} ${FY - 36})`);
      const h = hp(b, 1);
      kin.setAttribute('opacity', t < 3.12 ? 1 : 0);
      kout.setAttribute('opacity', t >= 3.12 ? 1 : 0);
      tf(kout, h.x + 2, h.y - 6, 0, 1.2);
      tf(q[0], 300, FY - 120, 0, Math.max(0.001, easeOut(seg(t, 1.2, 1.4)) * (1 - seg(t, 1.6, 1.7))));
      tf(q[1], 110, FY - 90, 0, Math.max(0.001, easeOut(seg(t, 2.35, 2.5)) * (1 - seg(t, 2.7, 2.8))));
    }
  };
}
