// grandmother：おばあちゃんがきゅうりを瓶に漬けて漬け物を作り、ひと切れ食べさせると「おいしい！」（例文 My grandmother makes great pickles.）
import { seg, lerp, easeInOut, easeOut, clamp, hump, wobble } from '../ease.js';
import { kitchen, TOP, arms, bun, glasses, heartP, pops, P, blinkAt, C } from './jam.js';

export const meta = { duration: 4.6, beats: [[0, '瓶に漬ける'], [1.8, 'ひと切れどうぞ'], [3.4, 'おいしい！']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const kit = kitchen(k, { wall: '#F5EEE2' });
  const gm = k.buddy({ x: 140, y: kit.FY, scale: S });
  bun(k, gm); glasses(k, gm);
  const kid = k.buddy({ x: 320, y: kit.FY - 6, scale: 0.75, facing: -1, ...C(k, 'coral') });
  kit.front('#EAD9BE');
  // 漬け物の瓶（きゅうりが並ぶ）
  const JX = 210, JW = 50, JH = 64;
  const cuc = (x, y, r = 90) => { const g = k.g({}); el('rect', { x: -5, y: -18, width: 10, height: 36, rx: 5, fill: '#59A85E' }, g); el('line', { x1: -1, y1: -12, x2: -1, y2: 12, stroke: '#3E8A45', 'stroke-width': 1.5 }, g); k.tf(g, x, y, r); return g; };
  const inside = [cuc(JX - 12, TOP - 22, 0), cuc(JX, TOP - 22, 0), cuc(JX + 12, TOP - 22, 0)];
  el('rect', { x: JX - JW / 2, y: TOP - JH + 26, width: JW, height: JH - 26, fill: '#E9E3A6', opacity: 0.5 });
  el('path', { d: `M ${JX - JW / 2} ${TOP} V ${TOP - JH + 6} H ${JX + JW / 2} V ${TOP} Z`, fill: 'rgba(200,232,250,0.35)', stroke: '#A9CDE3', 'stroke-width': 2 });
  el('rect', { x: JX - JW / 2 - 3, y: TOP - JH - 2, width: JW + 6, height: 9, rx: 3, fill: '#C98A5A' });
  // 小皿と切った漬け物
  el('ellipse', { cx: 270, cy: TOP, rx: 18, ry: 4, fill: '#fff', stroke: '#C9D2DD' });
  const slices = [0, 1, 2].map((i) => el('ellipse', { cx: 262 + i * 8, cy: TOP - 3, rx: 4, ry: 2.6, fill: '#7FBF6A', stroke: '#3E8A45' }));
  const pick = el('ellipse', { rx: 4, ry: 2.6, fill: '#7FBF6A', stroke: '#3E8A45' });
  const A = arms(k, gm, S, { back: ['L'] }), K = arms(k, kid, 0.75, { col: pal.coral, dark: pal.coralDark, back: ['L'] });
  const spark = [0, 1, 2].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow }));
  const h = heartP(k);
  return {
    update(t) {
      const tap = t < 1.4 ? Math.abs(Math.sin(t * 6)) : 0;
      P(gm, { look: t < 1.6 ? 0.4 : 0.8, lean: 4, blink: blinkAt(t), mood: t > 3.3 ? 'grin' : 'smile' });
      // 1) 瓶のふたを軽くたたいて「よく漬かった」
      A.to('L', JX - JW / 2 + 4, TOP - 30);
      const give = easeInOut(seg(t, 1.6, 2.2)), eat = easeInOut(seg(t, 2.3, 2.7)), back = easeInOut(seg(t, 2.8, 3.2));
      // 2) 小皿からひと切れつまんで子どもへ
      const take = easeInOut(seg(t, 1.2, 1.6));
      let hx = lerp(JX + 6, JX + 8, tap), hy = TOP - JH - 6 - 6 * tap;
      if (t > 1.2) { hx = lerp(JX + 8, 278, take); hy = lerp(TOP - JH - 6, TOP - 8, take); }
      if (t > 1.6) { hx = lerp(278, 296, give); hy = lerp(TOP - 8, 162, give); }
      if (t > 2.8) { hx = lerp(296, 200, back); hy = lerp(162, TOP - 20, back); }
      A.to('R', hx, hy);
      const kidMouth = { x: 320 - 6 * 0.75, y: kit.FY - 6 - 53 * 0.75 };
      const kh = K.to('R', lerp(304, 298, give) + lerp(0, kidMouth.x + 6 - 298, eat), lerp(204, 166, give) + lerp(0, kidMouth.y + 4 - 166, eat));
      K.to('L', 330, 204);
      slices[2].setAttribute('opacity', t > 1.6 ? 0 : 1);
      const held = t > 1.6 && t < 2.2 ? { x: hx - 4, y: hy } : t >= 2.2 && t < 2.75 ? { x: kh.x - 3, y: kh.y - 3 } : null;
      if (held) k.set(pick, { cx: held.x, cy: held.y, opacity: 1 }); else pick.setAttribute('opacity', 0);
      const chew = t > 2.7 && t < 3.4 ? Math.abs(Math.sin(t * 16)) : 0;
      P(kid, { look: 0.6, facing: -1, blink: t > 3.3 ? 1 : blinkAt(t, 1), mood: t > 3.3 ? 'grin' : chew > 0.5 ? 'open' : 'smile', squash: 1 + 0.02 * chew });
      spark.forEach((s, i) => { const q = seg(t, 3.3 + i * 0.12, 3.8 + i * 0.12); k.tf(s, 300 + (i - 1) * 26, 130 - 10 * q - (i % 2) * 10, q * 90, pops(q)); });
      const q = seg(t, 3.6, 4.1); k.tf(h, 160, 92 - 10 * q, 0, pops(q));
    }
  };
}
