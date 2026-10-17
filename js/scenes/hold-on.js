// hold on：電話の相手に「ちょっと待って」と手のひらを見せ、少し待ってもらう（例文 Hold on a moment. I'll be right back.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, decor } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, '電話が鳴る'], [1.3, '待ってと手を出す'], [2.8, '少し待ってもらう']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 248, mood: 'indoor' });
  decor(k, FY);
  const S = 1.1;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const o = k.buddy({ x: 320, y: FY, scale: 1.0, color: pal.coral, dark: pal.coralDark, facing: -1 });
  // 電話（左手＝背中側の手）と手のひら（右手）
  const ph = g({});
  el('rect', { x: -7, y: -15, width: 14, height: 30, rx: 4, fill: pal.ink }, ph);
  el('rect', { x: -5, y: -12, width: 10, height: 22, rx: 2, fill: '#8FD3F4' }, ph);
  const ring = g({});
  [10, 17].forEach((r) => el('path', { d: `M ${-r} -8 q -6 8 0 16`, fill: 'none', stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, ring));
  const palm = g({});
  el('circle', { cx: 0, cy: 0, r: 8, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 }, palm);
  [-9, -3, 3, 9].forEach((x, i) => el('line', { x1: x, y1: -4, x2: x * 1.25, y2: -17 + Math.abs(x) * 0.4, stroke: pal.mintDark, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, palm));
  // 待っている間のしるし：時計
  const clock = g({});
  el('circle', { r: 20, fill: '#fff', stroke: pal.blue, 'stroke-width': 4 }, clock);
  const hand = el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, clock);
  el('circle', { r: 2.5, fill: pal.ink }, clock);
  const dots = [0, 1, 2].map((i) => el('circle', { r: 3.5, fill: pal.sub }));
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.9, 1.4));
      const buzz = t < 0.9 ? Math.sin(t * 50) * 1.5 : 0;
      const wait = t > 1.4;
      b.pose({ armL: lerp(22, 118, up), armR: lerp(14, 95, up), look: 0.4, mood: t < 0.9 ? 'open' : 'flat', lean: 3 * up, squash: 1 - 0.02 * hump(seg(t, 0.9, 1.4)) });
      const hl = hp(b, S, 'L'), hr = hp(b, S, 'R');
      tf(ph, hl.x + buzz - 3, hl.y - 8, 14 * up - 10 * (1 - up));
      tf(ring, hl.x - 8, hl.y - 8, 0);
      ring.setAttribute('opacity', t < 0.9 ? (Math.sin(t * 30) > 0 ? 1 : 0.2) : 0);
      tf(palm, hr.x + 2, hr.y - 7, 8, 1.1, 1.1);
      palm.setAttribute('opacity', up > 0.5 ? 1 : 0);
      // 相手：待ちくたびれず、じっと待つ（時計の針がゆっくり進む）
      o.pose({ armR: 10, armL: 10, look: 0.4, mood: 'smile', squash: 1 + 0.01 * Math.sin(t * 3) * (wait ? 1 : 0), lean: wait ? 2 : 0 });
      tf(clock, 255, 120, 0, seg(t, 1.3, 1.6), seg(t, 1.3, 1.6));
      hand.setAttribute('transform', `rotate(${(t - 1.3) * 160})`);
      dots.forEach((d, i) => {
        const on = wait && Math.floor((t - 1.4) * 2.5) % 4 > i;
        k.set(d, { cx: 238 + i * 12, cy: 158 });
        d.setAttribute('opacity', !wait ? 0 : on ? 1 : 0.25);
      });
    }
  };
}
