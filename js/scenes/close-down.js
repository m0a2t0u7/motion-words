// close down：店主がシャッターを最後まで下ろし、閉店の張り紙が残る（例文 The shop closed down last month.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { reach } from './dig.js';
import { person, path, walk } from './queue-up.js';
import { storeFront } from './lock-up.js';

export const meta = { duration: 4.4, beats: [[0, '営業していた店'], [1.8, 'シャッターを下ろす'], [3.8, '閉店した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const st = storeFront(k, FY);
  // カレンダー（先月）
  const cal = g({}); tf(cal, 40, 110);
  el('rect', { x: -26, y: -28, width: 52, height: 56, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -26, y: -28, width: 52, height: 14, rx: 4, fill: pal.red }, cal);
  for (let i = 0; i < 12; i++) el('rect', { x: -20 + (i % 4) * 11, y: -8 + Math.floor(i / 4) * 11, width: 7, height: 7, rx: 1.5, fill: i === 6 ? pal.red : pal.line }, cal);
  const shut = g({});
  const clipId = k.clip((cp) => el('rect', { x: 120, y: 92, width: 270, height: FY - 92 }, cp));
  shut.setAttribute('clip-path', clipId);
  const slats = g({}, shut);
  el('rect', { x: 128, y: -150, width: 254, height: 150, fill: '#B8C1CE' }, slats);
  for (let y = -150; y < 0; y += 9) el('rect', { x: 128, y, width: 254, height: 2, fill: '#98A2B3' }, slats);
  el('rect', { x: 128, y: -6, width: 254, height: 6, fill: '#7D8798' }, slats);
  el('rect', { x: 116, y: 86, width: 278, height: 10, rx: 3, fill: '#7D8798' });
  const note = g({}); tf(note, 255, 180);
  el('rect', { x: -32, y: -16, width: 64, height: 32, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, note);
  k.text(0, 1, 'CLOSED', { 'font-size': 12, fill: pal.red }, note);
  const S = 0.9;
  const own = person(k, 'coral', { x: 300, y: FY, scale: S, facing: -1 });
  const xf = path([[2.9, 300], [3.4, 340]]);
  return {
    update(t) {
      const d = easeInOut(seg(t, 0.6, 2.6));
      const by = lerp(102, FY, d) + 2 * wobble(seg(t, 2.6, 3.1), 2, 6);
      tf(slats, 0, by);
      const p = walk(own, xf, t, { facing: t < 2.9 ? -1 : 1, look: -0.2, mood: t > 2.5 ? 'sad' : 'flat' });
      if (t < 2.9) {
        const reachUp = easeOut(seg(t, 0.1, 0.6));
        const a = reach(own, S, 'R', 280, Math.min(by, FY - 30));
        own.pose({ armR: lerp(10, a, reachUp) * (1 - easeInOut(seg(t, 2.6, 2.9))) + 10 * easeInOut(seg(t, 2.6, 2.9)), squash: 1 - 0.12 * d, lean: 8 * d });
      } else own.pose({ armR: p.armR });
      st.dark(easeInOut(seg(t, 2.0, 2.6)));
      const n = seg(t, 3.0, 3.4);
      note.setAttribute('opacity', n);
      tf(note, 255, 180 - 6 * (1 - easeOut(n)), 3 * wobble(seg(t, 3.2, 4.2), 1.5, 4));
      void hump;
    }
  };
}
