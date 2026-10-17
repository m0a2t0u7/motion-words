// play it by ear：明日の予定は白紙のまま。耳を澄ませるしぐさのあと、両手を広げて「その場の様子で決めよう」と笑い合う（Let's play it by ear tomorrow.）
import { seg, lerp, easeOut, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '予定は？'], [1.4, '耳を澄ます'], [3.0, '成り行きで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // カレンダー（明日の欄に印、予定は空）
  el('rect', { x: 146, y: 36, width: 108, height: 96, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('path', { d: 'M 146 44 a 8 8 0 0 1 8 -8 h 92 a 8 8 0 0 1 8 8 v 14 h -108 Z', fill: pal.red });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) el('circle', { cx: 160 + c * 14.5, cy: 74 + r * 14, r: 2, fill: pal.line });
  el('rect', { x: 177, y: 81, width: 26, height: 18, rx: 4, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 });
  // 天気カード（明日の欄の上で入れ替わる＝その場の状況しだい）
  const card = g({});
  el('rect', { x: -22, y: -18, width: 44, height: 36, rx: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, card);
  el('path', { d: 'M -6 18 L 0 26 L 6 18 Z', fill: '#fff' }, card);
  const sun = g({}, card);
  el('circle', { r: 8, fill: pal.yellow }, sun);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('line', { x1: Math.cos(a) * 11, y1: Math.sin(a) * 11, x2: Math.cos(a) * 14.5, y2: Math.sin(a) * 14.5, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linecap': 'round' }, sun); }
  const cloud = g({}, card);
  el('path', { d: 'M -12 6 a 8 8 0 0 1 4 -14 a 10 10 0 0 1 18 2 a 7 7 0 0 1 2 12 Z', fill: pal.blue }, cloud);
  // 質問の吹き出し（相手）
  const q = g({});
  el('rect', { x: -26, y: -22, width: 52, height: 40, rx: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, q);
  el('path', { d: 'M -8 18 L -14 28 L 4 18 Z', fill: '#fff' }, q);
  k.text(0, -2, '?', { 'font-size': 26, fill: pal.violet }, q);
  const me = k.buddy({ x: 100, y: 238 });
  const friend = k.buddy({ x: 306, y: 238, facing: -1, color: pal.coral, dark: pal.coralDark });
  const arcs = [0, 1, 2].map((i) => el('path', { d: `M ${i * 6} ${-i * 5} q ${5 + i * 3} ${5 + i * 5} 0 ${10 + i * 10}`, fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const qp = backOut(seg(t, 0.2, 0.7)) * (1 - seg(t, 1.5, 1.8));
      tf(q, 300, 112, 0, qp, qp);
      const ear = easeOut(seg(t, 1.4, 1.9)) * (1 - easeOut(seg(t, 2.7, 3.0)));
      const op = easeOut(seg(t, 2.7, 3.2));
      const sw = Math.sin(t * 7) * 3;
      me.pose({
        armR: lerp(lerp(8, 162, ear), 62 - sw, op), armL: lerp(8, 62 + sw, op),
        lean: lerp(0, -6, ear) + 3 * op, look: 0.4 - 0.8 * ear + 0.3 * op,
        mood: t < 2.7 ? 'flat' : 'grin', squash: 1 + 0.02 * Math.sin(t * 6) * op
      });
      friend.pose({ armL: 8, armR: lerp(8, 60 + sw * 0.7, op), mood: t < 2.7 ? 'smile' : 'grin', look: 0.3, lean: 3 * op, squash: 1 + 0.02 * Math.sin(t * 6 + 1) * op });
      arcs.forEach((a, i) => k.set(a, { transform: 'translate(136 160)', opacity: ear > 0.6 ? 0.4 + 0.6 * Math.max(0, Math.sin(t * 9 - i * 1.2)) : 0 }));
      const cp = easeOut(seg(t, 2.0, 2.5));
      const flip = Math.sin(t * 4.2) > 0;
      tf(card, 190, lerp(92, 66, cp), 0, cp, cp);
      sun.setAttribute('opacity', flip ? 1 : 0);
      cloud.setAttribute('opacity', flip ? 0 : 1);
    }
  };
}
