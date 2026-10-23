// serious：はちまきのまめが机で集中して勉強する。友だちがボールで遊びに誘っても首を振り、書き続ける（例文 He is serious about his studies.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { BL, reach, held, P, blinkAt, walkTo, path, wear, deskFront } from './member.js';
import { pencil } from './check.js';
import { homeBg } from './furniture.js';
import { icon } from './in-common.js';
import { drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '机に向かう'], [1.4, '誘いも断る'], [3.2, '本気で勉強']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  homeBg(k, { FY, winX: 40, winW: 80 });
  // 壁の目標
  el('rect', { x: 150, y: 40, width: 80, height: 50, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }); k.text(190, 58, 'GOAL', { 'font-size': 10, fill: pal.red }); k.text(190, 76, 'A+', { 'font-size': 16, fill: pal.red });
  const fr = k.buddy({ x: 440, y: FY, scale: 0.9, facing: -1, ...BL(k) });
  const ball = icon(k, 'ball');
  const b = k.buddy({ x: 150, y: FY, scale: S, facing: 1 }); wear(k, b, 'band', pal.red);
  const TOP = FY - 40;
  deskFront(k, 120, 140, TOP, FY);
  el('path', { d: `M 196 ${TOP} L 198 ${TOP - 12} L 232 ${TOP - 10} L 232 ${TOP} Z M 268 ${TOP} L 266 ${TOP - 12} L 232 ${TOP - 10} L 232 ${TOP} Z`, fill: '#fff', stroke: pal.line });
  const lines = el('path', { stroke: pal.blueDark, 'stroke-width': 1.4, fill: 'none' });
  const pen = pencil(k);
  const sw = drop(k);
  const fx = path([[0.4, 440], [1.3, 300], [3.0, 300], [3.9, 460]]);
  return {
    update(t) {
      const f = walkTo(fx, t, 440, -1);
      const invite = t > 1.3 && t < 3.0;
      P(fr, { x: f.x, walk: f.walk, armL: f.armL, armR: invite ? 100 + 20 * Math.sin(t * 8) : 40, lean: f.lean, facing: t > 3.0 ? 1 : -1, look: 0.6, blink: blinkAt(t, 1), mood: t > 2.4 ? 'sad' : 'grin' });
      const fh = { x: f.x - 30, y: FY - 70 }; tf(ball, invite ? fh.x - 10 : f.x + (t > 3 ? 30 : -30), invite ? fh.y - 10 * Math.abs(Math.sin(t * 8)) : FY - 50, 0, 0.9);
      // 首を横に振る（2.0〜2.6）、そのあいだもペンは止めない
      const shake = t > 2.0 && t < 2.7 ? Math.sin((t - 2.0) * 18) : 0;
      P(b, { lean: 12, look: 0.7 + 0.25 * shake, blink: 0.25, mood: 'flat' });
      b.body.children[3].setAttribute('transform', `translate(${(4 + 5 * shake).toFixed(2)} 3)`);
      const q = (t * 1.8) % 1;
      b.pose({ armR: reach(b, S, 'R', 200 + 26 * q, TOP - 6 + 2 * Math.sin(q * 30)) });
      held(k, b, S, pen, 'R', 0, 20);
      k.set(lines, { d: [0, 1, 2].map((i) => `M 202 ${TOP - 9 + i * 3} h ${26 * clamp(t * 0.6 - i)}`).join(' ') });
      const d = ((t * 0.7) % 1); tf(sw, 186, FY - 92 + 10 * d, 0, Math.max(0.001, 1 - d) * (t > 3 ? 1 : 0.001));
    }
  };
}
