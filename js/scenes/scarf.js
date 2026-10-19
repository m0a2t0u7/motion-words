// scarf：出かける前に玄関で、温かいマフラーを首にぐるりと巻いてから、ドアを開けて寒い外へ（例文 She wrapped a warm scarf around her neck before leaving home.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { wardrobe, gait, hp, P, blinkAt } from './skirt.js';

export const meta = { duration: 4.4, beats: [[0, 'マフラーを持つ'], [0.9, '首に巻く'], [2.6, '家を出る']] };

const C1 = '#F2685B', C2 = '#FFCF5C';
export function create(k) {
  const { el, g, pal, tf } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // ドア（右）。開くと外は雪
  const DX = 286, DY = 96, DW = 80, DH = FY - 96;
  el('rect', { x: DX - 6, y: DY - 6, width: DW + 12, height: DH + 6, rx: 4, fill: pal.woodDark });
  el('rect', { x: DX, y: DY, width: DW, height: DH, fill: '#DCE6F0' });
  el('rect', { x: DX, y: FY - 26, width: DW, height: 26, fill: '#fff' });
  const flakes = Array.from({ length: 8 }, () => el('circle', { r: 2.2, fill: '#fff', stroke: '#BFD3E6', 'stroke-width': 1 }));
  const door = g({});
  el('rect', { x: 0, y: 0, width: DW, height: DH, rx: 3, fill: pal.blue }, door);
  el('rect', { x: 10, y: 12, width: DW - 20, height: 50, rx: 4, fill: '#fff', opacity: 0.25 }, door);
  el('circle', { cx: 10, cy: DH / 2, r: 4.5, fill: pal.yellow }, door);
  // コート掛け
  el('rect', { x: 40, y: 70, width: 70, height: 6, rx: 3, fill: pal.woodDark });
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: '#6E7FA8', dark: '#56658A', sleeve: 'long', to: -16 });
  W.bottom({ kind: 'trousers', color: '#596377', dark: '#444D5F', from: -16 });
  W.feet('shoe', pal.ink);
  // 首に巻いたマフラー（体の上、顔の下）
  const sc = k.g({}, null); b.body.insertBefore(sc, b.body.children[6]);
  const ring = el('path', { d: 'M -33 -38 Q 0 -30 33 -38 L 32 -27 Q 0 -19 -32 -27 Z', fill: C1 }, sc);
  el('path', { d: 'M -20 -34 L -20 -23 M -8 -32 L -8 -21 M 8 -32 L 8 -21 M 20 -34 L 20 -23', stroke: C2, 'stroke-width': 3 }, sc);
  const tail = g({}, sc);
  el('rect', { x: -6, y: 0, width: 13, height: 30, rx: 3, fill: C1 }, tail);
  [8, 18].forEach((y) => el('rect', { x: -6, y, width: 13, height: 3.5, fill: C2 }, tail));
  [-4, 0, 4].forEach((x) => el('line', { x1: x, y1: 30, x2: x, y2: 35, stroke: C1, 'stroke-width': 2 }, tail));
  // 手に持っているときのマフラー（だらりと垂れる）
  const loose = el('path', { fill: 'none', stroke: C1, 'stroke-width': 9, 'stroke-linecap': 'round' });
  const xf = (t) => lerp(140, 262, easeInOut(seg(t, 2.6, 3.9)));
  return {
    update(t) {
      const wrap = easeInOut(seg(t, 0.9, 2.0));
      const p = gait(xf, t, 140);
      const circ = seg(t, 0.9, 2.0) * Math.PI * 2;
      P(b, { x: p.x, walk: p.walk, lean: p.lean, look: 0.3, mood: t > 2.0 ? 'grin' : 'smile', blink: blinkAt(t),
        armL: t < 0.9 ? 60 : t < 2.1 ? 150 + 18 * Math.sin(circ) : p.armL,
        armR: t < 0.9 ? 60 : t < 2.1 ? 150 - 18 * Math.sin(circ) : t > 3.6 ? lerp(p.armR, 95, easeOut(seg(t, 3.6, 3.9))) : p.armR });
      // 巻く前：両手の間にたれる。巻きながら首の帯になっていく
      const hl = hp(b, S, 'L'), hr = hp(b, S, 'R');
      const sag = lerp(46, 10, wrap);
      k.set(loose, { d: `M ${hl.x} ${hl.y} Q ${(hl.x + hr.x) / 2} ${(hl.y + hr.y) / 2 + sag} ${hr.x} ${hr.y}`, opacity: 1 - seg(t, 1.6, 2.0) });
      ring.setAttribute('opacity', 1);
      sc.setAttribute('transform', `translate(0 ${(-4 * (1 - wrap)).toFixed(2)}) scale(${(0.02 + 0.98 * easeOut(seg(t, 1.2, 1.9))).toFixed(3)} 1)`);
      tf(tail, 12, -30, 6 * Math.sin(p.walk) * p.m + 30 * (1 - easeOut(seg(t, 1.8, 2.3))), 1, easeOut(seg(t, 1.7, 2.1)) + 0.001);
      // ドアを開ける
      const op = easeInOut(seg(t, 3.7, 4.3));
      tf(door, DX, DY, 0, lerp(1, 0.12, op), 1);
      flakes.forEach((f, i) => {
        const yy = DY + ((t * 30 + i * 37) % (DH - 20));
        k.set(f, { cx: DX + 8 + ((i * 23) % (DW - 16)) + Math.sin(t + i) * 4, cy: yy, opacity: op > 0.2 ? 1 : 0 });
      });
      void wobble;
    }
  };
}
