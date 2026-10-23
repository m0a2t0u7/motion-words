// tissue：くしゃみが出て「ティッシュある？」。差し出された箱から1枚引き出して鼻をかむ（例文 Can I have a tissue?）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, iconSay, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, 'くしゃみ'], [1.0, 'ティッシュある？'], [2.6, '鼻をかむ']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const FY = homeBg(k, { winX: 160, winW: 80 });
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const f = k.buddy({ x: 290, y: FY, scale: 1.15, facing: -1, ...C(k, 'blue') });
  const box = k.g({});
  el('rect', { x: -22, y: -18, width: 44, height: 20, rx: 3, fill: '#A58BF3' }, box);
  el('ellipse', { cx: 0, cy: -18, rx: 10, ry: 2.6, fill: '#6F57C7' }, box);
  el('path', { d: 'M -6 -18 Q 0 -32 6 -18 Z', fill: '#fff' }, box);
  const tis = k.g({});
  el('path', { d: 'M -10 -14 Q -12 0 -8 12 L 8 12 Q 12 0 10 -14 Q 0 -18 -10 -14 Z', fill: '#fff', stroke: '#AEB8C6', 'stroke-width': 1.6 }, tis);
  const spray = [0, 1, 2, 3].map(() => el('circle', { r: 2, fill: '#BFE3F5' }));
  const A = arms(k, b, S), F = arms(k, f, 1.15, { col: pal.blue, dark: pal.blueDark, back: ['L'] });
  const ask = iconSay(k, 62, 40, -1, (g) => { el('rect', { x: -22, y: 0, width: 26, height: 12, rx: 2, fill: '#A58BF3' }, g); el('path', { d: 'M -13 0 Q -9 -12 -5 0 Z', fill: '#fff', stroke: '#D9DFE7' }, g); k.text(14, 0, '?', { 'font-size': 20, fill: pal.blueDark }, g); });
  return {
    update(t) {
      const pre = seg(t, 0.1, 0.5), ach = hump(seg(t, 0.5, 0.8));
      const give = easeInOut(seg(t, 1.3, 1.8)), pull = easeInOut(seg(t, 1.9, 2.3)), toNose = easeInOut(seg(t, 2.3, 2.7));
      const blow = t > 2.7 && t < 3.6 ? hump(seg((t - 2.7) % 0.45, 0, 0.45)) : 0;
      const done = easeInOut(seg(t, 3.7, 4.1));
      P(b, { look: 0.5, lean: -6 * pre * (t < 0.5) + 12 * ach, squash: 1 - 0.06 * ach, blink: ach > 0.3 || (t > 2.7 && t < 3.6) ? 1 : blinkAt(t), mood: t < 0.5 ? 'open' : t < 1.0 ? 'flat' : t < 1.9 ? 'open' : t > 3.7 ? 'grin' : 'flat' });
      P(f, { look: 0.5, lean: 6 * give, blink: blinkAt(t, 0.7), facing: -1, mood: 'smile' });
      // 友だち：箱を差し出す
      const bx = lerp(262, 214, give), by = lerp(200, 176, give);
      k.tf(box, bx, by); F.to('R', bx + 14, by - 2); F.to('L', bx + 20, by + 2);
      // 自分：くしゃみで口を押さえる → 1枚引く → 鼻へ
      const nose = { x: b.state.x + 10 * S, y: b.state.y - 50 * S };
      const grab = { x: bx, y: by - 26 };
      let hx = lerp(180, nose.x + 8, hump(seg(t, 0.4, 1.0))), hy = lerp(200, nose.y + 6, hump(seg(t, 0.4, 1.0)));
      if (t > 1.6) { const g2 = easeInOut(seg(t, 1.6, 1.9)); hx = lerp(180, grab.x, g2); hy = lerp(200, grab.y, g2); }
      if (t > 1.9) { hx = lerp(grab.x, grab.x - 4, pull); hy = lerp(grab.y, grab.y - 28, pull); }
      if (t > 2.3) { hx = lerp(grab.x - 4, nose.x + 12, toNose); hy = lerp(grab.y - 28, nose.y + 6 + 2 * blow, toNose); }
      if (t > 3.7) { hx = lerp(nose.x + 12, 186, done); hy = lerp(nose.y + 6, 196, done); }
      A.to('R', hx, hy); A.to('L', t > 2.3 && t < 3.7 ? nose.x - 2 : 100, t > 2.3 && t < 3.7 ? nose.y + 10 : 200);
      if (t < 1.9) k.tf(tis, bx, by - 22, 0, 0.001); else k.tf(tis, hx - 6, hy + 4, 0, 1 - 0.3 * done);
      spray.forEach((s, i) => k.set(s, { cx: nose.x + 14 + i * 9 * ach, cy: nose.y + 4 + (i - 1.5) * 6 * ach, opacity: ach }));
      ask.show(seg(t, 0.9, 1.2) * (1 - seg(t, 2.0, 2.2)), 140, 72);
    }
  };
}
