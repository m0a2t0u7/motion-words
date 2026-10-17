// turn around：歩いていたまめが、名前を呼ばれてくるりと振り向く（例文 She turned around when I called her.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '背を向けて歩く'], [1.2, '呼ばれる'], [2.2, '振り向く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY + 18, width: 400, height: 6, fill: '#E3E8EE' });
  const c = k.buddy({ x: 52, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark, facing: 1 });
  const b = k.buddy({ x: 250, y: FY, scale: 0.95, facing: 1 });
  const back = el('rect', { x: -30, y: -80, width: 60, height: 80, rx: 28, fill: pal.mintDark }, b.body);
  const callB = g({});
  el('path', { d: 'M -26 -14 L 26 -14 Q 34 -14 34 -22 L 34 -34 Q 34 -42 26 -42 L -26 -42 Q -34 -42 -34 -34 L -34 -22 Q -34 -14 -26 -14 Z M -20 -14 L -26 -4 L -8 -14', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, callB);
  k.text(0, -28, 'Hey!', { 'font-size': 16, fill: pal.coralDark }, callB);
  
  return {
    update(t) {
      const call = seg(t, 1.1, 1.3) * (1 - seg(t, 2.6, 2.8));
      const turnP = easeInOut(seg(t, 1.9, 2.6));
      const walkOn = t < 1.4;
      const wx = walkOn ? 250 + t * 22 : 250 + 1.4 * 22;
      const f = Math.cos(turnP * Math.PI);
      b.pose({
        x: wx,
        walk: walkOn ? t * 9 : 0,
        armL: walkOn ? 8 + Math.sin(t * 9) * 16 : 8,
        armR: walkOn ? 8 - Math.sin(t * 9) * 16 : 8,
        facing: f,
        look: turnP < 0.5 ? 0.3 : 1,
        mood: turnP > 0.8 ? 'open' : 'smile',
        squash: 1 + 0.02 * wobble(seg(t, 2.6, 3.4), 2, 4)
      });
      // 振り向く前は背中側が見えるようにカバーを重ねる
      const showBack = t < 1.9 && false || (t < 2.25);
      c.pose({ walk: 0, look: 0.5, mood: 'open', armR: 8, armL: call > 0 ? lerp(8, 130, call) + 15 * Math.sin(t * 16) * call : 8 });
      tf(callB, 82, 160, 0, 0.9 * call, 0.9 * call);
      b.g.setAttribute('opacity', 1);
      back.setAttribute('opacity', showBack ? 1 : 0);
    }
  };
}
