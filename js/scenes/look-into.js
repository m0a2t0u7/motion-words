// look into：警告ランプの点く機械を懐中電灯で調べ、外れた歯車（原因）を見つける（例文 We'll look into the problem right away.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '問題が起きる'], [1.2, '中を調べる'], [2.9, '原因が分かる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 28, y: 40, width: 64, height: 52, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 60, y1: 40, x2: 60, y2: 92, stroke: '#FFFFFF', 'stroke-width': 4 });

  // 機械（箱型）。原点はそのまま画面座標。
  const MX = 214, MY = 84, MW = 148, MH = 150; // 左上と大きさ
  k.shadow(MX + MW / 2, FY + 2, 86, 7);
  el('rect', { x: MX, y: MY, width: MW, height: MH, rx: 12, fill: '#B7C3D6' });
  el('rect', { x: MX, y: MY, width: MW, height: 14, rx: 8, fill: '#CAD4E3' });
  el('rect', { x: MX + 8, y: MY + MH, width: 14, height: 6, rx: 3, fill: '#8F9BB0' });
  el('rect', { x: MX + MW - 22, y: MY + MH, width: 14, height: 6, rx: 3, fill: '#8F9BB0' });
  // 警告ランプ
  el('rect', { x: MX + MW / 2 - 17, y: MY - 10, width: 34, height: 12, rx: 4, fill: '#8F9BB0' });
  const lampOff = el('path', { d: `M ${MX + MW / 2 - 14} ${MY - 8} Q ${MX + MW / 2} ${MY - 34} ${MX + MW / 2 + 14} ${MY - 8} Z`, fill: '#E8B8B2' });
  const lampOn = el('path', { d: `M ${MX + MW / 2 - 14} ${MY - 8} Q ${MX + MW / 2} ${MY - 34} ${MX + MW / 2 + 14} ${MY - 8} Z`, fill: pal.red });
  const lampGlow = el('circle', { cx: MX + MW / 2, cy: MY - 20, r: 28, fill: pal.red, opacity: 0 });
  const rays = [0, 1, 2, 3, 4].map((i) => { const a = -Math.PI / 2 + (i - 2) * 0.55; return el('line', { x1: MX + MW / 2 + Math.cos(a) * 26, y1: MY - 20 + Math.sin(a) * 26, x2: MX + MW / 2 + Math.cos(a) * 38, y2: MY - 20 + Math.sin(a) * 38, stroke: pal.red, 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: 0 }); });
  // 外板（開く窓）と中の断面
  const WX = MX + 18, WY = MY + 34, WW = MW - 36, WH = 84;
  el('rect', { x: WX - 4, y: WY - 4, width: WW + 8, height: WH + 8, rx: 10, fill: '#8F9BB0' });
  const inside = g({});
  el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 7, fill: '#2A3242' }, inside);
  const cl = k.clip((cp) => el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 7 }, cp));
  const inner = g({ 'clip-path': cl }, inside);
  const cog = (cx, cy, r, n, col, parent) => {
    const gg = g({}, parent);
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.8 : r * 1.0; pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`); }
    el('polygon', { points: pts.join(' '), fill: col, stroke: col, 'stroke-width': 4, 'stroke-linejoin': 'round' }, gg);
    el('circle', { cx: 0, cy: 0, r: r * 0.36, fill: '#2A3242' }, gg);
    tf(gg, cx, cy);
    return gg;
  };
  el('rect', { x: WX + 6, y: WY + 8, width: 40, height: 5, rx: 2.5, fill: '#4A5468' }, inner);
  el('rect', { x: WX + WW - 46, y: WY + WH - 14, width: 40, height: 5, rx: 2.5, fill: '#4A5468' }, inner);
  el('rect', { x: WX + WW - 22, y: WY + 8, width: 6, height: 40, rx: 3, fill: '#4A5468' }, inner);
  const g1 = cog(WX + 28, WY + 34, 18, 8, '#8FA0BA', inner);
  const g2 = cog(WX + 62, WY + 30, 14, 7, '#7E91AE', inner);
  const g3 = cog(WX + 96, WY + 26, 11, 6, '#8FA0BA', inner);
  // 外れた歯車（傾いて落ちている）と赤丸
  const loose = cog(0, 0, 13, 6, pal.yellow, inner);
  const circ = el('circle', { cx: 0, cy: 0, r: 22, fill: 'none', stroke: pal.red, 'stroke-width': 4, 'stroke-dasharray': '140', 'stroke-dashoffset': 140, 'stroke-linecap': 'round' });
  // 扉
  const door = g({});
  el('rect', { x: 0, y: 0, width: WW, height: WH, rx: 7, fill: '#C9D3E2', stroke: '#8F9BB0', 'stroke-width': 3 }, door);
  el('rect', { x: 8, y: 8, width: WW - 16, height: 12, rx: 4, fill: '#DCE3EE' }, door);
  el('circle', { cx: WW - 14, cy: WH / 2, r: 4.5, fill: '#8F9BB0' }, door);
  // 懐中電灯の光
  const beam = el('path', { d: '', fill: pal.yellow, opacity: 0.0 });

  const b = k.buddy({ x: 96, y: FY, scale: 1 });
  const torch = g({});
  el('rect', { x: -5, y: -7, width: 24, height: 14, rx: 4, fill: '#4A5468' }, torch);
  el('rect', { x: 16, y: -10, width: 10, height: 20, rx: 3, fill: pal.yellowDark }, torch);
  el('rect', { x: 24, y: -9, width: 4, height: 18, rx: 2, fill: '#FFF3C4' }, torch);
  const LG = [WX + 82, WY + 58];

  return {
    update(t) {
      // ランプの点滅
      const blink = Math.sin(t * 9) > 0 ? 1 : 0;
      const on = blink ? 1 : 0.1;
      lampOn.setAttribute('opacity', on); lampGlow.setAttribute('opacity', on * 0.22);
      rays.forEach((r) => r.setAttribute('opacity', blink ? 1 : 0));
      // 扉が開く（横にスライド）
      const open = easeInOut(seg(t, 1.5, 2.2));
      tf(door, WX - open * WW * 0.92, WY);
      door.setAttribute('opacity', 1 - seg(t, 2.1, 2.3));
      // まめが近づいてのぞき込む
      const walk = easeInOut(seg(t, 0.35, 1.3));
      const x = lerp(86, 150, walk);
      const lean = 16 * easeInOut(seg(t, 1.3, 1.9)) * (1 - easeInOut(seg(t, 3.5, 4.0)) * 0.7);
      const aim = easeOut(seg(t, 0.9, 1.5));
      const sweep = seg(t, 2.0, 3.0);
      const armA = lerp(20, 82, aim) + Math.sin(sweep * Math.PI * 2) * 6 * (sweep > 0 && sweep < 1 ? 1 : 0);
      b.pose({
        x, armR: armA, armL: 10, walk: walk > 0 && walk < 1 ? (t - 0.35) * 10 : 0,
        lean, look: 0.8, mood: t < 1.4 ? 'open' : t < 3.1 ? 'flat' : 'smile'
      });
      const hp = b.handPos('R');
      // 光の円錐：中の歯車を左→右へ照らし、最後に外れた歯車を照らす
      const bo = easeOut(seg(t, 1.5, 1.9));
      const tx = lerp(WX + 20, LG[0], easeInOut(seg(t, 2.1, 2.9))), ty = lerp(WY + 24, LG[1], easeInOut(seg(t, 2.1, 2.9)));
      const aimA = Math.atan2(ty - hp.y, tx - hp.x);
      tf(torch, hp.x, hp.y, (aimA * 180) / Math.PI);
      const sx = hp.x + Math.cos(aimA) * 27, sy = hp.y + Math.sin(aimA) * 27;
      const dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, w = 22;
      beam.setAttribute('d', `M ${sx} ${sy - 4} L ${tx + nx * w} ${ty + ny * w} L ${tx - nx * w} ${ty - ny * w} L ${sx} ${sy + 4} Z`);
      beam.setAttribute('opacity', 0.38 * bo * (1 - seg(t, 3.7, 4.2) * 0.5));
      // 歯車の動き（回っている歯車と、外れて止まっている歯車）
      const spin = t < 2.9 ? t * 60 : 2.9 * 60;
      tf(g1, WX + 28, WY + 34, spin); tf(g2, WX + 62, WY + 30, -spin * 1.2); tf(g3, WX + 96, WY + 26, spin * 1.5);
      // 外れた歯車：右下の隅に落ちている
      const lx = LG[0], ly = LG[1];
      tf(loose, lx, ly, 24);
      // 見つけた：赤丸を描く
      const cp = easeOut(seg(t, 2.9, 3.4));
            circ.setAttribute('stroke-dashoffset', 170 * (1 - cp));
      const pulse = t > 3.4 ? 1 + 0.07 * Math.sin((t - 3.4) * 9) : 1;
      circ.setAttribute('transform', `translate(${lx} ${ly}) rotate(-90) scale(${pulse})`);
      circ.setAttribute('opacity', cp > 0 ? 1 : 0);
    }
  };
}
