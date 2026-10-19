// schedule：2人で予定表を見て相談し、3時の欄に会議を書き入れる（例文 We scheduled the meeting for three o'clock.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P } from './run-after.js';
import { hp, reach } from './dig.js';
import { clock } from './run-after.js';
import { officeBg } from './get-on-with.js';

export const meta = { duration: 4.2, beats: [[0, '予定表を見る'], [1.3, '3時にしよう'], [2.6, '3時に会議']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  const FY = officeBg(k, 236, 20);
  // 壁の予定表（1時〜5時）
  const PX = 160, PY = 50, RH = 26, PW = 110;
  el('rect', { x: PX - 4, y: PY - 22, width: PW + 8, height: RH * 5 + 28, rx: 5, fill: '#fff', stroke: pal.sub, 'stroke-width': 2.5 });
  el('rect', { x: PX - 4, y: PY - 22, width: PW + 8, height: 18, rx: 5, fill: pal.blue });
  const rows = [];
  for (let i = 0; i < 5; i++) {
    const y = PY + i * RH;
    rows.push(el('rect', { x: PX, y, width: PW, height: RH, fill: i === 2 ? '#FFF6D8' : '#fff', opacity: i === 2 ? 0 : 1 }));
    el('line', { x1: PX, y1: y, x2: PX + PW, y2: y, stroke: pal.line, 'stroke-width': 1.5 });
    k.text(PX + 16, y + RH / 2 + 1, `${i + 1}:00`, { 'font-size': 10, fill: i === 2 ? pal.coralDark : pal.sub });
  }
  el('line', { x1: PX + 32, y1: PY, x2: PX + 32, y2: PY + RH * 5, stroke: pal.line, 'stroke-width': 1.5 });
  // 書き込む会議（バーが伸びる）
  const bar = el('rect', { x: PX + 36, y: PY + RH * 2 + 4, width: 0, height: RH - 8, rx: 4, fill: pal.violet });
  const icon = g({}); tf(icon, PX + 52, PY + RH * 2 + RH / 2);
  [[-5, '#fff'], [5, '#fff']].forEach(([x, c]) => { el('circle', { cx: x, cy: -3, r: 2.6, fill: c }, icon); el('path', { d: `M ${x - 4} 5 Q ${x - 4} 0 ${x} 0 Q ${x + 4} 0 ${x + 4} 5 Z`, fill: c }, icon); });
  // 壁の時計（今は10時）
  clock(k, 330, 70, 20).set(10, 0);
  const me = k.buddy({ x: 120, y: FY, scale: S });
  const her = k.buddy({ x: 312, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const pen = el('line', { stroke: pal.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const tgt = (p) => ({ x: PX + 40 + 66 * p, y: PY + RH * 2 + RH / 2 });
  return {
    update(t) {
      // 相談：指さし・うなずき
      const point = easeInOut(seg(t, 0.9, 1.3)) * (1 - easeInOut(seg(t, 1.8, 2.1)));
      const nod = hump(seg(t, 1.5, 1.8)) + hump(seg(t, 1.8, 2.1));
      P(her, { x: 312, facing: -1, armL: 8, armR: 8, look: -0.6, mood: t > 1.4 ? 'grin' : 'smile', lean: 8 * nod });
      her.pose({ armR: lerp(8, reach(her, S, 'R', PX + PW / 2, PY + RH * 2.5), point) });
      highlight(t);
      // 書き込み
      const wr = easeInOut(seg(t, 2.3, 3.3)), arm = easeInOut(seg(t, 2.0, 2.3)) * (1 - easeInOut(seg(t, 3.4, 3.8)));
      const tp = tgt(wr);
      P(me, { x: 120, armL: 8, armR: 8, look: 0.7, mood: t > 3.3 ? 'grin' : t > 1.5 && t < 2.0 ? 'open' : 'smile', lean: 6 * arm + 6 * hump(seg(t, 1.5, 1.8)) });
      me.pose({ armR: lerp(8, reach(me, S, 'R', tp.x, tp.y + 10), arm) });
      const h = hp(me, S, 'R', 28);
      if (arm > 0.02) { const dx = tp.x - h.x, dy = tp.y - h.y, L = Math.hypot(dx, dy) || 1; k.set(pen, { x1: h.x, y1: h.y, x2: h.x + dx / L * 14, y2: h.y + dy / L * 14, opacity: 1 }); } else k.set(pen, { opacity: 0 });
      bar.setAttribute('width', 70 * wr);
      icon.setAttribute('opacity', seg(t, 3.0, 3.3));
    }
  };
  function highlight(t) { rows[2].setAttribute('opacity', easeOut(seg(t, 1.0, 1.4))); }
}
