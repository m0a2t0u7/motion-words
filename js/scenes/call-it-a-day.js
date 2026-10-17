// call it a day：夕方になり、まめが伸びをしてPCを閉じ、ライトを消して今日の仕事を終える（例文 It's getting late. Let's call it a day.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '作業中'], [1.5, '区切りをつける'], [3.2, '今日は終わり']] };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, p) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], p)).toString(16).padStart(2, '0')).join('');
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 246, mood: 'evening' });
  // 昼の明るさ（だんだん消える）
  const dayTint = el('rect', { x: 0, y: 0, width: 400, height: 246, fill: '#FFFFFF', opacity: 0.55 });

  // 窓：空が夕焼けに変わる
  const WX = 34, WY = 28, WW = 104, WH = 96;
  const winClip = k.clip((cp) => el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 6 }, cp));
  const win = g({ 'clip-path': winClip });
  el('rect', { x: WX, y: WY, width: WW, height: WH, fill: k.gradient([[0, '#BFE3F7'], [1, '#E4F4FC']]) }, win);
  const dusk = el('rect', { x: WX, y: WY, width: WW, height: WH, fill: k.gradient([[0, '#FF9F7E'], [1, '#FFDDB0']]), opacity: 0 }, win);
  const sunGlow = el('circle', { cx: 86, r: 22, fill: '#FFFFFF', opacity: 0.35 }, win);
  const sun = el('circle', { cx: 86, r: 12, fill: pal.yellow }, win);
  const hills = el('path', { d: `M ${WX} 108 Q 60 92 84 104 Q 110 114 ${WX + WW} 98 L ${WX + WW} ${WY + WH} L ${WX} ${WY + WH} Z`, fill: '#BFE5CF' }, win);
  el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 6, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 5 });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('line', { x1: WX, y1: WY + WH / 2, x2: WX + WW, y2: WY + WH / 2, stroke: '#FFFFFF', 'stroke-width': 4 });

  // 時計
  const CLX = 330, CLY = 62;
  el('circle', { cx: CLX, cy: CLY, r: 27, fill: '#FFFFFF', stroke: pal.woodDark, 'stroke-width': 5 });
  [0, 90, 180, 270].forEach((a) => el('line', { x1: CLX, y1: CLY - 21, x2: CLX, y2: CLY - 17, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round', transform: `rotate(${a} ${CLX} ${CLY})` }));
  const hourH = el('line', { x1: 0, y1: 0, x2: 0, y2: -12, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const minH = el('line', { x1: 0, y1: 0, x2: 0, y2: -19, stroke: pal.coralDark, 'stroke-width': 3, 'stroke-linecap': 'round' });
  el('circle', { cx: CLX, cy: CLY, r: 3, fill: pal.ink });

  // 机
  const DY = 206;
  el('rect', { x: 52, y: DY + 12, width: 12, height: 34, rx: 3, fill: pal.woodDark });
  el('rect', { x: 372, y: DY + 12, width: 12, height: 34, rx: 3, fill: pal.woodDark });
  el('rect', { x: 30, y: DY, width: 366, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 30, y: DY + 10, width: 366, height: 5, rx: 2, fill: pal.woodDark });
  k.shadow(210, FY + 6, 170, 5);

  // 卓上ライト
  const LX = 96;
  const cone = el('path', { d: 'M 104 166 L 122 158 L 206 DY L 74 DY Z'.replace(/DY/g, DY), fill: '#FFE9A8', opacity: 0.4 });
  el('ellipse', { cx: LX, cy: DY - 1, rx: 20, ry: 5, fill: '#8C98AC' });
  el('rect', { x: LX - 12, y: DY - 8, width: 24, height: 7, rx: 3, fill: '#A3AEC0' });
  el('line', { x1: LX, y1: DY - 8, x2: LX - 6, y2: 150, stroke: '#8C98AC', 'stroke-width': 5, 'stroke-linecap': 'round' });
  const lampHead = g({});
  tf(lampHead, LX - 6, 150, 32);
  const shade = el('path', { d: 'M -6 -10 L 26 -6 Q 34 6 30 14 L -6 10 Q -10 0 -6 -10 Z', fill: pal.coral }, lampHead);
  const bulb = el('ellipse', { cx: 29, cy: 5, rx: 4, ry: 9, fill: '#FFF3C4' }, lampHead);
  const btn = el('circle', { cx: LX + 5, cy: DY - 9, r: 3.6, fill: pal.red });

  // ノートPC（斜めから見た形。手前が B、奥が A）
  const A0 = [250, 190], B0 = [214, 204], BASEW = 68, LL = 42;
  const lap = g({});
  el('path', { d: `M ${A0[0]} ${A0[1]} L ${B0[0]} ${B0[1]} L ${B0[0] - BASEW} ${B0[1]} L ${A0[0] - BASEW} ${A0[1]} Z`, fill: '#CBD5E2', stroke: '#CBD5E2', 'stroke-width': 3, 'stroke-linejoin': 'round' }, lap);
  el('path', { d: `M ${B0[0]} ${B0[1]} L ${B0[0] - BASEW} ${B0[1]} L ${B0[0] - BASEW} ${B0[1] + 8} L ${B0[0]} ${B0[1] + 8} Z`, fill: '#A9B5C7', stroke: '#A9B5C7', 'stroke-width': 2, 'stroke-linejoin': 'round' }, lap);
  for (let i = 0; i < 3; i++) {
    const w = 0.25 + i * 0.22;
    el('line', { x1: lerp(A0[0], B0[0], w) - 6, y1: lerp(A0[1], B0[1], w), x2: lerp(A0[0], B0[0], w) - BASEW + 10, y2: lerp(A0[1], B0[1], w), stroke: '#AEBACB', 'stroke-width': 2.5, 'stroke-dasharray': '4 3', 'stroke-linecap': 'round' }, lap);
  }
  const lidQ = el('path', { d: '', fill: '#8FA0B8', stroke: '#8FA0B8', 'stroke-width': 4, 'stroke-linejoin': 'round' }, lap);
  const scrQ = el('path', { d: '', fill: '#CDEBFF' }, lap);
  const scrLines = [0.3, 0.5, 0.7].map(() => el('line', { stroke: '#FFFFFF', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, lap));
  
  // まめ
  const MXB = 134;
  const b = k.buddy({ x: MXB, y: FY + 4, scale: 1 });
  // 閉じるときの腕（のびる腕）
  const reachArm = el('path', { fill: 'none', stroke: pal.mintDark, 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0 });
  const reachHand = el('circle', { r: 6.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5, opacity: 0 });

  const OPEN = 98;
  const rad = Math.PI / 180;

  return {
    update(t) {
      // ---- 空・時計 ----
      const sk = easeInOut(seg(t, 0.4, 2.1));
      k.set(dusk, { opacity: sk });
      k.set(dayTint, { opacity: 0.55 * (1 - seg(t, 0.6, 2.2)) });
      k.set(sun, { cy: lerp(58, 100, sk), fill: mix('#FFCF5C', '#FF8E6B', sk) });
      k.set(sunGlow, { cy: lerp(58, 100, sk), opacity: 0.25 + 0.3 * sk, fill: mix('#FFFFFF', '#FFC9A0', sk) });
      k.set(hills, { fill: mix('#BFE5CF', '#D8A3A4', sk) });
      const mAng = 40 + 330 * easeInOut(seg(t, 0.25, 2.2));
      tf(minH, CLX, CLY, mAng);
      tf(hourH, CLX, CLY, 150 + 30 * easeInOut(seg(t, 0.25, 2.2)));

      // ---- ライトの状態 ----
      const lampOn = 1 - easeOut(seg(t, 3.55, 3.75));
      k.set(cone, { opacity: 0.4 * lampOn });
      k.set(bulb, { fill: mix('#C9CFDA', '#FFF3C4', lampOn) });
      k.set(shade, { fill: mix('#C7A096', pal.coral, 0.4 + 0.6 * lampOn) });
      k.set(btn, { cy: DY - 9 + (t > 3.45 && t < 3.6 ? 2 : 0) });

      // ---- ノートPCのフタ ----
      const closeP = seg(t, 2.65, 3.1);
      const th = OPEN * (1 - easeIn(closeP));
      const shut = t >= 3.1 ? 1.6 * Math.abs(wobble(seg(t, 3.1, 3.5), 2, 6)) : 0;
      const v = [-LL * Math.cos(th * rad), -LL * Math.sin(th * rad)];
      const P = (u, w) => [A0[0] + u * (B0[0] - A0[0]) + w * v[0], A0[1] + u * (B0[1] - A0[1]) + w * v[1]];
      const pd = (pts) => 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';
      k.set(lidQ, { d: pd([P(0, 0), P(1, 0), P(1, 1), P(0, 1)]) });
      const scrOn = seg(th, 40, 70);
      k.set(scrQ, { d: pd([P(0.1, 0.12), P(0.9, 0.12), P(0.9, 0.88), P(0.1, 0.88)]), opacity: scrOn });
      scrLines.forEach((l, i) => {
        const w = 0.3 + i * 0.2;
        const [x1, y1] = P(0.22, w), [x2, y2] = P(0.7 - (i % 2) * 0.2, w);
        k.set(l, { x1, y1, x2, y2, opacity: scrOn });
      });
      tf(lap, 0, shut);

      // ---- まめ ----
      const typing = t < 1.5;
      const up = easeOut(seg(t, 1.5, 1.85)) * (1 - easeInOut(seg(t, 2.1, 2.45)));
      const reachOn = t >= 2.4 && t < 3.3;
      const lampArm = easeInOut(seg(t, 3.1, 3.4)) * (1 - easeInOut(seg(t, 3.8, 4.1)));
      const stretching = up > 0.02;
      const press = t > 3.45 && t < 3.6 ? 1 : 0;
      b.pose({
        armR: typing ? 66 + 7 * Math.sin(t * 22) : stretching ? lerp(40, 172, up) : 8,
        armL: stretching ? lerp(8, 172, up) : lerp(8, 76 - 4 * press, lampArm),
        lean: typing ? 7 : lerp(7, -7, up) * (stretching ? 1 : 0) + (t > 2.4 && reachOn ? 9 : 0) + (lampArm > 0 ? -4 * lampArm : 0),
        squash: 1 + 0.07 * up,
        look: typing ? 0.9 : lampArm > 0.1 ? -0.8 : 0.3,
        mood: typing ? 'smile' : up > 0.3 ? 'open' : 'smile',
        blink: up > 0.3 ? 1 : 0
      });
      k.set(b.armR.a, { display: reachOn ? 'none' : 'inline' });

      // フタを押さえにいく腕（肘を少し曲げて伸ばす）
      if (reachOn) {
        const sx = MXB + 27 + 2, sy = FY + 4 - 56;
        const mid = P(0.5, 0.62);
        const tx = mid[0] - 6, ty = mid[1] + 2;
        const p = easeInOut(seg(t, 2.4, 2.7));
        const hx0 = MXB + 27 + 24, hy0 = FY + 4 - 48;
        const retreat = easeInOut(seg(t, 3.1, 3.3));
        const hx = lerp(lerp(hx0, tx, p), hx0 - 6, retreat), hy = lerp(lerp(hy0, ty, p), hy0 + 6, retreat);
        k.set(reachArm, { d: `M ${sx} ${sy} Q ${(sx + hx) / 2} ${(sy + hy) / 2 + 16} ${hx} ${hy}`, opacity: 1 });
        k.set(reachHand, { cx: hx, cy: hy, opacity: 1 });
      } else {
        reachArm.setAttribute('opacity', 0);
        reachHand.setAttribute('opacity', 0);
      }
    }
  };
}
