// grandchild：おばあちゃんのもとに孫たちが1人ずつ駆け寄ってくる。数えると5人（例文 She has five grandchildren.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, bun, glasses, keys, pops, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, 'おばあちゃん'], [0.6, '孫が来る'], [3.6, '孫が5人']] };

export function create(k) {
  const { el, pal } = k;
  const FY = homeBg(k, { winX: 40, winW: 80 });
  const gm = k.buddy({ x: 90, y: FY, scale: 1.2 });
  bun(k, gm); glasses(k, gm);
  const A = arms(k, gm, 1.2);
  const spots = [160, 205, 250, 295, 340];
  const kids = spots.map((x, i) => ({ b: k.buddy({ x: 460, y: FY, scale: 0.55 + (i % 3) * 0.06, facing: -1, ...C(k, i % 2 ? 'blue' : 'coral') }), xf: keys([[0.4 + i * 0.55, 460], [1.3 + i * 0.55, x]]), t0: 1.3 + i * 0.55 }));
  const nums = spots.map((x, i) => k.text(x, 0, String(i + 1), { 'font-size': 20, fill: pal.coralDark }));
  const big = k.text(250, 50, '5', { 'font-size': 40, fill: pal.coralDark });
  return {
    update(t) {
      const open = easeOut(seg(t, 0.2, 0.8));
      P(gm, { look: 0.8, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'smile', lean: -3 * open });
      A.ang('R', lerp(10, 120, open) + 8 * Math.sin(t * 3) * open); A.ang('L', lerp(10, 60, open));
      kids.forEach(({ b, xf, t0 }, i) => {
        const g = gait(xf, t, 460);
        const hop = t > t0 ? Math.abs(Math.sin((t - t0) * 7)) * 5 * (1 - seg(t, t0 + 0.6, t0 + 1.2)) : 0;
        P(b, { x: g.x, walk: g.walk, armL: g.armL, armR: g.armR, lean: g.lean, facing: -1, lift: hop, look: 0.5, blink: blinkAt(t, i * 0.3), mood: 'grin' });
        const q = seg(t, t0, t0 + 0.4);
        nums[i].setAttribute('transform', `translate(0 ${FY - 70}) translate(${spots[i]} 0) scale(${pops(q).toFixed(3)}) translate(${-spots[i]} 0)`);
        nums[i].setAttribute('opacity', q > 0 ? 1 - seg(t, 3.7, 3.9) : 0);
      });
      const q = seg(t, 3.8, 4.2);
      big.setAttribute('transform', `translate(250 50) scale(${pops(q).toFixed(3)}) translate(-250 -50)`);
    }
  };
}
