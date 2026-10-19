// beat：緑チームがゴールを決めて3対1になり、相手チームに勝つ（例文 Our team beat theirs 3 to 1.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump, wobble } from '../ease.js';
import { P } from './run-after.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '2対1'], [1.0, 'シュート'], [2.4, '3対1で勝つ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.7;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 36, fill: '#BFE3C6' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#8FD19A' });
  el('line', { x1: 0, y1: FY + 20, x2: 400, y2: FY + 20, stroke: '#fff', 'stroke-width': 3, opacity: 0.7 });
  // 得点板
  const sb = g({}); tf(sb, 150, 54);
  el('rect', { x: -78, y: -30, width: 156, height: 56, rx: 8, fill: pal.ink }, sb);
  el('rect', { x: -66, y: -20, width: 18, height: 36, rx: 4, fill: pal.mint }, sb);
  el('rect', { x: 48, y: -20, width: 18, height: 36, rx: 4, fill: pal.coral }, sb);
  const ours = k.text(-22, 0, '2', { 'font-size': 30, fill: '#fff' }, sb);
  k.text(0, 0, '-', { 'font-size': 26, fill: '#fff' }, sb);
  k.text(22, 0, '1', { 'font-size': 30, fill: '#fff' }, sb);
  // ゴール（奥のネット）
  const GX = 322, GT = FY - 74;
  const net = g({});
  for (let i = 0; i <= 6; i++) el('line', { x1: GX + 6 + i * 11, y1: GT, x2: GX + 6 + i * 11, y2: FY, stroke: '#fff', 'stroke-width': 1.5, opacity: 0.9 }, net);
  for (let j = 0; j <= 6; j++) el('line', { x1: GX + 6, y1: GT + j * 12.3, x2: GX + 72, y2: GT + j * 12.3, stroke: '#fff', 'stroke-width': 1.5, opacity: 0.9 }, net);
  const keeper = k.buddy({ x: 342, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const foe = k.buddy({ x: 250, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const mate = k.buddy({ x: 70, y: FY, scale: S });
  const me = k.buddy({ x: 170, y: FY, scale: S });
  const ball = icon(k, 'ball'), bsh = k.shadow(0, 0, 10, 2.5);
  el('rect', { x: GX - 4, y: GT - 4, width: 8, height: 78, rx: 3, fill: '#fff', stroke: pal.line });
  el('rect', { x: GX - 4, y: GT - 4, width: 76, height: 7, rx: 3, fill: '#fff', stroke: pal.line });
  return {
    update(t) {
      const kick = seg(t, 0.75, 1.0), fly = seg(t, 1.0, 1.55);
      const kl = Math.sin(seg(t, 0.6, 1.1) * Math.PI);
      P(me, { x: 170 + 10 * easeOut(seg(t, 0.2, 0.8)), lean: 8 * kl, armL: 30 * kl, armR: 20 * kl, look: 1, mood: 'flat' });
      // 蹴る脚
      me.g.children[1].children[1].setAttribute('transform', `translate(12 -14) rotate(${(-60 * kl).toFixed(1)})`);
      // ボール：足元 → ゴールの奥
      let bx = 196, by = FY - 9, rot = 0;
      if (t > 1.0) { const p = easeOut(fly); bx = lerp(196, 372, p); by = lerp(FY - 9, FY - 40, p) - 34 * hump(p); rot = p * 600; }
      if (t > 1.55) { const d = seg(t, 1.55, 2.2); bx = 372 + 6 * wobble(d, 1, 5); by = lerp(FY - 40, FY - 9, easeIn(d)) - 10 * hump(seg(t, 2.2, 2.5)); }
      tf(ball, bx, by, rot);
      tf(bsh, bx, FY + 1, 0, 1 - (FY - 9 - by) / 120);
      tf(net, 0, 0, 0, 1, 1); net.setAttribute('transform', `translate(${(4 * hump(seg(t, 1.5, 1.9))).toFixed(2)} 0)`);
      // キーパーは逆に跳んで届かない
      const dive = seg(t, 1.15, 1.7), lie = easeOut(seg(t, 1.7, 2.0));
      P(keeper, { x: 342 - 30 * easeOut(dive), lift: 30 * hump(dive), lean: -50 * easeOut(dive) + 10 * lie, armR: 160 * hump(dive) + 8, armL: 150 * hump(dive), facing: -1, mood: t > 1.8 ? 'sad' : 'open', look: -0.5 });
      // 得点 3-1 と、勝ったよろこび
      const sc = seg(t, 1.7, 2.0);
      ours.textContent = t > 1.85 ? '3' : '2';
      tf(ours, 0, 0, 0, 1 + 0.4 * hump(sc)); ours.setAttribute('x', -22 / (1 + 0.4 * hump(sc)));
      const jo = (b, x, ph, f = 1) => { const j = t > 2.1 ? Math.abs(Math.sin((t - 2.1 + ph) * 6)) : 0; P(b, { x, facing: f, lift: 14 * j, armL: lerp(8, 160, seg(t, 2.0, 2.3)), armR: lerp(8, 160, seg(t, 2.0, 2.3)), mood: t > 2.0 ? 'grin' : 'smile', squash: 1 + 0.05 * j, look: 0.6 * f }); };
      jo(mate, 70 + 30 * easeInOut(seg(t, 0.4, 1.4)), 0.3);
      if (t > 2.0) jo(me, 180, 0);
      P(foe, { x: 250, facing: -1, look: t > 1.0 ? 0.6 : -0.6, mood: t > 1.9 ? 'sad' : 'flat', lean: t > 1.9 ? 10 : 0, squash: t > 1.9 ? 0.95 : 1, armL: 8, armR: 8 });
    }
  };
}
