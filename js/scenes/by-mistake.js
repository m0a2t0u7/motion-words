// by mistake：傘立てに似た青い傘が2本。相手の札（コーラル）付きの方を自分のと思って持っていく→相手が残った傘の札を見て困る→気づいて謝る（I took your umbrella by mistake.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { gait, hp } from './dig.js';
import { P, blinkAt, mark, umbrella } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '傘を取る'], [1.8, '残りは別の傘'], [3.0, '間違えた！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 300, y: FY - 140, width: 90, height: 140, fill: '#DDEFFA' });
  el('rect', { x: 296, y: FY - 144, width: 98, height: 6, fill: pal.woodDark });
  // 傘立て
  k.shadow(210, FY + 1, 22, 4);
  const back = el('rect', { x: 192, y: FY - 40, width: 36, height: 40, rx: 4, fill: '#8FA6BF' });
  const uC = umbrella(k, pal.blue, pal.coral), uG = umbrella(k, pal.blue, pal.mint);
  el('rect', { x: 190, y: FY - 34, width: 40, height: 34, rx: 4, fill: '#A9BCD2' });
  const G = k.buddy({ x: 150, y: FY });
  const C = k.buddy({ x: 440, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const q = mark(k, 'q'), bang = mark(k, 'bang');
  const gx = (t) => t < 2.6 ? lerp(150, 176, easeInOut(seg(t, 0.1, 0.5))) - lerp(0, 110, easeInOut(seg(t, 1.0, 1.9))) : lerp(66, 120, easeInOut(seg(t, 3.0, 3.8)));
  const cx = (t) => lerp(440, 252, easeInOut(seg(t, 1.3, 2.3)));
  return {
    update(t) {
      const a = gait(gx, t, 150);
      const take = t > 0.8;
      const turn = t > 2.8;
      P(G, { x: a.x, walk: a.walk, facing: t < 1.0 ? 1 : turn ? 1 : -1, lean: a.lean + (t > 3.8 ? 6 : 0), armL: a.armL,
        armR: t < 0.8 ? lerp(8, 60, easeOut(seg(t, 0.4, 0.8))) : turn ? lerp(30, 80, easeOut(seg(t, 3.6, 4.0))) : 30,
        look: t > 2.5 && t < 2.9 ? 0.9 : 0.5, mood: t < 2.6 ? 'smile' : t < 3.6 ? 'open' : 'flat', blink: blinkAt(t) });
      const hG = hp(G, 1, 'R');
      if (take) tf(uC, hG.x, hG.y, G.state.facing * 160); else tf(uC, 204, FY - 20, 6);
      const b = gait(cx, t, 440), ct = t > 2.4;
      P(C, { x: b.x, walk: b.walk, facing: -1, lean: b.lean, armL: b.armL, armR: ct ? lerp(8, 70, easeOut(seg(t, 2.4, 2.7))) : b.armR,
        look: t > 3.0 ? 0.8 : 0.5, mood: ct ? 'flat' : 'smile', blink: blinkAt(t, 1) });
      const hC = hp(C, 1, 'R');
      if (t > 2.6) tf(uG, hC.x, hC.y, -150); else tf(uG, 216, FY - 20, -6);
      tf(q, b.x, FY - 112, 0, Math.max(0.001, backOut(seg(t, 2.7, 3.0))));
      q.setAttribute('opacity', t < 3.8 ? 1 : 0);
      tf(bang, a.x, FY - 112, 0, Math.max(0.001, backOut(seg(t, 2.8, 3.05))));
    }
  };
}
