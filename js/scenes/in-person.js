// in person：別の部屋どうしで電話で話していた→電話を切って相手の部屋まで歩いていき、向かい合って直接話す（I'd like to talk to you in person.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { gait, hp } from './dig.js';
import { phone } from './look-over.js';
import { P, blinkAt } from './so-far-so-good.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '電話で話す'], [1.4, '会いに行く'], [3.0, '直接話す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 206, y: 0, width: 194, height: FY, fill: '#EEF4EC' });
  el('rect', { x: 36, y: 50, width: 70, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 300, y: 50, width: 70, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  // 仕切り壁と出入口
  el('rect', { x: 192, y: 0, width: 16, height: FY - 118, fill: '#D9CFC2' });
  el('rect', { x: 186, y: FY - 122, width: 28, height: 6, fill: pal.woodDark });
  const G = k.buddy({ x: 80, y: FY });
  const C = k.buddy({ x: 320, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const pg = phone(k), pc = phone(k);
  const bg = say(k, 46, 30, -1), bc = say(k, 46, 30, 1);
  [bg, bc].forEach((b) => [-10, 0, 10].forEach((x) => el('circle', { cx: x, cy: 0, r: 3, fill: pal.sub }, b.g)));
  const wave = (b, x, y) => { const w = g({}); [8, 14].forEach((r) => el('path', { d: `M ${r * 0.6} ${-r * 0.8} A ${r} ${r} 0 0 1 ${r * 0.6} ${r * 0.8}`, stroke: pal.blue, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, w)); return w; };
  const wg = wave(), wc = wave();
  const xf = (t) => lerp(80, 240, easeInOut(seg(t, 1.3, 2.9)));
  return {
    update(t) {
      const call = t < 1.2;
      const p = gait(xf, t, 80);
      const talkG = t > 3.0 && Math.sin(t * 18) > 0 && t < 3.8;
      P(G, { x: p.x, walk: p.walk, lean: p.lean, armL: p.armL, armR: call ? 150 : t < 1.35 ? lerp(150, 8, seg(t, 1.2, 1.35)) : t > 3.0 ? 8 + 50 * hump(seg(t, 3.0, 4.0)) : p.armR,
        mood: talkG ? 'open' : call && Math.sin(t * 16) > 0 ? 'open' : 'smile', look: 0.5, blink: blinkAt(t) });
      const pick = t < 2.4;
      P(C, { facing: -1, armR: pick ? (t < 1.3 ? 150 : lerp(150, 8, seg(t, 1.3, 1.5))) : 8 + 60 * hump(seg(t, 3.2, 4.2)), look: t > 1.5 && t < 3 ? 0.8 : 0.5,
        mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      const h1 = hp(G, 1, 'R'), h2 = hp(C, 1, 'R');
      tf(pg.g, t < 1.3 ? h1.x : 60, t < 1.3 ? h1.y + 4 : FY - 6, t < 1.3 ? -20 : 90); pg.g.setAttribute('opacity', t < 1.35 ? 1 : 0);
      tf(pc.g, t < 1.4 ? h2.x : 340, t < 1.4 ? h2.y + 4 : FY - 6, 20); pc.g.setAttribute('opacity', t < 1.45 ? 1 : 0);
      tf(wg, 128, 140 - 2 * Math.sin(t * 8), 0, 1); wg.setAttribute('opacity', call ? 1 : 0);
      tf(wc, 272, 140 - 2 * Math.sin(t * 8), 180, 1); wc.setAttribute('opacity', call ? 1 : 0);
      bg.show(seg(t, 3.0, 3.25), 214, 118); bc.show(seg(t, 3.5, 3.75), 290, 112);
    }
  };
}
