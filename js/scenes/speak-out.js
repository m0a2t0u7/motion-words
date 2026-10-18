// speak out：集会で新しいルールが貼り出される→座っていたまめが立ち上がり、手を挙げて反対の意見をはっきり言う（例文 He spoke out against the new rule.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { roomBg, say, waves, faceAt } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '新しいルール'], [1.4, '立ち上がる'], [2.6, '反対を言う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 244);
  // ボードとルールの紙
  el('rect', { x: 250, y: 50, width: 130, height: 96, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const rule = g({}); tf(rule, 315, 98);
  el('rect', { x: -30, y: -36, width: 60, height: 72, rx: 3, fill: '#FFF6DA', stroke: pal.yellowDark, 'stroke-width': 2 }, rule);
  k.text(0, -22, 'NEW', { 'font-size': 11, fill: pal.red }, rule);
  [-6, 4, 14, 24].forEach((y) => el('line', { x1: -20, x2: 20, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, rule));
  // 座っている人たち（背もたれ付きいす）
  const seat = (x, c, d) => { const p = k.buddy({ x, y: 252, scale: 0.7, color: c, dark: d }); return p; };
  const P = [seat(60, pal.blue, pal.blueDark), seat(200, pal.yellow, pal.yellowDark)];
  const b = k.buddy({ x: 130, y: 252, scale: 0.7 });
  [60, 130, 200].forEach((x) => { el('rect', { x: x - 30, y: 214, width: 60, height: 30, rx: 6, fill: pal.woodDark }); });
  const bub = say(k, 52, 40, -1);
  const mini = g({}, bub.g); tf(mini, 0, 0, 0, 0.32); el('rect', { x: -30, y: -36, width: 60, height: 72, rx: 3, fill: '#FFF6DA', stroke: pal.yellowDark, 'stroke-width': 5 }, mini);
  el('path', { d: 'M -14 -14 L 14 14 M 14 -14 L -14 14', stroke: pal.red, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, bub.g);
  const wv = waves(k, pal.mintDark);
  return {
    update(t) {
      tf(rule, 315, 98 - 30 * (1 - easeOut(seg(t, 0.1, 0.6))), 0, 1, 1); rule.setAttribute('opacity', seg(t, 0.1, 0.3));
      const up = easeOut(seg(t, 1.2, 1.7)), talk = t > 2.2;
      b.pose({ y: lerp(252, 244, up), lift: 30 * up - 6 * hump(seg(t, 1.1, 1.3)), armR: 8 + 160 * easeOut(seg(t, 1.6, 2.0)) - 70 * seg(t, 2.6, 3.0), armL: 8 + 30 * talk, lean: -4 * up + 5 * talk, mood: talk && Math.sin(t * 13) > 0 ? 'open' : 'flat', look: 0.4 });
      faceAt(b, 4, -2);
      bub.show(seg(t, 2.3, 2.6), 196, 70);
      wv(talk ? 1 : 0, (t * 1.2) % 1, 160, 146, 1, 1.3);
      P.forEach((p, i) => { const tt = seg(t, 2.5 + i * 0.2, 2.8 + i * 0.2); p.pose({ facing: i === 1 && tt > 0.5 ? -1 : 1, mood: tt > 0.5 ? 'open' : 'flat', look: i === 0 ? lerp(0.6, 1, tt) : 0.6 }); faceAt(p, i === 0 ? 5 : 3, -2); });
    }
  };
}
