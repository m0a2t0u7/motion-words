// sleeve：長袖の袖を手でまくり上げ、金づちをにぎって釘を打ち始める（例文 He rolled up his sleeves and started working.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { wardrobe, hp, held, reach, P, blinkAt } from './skirt.js';
import { frontL } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '長い袖'], [0.4, '袖をまくる'], [2.2, '作業を始める']] };

function hammer(k) {
  const g = k.g({});
  k.el('rect', { x: -2.5, y: -4, width: 5, height: 30, rx: 2, fill: k.pal.woodDark }, g);
  k.el('rect', { x: -9, y: 22, width: 18, height: 9, rx: 2, fill: k.pal.sub }, g);
  return g;
}

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.35;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 作業場の壁（板）と作業台
  for (let x = 0; x < 400; x += 40) el('rect', { x, y: 0, width: 38, height: FY, fill: '#F2E4D0', opacity: 0.6 });
  el('rect', { x: 230, y: 60, width: 120, height: 6, rx: 3, fill: pal.woodDark });
  [[244, pal.sub], [270, pal.coral], [300, pal.yellowDark]].forEach(([x, c]) => el('rect', { x, y: 66, width: 6, height: 26, rx: 2, fill: c }));
  const TY = 184;
  k.shadow(300, FY + 1, 90, 5);
  el('rect', { x: 212, y: TY, width: 188, height: 10, rx: 3, fill: pal.wood });
  [222, 388].forEach((x) => el('rect', { x: x - 4, y: TY + 10, width: 8, height: FY - TY - 10, fill: pal.woodDark }));
  el('rect', { x: 236, y: TY - 12, width: 110, height: 12, rx: 2, fill: '#E9C892', stroke: pal.woodDark, 'stroke-width': 1.5 });
  const nail = g({});
  el('rect', { x: -1.5, y: 0, width: 3, height: 16, fill: pal.sub }, nail);
  el('rect', { x: -5, y: -2, width: 10, height: 3, rx: 1, fill: pal.sub }, nail);
  const b = k.buddy({ x: 170, y: FY, scale: S });
  const W = wardrobe(k, b);
  const top = W.top({ color: pal.blue, dark: pal.blueDark, sleeve: 'long', to: -16 });
  W.bottom({ kind: 'trousers', color: '#596377', dark: '#444D5F', from: -16 });
  W.feet('shoe', pal.ink);
  const fl = frontL(b, S);
  const hm = hammer(k);
  const NX = 290, NY = TY - 12;
  return {
    update(t) {
      // まくる：右袖（左手で）→ 左袖
      const r1 = easeInOut(seg(t, 0.5, 1.3)), r2 = easeInOut(seg(t, 1.4, 1.9));
      const lift1 = easeInOut(seg(t, 0.2, 0.5)) * (1 - easeInOut(seg(t, 1.3, 1.6)));
      P(b, { x: 170, look: 0.3, mood: t > 2.2 ? 'grin' : 'smile', blink: blinkAt(t), armR: lerp(8, 70, lift1) });
      [top.sl[1], top.sl[0]].forEach((s, i) => {
        const r = i ? r2 : r1;
        k.set(s.r, { height: lerp(27, 10, r) });
        k.set(s.cuff, { y: lerp(18, 3, r), height: lerp(4, 7, r), rx: 3 });
      });
      // 左手：右袖口をつかんで、ひじの方へ押し上げる
      const along = lerp(24, 6, r1);
      let la = 8;
      if (lift1 > 0.01 && t < 1.4) { const st = b.state, a = ((-st.armR) * Math.PI) / 180; const sx = 27, sy = -46; const tx = st.x + (sx - along * Math.sin(a)) * S, ty = st.y + (sy + along * Math.cos(a) - 10) * S; la = reach(b, S, 'R', tx, ty); la = lerp(8, Math.atan2(tx - (st.x + 20 * S), (st.y + (-54) * S) - ty) * -57.3 + 180, 1); la = 180 - Math.atan2(tx - (st.x + 20 * S), -(ty - (st.y - 54 * S))) * 57.3 - 90; }
      if (t > 1.35 && t < 1.95) la = 8 + 40 * hump(r2 * 1);
      // 金づち：台から取って、3回打つ
      const pick = easeInOut(seg(t, 2.0, 2.4));
      const hit = t > 2.5 ? seg(t, 2.5, 4.1) : 0;
      const ph = (hit * 3) % 1, up = hit > 0 && hit < 1 ? (ph < 0.6 ? easeOut(ph / 0.6) : 1 - easeIn((ph - 0.6) / 0.4)) : 0;
      if (t > 1.95) {
        b.pose({ lean: 8 * pick, armR: lerp(8, reach(b, S, 'R', NX - 30, NY - 20), pick) + 50 * up });
        la = lerp(8, 50, pick);
      }
      fl.set(lift1 > 0.01 && t < 1.4 ? lerp(8, la, Math.min(1, lift1 * 2)) : la);
      if (t < 2.2) tf(hm, NX + 40, NY + 1, -90, S * 0.9); else held(k, b, S, hm, 'R', 0, 22);
      const hits = Math.floor(Math.min(hit, 0.999) * 3 + (ph > 0.95 ? 1 : 0)) + (hit >= 1 ? 1 : 0);
      tf(nail, NX, NY - 14 + Math.min(3, hits) * 3.6);
      void wobble; void hp;
    }
  };
}
