// offer：宿題で困っている相手（コーラル）に、まめが近づいて「手伝おうか？」と申し出る（例文 He offered to help me with my homework.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, held } from './dig.js';
import { desk } from './get-on-with.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { walk, path } from './queue-up.js';
import { cue } from './in-common.js';
import { drop } from './so-far-so-good.js';
import { pencil } from './check.js';

export const meta = { duration: 4.4, beats: [[0, '宿題で困る'], [1.6, '手伝おうか？'], [3.2, 'ありがとう']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  roomBg(k, 'home', FY);
  const me = k.buddy({ x: 120, y: FY, scale: 0.92, facing: 1, color: pal.coral, dark: pal.coralDark });
  desk(k, 80, 140, FY);
  // 机の上の宿題プリント（立てかけ）
  el('rect', { x: 150, y: 140, width: 50, height: 50, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  k.text(175, 152, '2x+3=?', { 'font-size': 8, fill: pal.ink });
  [164, 174, 182].forEach((y) => el('line', { x1: 158, x2: 192, y1: y, y2: y, stroke: pal.line, 'stroke-width': 2 }));
  const q = g({}); k.text(0, 0, '?', { 'font-size': 20, fill: pal.blueDark }, q);
  const sweat = drop(k);
  const he = k.buddy({ x: 390, y: FY, scale: 1.0, facing: -1 });
  const pen = pencil(k);
  const offer = cue(k, 'Help?', 64, 32, 1, 14);
  const xf = path([[0.6, 390], [1.7, 268]]);
  return {
    update(t) {
      // 相手：頭をかかえて悩む → 顔を上げて喜ぶ
      const worried = t < 2.6;
      P(me, { look: worried ? 0.4 : 0.9, blink: blinkAt(t, 1), mood: worried ? 'sad' : 'grin', armL: 10, armR: worried ? 150 + 8 * Math.sin(t * 6) : 10 + 140 * easeOut(seg(t, 3.2, 3.5)), lean: worried ? 6 : 0, lift: 8 * hump(seg(t, 3.0, 3.4)) });
      tf(q, 140 + 3 * Math.sin(t * 4), 112 - 4 * Math.sin(t * 3), 0, worried ? 1 : 0.001);
      tf(sweat, 92, 150 + 6 * ((t * 0.9) % 1), 0, worried ? 1 : 0.001);
      // まめ：歩いてきて、鉛筆を差し出しながら申し出る
      walk(he, xf, t, { facing: -1, look: 0.5, blink: blinkAt(t) });
      const hold = easeOut(seg(t, 1.8, 2.3));
      if (t > 1.7) P(he, { x: 268, facing: -1, look: 0.7, blink: blinkAt(t), armR: lerp(10, 96, hold), armL: 10, lean: 6 * hold, mood: t > 1.9 && t < 2.6 && Math.sin(t * 22) > -0.2 ? 'open' : 'smile' });
      held(k, he, 1.0, pen, 'R', 90);
      pen.setAttribute('opacity', t > 1.7 ? 1 : 0);
      offer.show(seg(t, 2.0, 2.3), 262, 120);
    }
  };
}
