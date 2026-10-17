// turn off：リモコンの電源ボタンを押すとテレビが消える（例文 Don't forget to turn off the TV.）
import { seg, lerp, easeInOut, easeIn, easeOut, hump } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, 'ついている'], [1.2, 'ボタンを押す'], [2.5, '消える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 部屋：窓と絵、ラグ、観葉植物
  el('rect', { x: 262, y: 52, width: 86, height: 70, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 305, y1: 52, x2: 305, y2: 122, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('line', { x1: 262, y1: 87, x2: 348, y2: 87, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 190, ry: 20, fill: '#FBE3D8' });
  // テレビ台
  el('rect', { x: 36, y: 186, width: 178, height: 50, rx: 8, fill: pal.wood });
  el('rect', { x: 36, y: 186, width: 178, height: 8, rx: 4, fill: pal.woodDark });
  el('rect', { x: 48, y: 204, width: 74, height: 26, rx: 5, fill: pal.woodDark, opacity: 0.35 });
  el('rect', { x: 130, y: 204, width: 74, height: 26, rx: 5, fill: pal.woodDark, opacity: 0.35 });
  // テレビ
  el('rect', { x: 118, y: 176, width: 14, height: 12, fill: '#4A5468' });
  el('rect', { x: 92, y: 184, width: 66, height: 5, rx: 2.5, fill: '#4A5468' });
  el('rect', { x: 36, y: 62, width: 178, height: 118, rx: 10, fill: '#3A4358' });
  const CX = 125, CY = 118, SW = 160, SH = 98;
  el('rect', { x: CX - SW / 2, y: CY - SH / 2, width: SW, height: SH, rx: 5, fill: '#1F2432' });
  const clipId = k.clip((cp) => el('rect', { x: CX - SW / 2, y: CY - SH / 2, width: SW, height: SH, rx: 5 }, cp));
  const clipG = g({ 'clip-path': clipId });
  const scr = g({}, clipG);
  el('rect', { x: -SW / 2, y: -SH / 2, width: SW, height: SH, fill: k.gradient([[0, '#9EDCFB'], [1, '#E5F6FF']]) }, scr);
  el('circle', { cx: 40, cy: -22, r: 15, fill: pal.yellow }, scr);
  el('ellipse', { cx: -36, cy: 46, rx: 70, ry: 34, fill: pal.green }, scr);
  el('ellipse', { cx: 50, cy: 52, rx: 60, ry: 30, fill: '#7ADBA0' }, scr);
  el('circle', { cx: -34, cy: -16, r: 9, fill: '#FFFFFF' }, scr);
  el('circle', { cx: -22, cy: -12, r: 11, fill: '#FFFFFF' }, scr);
  const line = el('rect', { x: -SW / 2, y: -2, width: SW, height: 4, rx: 2, fill: '#FFFFFF' }, clipG);
  const dot = el('circle', { cx: CX, cy: CY, r: 4, fill: '#FFFFFF' });
  el('rect', { x: CX - SW / 2, y: CY - SH / 2, width: SW, height: 14, rx: 5, fill: '#FFFFFF', opacity: 0.12 }); // ガラスの反射
  const led = el('circle', { cx: 196, cy: 172, r: 2.8, fill: pal.red });
  // 観葉植物
  el('rect', { x: 372, y: 206, width: 22, height: 30, rx: 5, fill: pal.coral });
  el('ellipse', { cx: 376, cy: 190, rx: 8, ry: 18, fill: pal.green, transform: 'rotate(-20 376 190)' });
  el('ellipse', { cx: 390, cy: 188, rx: 8, ry: 20, fill: '#7ADBA0', transform: 'rotate(18 390 188)' });

  // まめとリモコン
  const b = k.buddy({ x: 300, y: FY, scale: 0.88, facing: -1, color: pal.coral, dark: pal.coralDark });
  const remote = g({});
  const rbody = g({}, remote);
  el('rect', { x: -20, y: -6, width: 40, height: 12, rx: 4, fill: '#3A4358' }, rbody);
  const btn = g({ }, rbody);
  el('circle', { cx: 8, cy: 0, r: 3.8, fill: pal.red }, btn);
  el('rect', { x: -14, y: -2, width: 14, height: 4, rx: 2, fill: '#6E7890' }, rbody);
  const rings = [0, 1, 2].map(() => el('path', { d: 'M 0 -10 Q 6 0 0 10', stroke: pal.blueDark, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }));
  const flash = el('circle', { cx: 0, cy: 0, r: 8, fill: pal.yellow, opacity: 0 });

  return {
    update(t) {
      // ボタンを押す：1.35s〜1.6s
      const press = hump(seg(t, 1.3, 1.65));
      const armA = 96 - press * 5;
      b.pose({ armR: armA, armL: 8, look: -0.7, lean: -2 - press * 3, squash: 1 - press * 0.03, mood: t > 2.4 ? 'smile' : 'smile' });
      const hp = b.handPos('R');
      tf(remote, hp.x - 4, hp.y - 6, 204, 1.35);
      tf(btn, 0, 0, 0, 1 - press * 0.45, 1 - press * 0.45);
      const fp = seg(t, 1.35, 1.85);
      tf(flash, hp.x - 4 - 8 * 1.35 * 0.9, hp.y - 6 - 8 * 1.35 * 0.4, 0, 0.6 + fp * 1.6);
      flash.setAttribute('opacity', fp > 0 && fp < 1 ? (1 - fp) * 0.7 : 0);
      // 信号の輪：リモコンの先からテレビへ
      rings.forEach((r, i) => {
        const p = seg(t, 1.4 + i * 0.14, 1.95 + i * 0.14);
        const d = p * 44 + 8;
        tf(r, hp.x - 30 - d * 0.94, hp.y - 18 - d * 0.34, 0, -(1 + p * 0.6), 1 + p * 0.6);
        r.setAttribute('transform', r.getAttribute('transform').replace(/rotate\([^)]*\)/, 'rotate(-20)'));
        r.setAttribute('opacity', p > 0 && p < 1 ? Math.min(1, (1 - p) * 1.6) : 0);
      });
      // テレビが消える：横一本線 → 点 → 真っ暗
      const p1 = seg(t, 1.95, 2.2);
      const p2 = seg(t, 2.2, 2.5);
      const sy = lerp(1, 0.0, easeIn(p1));
      const sx = lerp(1, 0.0, easeInOut(p2));
      tf(scr, CX, CY, 0, Math.max(sx, 0.001), Math.max(sy, 0.001));
      scr.setAttribute('opacity', p2 >= 1 ? 0 : 1);
      const lineOn = p1 > 0.55 && p2 < 1;
      line.setAttribute('opacity', lineOn ? 1 : 0);
      tf(line, CX, CY, 0, Math.max(sx, 0.001), lerp(0.7, 1, p1));
      const dp = seg(t, 2.45, 3.1);
      dot.setAttribute('r', lerp(4.5, 0.5, easeOut(dp)) * (1 + (1 - p2) * 0.0));
      dot.setAttribute('opacity', p2 >= 1 && dp < 1 ? 1 - easeIn(dp) : 0);
      led.setAttribute('opacity', t > 2.5 ? 1 : 0.0);
    }
  };
}
