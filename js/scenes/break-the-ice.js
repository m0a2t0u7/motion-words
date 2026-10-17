// break the ice：冗談で氷の壁が割れ、ぎこちなかった2人が打ち解ける（例文 He told a joke to break the ice.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.7, beats: [[0, 'ぎこちない'], [1.2, '冗談を言う'], [3.1, '打ち解ける']] };

export function create(k) {
  const BRK = 3.1;
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 36, y: 40, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 40, x2: 71, y2: 100, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('rect', { x: 300, y: 48, width: 56, height: 44, rx: 6, fill: '#FBE9DC' });
  el('circle', { cx: 328, cy: 70, r: 12, fill: pal.yellow, opacity: 0.8 });

  const IX = 200, IW = 34, IH = 118;
  // 氷の壁（割れるまでは1枚）
  const wall = g({});
  tf(wall, IX, FY);
  k.shadow(IX, FY + 1, 30, 5);
  const slab = el('rect', { x: -IW / 2, y: -IH, width: IW, height: IH, rx: 8, fill: '#CDEEFB', stroke: '#A6DAF2', 'stroke-width': 3 }, wall);
  const shine = el('rect', { x: -IW / 2 + 6, y: -IH + 12, width: 5, height: 52, rx: 2.5, fill: '#FFFFFF', opacity: 0.75 }, wall);
  // 霜の結晶
  const frost = g({ transform: `translate(4 ${-IH + 26})` }, wall);
  [0, 60, 120].forEach((a) => el('line', { x1: -7, y1: 0, x2: 7, y2: 0, stroke: '#FFFFFF', 'stroke-width': 2.5, 'stroke-linecap': 'round', transform: `rotate(${a})` }, frost));
  // ひび
  const cracks = [
    'M 0 -62 L 6 -74 L -5 -88 L 4 -104 L 0 -118',
    'M 0 -62 L -7 -50 L 5 -36 L -4 -20 L 1 0',
    'M 0 -62 L 12 -58 L 17 -64'
  ].map((d) => el('path', { d, fill: 'none', stroke: '#6FB6DC', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, wall));

  // 割れた破片
  const bands = [0, -20, -42, -64, -86, -104, -118];
  const jag = [[0, 0, 0], [3, -3, 2], [-2, 3, -3], [2, -2, 3], [-3, 2, -2], [2, -3, 1], [0, 0, 0]];
  const vel = [[-34, -58, -140], [58, -80, 170], [-70, -96, -190], [42, -120, 120], [-52, -140, -150], [66, -110, 210]];
  const shards = vel.map((v, i) => {
    const yt = bands[i + 1], yb = bands[i];
    const top = [-IW / 2, 0, IW / 2].map((x, j) => [x, yt + jag[i + 1][j]]);
    const bot = [IW / 2, 0, -IW / 2].map((x, j) => [x, yb + jag[i][2 - j]]);
    const cy = (yt + yb) / 2;
    const pts = [...top, ...bot].map(([x, y]) => `${x} ${y - cy}`).join(' L ');
    const sg = g({}, wall);
    el('path', { d: `M ${pts} Z`, fill: '#CDEEFB', stroke: '#A6DAF2', 'stroke-width': 3, 'stroke-linejoin': 'round' }, sg);
    return { sg, cy, v, half: Math.abs(yt - yb) / 2 };
  });

  // まめ2人
  const A = k.buddy({ x: 112, y: FY, scale: 0.85, facing: 1 });
  const B = k.buddy({ x: 288, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 気まずい「…」
  const dots = k.text(IX, 92, '...', { 'font-size': 26, fill: pal.sub });
  // 吹き出し①：冗談を言う側（"Knock knock!" と笑わせる顔）
  const talk = g({});
  const bubbleD = 'M -46 -26 Q -46 -34 -38 -34 L 38 -34 Q 46 -34 46 -26 L 46 6 Q 46 14 38 14 L 8 14 L 0 28 L -6 14 L -38 14 Q -46 14 -46 6 Z';
  const wideD = 'M -64 -26 Q -64 -34 -56 -34 L 56 -34 Q 64 -34 64 -26 L 64 6 Q 64 14 56 14 L 8 14 L 0 28 L -6 14 L -56 14 Q -64 14 -64 6 Z';
  el('path', { d: wideD, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, talk);
  k.text(0, -10, 'Knock knock!', { 'font-size': 17, fill: pal.coralDark }, talk);
  // 吹き出し②：聞いた側の笑い
  const laugh = g({});
  el('path', { d: bubbleD, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, laugh);
  k.text(0, -10, 'Haha', { 'font-size': 22, fill: pal.coralDark }, laugh);
  // きらきら
  const sparks = [[-62, -150], [60, -160], [0, -190], [-90, -120], [90, -125]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x: IX + x, y: FY + y };
  });

  return {
    update(t) {
      // ---- 氷：笑いを聞いたあと、ひびが入り、割れて飛び散る ----
            const crk = seg(t, 2.45, 3.0);
      cracks.forEach((c, i) => k.set(c, { 'stroke-dashoffset': 1 - clamp(crk * 1.3 - i * 0.15) }));
      const broke = t >= BRK;
      const shake = broke ? 0 : 1.6 * hump(seg(t, 2.6, 3.1)) * Math.sin(t * 60);
      tf(wall, IX + shake, FY);
      slab.setAttribute('opacity', broke ? 0 : 1);
      cracks.forEach((c) => c.setAttribute('visibility', broke ? 'hidden' : 'visible'));
      frost.setAttribute('opacity', broke ? 0 : 1);
      shine.setAttribute('opacity', broke ? 0 : 0.75);
      shards.forEach((s) => {
        const tau = t - BRK;
        if (tau < 0) { s.sg.setAttribute('opacity', 0); return; }
        let y = s.cy + s.v[1] * tau + 0.5 * 420 * tau * tau;
        const lim = -s.half * 0.5;
        if (y > lim) y = lim;
        const x = s.v[0] * Math.min(tau, 0.9);
        const rot = s.v[2] * easeOut(seg(tau, 0, 0.9));
        tf(s.sg, x, y, rot);
        s.sg.setAttribute('opacity', 1 - seg(t, BRK + 0.7, BRK + 1.3));
      });
      // ---- 気まずい「…」 ----
      const dp = seg(t, 0.35, 0.6) * (1 - seg(t, 1.05, 1.25));
      dots.setAttribute('opacity', dp);
      dots.textContent = ['.', '..', '...'][Math.floor(t * 3) % 3];

      // ---- 吹き出し①：冗談（Knock knock!） ----
      const bp = backOut(seg(t, 1.3, 1.55));
      tf(talk, 124, FY - 128, 0, bp, bp);
      talk.setAttribute('opacity', t < 1.3 ? 0 : 1 - seg(t, 2.1, 2.4));
      // ---- 吹き出し②：聞いた側の「Haha」 ----
      const lp = backOut(seg(t, 2.05, 2.3));
      tf(laugh, 288 - 22, FY - 128, 0, lp, lp);
      laugh.setAttribute('opacity', t < 2.05 ? 0 : 1 - seg(t, BRK + 0.3, BRK + 0.7));

      // ---- まめA（冗談を言う側） ----
      const joke = t > 1.25 && t < 2.4;
      const happy = t >= BRK;
      const hp = seg(t, BRK, 4.7);
      const bounce = happy ? 15 * Math.abs(Math.sin((t - BRK - 0.05) * 6.5)) * (1 - hp * 0.35) : 0;
      const bounceB = happy ? 15 * Math.abs(Math.sin((t - BRK - 0.25) * 6.5)) * (1 - hp * 0.35) : 0;
      const gest = 100 + 24 * Math.sin((t - 1.25) * 11);
      A.pose({
        mood: happy ? 'grin' : joke ? 'smile' : t >= 2.4 ? 'smile' : 'flat',
        look: happy ? 0.9 : joke ? 0.6 : -0.8,
        lean: joke ? 7 : happy ? 4 : 0,
        armR: happy ? 140 + 15 * Math.sin((t - BRK) * 13) : joke ? gest : 8,
        armL: happy ? 125 : 8,
        lift: bounce,
        squash: happy && bounce < 1.5 ? 0.93 : 1
      });
      // ---- まめB（聞いた側）：冗談を聞いて笑う ----
      const laughing = t >= 2.05 && !happy;
      B.pose({
        mood: happy || laughing ? 'grin' : 'flat',
        look: happy ? 0.9 : laughing ? 0.4 : -0.8,
        lean: happy ? 4 : laughing ? -4 : 0,
        armR: happy ? 140 - 15 * Math.sin((t - BRK) * 13) : laughing ? 40 : 8,
        armL: happy ? 125 : 8,
        lift: bounceB + (laughing ? 3 * Math.abs(Math.sin((t - 2.05) * 12)) : 0),
        squash: happy && bounceB < 1.5 ? 0.93 : 1
      });
      // ---- きらきら ----
      sparks.forEach((p, i) => {
        const q = seg(t, BRK + 0.1 + i * 0.1, BRK + 0.5 + i * 0.1);
        const s = hump(q) * 1.2 + (q >= 1 ? 0 : 0);
        const tw = 0.85 + 0.15 * Math.sin(t * 8 + i);
        const sc = q <= 0 ? 0 : (q >= 1 ? 0.9 * tw : easeOut(q) * tw);
        tf(p.s, p.x, p.y - 8 * easeOut(q), t * 40 * (i % 2 ? 1 : -1), sc, sc);
      });
    }
  };
}
