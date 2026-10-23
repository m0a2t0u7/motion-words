// full：お皿を空にしたまめに、もう1皿すすめられる。手のひらで「もういい」と止め、ふくらんだおなかをさする（例文 No more, thanks. I'm full.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, walkTo, path, deskFront, wear } from './member.js';
import { dish } from './restaurant.js';
import { cue } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '食べ終わる'], [1.4, 'もういいです'], [2.6, 'おなかいっぱい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F8EBDD' });
  el('rect', { x: 40, y: 40, width: 90, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const b = k.buddy({ x: 120, y: FY, scale: S, facing: 1 });
  const host = k.buddy({ x: 480, y: FY, scale: 0.95, facing: -1, ...CO(k) }); wear(k, host, 'apron', '#fff');
  const TOP = FY - 26;
  deskFront(k, 80, 140, TOP, FY);
  // 空の皿の山
  for (let i = 0; i < 4; i++) el('ellipse', { cx: 180, cy: TOP - 2 - i * 4, rx: 22, ry: 4.5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const more = dish(k, k.root, '#F2C14E', '#E8574A');
  const no = cue(k, 'No more!', 84, 30, -1, 13);
  // おなかをさすると出る満腹のしるし
  const puff = el('path', { d: 'M -6 0 Q 0 -8 6 0', stroke: pal.sub, 'stroke-width': 2, fill: 'none' });
  const hx = path([[0.4, 480], [1.4, 260], [3.0, 260], [3.8, 480]]);
  return {
    update(t) {
      const h = walkTo(hx, t, 480, -1), offer = easeInOut(seg(t, 1.3, 1.6)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      P(host, { x: h.x, walk: h.walk, armL: h.armL, armR: lerp(30, 80, offer), lean: h.lean + 6 * offer, facing: t > 3.0 ? 1 : -1, blink: blinkAt(t, 1), mood: t > 2.4 ? 'grin' : 'smile', look: 0.5 });
      const hh = hp(host, 0.95, 'R', 30); tf(more.g, hh.x, hh.y - 2);
      const stopP = easeInOut(seg(t, 1.5, 1.8)) * (1 - easeInOut(seg(t, 2.6, 2.9)));
      const full = easeInOut(seg(t, 2.4, 3.0));
      P(b, { lean: -6 * stopP - 8 * full, look: 0.6, blink: t > 3 ? 1 : blinkAt(t), mood: t > 2.8 ? 'grin' : stopP > 0.3 ? 'flat' : 'smile', squash: 1 - 0.1 * full });
      // 手のひらを前へ → おなかをさする
      const rub = Math.sin(t * 7) * 6 * full;
      b.pose({ armR: stopP > 0.01 ? lerp(10, 100, stopP) : lerp(10, reach(b, S, 'R', 132 + rub, FY - 30), full), armL: lerp(10, 40, full) });
      no.show(seg(t, 1.6, 1.9) - seg(t, 2.6, 2.8), 150, 110);
      const q = ((t - 3.0) % 0.8) / 0.8; tf(puff, 150, FY - 104 - 14 * q, 0, t > 3.0 ? Math.max(0.001, hump(q)) : 0.001);
    }
  };
}
