// tie：青いネクタイの結び目を整えてから、会議室へ入り、同僚の待つ会議に出る（例文 He wore a blue tie to the meeting.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { wardrobe, gait, reach, P, blinkAt } from './skirt.js';
import { officeBg } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, 'ネクタイを締める'], [1.4, '会議室へ'], [3.3, '会議に出る']] };

export function create(k) {
  const { el, pal, tf } = k, S = 1.25;
  const FY = officeBg(k, 236, 40);
  // ホワイトボード（グラフ）
  el('rect', { x: 186, y: 40, width: 120, height: 74, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 4 });
  [[204, 30], [228, 46], [252, 38], [276, 58]].forEach(([x, h]) => el('rect', { x, y: 104 - h, width: 14, height: h, rx: 2, fill: pal.blue, opacity: 0.7 }));
  const c1 = k.buddy({ x: 226, y: FY - 6, scale: 0.95, color: pal.coral, dark: pal.coralDark });
  const c2 = k.buddy({ x: 318, y: FY - 6, scale: 0.95, facing: -1, color: pal.violet, dark: '#8C70DD' });
  // 会議テーブル
  k.shadow(278, FY + 1, 100, 5);
  el('rect', { x: 186, y: 194, width: 210, height: 10, rx: 4, fill: pal.woodDark });
  el('rect', { x: 196, y: 204, width: 190, height: 32, fill: pal.wood });
  [250, 300].forEach((x) => el('rect', { x, y: 189, width: 22, height: 5, rx: 1, fill: '#fff', stroke: pal.line }));
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: '#fff', dark: pal.line, sleeve: 'long', to: -16, collar: true });
  W.bottom({ kind: 'trousers', color: '#3F4656', dark: '#2E3440', from: -16 });
  W.feet('shoe', pal.ink);
  const tie = W.tie(pal.blue, pal.blueDark);
  const xf = (t) => lerp(70, 140, easeInOut(seg(t, 1.5, 3.0)));
  return {
    update(t) {
      const adj = easeInOut(seg(t, 0.2, 0.5)) * (1 - easeInOut(seg(t, 1.1, 1.4)));
      const p = gait(xf, t, 70);
      P(b, { x: p.x, walk: p.walk, lean: p.lean, armL: p.armL, armR: p.armR, look: t < 1.4 ? -0.2 : 0.5, mood: t > 3.1 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (adj > 0) b.pose({ armR: lerp(8, reach(b, S, 'R', 70 + 3 * S, FY - 36 * S), adj), armL: lerp(8, reach(b, S, 'L', 70 - 4 * S, FY - 22 * S), adj) });
      // 結び目をきゅっと上げる
      const up = easeOut(seg(t, 0.5, 0.9));
      tf(tie, 0, 3 * (1 - up), Math.sin(p.walk) * 3 * p.m);
      if (t > 3.2) b.pose({ armR: 8 + 30 * hump(seg(t, 3.3, 4.0)) });
      const wv = hump(seg(t, 3.0, 4.2));
      P(c1, { x: 226, y: FY - 6, armR: 8 + 140 * wv + 14 * Math.sin(t * 14) * wv, look: -0.6, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t, 0.7) });
      P(c2, { x: 318, y: FY - 6, look: 0.6, mood: 'smile', facing: -1, blink: blinkAt(t, 1.4) });
    }
  };
}
