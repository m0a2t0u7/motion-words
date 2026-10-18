// drop out：大学の4段の階段を仲間がのぼっていく中、まめは1段目で列からはずれ、外へ歩いて去る（例文 He dropped out of college after one year.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';

export const meta = { duration: 4.6, beats: [[0, '1年目'], [1.6, '列から抜ける'], [3.6, '大学を去る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 校舎（背景）
  el('rect', { x: 230, y: 60, width: 160, height: 110, rx: 4, fill: '#F3E6DC' });
  el('path', { d: 'M 220 64 L 310 26 L 400 64 Z', fill: pal.violet });
  [250, 290, 330, 360].forEach((x) => el('rect', { x, y: 84, width: 18, height: 22, rx: 2, fill: '#CFE9F7' }));
  // 卒業帽の旗
  const cap = g({}); tf(cap, 360, 130);
  el('path', { d: 'M -16 0 L 0 -8 L 16 0 L 0 8 Z', fill: pal.ink }, cap); el('rect', { x: -7, y: 2, width: 14, height: 8, fill: pal.ink }, cap);
  el('line', { x1: 12, y1: 0, x2: 14, y2: 12, stroke: pal.yellow, 'stroke-width': 2 }, cap);
  // 4段の階段（1段＝1年）
  const st = [0, 1, 2, 3].map((i) => ({ x: 120 + i * 60, y: FY - 20 - i * 20 }));
  st.forEach((s, i) => {
    el('rect', { x: s.x, y: s.y, width: 400 - s.x, height: FY - s.y, fill: ['#E9EDF2', '#E1E6EC', '#D9DFE7', '#D1D8E1'][i] });
    el('rect', { x: s.x, y: s.y, width: 400 - s.x, height: 3, fill: '#fff' });
    k.text(s.x + 14, s.y + 11, String(i + 1), { 'font-size': 11, fill: pal.sub });
  });
  const S = 0.6;
  const peers = [0, 1].map((i) => k.buddy({ scale: S, color: i ? pal.blue : pal.coral, dark: i ? pal.blueDark : pal.coralDark }));
  const b = k.buddy({ scale: S });
  // 段の上の高さ
  const yAt = (x) => { let y = FY; st.forEach((s) => { if (x >= s.x + 10) y = s.y; }); return y; };
  const px = (i) => (t) => lerp(40 - i * 50, 330 - i * 52, easeInOut(seg(t, 0.2 + i * 0.1, 4.2)));
  // まめ：1段目にのぼってから、向きを変えて左へ降り、外へ
  const bx = (t) => t < 1.6 ? lerp(-20, 150, easeInOut(seg(t, 0.1, 1.4))) : lerp(150, -60, easeInOut(seg(t, 2.2, 4.4)));
  return {
    update(t) {
      peers.forEach((p, i) => { const f = px(i); const w = walkTo(f, t, 40 - i * 50, 1); P(p, { ...w, y: yAt(w.x), facing: 1, look: 0.7, mood: 'smile', blink: blinkAt(t, i) }); });
      const w = walkTo(bx, t, -20, 1);
      const think = hump(seg(t, 1.5, 2.2));
      P(b, { ...w, y: yAt(w.x), facing: t > 1.9 ? -1 : 1, look: t > 1.6 && t < 1.9 ? 0.9 : 0.6, lean: w.lean - 4 * think, mood: t > 1.6 ? 'flat' : 'smile', squash: 1 - 0.04 * think, blink: blinkAt(t) });
    }
  };
}
