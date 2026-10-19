// tape：壁のポスターの角にテープを1枚ずつ貼って、はがれないように留める（例文 Use tape to hold the poster on the wall.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach, hp, P, blinkAt, face, homeBg } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, 'ポスターが落ちそう'], [0.8, 'テープで留める'], [3.2, 'ぴったり貼れた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236, X = 170;
  homeBg(k, { FY, winX: 30, winW: 70 });
  const PX = 240, PY = 124, PW = 54, PH = 62;
  const poster = k.g({});
  el('rect', { x: 0, y: 0, width: PW, height: PH, rx: 2, fill: '#FFF1D6', stroke: '#E9C98A', 'stroke-width': 2 }, poster);
  el('circle', { cx: PW / 2, cy: 22, r: 12, fill: pal.yellow }, poster);
  el('path', { d: `M 4 ${PH - 6} L 20 38 L 30 48 L 38 40 L ${PW - 4} ${PH - 6} Z`, fill: '#7FD3A0' }, poster);
  const tapes = [[PX, PY], [PX, PY + PH], [PX + PW, PY], [PX + PW, PY + PH]].map(([x, y]) => { const g = k.g({}); el('rect', { x: -9, y: -4, width: 18, height: 8, fill: '#F2F0E6', opacity: 0.85, stroke: '#D9D4C0', 'stroke-width': 1 }, g); tf(g, x, y, 45); return { g, x, y }; });
  // テープのロール（左手に持つ）
  const roll = k.g({}); el('circle', { r: 8, fill: '#F2F0E6', stroke: '#D9D4C0', 'stroke-width': 3 }, roll);
  const b = k.buddy({ x: X, y: FY, scale: S });
  roll.parentNode.appendChild(roll);
  return {
    update(t) {
      const n = Math.floor((t - 0.6) / 0.65);
      // 留めた数だけ紙がまっすぐになる
      const fixedTop = t > 1.0 ? (t > 2.3 ? 2 : 1) : 0;
      const sag = fixedTop === 0 ? 14 : fixedTop === 1 ? 7 : 0;
      k.set(poster, { transform: `translate(${PX} ${PY}) rotate(${(sag * 0.5).toFixed(2)} ${PW} 0) ` });
      const bx = lerp(X, X + 54, easeInOut(seg(t, 1.85, 2.1))) - 110 * easeInOut(seg(t, 3.3, 4.1));
      P(b, { x: bx, walk: seg(t, 1.85, 2.1) * Math.PI * 2 + seg(t, 3.3, 4.1) * Math.PI * 4, facing: t > 3.3 && t < 4.05 ? -1 : 1, look: 0.6, blink: blinkAt(t), lift: 0, mood: t > 3.3 ? 'grin' : 'smile', lean: -4 });
      face(b, 4, -3);
      const i = Math.max(0, Math.min(3, n)), q = ((t - 0.6) % 0.65) / 0.65;
      const tp = tapes[i];
      const active = t > 0.6 && t < 0.6 + 4 * 0.65;
      const tgt = active ? { x: lerp(bx + 40, tp.x, Math.sin(Math.min(1, q * 1.6) * Math.PI / 2)), y: lerp(tp.y + 10, tp.y, Math.sin(Math.min(1, q * 1.6) * Math.PI / 2)) } : { x: bx + 40, y: FY - 60 };
      b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y), armL: 40 });
      const lh = hp(b, S, 'L'); tf(roll, lh.x, lh.y);
      tapes.forEach((tt, j) => { const on = t > 0.6 + j * 0.65 + 0.4; tt.g.setAttribute('opacity', on ? 1 : 0); tt.g.parentNode.appendChild(tt.g); });
    }
  };
}
