// seatbelt：車の座席のまめが肩の上のベルトを引き出し、体の前を通して腰の留め具にカチッと締める（例文 Please fasten your seatbelt.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { blinkAt, reach, popIn, mark } from './vehicle.js';

export const meta = { duration: 4.2, beats: [[0, 'ベルトをつかむ'], [1.3, '体の前へ引く'], [2.6, 'カチッと締めた']] };

export function create(k) {
  const { el, g, pal } = k;
  k.backdrop({ floorY: 300, mood: 'indoor' });
  // 車内：窓・座席（横から）
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#E6EAF0' });
  el('path', { d: 'M 40 40 L 330 40 Q 360 40 370 80 L 380 150 L 40 150 Z', fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 6 });
  el('rect', { x: 0, y: 210, width: 400, height: 90, fill: '#9AA5B4' });
  const seatBack = el('path', { d: 'M 108 250 L 96 96 Q 96 80 112 80 L 142 80 Q 154 80 154 96 L 160 230 Z', fill: '#4A5468' });
  el('rect', { x: 110, y: 214, width: 160, height: 36, rx: 10, fill: '#5A6478' });
  el('rect', { x: 112, y: 58, width: 34, height: 26, rx: 8, fill: '#4A5468' });
  const S = 1.15, me = k.buddy({ x: 200, y: 232, scale: S });
  me.g.firstChild.setAttribute('display', 'none');
  // バックル（座席の右下）と肩のアンカー（左上）
  const AX = 150, AY = 104, BX = 258, BY = 214;
  el('rect', { x: BX - 6, y: BY - 4, width: 12, height: 22, rx: 3, fill: pal.ink });
  el('rect', { x: AX - 6, y: AY - 6, width: 12, height: 12, rx: 3, fill: pal.sub });
  const belt = el('path', { stroke: '#2B3446', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' });
  const tongue = el('rect', { x: -5, y: -7, width: 10, height: 14, rx: 2, fill: '#C9D1DC' });
  const click = mark(k, 'check');
  void seatBack; void g;
  return {
    update(t) {
      // 手（金具）の通り道：肩の横 → 前へ引き出す → 腰のバックルへ
      const p1 = easeInOut(seg(t, 0.4, 1.0)), p2 = easeInOut(seg(t, 1.1, 2.5));
      let hx = lerp(AX + 6, AX + 50, p1), hy = lerp(AY + 4, AY - 10, p1);
      if (p2 > 0) { hx = lerp(AX + 50, BX, p2) + 26 * Math.sin(p2 * Math.PI); hy = lerp(AY - 10, BY - 4, p2) - 20 * Math.sin(p2 * Math.PI); }
      const push = hump(seg(t, 2.5, 2.8)) * 4;
      const done = t > 2.7;
      me.pose({ look: lerp(-0.6, 0.6, p2), mood: done ? 'grin' : 'flat', blink: blinkAt(t), lean: -4 + 6 * p2 });
      if (t < 3.2) me.pose({ armR: reach(me, S, 'R', hx, hy + push), armL: p1 > 0.5 && p2 < 0.9 ? reach(me, S, 'L', AX + 20, AY + 30) : 10 });
      else me.pose({ armR: lerp(reach(me, S, 'R', BX, BY), 30, easeOut(seg(t, 3.2, 3.6))), armL: 10 });
      const ex = done ? BX : hx, ey = done ? BY - 4 : hy + push;
      // 肩 → 体の前（胸）→ 金具 / 金具 → 腰の左（ひざ側）
      const midx = lerp(AX + 10, 200, Math.max(p2, 0)), midy = lerp(AY + 20, 170, Math.max(p2, 0));
      k.set(belt, { d: `M ${AX} ${AY} Q ${midx} ${midy} ${ex} ${ey}${p2 > 0.6 ? ` M ${ex} ${ey} Q 200 ${BY + 4} 140 ${BY - 2}` : ''}` });
      k.tf(tongue, ex, ey, 40);
      const cp = seg(t, 2.7, 3.0); k.tf(click, BX + 20, BY - 30, 0, popIn(cp) * 1.8 * (1 - seg(t, 3.8, 4.2)) + 0.001);
    }
  };
}
