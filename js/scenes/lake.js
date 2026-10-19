// lake：湖にボートを浮かべ、2人で釣り。うきが沈み、竿がしなって魚が釣れる（例文 We went fishing on the lake.）
import { seg, lerp, easeInOut, easeOut, clamp, hump, wobble } from '../ease.js';
import { scene, mountain, treeG, water, hp, P, blinkAt } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '湖で釣り'], [1.6, 'うきが沈む'], [3.0, '釣れた！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.75;
  scene(k, { FY: 150, top: '#A9D6F5', bot: '#EEF8FD', ground: '#9ED69F', edge: '#8CCB8F' });
  mountain(k, 90, 150, 200, 80, '#A9C3D9');
  mountain(k, 300, 150, 240, 100, '#9FB8CF');
  [[30, 0.6], [370, 0.7]].forEach(([x, s]) => tf(treeG(k, s).g, x, 152));
  const lake = water(k, 150, { dx: 10 });
  // ボート（人物の下半身を隠す前面は後で描く）
  const boat = g({});
  const a = k.buddy({ x: -26, y: -6, scale: S, parent: boat });
  const c = k.buddy({ x: 30, y: -6, scale: S * 0.95, color: pal.coral, dark: pal.coralDark, facing: -1, parent: boat });
  el('path', { d: 'M -70 -14 L 70 -14 Q 64 14 40 16 L -40 16 Q -64 14 -70 -14 Z', fill: '#C48E57' }, boat);
  el('path', { d: 'M -70 -14 L 70 -14', stroke: '#9C6B3E', 'stroke-width': 4 }, boat);
  const line = el('path', { d: '', stroke: '#fff', 'stroke-width': 1.2, fill: 'none' });
  const rod = el('path', { d: '', stroke: '#6D4C30', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const bob = g({}); el('circle', { r: 4.5, fill: pal.red }, bob); el('path', { d: 'M -4.5 0 A 4.5 4.5 0 0 0 4.5 0 Z', fill: '#fff' }, bob);
  const fish = g({}); el('path', { d: 'M -12 0 Q 0 -9 12 0 Q 0 9 -12 0 Z M 12 0 L 20 -6 L 20 6 Z', fill: '#8FB3D9' }, fish); el('circle', { cx: -6, cy: -1, r: 1.5, fill: pal.ink }, fish);
  const rip = el('ellipse', { rx: 0, ry: 0, fill: 'none', stroke: '#fff', 'stroke-width': 2 });
  const BX = 160, BY = 236;
  return {
    update(t) {
      lake(t);
      const bob0 = 2 * Math.sin(t * 2);
      tf(boat, BX, BY + bob0, 1.5 * Math.sin(t * 1.6));
      const bite = seg(t, 1.6, 2.0), pull = easeOut(seg(t, 2.6, 3.0));
      P(a, { y: -6, armR: lerp(60, 120, pull), armL: lerp(55, 110, pull), lean: -4 * pull + 4 * hump(bite), look: 0.6, mood: t > 1.6 ? (t > 3 ? 'grin' : 'open') : 'smile', blink: blinkAt(t) });
      P(c, { y: -6, facing: -1, look: -0.6, armL: 20 + 130 * easeOut(seg(t, 3.0, 3.3)), armR: 20 + 130 * easeOut(seg(t, 3.0, 3.3)), mood: t > 1.7 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      const h0 = hp(a, S, 'R', 28), h = { x: h0.x + BX, y: h0.y + BY + bob0 };
      const ang = (-60 + 50 * pull) * Math.PI / 180, L = 80;
      const bend = 18 * (hump(bite) * 0.6 + (t > 2.0 && t < 2.6 ? 1 : 0) + (1 - pull) * 0 ) * (1 - pull);
      const tip = { x: h.x + L * Math.cos(ang), y: h.y + L * Math.sin(ang) + bend };
      rod.setAttribute('d', `M ${h.x} ${h.y} Q ${(h.x + tip.x) / 2 + 6} ${(h.y + tip.y) / 2 - 8 + bend} ${tip.x} ${tip.y}`);
      const sink = t < 1.6 ? 0 : t < 2.6 ? 6 + 3 * Math.sin(t * 20) : 0;
      let bx = 320, by = 210 + 2 * Math.sin(t * 3) + sink;
      if (t > 2.6) { bx = lerp(320, tip.x + 4, pull); by = lerp(210, tip.y + 34, pull); }
      tf(bob, bx, by, 0, t < 2.6 ? 1 : 0.001);
      tf(fish, bx, by + (t > 2.6 ? 0 : 20), 70 + 20 * Math.sin(t * 18) * (t > 2.6 ? 1 : 0), t > 2.6 ? 1 : 0.001);
      line.setAttribute('d', `M ${tip.x} ${tip.y} L ${bx} ${by - (t > 2.6 ? 12 : 4)}`);
      const r = seg(t, 1.6, 2.6);
      k.set(rip, { cx: 320, cy: 214, rx: 6 + 24 * r, ry: 2 + 5 * r, opacity: r > 0 && r < 1 ? 1 - r : 0 });
    }
  };
}
