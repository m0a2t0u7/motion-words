// all of a sudden：静かに本を読んでいると、突然電話が鳴りだし、びっくりして跳び上がる（例文 All of a sudden, the phone rang.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, sofa } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp } from './dig.js';
import { handset, ringWaves } from './from-scratch.js';

export const meta = { duration: 4.0, beats: [[0, '静かに読書'], [1.6, '突然鳴る'], [2.4, 'びっくり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('rect', { x: 300, y: 70, width: 50, height: 40, rx: 4, fill: '#F1E7D8', stroke: '#fff', 'stroke-width': 3 });
  el('path', { d: 'M 306 104 L 318 88 L 328 98 L 336 90 L 344 104 Z', fill: '#9ED9B0' });
  const so = sofa(k, 150, FY, 150);
  const b = k.buddy({ x: 150, y: FY - 26 });
  so.front();
  // 本（両手で持つ）
  const book = g({});
  el('rect', { x: -18, y: -13, width: 36, height: 26, rx: 2, fill: pal.coral }, book);
  el('rect', { x: -1, y: -13, width: 2, height: 26, fill: pal.coralDark }, book);
  // 小机と電話
  k.shadow(285, FY + 1, 30, 4);
  el('rect', { x: 258, y: FY - 46, width: 54, height: 8, rx: 3, fill: pal.wood });
  [264, 300].forEach((x) => el('rect', { x, y: FY - 38, width: 6, height: 38, fill: pal.woodDark }));
  const ph = handset(k);
  const waves = ringWaves(k);
  const zz = [0, 1, 2].map(() => el('circle', { r: 2.5, fill: pal.sub }));
  return {
    update(t) {
      const R = 1.6;
      const ring = t > R;
      const jump = seg(t, R + 0.05, R + 0.55);
      const after = easeOut(seg(t, R + 1.0, R + 1.5));
      const shake = ring ? Math.sin(t * 60) * 2.2 : 0;
      const readA = 58 + Math.sin(t * 1.2) * 2;
      P(b, {
        x: 150, y: FY - 26,
        armR: ring ? lerp(lerp(readA, 150, easeOut(seg(jump, 0, 0.3))), 60, after) : readA,
        armL: ring ? lerp(lerp(readA, 150, easeOut(seg(jump, 0, 0.3))), 30, after) : readA,
        lift: 22 * hump(jump), squash: 1 - 0.08 * hump(seg(t, R + 0.5, R + 0.75)) + 0.05 * hump(seg(jump, 0, 0.4)),
        look: ring ? lerp(0, 1, easeOut(seg(t, R + 0.6, R + 1.1))) : 0.2, mood: ring ? 'open' : 'smile',
        blink: ring ? 0 : blinkAt(t), lean: ring ? -8 * hump(jump) + 6 * after : 3
      });
      // 本：読書中は両手の前。突然の音で宙に跳ねて膝に落ちる
      const h = hp(b, 1);
      const fly = seg(t, R + 0.05, R + 0.9);
      const bx = ring ? lerp(h.x - 20, 160, easeOut(fly)) : h.x - 20;
      const by = ring ? lerp(FY - 84, FY - 46, fly) - 50 * hump(fly) : h.y + 2;
      tf(book, ring ? bx : 150 + 6, ring ? by : FY - 84, ring ? 200 * easeOut(fly) + 160 : 0);
      tf(ph.g, 285 + shake, FY - 58 - (ring ? Math.abs(Math.sin(t * 30)) * 3 : 0), 90);
      ph.scr.setAttribute('fill', ring && Math.sin(t * 14) > 0 ? '#FFE27A' : '#9FB4CC');
      tf(waves, 285, FY - 58, 0, ring ? 1 + 0.15 * Math.sin(t * 16) : 0.001);
      waves.setAttribute('opacity', ring ? 1 : 0);
      zz.forEach((z, i) => { const q = (t * 0.5 + i / 3) % 1; tf(z, 285 + 6 * Math.sin(q * 6), FY - 70 - q * 30); z.setAttribute('opacity', ring ? 0 : 0); });
    }
  };
}
