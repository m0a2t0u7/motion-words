// not one's cup of tea：友だちはホラー映画を楽しむが、自分は手を振って「だめ」と背を向ける。机の上の紅茶は静かに湯気（Horror movies are not my cup of tea.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '映画が始まる'], [1.4, 'ぞっとする'], [3.0, '背を向ける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('ellipse', { cx: 210, cy: FY + 16, rx: 170, ry: 10, fill: '#EDE5D8' });
  // テレビ
  k.shadow(78, FY + 2, 62, 6);
  el('rect', { x: 20, y: 84, width: 116, height: 84, rx: 8, fill: pal.ink });
  const scr = el('rect', { x: 28, y: 92, width: 100, height: 68, rx: 4, fill: '#2B2440' });
  const clipId = k.clip((cp) => el('rect', { x: 28, y: 92, width: 100, height: 68, rx: 4 }, cp));
  const gh = g({}); gh.setAttribute('clip-path', clipId);
  const ghost = g({}, gh);
  el('path', { d: 'M -16 16 L -16 -4 Q -16 -22 0 -22 Q 16 -22 16 -4 L 16 16 L 10 11 L 5 16 L 0 11 L -5 16 L -10 11 Z', fill: '#EDEFF7' }, ghost);
  el('ellipse', { cx: -6, cy: -6, rx: 3, ry: 4.5, fill: pal.ink }, ghost);
  el('ellipse', { cx: 6, cy: -6, rx: 3, ry: 4.5, fill: pal.ink }, ghost);
  el('ellipse', { cx: 0, cy: 4, rx: 4, ry: 5, fill: pal.ink }, ghost);
  el('rect', { x: 50, y: FY - 72, width: 56, height: 72, fill: pal.woodDark });
  el('rect', { x: 46, y: 168, width: 64, height: FY - 168 - 72 + 2, fill: 'none' });
  el('rect', { x: 58, y: 168, width: 40, height: 10, fill: pal.ink });
  el('rect', { x: 20, y: 168, width: 116, height: 10, fill: 'none' });
  // 側机と紅茶
  el('rect', { x: 238, y: FY - 62, width: 34, height: 62, rx: 3, fill: pal.wood });
  el('rect', { x: 232, y: FY - 68, width: 46, height: 8, rx: 3, fill: pal.woodDark });
  const cup = g({}); tf(cup, 255, FY - 68);
  el('path', { d: 'M -11 -14 L 11 -14 Q 10 0 0 0 Q -10 0 -11 -14 Z', fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 }, cup);
  el('path', { d: 'M 11 -11 q 8 0 6 6 q -2 4 -8 3', fill: 'none', stroke: '#CBD3DF', 'stroke-width': 2.4 }, cup);
  el('ellipse', { cx: 0, cy: -13, rx: 9, ry: 2.2, fill: '#C97B3E' }, cup);
  const steam = el('path', { d: 'M 0 0 q -4 -6 0 -12 t 0 -12', fill: 'none', stroke: '#C5CFDB', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const mint = k.buddy({ x: 190, y: FY, facing: -1 });
  const coral = k.buddy({ x: 320, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const bowl = g({});
  el('path', { d: 'M -12 -4 L 12 -4 Q 10 8 0 8 Q -10 8 -12 -4 Z', fill: pal.blue }, bowl);
  [[-6, -8], [0, -11], [6, -8], [-2, -7], [3, -7]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4.2, fill: '#FFF3C4' }, bowl));
  const no = g({});
  el('line', { x1: -9, y1: -9, x2: 9, y2: 9, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, no);
  el('line', { x1: 9, y1: -9, x2: -9, y2: 9, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, no);
  return {
    update(t) {
      // 画面：おばけが近づき、画面が点滅
      const ap = easeInOut(seg(t, 0.4, 2.8));
      scr.setAttribute('fill', Math.sin(t * 20) > 0.6 && t > 1.2 ? '#4A2440' : '#2B2440');
      tf(ghost, 78 + 4 * Math.sin(t * 4), lerp(150, 126, ap) + 3 * Math.sin(t * 7), 4 * Math.sin(t * 5), lerp(0.6, 2.1, ap));
      const shock = hump(seg(t, 1.3, 2.0));
      const turn = t > 3.0;
      const wave = seg(t, 1.5, 3.0);
      mint.pose({
        facing: turn ? 1 : -1, lean: turn ? -3 : lerp(0, -14, easeOut(seg(t, 1.3, 1.6))), squash: 1 - 0.05 * shock,
        armL: 8, armR: turn ? 8 : 95 + 22 * Math.sin(t * 12) * seg(wave, 0, 0.2), look: turn ? 0.5 : 0.8,
        mood: t < 1.3 ? 'smile' : 'flat', blink: t > 1.6 && t < 1.9 ? 0.6 : 0
      });
      const laugh = Math.sin(t * 9);
      coral.pose({ armL: 62, armR: 8, lean: 2 + (t > 1 ? laugh * 1.5 : 0), squash: 1 - 0.015 * Math.abs(laugh), look: 0.7, mood: 'grin', blink: 0 });
      const hb = coral.handPos('L');
      tf(bowl, hb.x - 2, hb.y + 2, 0, 1);
      tf(steam, 255, FY - 94 - 5 * ((t * 0.7) % 1), 0, 1);
      steam.setAttribute('opacity', 0.7 * Math.sin(((t * 0.7) % 1) * Math.PI));
      tf(no, 170, FY - 118, 0, easeOut(seg(t, 2.0, 2.4)) * (turn ? 1 : 1));
      no.setAttribute('opacity', t > 2.0 ? 1 : 0);
    }
  };
}
