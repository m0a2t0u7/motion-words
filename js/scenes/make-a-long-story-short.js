// make a long story short：長々と続く話にハサミを入れて短くし、「道に迷った」の一言に絞る（To make a long story short, we got lost.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '長い話'], [1.9, '切る'], [3.2, '手短に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  el('ellipse', { cx: 200, cy: FY + 16, rx: 160, ry: 10, fill: '#EDE5D8' });
  const CUT = 176, L = 40, R = 372, BY = 30, BH = 58;
  const mint = k.buddy({ x: 78, y: FY });
  const coral = k.buddy({ x: 330, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 });
  // 吹き出し（左・右に分けて描く）
  const rowsD = (a, b) => [0, 1, 2].map((i) => { let d = `M ${a} ${BY + 14 + i * 15}`; for (let x = a; x < b; x += 16) d += ` q 4 -6 8 0 t 8 0`; return d; });
  const mk = (clipId) => {
    const gg = g({}); gg.setAttribute('clip-path', clipId); return gg;
  };
  const clipL = k.clip((cp) => k.el('rect', { x: 0, y: 0, width: CUT, height: 300 }, cp));
  const clipR = k.clip((cp) => k.el('rect', { x: CUT, y: 0, width: 400, height: 300 }, cp));
  const piece = (clipId, left) => {
    const wrap = g({});
    const inner = mk(clipId); wrap.appendChild(inner);
    const rect = el('rect', { x: L, y: BY, width: R - L, height: BH, rx: 16, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, inner);
    const lines = rowsD(L + 14, R - 14).map((d) => el('path', { d, pathLength: 1, fill: 'none', stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, inner));
    return { wrap, rect, lines };
  };
  const pr = piece(clipR, false), pl = piece(clipL, true);
  const tail = el('polygon', { points: `${L + 14},${BY + BH - 1} ${L + 34},${BY + BH - 1} ${78},${FY - 96}`, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  pl.wrap.parentNode.insertBefore(tail, pl.wrap);
  // 左片の右縁を丸く閉じ直す
  const cap = el('rect', { x: L, y: BY, width: CUT - L + 6, height: BH, rx: 16, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2, opacity: 0 });
  // 短い要点：地図と「?」（迷った）
  const map = g({});
  el('rect', { x: -26, y: -20, width: 52, height: 40, rx: 5, fill: '#EAF4FB', stroke: '#CBD3DF', 'stroke-width': 2 }, map);
  el('path', { d: 'M -20 14 Q -8 -6 4 4 T 20 -14', stroke: pal.blueDark, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '4 3', 'stroke-linecap': 'round' }, map);
  k.text(12, 6, '?', { 'font-size': 18, fill: pal.red }, map);
  const guide = el('line', { x1: CUT, y1: BY - 6, x2: CUT, y2: BY + BH + 6, stroke: pal.red, 'stroke-width': 2, 'stroke-dasharray': '4 3' });
  const sc = g({});
  [-1, 1].forEach((s) => {
    const b = g({}, sc); b.dataset.s = s;
    el('path', { d: 'M 0 0 L 4 34 L -2 34 Z', fill: '#C8D0DC', stroke: pal.ink, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, b);
    el('circle', { cx: -s * 6, cy: -12, r: 8, fill: 'none', stroke: pal.red, 'stroke-width': 4 }, b);
    el('line', { x1: 0, y1: 0, x2: -s * 6, y2: -5, stroke: pal.ink, 'stroke-width': 3 }, b);
  });
  const zz = k.text(0, 0, 'z', { 'font-size': 18, fill: pal.sub });
  const q = k.text(0, 0, '!', { 'font-size': 24, fill: pal.red });
  return {
    update(t) {
      const grow = easeOut(seg(t, 0.2, 1.6));
      const cutP = seg(t, 2.1, 2.5);
      [pl, pr].forEach((p) => p.lines.forEach((l, i) => l.setAttribute('stroke-dashoffset', 1 - seg(t, 0.4 + i * 0.3, 1.8 + i * 0.3))));
      // 全体は左から伸びる（クリップ幅で表現）
      const reveal = L + (R - L) * grow;
      pr.rect.setAttribute('width', Math.max(10, reveal - L));
      pl.rect.setAttribute('width', Math.max(10, Math.min(reveal, R) - L));
      // 切った後：右片は落ちて消え、左片は短くなる
      const fall = easeIn(seg(t, 2.5, 3.3));
      pr.wrap.setAttribute('transform', `translate(${(CUT + 20 * fall).toFixed(1)} ${(BY + 20 + 120 * fall).toFixed(1)}) rotate(${(25 * fall).toFixed(1)}) translate(${-CUT} ${-(BY + 20)})`);
      pr.wrap.setAttribute('opacity', 1 - seg(t, 3.0, 3.4));
      const shorten = easeInOut(seg(t, 2.6, 3.2));
      pl.rect.setAttribute('width', Math.max(10, (Math.min(reveal, R) - L) * (1 - shorten) + (CUT - L) * shorten + 0));
      const lo = 1 - seg(t, 2.6, 3.0);
      pl.lines.forEach((l) => l.setAttribute('opacity', lo));
      tf(map, (L + CUT) / 2 + 2, BY + BH / 2, 0, easeOut(seg(t, 3.1, 3.5)));
      guide.setAttribute('opacity', t > 1.7 && t < 2.5 ? 0.9 : 0);
      // ハサミ：上から降りて、パチン
      const sy = lerp(-30, BY + 4, easeOut(seg(t, 1.8, 2.2))) - 0 + (t > 2.5 ? -120 * easeIn(seg(t, 2.5, 3.0)) : 0);
      const open = t < 2.1 ? 24 : t < 2.4 ? lerp(24, 2, seg(t, 2.1, 2.3)) : 2;
      sc.setAttribute('transform', `translate(${CUT} ${sy.toFixed(1)}) rotate(0)`);
      [...sc.children].forEach((b) => b.setAttribute('transform', `rotate(${-b.dataset.s * open})`));
      sc.setAttribute('opacity', t > 1.7 && t < 3.0 ? 1 : 0);
      const talk = t < 2.4;
      mint.pose({
        look: 0.4, mood: talk ? (Math.sin(t * 14) > 0 ? 'open' : 'smile') : t < 3.2 ? 'smile' : 'grin',
        armL: 10 + (talk ? 16 * Math.sin(t * 6) : 0), armR: lerp(10, 90, hump(seg(t, 0.3, 1.8))) + (t > 2.5 ? 40 * easeOut(seg(t, 2.6, 3.0)) : 0)
      });
      const bored = 1 - seg(t, 2.7, 3.0);
      coral.pose({
        look: 0.5, mood: t < 2.7 ? (t > 1.0 ? 'open' : 'flat') : 'smile', blink: t > 1.2 && t < 2.7 ? 0.9 : 0,
        lean: t < 2.7 ? 6 * seg(t, 1.0, 2.2) : lerp(6, 0, easeOut(seg(t, 2.7, 3.0))) , squash: 1 - 0.03 * hump(seg(t, 1.0, 2.0)),
        armL: lerp(8, 8, 1), armR: t > 3.0 ? lerp(8, 140, easeOut(seg(t, 3.0, 3.5))) : 8
      });
      tf(zz, 330, FY - 105 - 8 * ((t * 0.7) % 1), 0, 1);
      zz.setAttribute('opacity', t > 1.4 && t < 2.7 ? 0.9 : 0);
      tf(q, 316, FY - 108, 0, easeOut(seg(t, 3.0, 3.3)));
      q.setAttribute('opacity', t > 3.0 ? 1 : 0);
      tail.setAttribute('opacity', 1);
    }
  };
}
