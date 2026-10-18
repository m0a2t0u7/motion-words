// at least：「最低3時間はかかるよ」→机で作業。時間バーが3時間の線を越えても作業はまだ続き、3時間半でやっと終わる（You need at least three hours to finish.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { P, blinkAt, mark, talk } from './so-far-so-good.js';

// 時間のバー（0〜max 時間）。set(h) で h 時間まで伸ばす
export function timeBar(k, x, y, w, max, marks) {
  const { el, pal } = k, g = k.g({}), sc = w / max;
  el('rect', { x, y, width: w, height: 16, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, g);
  const bar = el('rect', { x: x + 2, y: y + 2, width: 0, height: 12, rx: 6, fill: pal.blue }, g);
  for (let h = 0; h <= max; h++) { el('line', { x1: x + h * sc, y1: y + 18, x2: x + h * sc, y2: y + 24, stroke: pal.sub, 'stroke-width': 2 }, g); k.text(x + h * sc, y + 34, h + 'h', { 'font-size': 11, fill: pal.sub }, g); }
  return { g, sc, bar, set(h, c) { k.set(bar, { width: Math.max(0, h * sc - 4), fill: c || pal.blue }); }, at: (h) => x + h * sc };
}

export const meta = { duration: 4.4, beats: [[0, '最低3時間'], [1.4, '作業を続ける'], [3.4, '3時間超で完了']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 280);
  const tb = timeBar(k, 70, 30, 260, 4);
  const line = el('rect', { x: tb.at(3) - 2, y: 22, width: 4, height: 32, rx: 2, fill: pal.coralDark });
  const zone = el('rect', { x: tb.at(3), y: 32, width: tb.at(4) - tb.at(3) - 2, height: 12, rx: 6, fill: pal.green, opacity: 0.18 });
  const top = desk(k, 150, 110, FY);
  const mon = monitor(k, 205, top);
  const prog = el('rect', { x: 187, y: top - 26, width: 0, height: 6, rx: 3, fill: pal.green });
  el('rect', { x: 186, y: top - 27, width: 38, height: 8, rx: 4, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 });
  const G = k.buddy({ x: 130, y: FY });
  const C = k.buddy({ x: 330, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark, scale: 0.9 });
  const bub = talk(k, '3h+', 56, 32, 1, 16);
  const ck = mark(k, 'check', null, 1.6);
  return {
    update(t) {
      const h = 3.5 * easeInOut(seg(t, 0.9, 3.6));
      tb.set(h, h > 3 ? pal.green : pal.blue);
      const done = clamp(h / 3.5);
      prog.setAttribute('width', 36 * done);
      const work = t > 0.9 && t < 3.6, ty = work ? Math.max(0, Math.sin(t * 22)) : 0;
      const yay = easeOut(seg(t, 3.6, 4.0));
      P(G, { facing: 1, armR: work ? 70 + 10 * ty : lerp(8, 160, yay), armL: work ? 60 + 8 * (1 - ty) : lerp(8, 160, yay), lean: work ? 6 : 0,
        look: 0.6, mood: t > 3.6 ? 'grin' : work ? 'flat' : 'smile', lift: 8 * hump(seg(t, 3.6, 4.0)), blink: blinkAt(t) });
      P(C, { facing: -1, armR: 8 + 100 * hump(seg(t, 0.1, 1.1)), look: 0.5, mood: t < 1.1 && Math.sin(t * 20) > 0 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      bub.show(seg(t, 0.15, 0.4) * (t < 1.4 ? 1 : 0), 300, 112);
      line.setAttribute('opacity', 0.6 + 0.4 * Math.abs(Math.sin(t * 4)) * (h > 2.6 && h < 3.2 ? 1 : 0));
      tf(ck, tb.at(3.5), 64, 0, Math.max(0.001, 1.6 * backOut(seg(t, 3.6, 3.9))));
    }
  };
}
