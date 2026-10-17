// hand in：生徒が宿題の用紙を先生に手渡しし、先生の机の束に重なる（例文 Please hand in your homework by Friday.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '持って行く'], [1.8, '手渡す'], [3.0, '提出した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('ellipse', { cx: 200, cy: 262, rx: 190, ry: 18, fill: '#FBE3D8' });
  // 壁のカレンダー（FRI）
  el('rect', { x: 52, y: 40, width: 74, height: 80, rx: 10, fill: 'rgba(40,52,70,0.12)', transform: 'translate(3 3)' });
  el('rect', { x: 52, y: 40, width: 74, height: 80, rx: 10, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2.5 });
  el('rect', { x: 52, y: 40, width: 74, height: 22, rx: 10, fill: pal.red });
  el('rect', { x: 52, y: 52, width: 74, height: 10, fill: pal.red });
  [74, 104].forEach((x) => el('circle', { cx: x, cy: 40, r: 4.5, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 2 }));
  k.text(89, 51, 'FRI', { 'font-size': 14, fill: '#FFFFFF' });
  k.text(89, 90, '17', { 'font-size': 32, fill: pal.ink });
  el('circle', { cx: 89, cy: 90, r: 24, fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': '6 4' });

  const S = 0.95;
  // 先生（机の向こう側に座る）
  const T = k.buddy({ x: 340, y: FY - 14, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  T.g.firstChild.setAttribute('display', 'none');
  // 生徒
  const P = k.buddy({ x: 40, y: FY, scale: S });
  // 机（まめの後ろ側を隠す）
  const DY = 194;
  k.shadow(320, 254, 102, 6);
  el('rect', { x: 240, y: DY, width: 160, height: 12, rx: 4, fill: '#F0D9B8' });
  el('rect', { x: 240, y: DY + 12, width: 160, height: 46, fill: pal.wood });
  el('rect', { x: 240, y: DY + 12, width: 160, height: 4, fill: pal.woodDark, opacity: 0.4 });
  el('rect', { x: 248, y: DY + 58, width: 10, height: 6, rx: 2, fill: pal.woodDark });
  el('rect', { x: 382, y: DY + 58, width: 10, height: 6, rx: 2, fill: pal.woodDark });
  // 机の上の束
  const SX = 304, TOP = DY + 4;
  [0, 1, 2].forEach((i) => el('rect', { x: SX - 20 + (i % 2) * 2, y: TOP - 4 * (i + 1), width: 40, height: 4, rx: 1.5, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 1.5 }));
  const stackTop = el('rect', { x: SX - 21, y: TOP - 16, width: 42, height: 4, rx: 1.5, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 1.5, opacity: 0 });
  const okMark = g({});
  // 用紙（手に持つ）
  const sheet = g({});
  el('rect', { x: -12, y: -16, width: 24, height: 32, rx: 2.5, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 1.8 }, sheet);
  el('rect', { x: -8, y: -11, width: 14, height: 3, rx: 1.5, fill: pal.coral }, sheet);
  [-4, 2, 8].forEach((y) => el('rect', { x: -8, y, width: 16, height: 2.4, rx: 1.2, fill: pal.line }, sheet));

  el('circle', { cx: 0, cy: 0, r: 13, fill: pal.green }, okMark);
  el('path', { d: 'M -6 0 L -2 4.5 L 6.5 -5', stroke: '#FFFFFF', 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, okMark);

  return {
    update(t) {
      const walk = easeInOut(seg(t, 0.2, 1.6));
      const x = lerp(40, 214, walk);
      const walking = walk > 0 && walk < 1;
      const give = easeOut(seg(t, 1.6, 2.1)), retract = easeInOut(seg(t, 2.6, 3.2));
      const pArm = lerp(lerp(55, 92, give), 8, retract);
      P.pose({
        x, armR: pArm + (walking ? Math.sin(t * 10) * 4 : 0), armL: 8 + (walking ? Math.sin(t * 10 + 3) * 14 : 0),
        walk: walking ? (t - 0.2) * 10 : 0, look: 0.5, lean: 3 * give * (1 - retract),
        mood: t > 3.0 ? 'smile' : 'smile'
      });
      const tTake = easeOut(seg(t, 1.9, 2.3)), tLow = easeInOut(seg(t, 2.5, 3.1));
      T.pose({
        x: 340, y: FY - 14, armR: lerp(lerp(8, 92, tTake), 66, tLow), armL: 8, look: -0.4,
        lean: 2 * hump(seg(t, 3.0, 3.6)), mood: t > 3.1 ? 'smile' : 'flat'
      });
      // 用紙：生徒の手 → 先生の手 → 机の束の上
      const hp = P.handPos('R'), tp = T.handPos('R');
      const take = easeInOut(seg(t, 2.05, 2.4));
      let px = lerp(hp.x + 9, tp.x - 2, take), py = lerp(hp.y - 10, tp.y - 8, take);
      let rot = 0, sy = 1;
      const land = easeInOut(seg(t, 2.8, 3.25));
      px = lerp(px, SX + 1, land); py = lerp(py, TOP - 14, land);
      sy = lerp(1, 0.16, land);
      tf(sheet, px, py, lerp(0, -3, land), lerp(1, 1.5, land), sy * lerp(1, 1.5, land) * 1);
      sheet.setAttribute('opacity', t > 3.3 ? 0 : 1);
      // 着地後は束の一番上に1枚
      stackTop.setAttribute('opacity', t > 3.25 ? 1 : 0);
      const ok = Math.max(0.001, backOut(seg(t, 3.35, 3.75), 1.8));
      tf(okMark, SX, 150, 0, ok, ok);
      okMark.setAttribute('opacity', t > 3.35 ? 1 : 0);
    }
  };
}
