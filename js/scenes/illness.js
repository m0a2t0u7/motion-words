// illness：病気で寝こんだまま、カレンダーの×が何日も増えていく。窓の外ではほかの子が学校へ（例文 She missed school because of a long illness.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, lying, bed, bottle } from './hospital.js';

export const meta = { duration: 4.4, beats: [[0, '病気で寝ている'], [1.4, '何日も休む'], [3.4, '学校に行けない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'indoor' });
  // 窓：外の道と学校
  const WX = 24, WY = 36, WW = 128, WH = 86;
  const sky = el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 6, fill: '#DDEFFA' });
  const inner = g({ 'clip-path': k.clip((c) => el('rect', { x: WX, y: WY, width: WW, height: WH }, c)) });
  el('rect', { x: WX + 70, y: WY + 34, width: 60, height: 40, fill: '#F6E3C8' }, inner);
  el('path', { d: `M ${WX + 66} ${WY + 36} L ${WX + 100} ${WY + 18} L ${WX + 134} ${WY + 36} Z`, fill: pal.coral }, inner);
  el('rect', { x: WX, y: WY + 70, width: WW, height: 16, fill: '#E3E8EE' }, inner);
  const kids = [0, 1].map((i) => { const b = k.buddy({ parent: inner, x: 0, y: WY + 76, scale: 0.28, color: i ? pal.yellow : pal.blue, dark: i ? pal.yellowDark : pal.blueDark }); el('rect', { x: -36, y: -66, width: 22, height: 30, rx: 6, fill: pal.red }, b.body); return b; });
  el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 6, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 4 });
  // 壁のカレンダー（2週分）
  const CX = 190, CY = 34;
  el('rect', { x: CX, y: CY, width: 112, height: 82, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: CX, y: CY, width: 112, height: 16, rx: 5, fill: pal.blue });
  const marks = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) {
    const x = CX + 10 + c * 15.5, y = CY + 34 + r * 26;
    el('rect', { x: x - 6, y: y - 8, width: 12, height: 16, rx: 2, fill: '#F2F5F9' });
    const m = el('path', { d: `M ${x - 5} ${y - 6} L ${x + 5} ${y + 6} M ${x + 5} ${y - 6} L ${x - 5} ${y + 6}`, stroke: pal.red, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-dasharray': 32, 'stroke-dashoffset': 32 });
    marks.push(m);
  }
  // 使われないランドセル
  el('rect', { x: 338, y: 50, width: 30, height: 34, rx: 8, fill: pal.violet });
  el('rect', { x: 338, y: 50, width: 30, height: 14, rx: 7, fill: '#8C70DD' });
  el('circle', { cx: 353, cy: 44, r: 3, fill: pal.woodDark });
  // ベッドと寝ている子
  const X0 = 120, B = bed(k, X0, FY, 210, '#F7B7C4');
  const S = 0.64, gx = X0 + 80, gy = B.MT - 15;
  const L = lying(k, {});
  tf(L.grp, gx, gy, 90, S);
  B.front(X0 + 6, gx + 28, gy - 18);
  // 枕元の台と薬・ティッシュ
  el('rect', { x: 344, y: FY - 70, width: 46, height: 70, rx: 4, fill: pal.wood });
  bottle(k, null).setAttribute('transform', `translate(358 ${FY - 70}) scale(0.8)`);
  el('rect', { x: 368, y: FY - 84, width: 20, height: 14, rx: 2, fill: '#fff', stroke: pal.line });
  el('path', { d: `M 374 ${FY - 84} q 4 -8 8 0`, fill: '#fff', stroke: pal.line });
  return {
    update(t) {
      // 日が過ぎる：×が1つずつ増える
      const n = 11;
      marks.forEach((m, i) => { const q = i < n ? easeOut(seg(t, 0.4 + i * 0.3, 0.6 + i * 0.3)) : 0; m.setAttribute('stroke-dashoffset', (32 * (1 - q)).toFixed(1)); });
      // 窓の外：朝ごとに子どもが学校へ歩いていく
      const ph = (t * 0.55) % 1;
      kids.forEach((b, i) => { const q = (ph + i * 0.35) % 1; P(b, { x: WX - 10 + q * (WW + 20), walk: q * 40, look: 0.5 }); });
      k.set(sky, { fill: '#DDEFFA' });
      // 寝ている子：ときどきせき・寝返り
      const cough = hump(seg(t % 1.8, 1.3, 1.6));
      P(L.b, { mood: cough > 0.3 ? 'open' : 'sad', blink: cough > 0.3 ? 0.6 : 0.85, squash: 1 - 0.05 * cough });
    }
  };
}
