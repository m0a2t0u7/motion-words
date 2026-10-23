// file：パソコンで書類のアイコンをデスクトップへドラッグして保存（例文 I saved the file on my desktop.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach } from './look-over.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.0, beats: [[0, 'ファイル'], [1.4, 'ドラッグ'], [3.2, '保存した']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  desk(k, 240, 150, 200);
  const b = k.buddy({ x: 205, y: FY, scale: S });
  // モニター
  el('rect', { x: 322, y: 176, width: 12, height: 24, fill: pal.sub });
  el('rect', { x: 300, y: 196, width: 56, height: 5, rx: 2, fill: pal.sub });
  el('rect', { x: 262, y: 96, width: 132, height: 84, rx: 6, fill: pal.ink });
  el('rect', { x: 267, y: 101, width: 122, height: 74, rx: 3, fill: '#CFE6F7' });
  // デスクトップのフォルダ（保存先）
  const dt = g({}); tf(dt, 366, 128);
  el('rect', { x: -14, y: -9, width: 28, height: 20, rx: 3, fill: pal.yellow }, dt);
  el('rect', { x: -14, y: -13, width: 12, height: 6, rx: 2, fill: pal.yellowDark }, dt);
  const win = g({}); tf(win, 304, 138);
  el('rect', { x: -32, y: -30, width: 64, height: 60, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, win);
  el('rect', { x: -32, y: -30, width: 64, height: 9, rx: 4, fill: pal.blue }, win);
  const ico = g({});
  el('rect', { x: -9, y: -12, width: 18, height: 24, rx: 2, fill: '#fff', stroke: pal.blueDark, 'stroke-width': 2 }, ico);
  [-5, 0, 5].forEach((y) => el('line', { x1: -5, x2: 5, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 1.6 }, ico));
  const ok = g({});
  el('circle', { r: 8, fill: pal.green }, ok);
  el('path', { d: 'M -4 0 l 3 3 l 6 -6', fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, ok);
  const cur = el('path', { d: 'M 0 0 L 0 13 L 4 10 L 7 16 L 9 15 L 6 9 L 11 9 Z', fill: pal.ink, stroke: '#fff', 'stroke-width': 1 });
  const mouse = el('rect', { x: -7, y: -5, width: 14, height: 9, rx: 4, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 });
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const drag = easeInOut(seg(t, 1.4, 2.8)), click = hump(seg(t, 1.1, 1.5));
      const mx = lerp(254, 266, drag), my = 196;
      tf(mouse, mx, my);
      P(b, { armR: reach(b, S, 'R', mx, my - 4) - click * 4, armL: 8, lean: 4, squash: 1 - click * 0.03, look: 4, mood: t > 3.1 ? 'grin' : 'smile', blink: blinkAt(t) });
      gr(hp(b, S, 'R'));
      const px = lerp(304, 366, drag), py = lerp(138, 128, drag);
      const done = seg(t, 2.8, 3.1);
      tf(ico, lerp(px, 366, done), lerp(py, 128, done), 0, 1 - done * 0.5, 1 - done * 0.5);
      ico.setAttribute('opacity', 1 - done);
      win.setAttribute('opacity', 1 - seg(t, 2.8, 3.1));
      tf(cur, px + 6, py + 8);
      cur.setAttribute('opacity', 1 - seg(t, 2.9, 3.1));
      tf(dt, 366, 128, 0, 1 + hump(seg(t, 2.8, 3.3)) * 0.12);
      tf(ok, 378, 118, 0, backOut(seg(t, 3.0, 3.5)) + 0.001);
    }
  };
}
