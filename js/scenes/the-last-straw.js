// the last straw：真夜中の隣の騒音が重なり、がまんの目盛りがあふれて、ついに飛び起きる（The noise at midnight was the last straw for me.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '眠ろうとする'], [1.8, '騒音が重なる'], [3.4, '限界でがまんが切れる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 250, mood: 'indoor' });
  // 壁の時計（0時）と隣室のスピーカー
  const c = g({}); tf(c, 214, 70);
  el('circle', { r: 20, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, c);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, c);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -9, stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, c);
  el('rect', { x: 14, y: 100, width: 46, height: 76, rx: 8, fill: pal.ink });
  el('circle', { cx: 37, cy: 124, r: 9, fill: pal.sub }); el('circle', { cx: 37, cy: 154, r: 14, fill: pal.sub });
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 -14 q 10 14 0 28', fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  // 我慢メーター（右の壁）
  el('rect', { x: 362, y: 50, width: 22, height: 120, rx: 8, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  const fill = el('rect', { x: 366, y: 166, width: 14, height: 0, rx: 4, fill: pal.red });
  const drip = el('ellipse', { cx: 373, cy: 176, rx: 3, ry: 5, fill: pal.red, opacity: 0 });
  // ベッド
  el('rect', { x: 338, y: 130, width: 14, height: 112, rx: 5, fill: pal.woodDark });
  el('rect', { x: 120, y: 206, width: 230, height: 26, rx: 6, fill: pal.wood });
  el('rect', { x: 126, y: 232, width: 10, height: 18, fill: pal.woodDark }); el('rect', { x: 332, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 124, y: 190, width: 220, height: 20, rx: 8, fill: '#EAF2FA' });
  el('ellipse', { cx: 300, cy: 170, rx: 34, ry: 15, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const grp = g({});
  const b = k.buddy({ parent: grp, x: 0, y: 0 });
  b.g.firstChild.setAttribute('display', 'none');
  const bl = el('rect', { x: 150, y: 164, width: 112, height: 42, rx: 14, fill: pal.blue });
  el('rect', { x: 150, y: 164, width: 112, height: 9, rx: 4, fill: '#fff', opacity: 0.35 });
  const anger = g({});
  el('path', { d: 'M -10 -4 q 6 -2 6 -8 M 10 -4 q -6 -2 -6 -8 M -10 6 q 6 2 6 8 M 10 6 q -6 2 -6 8', fill: 'none', stroke: pal.red, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, anger);
  const bursts = [0.7, 1.5, 2.3, 3.0];
  return {
    update(t) {
      // 音の波：4回。最後は特大
      waves.forEach((w, i) => {
        let o = 0, s = 1, x = 66;
        bursts.forEach((bt, j) => { const p = (t - bt - i * 0.12) / 0.5; if (p > 0 && p < 1) { o = 1 - p; s = (j === 3 ? 1.6 : 1) * (0.6 + p); x = 66 + p * 40; } });
        k.set(w, { transform: `translate(${x} 140) scale(${s})`, opacity: o });
      });
      // メーター：3回で少しずつ上がり、4回目で満タン超え
      const lv = easeOut(seg(t, 0.9, 1.2)) * 30 + easeOut(seg(t, 1.7, 2.0)) * 40 + easeOut(seg(t, 2.5, 2.8)) * 38 + easeOut(seg(t, 3.0, 3.2)) * 12;
      k.set(fill, { y: 166 - lv, height: lv });
      const dp = seg(t, 3.1, 3.9);
      k.set(drip, { cy: 168 + dp * 70, opacity: dp > 0 && dp < 1 ? 1 : 0 });
      // まめ：横になって眠ろうとする→飛び起きる
      const sp = easeInOut(seg(t, 3.2, 3.8));
      const sit = easeOut(seg(t, 3.5, 4.0));
      tf(grp, 190, lerp(160, 192, sp), lerp(90, 0, sp));
      const twitch = bursts.slice(0, 3).reduce((a, bt) => a + hump(seg(t, bt, bt + 0.3)), 0);
      b.pose({
        blink: t < 3.2 ? 1 - Math.min(1, twitch * 0.8) * 0.0 - (twitch > 0.3 ? 0.4 : 0) : 0,
        mood: t < 3.3 ? 'flat' : 'open', armL: lerp(8, 160, sit), armR: lerp(8, 160, sit),
        squash: 1 + 0.03 * Math.sin(t * 2), look: 0.3, lean: 0
      });
      bl.setAttribute('y', 164 + 16 * seg(t, 3.5, 4.0)); bl.setAttribute('height', 42 - 16 * seg(t, 3.5, 4.0));
      const ap = backOut(seg(t, 3.6, 4.0));
      tf(anger, 232, 96 - 6 * Math.sin(t * 20) * seg(t, 3.8, 4.6), 0, ap, ap);
    }
  };
}
