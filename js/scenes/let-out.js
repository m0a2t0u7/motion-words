// let out：庭の門を開けてやると、中にいた犬が外へ走り出る（例文 She opened the gate and let the dog out.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { reach } from './dig.js';
import { makeDog } from './bury.js';
import { path, walk, door } from './queue-up.js';

export const meta = { duration: 4.2, beats: [[0, '門の中の犬'], [1.5, '門を開ける'], [3.6, '犬が外へ出た']] };

export function fenceGate(k, FY, { gx = 170, gw = 70, gh = 62, label } = {}) {
  const { el, g, pal } = k;
  el('rect', { x: 0, y: FY - 70, width: 400, height: 70, fill: '#CDEBCF' });
  [[60, 40], [330, 46]].forEach(([x, r]) => el('circle', { cx: x, cy: FY - 92, r, fill: '#9ED9B0' }));
  const back = g({});
  const fence = g({});
  for (let x = 6; x < 400; x += 24) if (x < gx - 10 || x > gx + gw) el('rect', { x, y: FY - 56, width: 16, height: 56, rx: 3, fill: '#F6EBDD', stroke: '#E3D2BC', 'stroke-width': 1.5 }, fence);
  el('rect', { x: 0, y: FY - 44, width: gx - 6, height: 6, fill: '#EBDCC8' }, fence);
  el('rect', { x: gx + gw + 6, y: FY - 44, width: 400 - gx - gw, height: 6, fill: '#EBDCC8' }, fence);
  [gx - 8, gx + gw].forEach((x) => el('rect', { x, y: FY - gh - 10, width: 8, height: gh + 10, rx: 2, fill: pal.woodDark }, fence));
  const D = door(k, { x: gx, y: FY - gh, w: gw, h: gh, hinge: 'L', color: '#E7C9A0', parent: fence });
  if (label) {
    const s = g({}, D.g);
    el('rect', { x: 8, y: 10, width: gw - 16, height: 22, rx: 3, fill: '#fff', stroke: pal.red, 'stroke-width': 2.5 }, s);
    k.text(gw / 2, 22, label, { 'font-size': 10, fill: pal.red }, s);
  }
  const front = g({});
  return { back, fence, front, D };
}

export function create(k) {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const F = fenceGate(k, FY, { gx: 170 });
  const dog = makeDog(k, F.back, 0.7);
  const S = 0.85;
  const b = k.buddy({ parent: F.front, x: 290, y: FY + 6, scale: S, facing: -1 });
  const dxf = path([[1.7, 205], [3.3, 352]]);
  return {
    update(t) {
      const op = easeInOut(seg(t, 0.9, 1.6));
      F.D.set(op);
      const p = walk(b, path([[0, 290], [0.8, 262], [1.7, 262], [2.3, 262]]), t, { facing: t > 3.0 ? 1 : -1, look: t > 3.0 ? 0.5 : -0.4, mood: t > 2.2 ? 'grin' : 'smile', y: FY + 6 });
      if (t > 0.6 && t < 1.8) { const kn = F.D.knob(op); const a = reach(b, S, 'R', kn.x, kn.y); b.pose({ armR: lerp(p.armR, a, easeOut(seg(t, 0.6, 0.9))), lean: 5 }); }
      // 犬：門の中→門を抜けて手前へ→右へ走り去る
      const x = dxf(t), out = seg(t, 2.0, 2.5);
      const run = t > 1.7 && t < 3.4 ? (t - 1.7) * 18 : 0;
      const w = Math.sin(run) * 28 * (t > 1.7 && t < 3.4 ? 1 : 0);
      const wag = 20 * Math.sin(t * 16);
      (out > 0.5 ? F.front : F.back).appendChild(dog.g);
      if (out > 0.5) F.front.insertBefore(dog.g, F.front.firstChild);
      dog.pose({ x, y: lerp(FY - 4, FY + 22, easeOut(out)) - Math.abs(Math.sin(run)) * 4, facing: 1, f1: w, f2: -w, h1: -w, h2: w, tail: wag, headRot: t < 1.7 ? -8 + 4 * Math.sin(t * 6) : -4, jaw: t < 1.7 ? 10 * hump(seg(t, 0.2, 0.6)) : 12 });
      void el; void pal;
    }
  };
}
