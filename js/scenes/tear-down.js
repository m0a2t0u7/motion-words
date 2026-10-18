// tear down：作業員たちが古い校舎にロープを掛けて引き倒し、建物はがれきになる（例文 They tore down the old school building.）
import { seg, lerp, easeInOut, easeIn, easeOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '古い校舎'], [1.6, '引き倒す'], [3.4, 'なくなった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E3D6C0' });
  k.shadow(130, FY + 1, 90, 7);
  // 校舎（左下の角を支点に右へ倒れる…ではなく、下へ崩れる）
  const bd = g({});
  const inner = g({}, bd);
  el('rect', { x: -80, y: -130, width: 160, height: 130, fill: '#D8CCB8' }, inner);
  el('rect', { x: -16, y: -160, width: 32, height: 34, fill: '#C9BBA4' }, inner);
  el('circle', { cx: 0, cy: -146, r: 9, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, inner);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) el('rect', { x: -68 + c * 36, y: -118 + r * 38, width: 24, height: 24, fill: '#A9BCCB', stroke: '#fff', 'stroke-width': 2 }, inner);
  el('path', { d: 'M -60 -40 L -40 -20 L -50 -4 M 40 -120 L 52 -96', stroke: '#8E8070', 'stroke-width': 2, fill: 'none' }, inner);
  tf(bd, 130, FY);
  const rubble = g({});
  [[-60, 10, 0], [-20, 16, 20], [20, 12, -15], [60, 8, 10], [0, 26, 5], [-40, 22, -10], [40, 24, 30]].forEach(([x, w, r], i) => el('rect', { x: x - w, y: -w * 0.8, width: w * 2, height: w * 0.8, rx: 2, fill: i % 2 ? '#C9BBA4' : '#D8CCB8', transform: `translate(130 ${FY}) rotate(${r})` }, rubble));
  const rope = el('path', { stroke: '#8A6A4C', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const crew = [270, 320].map((x, i) => {
    const b = k.buddy({ x, y: FY, scale: 0.72, facing: 1, color: i ? pal.coral : pal.mint, dark: i ? pal.coralDark : pal.mintDark });
    const hat = g({}, b.body); el('path', { d: 'M -30 -66 Q 0 -102 30 -66 Z', fill: pal.yellow }, hat); el('rect', { x: -34, y: -68, width: 68, height: 6, rx: 3, fill: pal.yellowDark }, hat);
    return { b, x };
  });
  const dust = [0, 1, 2, 3, 4].map(() => el('circle', { r: 10, fill: '#E9E0D0' }));
  return {
    update(t) {
      const pull = easeInOut(seg(t, 0.4, 1.4));
      const fall = easeIn(seg(t, 1.5, 2.4)), crash = seg(t, 2.4, 3.2);
      const ang = lerp(0, 6, pull) * (1 - fall) + fall * 24;
      // 建物は右下角を支点に傾き、倒れながら崩れる
      tf(inner, 80, 0, ang); inner.setAttribute('transform', `translate(80 0) rotate(${ang}) translate(-80 0) scale(1 ${(1 - 0.75 * fall).toFixed(3)})`);
      bd.setAttribute('opacity', 1 - seg(t, 2.3, 2.6));
      rubble.setAttribute('opacity', seg(t, 2.3, 2.6));
      tf(rubble, 0, 0);
      // ロープの先端＝屋根の右上
      const a = (ang * Math.PI) / 180, rx0 = 80, ry0 = -126;
      const ry1 = ry0 * (1 - 0.75 * fall), topX = 130 + 80 - ry1 * Math.sin(a), topY = FY + ry1 * Math.cos(a);
      const lean = lerp(0, -22, pull) * (1 - seg(t, 2.4, 3.0));
      crew.forEach((c, i) => {
        const back = 18 * pull - 10 * fall;
        c.b.pose({ x: c.x + back + 14 * easeOut(seg(t, 1.5, 2.0)), lean, armL: 70, armR: 80, mood: t > 2.6 ? 'grin' : 'flat', look: -0.6, facing: -1, squash: 1 - 0.04 * pull });
      });
      const hx = crew[1].b.state.x - 24;
      if (t < 2.4) k.set(rope, { d: `M ${topX} ${topY} Q ${(topX + hx) / 2} ${(topY + FY - 52) / 2 + 20 * (1 - pull)} ${hx} ${FY - 52}`, opacity: 1 });
      else k.set(rope, { d: `M ${crew[0].b.state.x - 20} ${FY - 50} Q ${crew[0].b.state.x - 60} ${FY - 10} 220 ${FY - 2}`, opacity: 1 - seg(t, 2.6, 3.0) });
      dust.forEach((d, i) => { const u = seg(t, 2.3, 3.8); k.set(d, { cx: 60 + i * 36 + Math.sin(u * 3 + i) * 10, cy: FY - 10 - u * (30 + i * 8), r: 10 + 26 * u, opacity: u > 0 ? 0.8 * (1 - u) : 0 }); });
    }
  };
}
