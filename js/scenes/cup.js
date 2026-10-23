// cup：受け皿にのったカップの紅茶を、彼女が持ち上げて飲みほす（例文 She drank a cup of tea.）
import { seg, lerp, easeInOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, vessel, plateP, steam, sip, bow, P, blinkAt } from './jam.js';

export const meta = { duration: 4.2, beats: [[0, 'カップの紅茶'], [1.0, '飲む'], [3.4, '飲みほした']] };

export function create(k) {
  const S = 1.2;
  const kit = kitchen(k, { wall: '#F3EEF6' });
  const b = k.buddy({ x: 176, y: kit.FY, scale: S });
  bow(k, b);
  kit.front('#EADCF0');
  const CX = 238, CY = TOP;
  const sau = plateP(k, null, 20); k.tf(sau, CX, TOP + 4);
  const cup = vessel(k, null, { w: 22, h: 16, taper: 0.7, handle: 8, liquid: '#B5652E' });
  const st = steam(k, null, 2, 16);
  const A = arms(k, b, S, { back: ['L'] });
  return {
    update(t) {
      const q = easeInOut(seg(t, 0.9, 1.5)) * (1 - easeInOut(seg(t, 2.9, 3.4)));
      P(b, { lean: 4, look: 0.5, blink: q > 0.6 ? 1 : blinkAt(t), mood: t > 3.4 ? 'grin' : q > 0.6 ? 'flat' : 'smile' });
      cup.set(0.8 * (1 - easeInOut(seg(t, 1.6, 2.8))) + 0.001);
      if (t < 0.9) { k.tf(cup.g, CX, CY, 0, 1.2); A.to('R', lerp(212, CX + 20, easeInOut(seg(t, 0.3, 0.9))), lerp(214, CY - 9, easeInOut(seg(t, 0.3, 0.9)))); }
      else sip(k, A, b, S, cup.g, 'R', { x: CX, y: CY }, q, { sc: 1.2, w: 22, h: 16, tilt: 70 });
      A.to('L', CX - 34, TOP + 2);
      st.set(t < 0.9 ? CX : -99, CY - 22, 1, t);
    }
  };
}
