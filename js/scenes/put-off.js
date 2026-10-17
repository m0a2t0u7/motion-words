// put off：やるべき宿題カードを、スマホを見たまま「明日」の側へ押しやり、片づかずに積み重なる（例文 Don't put off your homework until tomorrow.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'やることがある'], [0.9, '押しやる'], [3.1, '後回し']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 壁：窓
  el('rect', { x: 36, y: 34, width: 66, height: 54, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 69, y1: 34, x2: 69, y2: 88, stroke: '#FFFFFF', 'stroke-width': 4 });
  // 机（右側）
  const TY = 174;
  k.shadow(278, 246, 124, 6);
  el('rect', { x: 150, y: TY, width: 250, height: 36, rx: 6, fill: pal.wood });
  el('rect', { x: 150, y: TY, width: 250, height: 5, rx: 2.5, fill: '#F0D9B8' });
  el('rect', { x: 150, y: TY + 36, width: 250, height: 10, fill: '#D6B58A' });
  el('rect', { x: 372, y: TY + 46, width: 12, height: 26, rx: 3, fill: pal.woodDark });
  el('rect', { x: 372, y: TY + 70, width: 12, height: 2, fill: pal.woodDark });
  // 「今日」「明日」の置き場と札
  const zone = (x, w, label, col) => {
    el('rect', { x: x - w / 2, y: TY + 8, width: w, height: 26, rx: 6, fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    el('rect', { x: x - w / 2 - 2, y: 122, width: w + 4, height: 22, rx: 8, fill: col });
    el('path', { d: `M ${x - 6} 144 L ${x} 152 L ${x + 6} 144 Z`, fill: col });
    k.text(x, 133.5, label, { 'font-size': 13, fill: '#FFFFFF' });
  };
  zone(172, 62, 'TODAY', pal.coralDark);
  zone(334, 82, 'TOMORROW', pal.blueDark);

  // カード
  const CX0 = 172, CX1 = 334, CY = TY + 21;
  const rotEnd = [-3, 4, -1];
  const mkCard = () => {
    const c = g({});
    el('rect', { x: -27, y: -17, width: 56, height: 38, rx: 5, fill: 'rgba(40,52,70,0.14)' }, c);
    el('rect', { x: -28, y: -19, width: 56, height: 38, rx: 5, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, c);
    el('rect', { x: -28, y: -19, width: 56, height: 12, rx: 5, fill: pal.coral }, c);
    el('rect', { x: -28, y: -13, width: 56, height: 6, fill: pal.coral }, c);
    k.text(0, -13, 'TODAY', { 'font-size': 9, fill: '#FFFFFF' }, c);
    el('rect', { x: -20, y: -1, width: 38, height: 4, rx: 2, fill: pal.line }, c);
    el('rect', { x: -20, y: 8, width: 26, height: 4, rx: 2, fill: pal.line }, c);
    return c;
  };
  const cards = [0, 1, 2].map(mkCard);
  const appear = [-1, 1.6, 2.9], push = [0.95, 2.3, 3.6];

  // ソファ（背もたれ）→ まめ → ソファ（座面）
  el('rect', { x: 8, y: 118, width: 134, height: 100, rx: 20, fill: '#A9C8F5' });
  const BY = 226;
  const b = k.buddy({ x: 80, y: BY, scale: 1 });
  b.g.firstChild.setAttribute('display', 'none');
  el('rect', { x: 0, y: 200, width: 36, height: 44, rx: 14, fill: '#8DB4EE' });
  el('rect', { x: 118, y: 208, width: 30, height: 36, rx: 12, fill: '#8DB4EE' });
  el('rect', { x: 20, y: 214, width: 112, height: 30, rx: 12, fill: '#BDD6F8' });
  el('rect', { x: 20, y: 212, width: 112, height: 6, rx: 3, fill: '#D3E4FB' });
  el('rect', { x: 28, y: 240, width: 9, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 118, y: 240, width: 9, height: 8, rx: 3, fill: pal.woodDark });
  k.shadow(78, 247, 76, 6);
  // スマホ（左手に持つ）
  const phone = g({});
  el('rect', { x: -10, y: -17, width: 20, height: 34, rx: 5, fill: '#2A3242' }, phone);
  el('rect', { x: -7.5, y: -13, width: 15, height: 26, rx: 3, fill: '#CFE9FA' }, phone);
  el('rect', { x: -5, y: -9, width: 10, height: 4, rx: 2, fill: '#FFFFFF' }, phone);
  const scrollBar = el('rect', { x: -5, y: 0, width: 10, height: 4, rx: 2, fill: '#FFFFFF' }, phone);

  return {
    update(t) {
      // カード
      cards.forEach((c, i) => {
        const dp = seg(t, appear[i], appear[i] + 0.32);
        const s = easeOut(seg(t, push[i] + 0.1, push[i] + 0.62));
        const y0 = CY - (1 - easeIn(dp)) * 90 + wobble(seg(t, appear[i] + 0.32, appear[i] + 0.7), 2, 6) * 3;
        const x = lerp(CX0, CX1, s);
        const y = lerp(y0, CY - 9 * i, s) - hump(s) * 12;
        c.setAttribute('opacity', t >= appear[i] ? 1 : 0);
        tf(c, x, y, lerp(0, rotEnd[i], s) + hump(s) * 6, 1, 1);
      });
      // まめ：右手でカードを払うように押しやる
      let arm = 28;
      push.forEach((p) => {
        arm = Math.max(arm, 28 + 62 * easeOut(seg(t, p - 0.22, p)) * (1 - easeInOut(seg(t, p + 0.12, p + 0.55))));
      });
      const flick = push.some((p) => t > p - 0.22 && t < p + 0.5);
      const end = easeInOut(seg(t, 3.9, 4.2));
      b.pose({
        x: 80, y: BY, armR: arm, armL: 128, look: flick ? -0.6 : -1,
        lean: flick ? 4 : 0, mood: end > 0.5 ? 'smile' : 'flat', squash: 1,
        blink: Math.sin(t * 2.3) > 0.97 ? 1 : 0
      });
      const hp = b.handPos('L');
      tf(phone, hp.x - 3, hp.y - 14, -18);
      k.set(scrollBar, { y: -2 + Math.sin(t * 5) * 6 });
    }
  };
}
