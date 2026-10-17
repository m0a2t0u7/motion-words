// sleep in：目覚ましが鳴っても布団をかぶって、日曜は遅くまで寝ている（例文 I like to sleep in on Sundays.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '目覚ましが鳴る'], [1.5, '布団をかぶる'], [3.4, '日が高い・まだ寝る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  // 窓と朝日（日は低い位置から高く昇る）
  el('rect', { x: 30, y: 40, width: 76, height: 66, rx: 8, fill: '#DDEFFA' });
  const sun = el('circle', { cx: 68, r: 13, fill: pal.yellow });
  el('rect', { x: 30, y: 98, width: 76, height: 8, fill: '#B9DDB8' });
  el('line', { x1: 68, y1: 40, x2: 68, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 30, y1: 73, x2: 106, y2: 73, stroke: '#fff', 'stroke-width': 4 });
  // 日曜のカレンダー
  el('rect', { x: 130, y: 44, width: 44, height: 50, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 130, y: 44, width: 44, height: 14, rx: 5, fill: pal.red });
  k.text(152, 51, 'SUN', { 'font-size': 10, fill: '#fff' });
  k.text(152, 77, '7', { 'font-size': 24, fill: pal.red });
  // 壁の時計
  const wc = g({}); tf(wc, 230, 66);
  el('circle', { r: 24, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 5 }, wc);
  [0, 90, 180, 270].forEach((a) => el('line', { x1: 0, y1: -19, x2: 0, y2: -15, stroke: pal.sub, 'stroke-width': 2, transform: `rotate(${a})` }, wc));
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -12, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, wc);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -18, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, wc);
  // ベッド
  el('rect', { x: 338, y: 120, width: 14, height: 112, rx: 5, fill: pal.woodDark });
  el('rect', { x: 120, y: 206, width: 230, height: 26, rx: 6, fill: pal.wood });
  el('rect', { x: 126, y: 232, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 332, y: 232, width: 10, height: 20, fill: pal.woodDark });
  el('rect', { x: 124, y: 190, width: 220, height: 20, rx: 8, fill: '#EAF2FA' });
  el('ellipse', { cx: 302, cy: 172, rx: 34, ry: 15, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  // 目覚まし台
  el('rect', { x: 36, y: 200, width: 62, height: 52, rx: 5, fill: pal.wood });
  const clock = g({});
  el('circle', { r: 17, fill: '#fff', stroke: pal.red, 'stroke-width': 5 }, clock);
  el('circle', { cx: -14, cy: -17, r: 6, fill: pal.red }, clock);
  el('circle', { cx: 14, cy: -17, r: 6, fill: pal.red }, clock);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -11, stroke: pal.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, clock);
  el('line', { x1: 0, y1: 0, x2: 7, y2: 4, stroke: pal.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, clock);
  const rings = g({});
  [-1, 1].forEach((s) => [26, 34].forEach((r, i) => el('path', { d: `M ${s * r} ${-6 - i * 6} q ${s * (6 + i * 3)} ${6 + i * 6} 0 ${12 + i * 12}`, fill: 'none', stroke: pal.red, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, rings)));
  // まめ（あお向け、頭は右）
  const grp = g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0 });
  b.g.firstChild.setAttribute('display', 'none');
  tf(grp, 190, 160, 90);
  const bl = el('rect', { x: 150, y: 164, width: 112, height: 42, rx: 14, fill: pal.blue });
  const blTop = el('rect', { x: 150, y: 164, width: 112, height: 9, rx: 4, fill: '#fff', opacity: 0.35 });
  const zz = g({});
  ['Z', 'z'].forEach((s, i) => k.text(i * 14, -i * 16, s, { 'font-size': 20 - i * 5, fill: pal.sub }, zz));
  return {
    update(t) {
      const ringing = t > 0.3 && t < 2.6;
      const cover = easeInOut(seg(t, 1.3, 2.0));
      const toss = ringing && t < 1.3 ? Math.sin(t * 22) * 0.04 : 0;
      b.pose({ blink: t < 0.5 ? 1 : t < 1.3 ? 0.2 : 1, mood: t < 1.3 ? 'sad' : 'smile', armL: 8, armR: 8, squash: 1 + toss + 0.02 * Math.sin(t * 2.2) * (t > 2.4 ? 1 : 0), look: 0.3 });
      // 布団：胸まで → 頭までかぶる
      const top = lerp(164, 136, cover), w = lerp(112, 146, cover);
      k.set(bl, { y: top, height: 206 - top, width: w });
      k.set(blTop, { y: top, width: w });
      tf(clock, 67, 178, ringing ? Math.sin(t * 60) * 3 : 0);
      tf(rings, 67, 178);
      rings.setAttribute('opacity', ringing ? (t < 2.0 ? (Math.sin(t * 30) > 0 ? 1 : 0.3) : 0.3 * (1 - seg(t, 2.0, 2.6))) : 0);
      // 日の高さ・時刻
      const tm = seg(t, 1.0, 4.4);
      k.set(sun, { cy: lerp(102, 58, easeOut(tm)) });
      sun.setAttribute('r', lerp(13, 11, tm));
      hh.setAttribute('transform', `rotate(${210 + tm * 90})`);
      mh.setAttribute('transform', `rotate(${tm * 1080})`);
      tf(zz, 292, 134 - 6 * Math.sin(t * 3), 0);
      zz.setAttribute('opacity', seg(t, 2.1, 2.6));
    }
  };
}
