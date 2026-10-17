// print：ノートPCのファイルを選び、ボタンを押すとプリンターから紙が出てくる（例文 Can you print this file for me?）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { hp, reach } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, 'ファイル画面'], [1.4, 'ボタンを押す'], [3.6, '紙が出た']] };

function docIcon(k, parent, w, h, c = '#fff') {
  const d = k.g({}, parent);
  k.el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 3, fill: c, stroke: '#D5DBE5', 'stroke-width': 1.5 }, d);
  for (let i = 0; i < 4; i++) k.el('rect', { x: -w / 2 + 5, y: -h / 2 + 7 + i * (h - 14) / 4, width: i === 3 ? w * 0.4 : w - 10, height: 2.4, rx: 1, fill: '#9AA6B8' }, d);
  return d;
}
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 30, y: 44, width: 76, height: 56, rx: 5, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 机
  el('rect', { x: 140, y: 200, width: 270, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 150, y: 208, width: 8, height: FY - 208, fill: pal.woodDark });
  el('rect', { x: 392, y: 208, width: 8, height: FY - 208, fill: pal.woodDark });
  k.shadow(275, FY + 2, 130, 5);
  // ノートPC
  el('path', { d: 'M 158 200 L 166 150 L 222 150 L 230 200 Z', fill: '#E7ECF3', stroke: '#C5CEDB', 'stroke-width': 2 });
  el('path', { d: 'M 170 196 L 175 156 L 213 156 L 218 196 Z', fill: '#BFE3F5' });
  const ic = docIcon(k, g({}), 22, 28); tf(ic.parentNode, 194, 176);
  const sel = el('rect', { x: 180, y: 160, width: 28, height: 32, rx: 4, fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.4 });
  el('rect', { x: 150, y: 198, width: 90, height: 5, rx: 2, fill: '#C5CEDB' });
  const S = 1.1;
  // プリンター
  const pw = g({});
  const paper = g({}, pw);
  const sheet = docIcon(k, paper, 30, 40); tf(sheet, 0, -20);
  const body = g({});
  el('rect', { x: 296, y: 160, width: 76, height: 40, rx: 8, fill: '#fff', stroke: '#C5CEDB', 'stroke-width': 2 }, body);
  el('rect', { x: 296, y: 160, width: 76, height: 9, rx: 4, fill: '#E7ECF3' }, body);
  el('rect', { x: 326, y: 160, width: 34, height: 3, rx: 1.5, fill: '#8A94A6' }, body);
  el('rect', { x: 306, y: 180, width: 56, height: 6, rx: 3, fill: pal.ink, opacity: 0.8 }, body);
  const btn = g({}, body); tf(btn, 312, 164);
  el('rect', { x: -6, y: -3, width: 12, height: 6, rx: 3, fill: pal.green }, btn);
  const led = el('circle', { cx: 354, cy: 165, r: 2.6, fill: pal.green }, body);
  tf(pw, 0, 0);
  // 紙の出るスリット（本体の上）
  const b = k.buddy({ x: 262, y: FY + 6, scale: 1.1 });
  return {
    update(t) {
      const press = hump(seg(t, 1.0, 1.7));
      const tg = { x: lerp(300, 312, 0), y: 150 };
      b.pose({ armR: 0, lean: 2 });
      const hand = { x: 316, y: lerp(150, 164, hump(seg(t, 1.1, 1.6))) };
      const rr = reach(b, S, 'R', hand.x, t < 1.0 || t > 2.2 ? 150 : hand.y);
      const u = t < 0.9 ? 0 : t < 2.2 ? 1 : 1 - seg(t, 2.2, 2.7);
      b.pose({ armR: lerp(30, rr, u), armL: 8, look: 0.6, mood: t < 3.4 ? 'flat' : 'smile', squash: 1 - 0.03 * press });
      tf(btn, 312, 164 + 2 * press);
      sel.setAttribute('opacity', t < 0.9 ? 0.5 + 0.5 * Math.sin(t * 8) : 1);
      const run = seg(t, 1.8, 3.4);
      const out = easeOut(run);
      tf(paper, 343, lerp(200, 170, out));
      led.setAttribute('opacity', run > 0 && run < 1 ? (Math.sin(t * 25) > 0 ? 1 : 0.2) : 1);
      tf(pw, 0, 0.8 * Math.sin(t * 60) * (run > 0 && run < 1 ? 1 : 0));
    }
  };
}
