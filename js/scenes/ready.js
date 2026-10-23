// ready：玄関で友だちが「行ける？」と待つ。まめはぼうしをかぶり、リュックを背負って「OK！」と手を上げる（例文 Are you ready to go?）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, wear, pop } from './member.js';
import { homeBg } from './furniture.js';
import { backpack } from './bus.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '行ける？'], [1.0, 'したくする'], [3.0, '準備OK！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  homeBg(k, { FY, winX: 40, winW: 80 });
  // 開いた玄関ドア
  el('rect', { x: 290, y: 70, width: 96, height: FY - 70, fill: '#CFE8FA' });
  el('path', { d: `M 290 70 L 260 60 L 260 ${FY + 10} L 290 ${FY}`, fill: pal.woodDark });
  el('rect', { x: 284, y: 64, width: 108, height: 8, fill: pal.wood });
  const fr = k.buddy({ x: 340, y: FY, scale: 0.95, facing: -1, ...CO(k) });
  const bp2 = backpack(k, fr, pal.blue, pal.blueDark);
  const ask = cue(k, 'Ready?', 74, 30, 1, 14);
  // 床のリュックと、手に持つぼうし
  const b = k.buddy({ x: 150, y: FY, scale: S, facing: 1 });
  const pack = backpack(k, b, pal.yellow, pal.yellowDark), strap = b.body.lastChild;
  const floorPack = g({}); el('rect', { x: -12, y: -30, width: 24, height: 30, rx: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, floorPack); tf(floorPack, 196, FY);
  const hatOn = wear(k, b, 'hat', '#fff');
  const hat = g({}); el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 4, fill: '#fff', stroke: pal.line }, hat); el('path', { d: 'M -12 0 Q -12 -12 0 -12 Q 12 -12 12 0 Z', fill: '#fff', stroke: pal.line }, hat); el('rect', { x: -12, y: -4, width: 24, height: 3, fill: pal.red }, hat);
  const okc = cue(k, 'OK!', 50, 30, -1, 15);
  return {
    update(t) {
      P(fr, { look: 0.6, blink: blinkAt(t, 1), mood: talk(t, 0.3, 0.9) || (t > 3.2 ? 'grin' : 'smile'), armR: 8 + 30 * hump(seg(t, 0.3, 1.0)), armL: 10 });
      ask.show(seg(t, 0.3, 0.6) - seg(t, 1.6, 1.8), 300, 110);
      // 1.0〜1.8 ぼうしを頭へ、1.9〜2.7 しゃがんでリュックを背負う
      const hatP = easeInOut(seg(t, 1.0, 1.7)), packDown = hump(seg(t, 1.9, 2.8)), packOn = t > 2.35;
      P(b, { lean: 24 * packDown, squash: 1 - 0.08 * packDown, look: t < 1 ? 0.8 : 0.4, blink: blinkAt(t), mood: t > 3.0 ? 'grin' : 'smile' });
      const head = { x: 150 + 4, y: FY - 96 * S };
      if (t < 1.8) b.pose({ armR: lerp(70, reach(b, S, 'R', head.x + 14, head.y + 4), hatP) });
      else if (t < 2.8) b.pose({ armR: reach(b, S, 'R', 196, FY - 30 - 10 * seg(t, 2.35, 2.8)) });
      else b.pose({ armR: lerp(20, 165, easeOut(seg(t, 2.9, 3.2))), armL: 14 });
      const h = hp(b, S, 'R', 30);
      tf(hat, h.x, h.y - 4, 0, t < 1.7 ? 1 : 0.001);
      hatOn.setAttribute('opacity', t < 1.7 ? 0 : 1);
      floorPack.setAttribute('opacity', packOn ? 0 : 1); pack.setAttribute('opacity', packOn ? 1 : 0); strap.setAttribute('opacity', packOn ? 1 : 0);
      if (!packOn && t > 1.9) tf(floorPack, h.x, h.y + 30); else tf(floorPack, 196, FY);
      okc.show(seg(t, 3.1, 3.4), 196, 110);
    }
  };
}
