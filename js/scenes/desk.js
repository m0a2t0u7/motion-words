// desk：自分の机で椅子に座り、キーボードを打って書類を確かめながら仕事をしている（例文 He is working at his desk.）
// 共通ヘルパー：bentLegs（横向きに座ったときの曲げた脚）、officeChair（横から見た事務いす）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach, hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { officeBg, monitor } from './get-on-with.js';

// 横向きに座った脚（元の脚は隠す）。set(dir) は pose の後に呼ぶ。dir=1 で右向き
export function bentLegs(k, b, S, dark, FY) {
  const g = k.g({});
  b.g.parentNode.insertBefore(g, b.g.nextSibling);
  const legs = [0, 1].map(() => k.el('path', { fill: 'none', stroke: dark, 'stroke-width': 10 * S, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g));
  [0, 1].forEach((i) => b.g.children[1].children[i].setAttribute('opacity', 0));
  return {
    g,
    set(dir = 1, kneeLen = 24) {
      const st = b.state, hy = st.y - 14 * S, fy = Math.min(FY - 2, hy + 30);
      legs.forEach((l, i) => {
        const hx = st.x + (i ? 6 : -6) * S;
        const kx = hx + dir * kneeLen * S;
        l.setAttribute('d', `M ${hx.toFixed(1)} ${hy.toFixed(1)} L ${kx.toFixed(1)} ${(hy + 2).toFixed(1)} L ${(kx + dir * 2).toFixed(1)} ${fy.toFixed(1)}`);
      });
    }
  };
}
// 横から見た事務いす（背もたれは x の左。座面 y=SY）
export function officeChair(k, x, SY, FY, dir = 1) {
  const { el, pal } = k;
  k.shadow(x, FY + 1, 30, 4);
  el('rect', { x: x - dir * 34 - 6, y: SY - 66, width: 12, height: 62, rx: 6, fill: '#55607A' });
  el('rect', { x: x - 3, y: SY + 6, width: 6, height: FY - SY - 14, fill: pal.sub });
  el('path', { d: `M ${x - 26} ${FY - 4} L ${x + 26} ${FY - 4}`, stroke: pal.sub, 'stroke-width': 5, 'stroke-linecap': 'round' });
  [-26, 0, 26].forEach((d) => el('circle', { cx: x + d, cy: FY - 2, r: 3.5, fill: pal.ink }));
  return { seat() { el('rect', { x: x - 30, y: SY - 2, width: 60, height: 10, rx: 5, fill: '#55607A' }); } };
}

export const meta = { duration: 4.2, beats: [[0, '机に向かう'], [1.4, 'キーを打つ'], [2.6, 'クリック']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.86;
  const FY = officeBg(k, 236, 40);
  const SY = 196, BX = 146, DX = 168, DT = FY - 66;
  const chair = officeChair(k, BX, SY, FY, 1);
  const b = k.buddy({ x: BX, y: SY + 10, scale: S });
  const legs = bentLegs(k, b, S, pal.mintDark, FY);
  chair.seat();
  // 机（横から：天板と脚、引き出し）
  k.shadow(DX + 90, FY + 1, 96, 5);
  el('rect', { x: DX, y: DT, width: 190, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: DX + 6, y: DT + 9, width: 8, height: FY - DT - 9, fill: pal.woodDark });
  el('rect', { x: DX + 120, y: DT + 9, width: 64, height: FY - DT - 9, rx: 3, fill: '#EAD3B0' });
  [0, 1, 2].forEach((i) => { el('rect', { x: DX + 124, y: DT + 14 + i * 18, width: 56, height: 14, rx: 2, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5 }); el('rect', { x: DX + 146, y: DT + 20 + i * 18, width: 12, height: 3, rx: 1.5, fill: pal.woodDark }); });
  const mon = monitor(k, 300, DT);
  const lines = [0, 1, 2, 3].map((i) => el('rect', { x: 280, y: DT - 36 + i * 6, height: 3, rx: 1.5, width: 0, fill: '#fff' }));
  el('rect', { x: DX + 2, y: DT - 5, width: 34, height: 5, rx: 2, fill: '#C9D3E0' });
  const keys = el('rect', { x: DX + 4, y: DT - 7, width: 30, height: 3, rx: 1, fill: '#fff', opacity: 0.8 });
  el('path', { d: `M 352 ${DT} q -3 -16 4 -16 h 12 q 7 0 4 16 Z`, fill: pal.coral });
  el('rect', { x: 330, y: DT - 3, width: 16, height: 3, fill: pal.sub });
  const mouse = el('ellipse', { cx: DX + 46, cy: DT - 3, rx: 6, ry: 3.5, fill: pal.sub });
  const ok = g({}); el('circle', { r: 9, fill: pal.green }, ok); el('path', { d: 'M -4 0 L -1 3.5 L 5 -3.5', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, ok);
  return {
    update(t) {
      const mo = easeInOut(seg(t, 2.5, 2.8)) * (1 - easeInOut(seg(t, 3.5, 3.8)));
      const click = hump(seg(t, 3.0, 3.15));
      const typing = mo < 0.01;
      const tap = (ph) => (typing ? 3 * Math.abs(Math.sin(t * 16 + ph)) : 0);
      const pose = { x: BX + 2, y: SY + 10, lean: 12 + 4 * mo, look: 0.7, mood: t > 3.1 && t < 3.9 ? 'smile' : 'flat', blink: blinkAt(t), squash: 1 + 0.01 * Math.sin(t * 3) };
      P(b, pose);
      const ar = lerp(reach(b, S, 'R', DX + 26, DT - 8 - tap(0)), reach(b, S, 'R', DX + 46, DT - 7 + 1.5 * click), mo);
      const al = reach(b, S, 'L', DX + 10, DT - 8 - tap(1.7));
      P(b, { ...pose, armR: ar, armL: al });
      legs.set(1);
      const ty = clamp01((t - 0.2) / 2.2) + clamp01((t - 3.9) / 0.3) * 0.1;
      lines.forEach((l, i) => l.setAttribute('width', Math.max(0, Math.min(1, ty * 4 - i)) * (i % 2 ? 26 : 38)));
      k.set(keys, { opacity: typing ? 0.4 + 0.5 * Math.abs(Math.sin(t * 16)) : 0.8 });
      k.set(mouse, { cy: DT - 3 + 1 * click });
      const q = seg(t, 3.05, 3.4);
      tf(ok, 316, DT - 26, 0, q > 0 ? 0.3 + 0.7 * easeOut(q) : 0.001);
      ok.setAttribute('opacity', 1 - seg(t, 3.7, 3.95));
    }
  };
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));
