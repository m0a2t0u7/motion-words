// pass back：先生が採点済みのノートを、生徒に1人ずつ返す（例文 The teacher passed back our notebooks.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, grip } from './hand-over.js';

export const meta = { duration: 4.4, beats: [[0, '先生がノートを持つ'], [0.9, '1人目に返す'], [2.7, '2人目に返す']] };

function nb(k, g, ink) {
  const { el, pal } = k;
  el('rect', { x: -11, y: -15, width: 22, height: 30, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  el('rect', { x: -11, y: -15, width: 5, height: 30, rx: 2, fill: ink }, g);
  el('circle', { cx: 3, cy: -3, r: 7, fill: 'none', stroke: pal.red, 'stroke-width': 2 }, g);
  el('path', { d: 'M -1 -3 L 2 0 L 7 -7', fill: 'none', stroke: pal.red, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  el('rect', { x: 150, y: 40, width: 150, height: 86, rx: 6, fill: '#3F7F6B' });
  el('rect', { x: 150, y: 40, width: 150, height: 86, rx: 6, fill: 'none', stroke: pal.woodDark, 'stroke-width': 5 });
  el('path', { d: 'M 170 70 q 12 -14 24 0 t 24 0', fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.8, 'stroke-linecap': 'round' });
  el('line', { x1: 170, y1: 98, x2: 240, y2: 98, stroke: '#fff', 'stroke-width': 3, opacity: 0.7, 'stroke-linecap': 'round' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const S = 1;
  const T = k.buddy({ x: 95, y: FY, scale: S });
  const s2 = k.buddy({ x: 430, y: FY, scale: S, color: pal.blue, dark: pal.blueDark, facing: -1 });
  const s1 = k.buddy({ x: 210, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const hold = g({}), n1 = g({}), n2 = g({});
  nb(k, n1, pal.coralDark); nb(k, n2, pal.blueDark); nb(k, hold, pal.violet);
  const gT = grip(k, pal.mint, pal.mintDark, S), g1 = grip(k, pal.coral, pal.coralDark, S), g2 = grip(k, pal.blue, pal.blueDark, S);
  return {
    update(t) {
      const e1 = easeInOut(seg(t, 0.8, 1.5));              // 先生が1人目へ差し出す
      const r1 = easeInOut(seg(t, 1.5, 2.1));              // 1人目が下がる
      const e2 = easeInOut(seg(t, 2.6, 3.2));              // 2人目へ差し出す
      const r2 = easeInOut(seg(t, 3.3, 3.9));
      const leave = easeInOut(seg(t, 1.9, 2.8));
      const come = easeOut(seg(t, 1.9, 2.8));
      const walk1 = t > 1.9 && t < 2.8, walk2 = t > 1.9 && t < 2.8;
      T.pose({ armR: lerp(lerp(30, 88, e1), 30, r1) * (1 - e2) + 88 * e2 * (1 - r2) + 30 * r2 * e2, armL: 12, look: 0.4, mood: 'smile', lean: 3 * hump(seg(t, 0.8, 1.9)) + 3 * hump(seg(t, 2.6, 3.7)) });
      s1.pose({ x: lerp(210, 322, leave), y: FY + 10 * hump(seg(t, 1.9, 3.2)) * 0 + 12 * leave, walk: walk1 ? (t - 1.9) * 9 : 0, facing: leave > 0.02 ? 1 : -1,
        armR: lerp(12, 90, easeInOut(seg(t, 1.0, 1.5))) * (1 - r1) + 40 * r1, armL: 10, look: 0.3, mood: t > 1.5 ? 'grin' : 'smile', squash: 1 - 0.05 * hump(seg(t, 1.5, 1.9)) });
      s2.pose({ x: lerp(430, 214, come), y: FY - 10 * (1 - easeInOut(seg(t, 2.3, 3.0))), walk: walk2 ? (t - 1.9) * 9 : 0, armR: lerp(12, 90, easeInOut(seg(t, 2.7, 3.2))) * (1 - r2) + 40 * r2, armL: 10, look: 0.3,
        mood: t > 3.2 ? 'grin' : 'smile', squash: 1 - 0.05 * hump(seg(t, 3.2, 3.6)) });
      const hT = hp(T, S), h1 = hp(s1, S), h2 = hp(s2, S);
      // 先生の手の中の束（1人目に渡したあとも、もう1冊持っている）
      const toHand = (n, a, b, m, dx) => tf(n, lerp(a.x, b.x, m) + dx, lerp(a.y, b.y, m) - 12, lerp(-8, 6, m));
      // 手元のノート（2人目用）
      tf(hold, hT.x + 2, hT.y - 12, -8);
      hold.setAttribute('opacity', t < 3.0 ? 1 : 0);
      // 1人目用：渡す前は先生の手元、渡した後は生徒の手元
      const m1 = easeInOut(seg(t, 1.35, 1.6)), m2 = easeInOut(seg(t, 3.05, 3.3));
      toHand(n1, hT, h1, m1, 4);
      n1.setAttribute('opacity', t > 0.7 ? 1 : 0);
      toHand(n2, hT, h2, m2, 4);
      n2.setAttribute('opacity', t > 2.5 ? 1 : 0);
      if (t <= 2.5) tf(n2, -50, -50);
      gT(hT); g1(h1); g2(h2);
    }
  };
}
