// reception：ホテルの受付で、まめがベルを鳴らして地図のことを尋ね、受付係から折りたたんだ地図を受け取って広げる（例文 Ask at reception for a map.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, held, reach, deskFront, cue } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '受付で聞く'], [1.6, '地図をもらう'], [3.2, '地図を広げる']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F1EADF' });
  el('rect', { x: 200, y: 40, width: 170, height: 30, rx: 6, fill: pal.blue }); k.text(285, 55, 'RECEPTION', { 'font-size': 14, fill: '#fff' });
  el('rect', { x: 230, y: 84, width: 110, height: 56, rx: 4, fill: '#E3D2B8' });
  for (let i = 0; i < 6; i++) el('rect', { x: 238 + i * 17, y: 92, width: 10, height: 12, rx: 2, fill: pal.yellowDark });
  const staff = k.buddy({ x: 300, y: FY - 34, scale: 0.86, facing: -1, color: pal.coral, dark: pal.coralDark });
  deskFront(k, 190, 200, 176, FY, '#8A5A3C', '#6E4630');
  const bell = g({}); el('path', { d: 'M -10 0 Q -10 -14 0 -14 Q 10 -14 10 0 Z', fill: pal.yellow }, bell); el('rect', { x: -13, y: 0, width: 26, height: 3, rx: 1, fill: pal.yellowDark }, bell); k.tf(bell, 214, 176);
  const me = k.buddy({ x: 130, y: FY + 6, scale: 0.92 });
  const q = cue(k, '', 50, 36, -1);
  el('rect', { x: -14, y: -10, width: 28, height: 20, rx: 2, fill: '#E6F3E0', stroke: pal.green, 'stroke-width': 2 }, q.g); el('path', { d: 'M -8 4 L -2 -4 L 4 2 L 10 -6', stroke: pal.red, 'stroke-width': 2, fill: 'none' }, q.g);
  // 地図（たたむ⇔広げる）
  const map = g({});
  const panels = [-1, 0, 1].map((i) => el('rect', { x: -9, y: -12, width: 18, height: 24, fill: ['#E6F3E0', '#DDEFF8', '#E6F3E0'][i + 1], stroke: pal.green, 'stroke-width': 1.5 }, map));
  const rd = el('path', { d: 'M -24 6 Q -4 -10 26 4', stroke: pal.red, 'stroke-width': 2.5, fill: 'none' }, map);
  return {
    update(t) {
      // ベルを鳴らす（0.3〜0.6）、尋ねる、受け取る（2.0〜2.6）、広げる（3.0〜3.6）
      const ring = hump(seg(t, 0.3, 0.6));
      k.tf(bell, 214, 176 + ring * 2);
      q.show(seg(t, 0.7, 1.0) * (1 - seg(t, 1.9, 2.1)), 150, 110);
      const give = easeInOut(seg(t, 1.6, 2.2)), take = t > 2.2;
      P(staff, { x: 300, y: FY - 34, look: 0.6, mood: 'grin', blink: blinkAt(t, 1), lean: 6 * give * (take ? 0 : 1) });
      staff.pose({ armR: t < 2.4 ? lerp(10, reach(staff, 0.86, 'R', 212, 150), give) : lerp(reach(staff, 0.86, 'R', 212, 150), 10, easeOut(seg(t, 2.4, 2.8))) });
      P(me, { look: 0.6, mood: t > 3.0 ? 'grin' : t > 0.8 && t < 1.8 && Math.sin(t * 22) > 0 ? 'open' : 'smile', blink: blinkAt(t) });
      me.pose({ armR: t < 0.8 ? lerp(10, reach(me, 0.92, 'R', 214, 160), hump(seg(t, 0.1, 0.8))) : t < 2.0 ? 10 : t < 2.6 ? reach(me, 0.92, 'R', 210, 150) : 70, armL: t > 2.9 ? 70 : 10 });
      const un = easeInOut(seg(t, 3.0, 3.6));
      panels.forEach((p, i) => k.set(p, { transform: `translate(${(i - 1) * 18 * un} 0)` }));
      rd.setAttribute('opacity', un);
      map.setAttribute('display', t < 1.6 ? 'none' : 'inline');
      if (!take) held(k, staff, 0.86, map, 'R', 0, 32); else if (t < 2.9) held(k, me, 0.92, map, 'R', 0, 32);
      else { const h = { x: me.state.x + 44, y: me.state.y - 62 }; k.tf(map, h.x, h.y, 0, 1.4); }
    }
  };
}
