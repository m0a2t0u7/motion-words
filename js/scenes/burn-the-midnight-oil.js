// burn the midnight oil：時計が真夜中をまわっても、ランプの下でレポートを書き続けて仕上げる（例文 She burned the midnight oil to finish the report.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '夜に机へ'], [1.6, '日付をまたぐ'], [3.5, '仕上げた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 248, mood: 'indoor' });
  // 夜の窓
  el('rect', { x: 28, y: 30, width: 92, height: 80, rx: 8, fill: '#4D5584' });
  el('circle', { cx: 92, cy: 56, r: 12, fill: '#F2EFD8' });
  el('circle', { cx: 98, cy: 52, r: 11, fill: '#4D5584' });
  [[44, 46], [60, 84], [48, 92], [76, 40]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.8, fill: '#fff' }));
  el('line', { x1: 74, y1: 30, x2: 74, y2: 110, stroke: '#fff', 'stroke-width': 4 });
  // 壁掛け時計
  const clock = g({ transform: 'translate(200 62)' });
  el('circle', { r: 30, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 4 }, clock);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: Math.sin(a) * 24, y1: -Math.cos(a) * 24, x2: Math.sin(a) * 27, y2: -Math.cos(a) * 27, stroke: pal.sub, 'stroke-width': 2 }, clock); }
  const hH = el('line', { x1: 0, y1: 0, x2: 0, y2: -15, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, clock);
  const hM = el('line', { x1: 0, y1: 0, x2: 0, y2: -22, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, clock);
  // 机
  el('rect', { x: 150, y: 190, width: 230, height: 12, rx: 5, fill: pal.wood });
  el('rect', { x: 160, y: 200, width: 10, height: 48, fill: pal.woodDark });
  el('rect', { x: 360, y: 200, width: 10, height: 48, fill: pal.woodDark });
  k.shadow(265, 250, 112, 4);
  // ランプ（光）
  const glow = el('ellipse', { cx: 330, cy: 170, rx: 70, ry: 40, fill: pal.yellow, opacity: 0.22 });
  el('rect', { x: 322, y: 146, width: 4, height: 44, fill: pal.sub });
  el('path', { d: 'M 306 150 L 350 150 L 340 126 L 316 126 Z', fill: pal.coral });
  // 紙の束
  const sheets = [];
  for (let i = 0; i < 4; i++) sheets.push(el('rect', { x: 256 + i * 2, y: 184 - i * 4, width: 64, height: 6, rx: 1, fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 1.2 }));
  const pen = g({});
  el('line', { x1: -10, y1: 0, x2: 8, y2: 0, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pen);
  const chk = g({});
  el('circle', { r: 16, fill: pal.green }, chk);
  el('path', { d: 'M -7 0 L -2 5 L 8 -6', fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chk);
  const zz = k.text(0, 0, 'z', { 'font-size': 14, fill: pal.sub });
  const b = k.buddy({ x: 210, y: FY, scale: 1.0, color: pal.coral, dark: pal.coralDark, facing: 1 });
  return {
    update(t) {
      const tp = easeInOut(seg(t, 0.2, 3.3));
      // 22:30 → 1:30 くらい
      const hours = 10.5 + tp * 3;
      tf(hH, 0, 0, (hours % 12) * 30);
      tf(hM, 0, 0, hours * 360);
      const writing = t < 3.4;
      const sc = Math.sin(t * 14);
      sheets.forEach((s, i) => s.setAttribute('opacity', i <= Math.floor(seg(t, 0.4, 3.2) * 4) ? 1 : 0.0));
      sheets[0].setAttribute('opacity', 1);
      const wob = writing ? sc : 0;
      b.pose({
        armR: writing ? 62 + 5 * wob : lerp(62, 150, easeOut(seg(t, 3.4, 3.8))),
        armL: writing ? 8 : lerp(8, 120, easeOut(seg(t, 3.4, 3.8))),
        lean: writing ? 6 + 1.5 * wob : lerp(6, -8, easeOut(seg(t, 3.4, 3.8))),
        mood: writing ? (t > 2.0 && t < 3.0 ? 'flat' : 'smile') : 'grin',
        blink: t > 2.2 && t < 3.0 ? 0.7 : 0, look: 0.6,
        lift: 0
      });
      const hp = b.handPos('R');
      tf(pen, writing ? hp.x + 4 : hp.x + 4, writing ? Math.min(hp.y, 186) : hp.y, writing ? -10 : 20);
      pen.setAttribute('opacity', writing ? 1 : 0);
      glow.setAttribute('opacity', 0.22 + 0.04 * Math.sin(t * 5));
      const cp = backOut(seg(t, 3.6, 4.0), 2);
      tf(chk, 270, 150, 0, cp, cp);
      chk.setAttribute('opacity', t < 3.6 ? 0 : 1);
      const zp = hump(seg(t, 2.0, 3.0));
      tf(zz, 232, FY - 108 - 12 * seg(t, 2.0, 3.0), 0, 1 + zp * 0.2);
      zz.setAttribute('opacity', 0);
    }
  };
}
