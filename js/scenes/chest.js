// chest：病院で「胸が痛い」と胸をおさえる。お医者さんが聴診器で胸の音を聞く（例文 I have a pain in my chest.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, ache, spot } from './body.js';
import { medRoom } from './surgery.js';

export const meta = { duration: 4.4, beats: [[0, '胸をおさえる'], [1.4, '胸が痛い'], [2.6, '診てもらう']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.15, FY = 236;
  medRoom(k, FY);
  el('rect', { x: 300, y: 40, width: 60, height: 76, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('path', { d: 'M 330 60 v 30 M 315 75 h 30', stroke: pal.red, 'stroke-width': 7 });
  el('rect', { x: 92, y: FY - 30, width: 60, height: 8, rx: 3, fill: pal.sub }); el('rect', { x: 118, y: FY - 22, width: 7, height: 22, fill: pal.sub });
  const me = k.buddy({ x: 122, y: FY - 26, scale: S, facing: 1 });
  const doc = k.buddy({ x: 210, y: FY, scale: 1.1, facing: -1, color: '#F4F6F9', dark: '#C3CCD8' });
  el('rect', { x: -26, y: -86, width: 52, height: 8, rx: 4, fill: '#7FC4D9' }, doc.body);
  const tube = el('path', { fill: 'none', stroke: pal.ink, 'stroke-width': 2.2 });
  const disk = el('circle', { r: 5.5, fill: '#AEB8C6', stroke: pal.ink, 'stroke-width': 2 });
  const hurt = ache(k), ring = spot(k, pal.red);
  return {
    update(t) {
      const press = easeInOut(seg(t, 0.4, 0.9)) * (1 - easeInOut(seg(t, 2.5, 2.8)));
      const listen = easeInOut(seg(t, 2.4, 2.9));
      P(me, { y: FY - 26, lean: 8 * press, squash: 1 - 0.03 * press, mood: t > 3.4 ? 'flat' : 'sad', blink: press > 0.5 && t < 2.2 ? 0.7 : blinkAt(t), look: 0.5, armL: 10 });
      const ch = bp(me, S, 14, -24);
      me.pose({ armR: lerp(10, reach(me, S, 'R', ch.x + 2, ch.y), press) });
      P(doc, { lean: 10 * listen, look: 0.4, mood: 'smile', blink: blinkAt(t, 1), armL: 10 });
      const dt = { x: lerp(doc.state.x - 36, ch.x + 10, listen), y: lerp(FY - 40, ch.y, listen) };
      doc.pose({ armR: reach(doc, 1.1, 'R', dt.x, dt.y) });
      const h = hp(doc, 1.1, 'R', 26), ear = bp(doc, 1.1, 20, -60);
      k.set(disk, { cx: h.x, cy: h.y });
      k.set(tube, { d: `M ${h.x} ${h.y} Q ${(h.x + ear.x) / 2} ${Math.max(h.y, ear.y) + 30} ${ear.x} ${ear.y}` });
      hurt.set(easeOut(seg(t, 0.9, 1.2)) * (1 - 0.6 * listen), ch.x - 4, ch.y - 30, t, -10);
      ring.set(seg(t, 1.0, 1.3) * (1 - seg(t, 2.4, 2.6)), ch.x, ch.y, 18, t);
    }
  };
}
