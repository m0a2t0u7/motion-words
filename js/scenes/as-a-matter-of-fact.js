// as a matter of fact：相手が塔のポスターを「ここ知らないでしょ」と見せる。実は自分はそこへ行ったことがあり、塔の前で撮った写真を見せて相手が驚く（例文 As a matter of fact, I've been there before.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp } from './dig.js';
import { cue, popS } from './from-scratch.js';

// 塔の絵（原点＝根元）
export function tower(k, parent, s = 1) {
  const g = k.g({}, parent); k.tf(g, 0, 0, 0, s);
  k.el('path', { d: 'M -14 0 L -3 -46 L 3 -46 L 14 0 Z M -8 -20 L 8 -20', fill: k.pal.coral, stroke: k.pal.coralDark, 'stroke-width': 2 }, g);
  k.el('rect', { x: -1.5, y: -58, width: 3, height: 12, fill: k.pal.coralDark }, g);
  return g;
}

export const meta = { duration: 4.6, beats: [[0, '塔を見せる'], [1.6, '実は…'], [3.0, '行ったことある']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const c = k.buddy({ x: 280, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 120, y: FY, facing: 1 });
  // 相手のポスター（塔の絵）
  const post = g({});
  el('rect', { x: -26, y: -34, width: 52, height: 68, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 }, post);
  tf(tower(k, post, 0.9), 0, 26);
  // 自分の写真（塔の前に立つ自分）
  const ph = g({});
  el('rect', { x: -24, y: -30, width: 48, height: 60, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, ph);
  el('rect', { x: -20, y: -26, width: 40, height: 44, fill: '#DDEFFA' }, ph);
  tf(tower(k, ph, 0.7), -6, 18);
  el('rect', { x: 4, y: 0, width: 12, height: 16, rx: 6, fill: pal.mint }, ph);
  el('circle', { cx: 8, cy: 6, r: 1.2, fill: pal.ink }, ph); el('circle', { cx: 12, cy: 6, r: 1.2, fill: pal.ink }, ph);
  const q = cue(k, '?', 36, 30, 18);
  const say1 = cue(k, 'Actually…', 84, 30, 13);
  const wow = k.text(0, 0, '!', { 'font-size': 26, fill: pal.coralDark });
  return {
    update(t) {
      // 相手：ポスターを掲げて「知らないでしょ？」
      const show = easeOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 1.8, 2.3)));
      const surp = easeOut(seg(t, 3.0, 3.3));
      P(c, { x: 280, facing: -1, look: -0.5, armR: lerp(20, 110, show) - 30 * surp, armL: 8 + 40 * surp, mood: t < 3.0 ? 'grin' : 'open', lift: 8 * hump(seg(t, 3.0, 3.4)), lean: -6 * surp, blink: t > 3.0 ? 0 : blinkAt(t, 1) });
      const hc = hp(c, 1);
      tf(post, hc.x - 14, hc.y - 26, 0, Math.max(0.001, 1 - easeInOut(seg(t, 1.9, 2.3))));
      q.show(300, 100, easeOut(seg(t, 0.6, 0.9)) * (1 - seg(t, 1.5, 1.7)));
      // 自分：見て→にっこり→写真を取り出して見せる
      const take = easeOut(seg(t, 2.0, 2.6));
      P(b, { x: 120, facing: 1, look: 0.7, armR: lerp(8, 100, take), mood: t > 1.6 ? 'grin' : 'smile', lean: 4 * take, blink: blinkAt(t) });
      const hb = hp(b, 1);
      tf(ph, hb.x + 12, hb.y - 24, 0, popS(seg(t, 2.0, 2.4)));
      say1.show(120, 104, easeOut(seg(t, 1.6, 1.9)) * (1 - seg(t, 2.8, 3.0)));
      tf(wow, 262, 120, 0, popS(seg(t, 3.0, 3.3)));
      wow.setAttribute('opacity', t > 3.0 ? 1 : 0);
    }
  };
}
