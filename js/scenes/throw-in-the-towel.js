// throw in the towel：重いダンベルを何度も持ち上げようとして失敗し、ついに肩のタオルを投げて降参する（After many tries, he threw in the towel.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '挑戦する'], [1.8, '何度も失敗'], [3.6, 'タオルを投げる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 回数ボード
  el('rect', { x: 290, y: 40, width: 92, height: 56, rx: 7, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  const tally = [0, 1, 2].map((i) => { const m = g({}); tf(m, 311 + i * 30, 68); el('path', { d: 'M -7 -7 L 7 7 M 7 -7 L -7 7', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, m); return m; });
  // ベンチ（ダンベル台）
  el('rect', { x: 196, y: 208, width: 90, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 206, y: 216, width: 8, height: 20, fill: pal.woodDark }); el('rect', { x: 268, y: 216, width: 8, height: 20, fill: pal.woodDark });
  const me = k.buddy({ x: 168, y: 238 });
  // タオル（肩 → 手 → 床）
  const towel = g({});
  el('rect', { x: -9, y: -5, width: 18, height: 30, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, towel);
  el('rect', { x: -9, y: 5, width: 18, height: 5, fill: pal.blue }, towel);
  const flat = g({});
  el('ellipse', { rx: 22, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, flat);
  el('ellipse', { rx: 10, ry: 2.4, cy: 0, fill: pal.blue, opacity: 0.8 }, flat);
  k.shadow(0, 0, 22, 4, flat);
  // ダンベル
  const db = g({});
  el('rect', { x: -20, y: -2.5, width: 40, height: 5, fill: pal.sub }, db);
  [-1, 1].forEach((s) => { el('rect', { x: s * 22 - 6, y: -13, width: 12, height: 26, rx: 4, fill: pal.ink }, db); });
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water, stroke: '#fff', 'stroke-width': 1 }));
  const PX = 195, PY = 182;
  const handAt = (a) => [PX + 28 * Math.sin(a * Math.PI / 180), PY + 28 * Math.cos(a * Math.PI / 180)];
  return {
    update(t) {
      const T = [0.2, 1.0, 1.8], L = 0.8;
      const tries = t < 2.6;
      let ang = 50, effort = 0;
      if (tries) {
        const i = Math.min(2, Math.floor((t - 0.2) / L));
        const p = t < 0.2 ? 0 : (t - 0.2 - i * L) / L;
        const lift = easeOut(seg(p, 0.15, 0.5)) * (1 - easeIn(seg(p, 0.62, 0.95)));
        ang = 50 + 38 * lift * (0.85 + 0.0 * i);
        effort = lift;
        ang += Math.sin(t * 40) * 2.2 * lift;
      }
      const done = seg(t, 2.6, 3.0);
      const grab = easeOut(seg(t, 3.0, 3.35)), thr = easeInOut(seg(t, 3.35, 3.65));
      let armR = tries ? ang : lerp(50, 15, done);
      if (t >= 3.0) armR = lerp(lerp(50, 15, 1), 160, grab);
      if (t >= 3.35) armR = lerp(160, 55, thr);
      if (t >= 3.65) armR = lerp(55, 100, easeOut(seg(t, 3.65, 4.1)));
      me.pose({
        armR, armL: t < 3.65 ? 8 : lerp(8, 100, easeOut(seg(t, 3.65, 4.1))),
        lean: tries ? 12 * (0.3 + effort) : lerp(12, 6, done), squash: tries ? 1 - 0.1 * effort : 0.94 + (t > 3.65 ? -0.02 * hump(seg(t, 3.65, 4.1)) : 0),
        mood: t < 0.2 ? 'smile' : t < 2.6 ? (effort > 0.3 ? 'open' : 'flat') : 'sad', look: 0.7, blink: effort > 0.5 ? 0.6 : 0
      });
      // ダンベル：手と一緒に動く（つかんでいる間）
      const [hx, hy] = handAt(tries ? ang : 50);
      tf(db, tries ? hx + 8 : 241, tries ? hy - 6 : 200, 0);
      if (!tries) { tf(db, 241, 200); }
      // 失敗の印
      tally.forEach((m, i) => { const p = backOut(seg(t, T[i] + 0.62, T[i] + 0.85), 2.5); tf(m, 311 + i * 30, 68, 0, p, p); });
      // タオル
      const th = handAt(armR);
      if (t < 3.0) { tf(towel, 190, 172, 8); towel.setAttribute('opacity', 1); flat.setAttribute('opacity', 0); }
      else if (t < 3.55) { tf(towel, th[0] + 4, th[1] - 4, lerp(8, 0, grab)); flat.setAttribute('opacity', 0); }
      else {
        const p = seg(t, 3.55, 4.15), r = th;
        const x0 = 214, y0 = 160, x1 = 318, y1 = 232;
        if (p < 1) { tf(towel, lerp(x0, x1, easeOut(p)), lerp(y0, y1, p * p) - 46 * Math.sin(Math.PI * p), p * 560); flat.setAttribute('opacity', 0); }
        else { towel.setAttribute('opacity', 0); tf(flat, x1, y1, 0, 1 + 0.12 * wobble(seg(t, 4.15, 4.6), 2, 4), 1); flat.setAttribute('opacity', 1); }
      }
      sweat.forEach((s, i) => { const p = (t * 1.1 + i * 0.5) % 1; tf(s, 138 + i * 6, 160 + p * 28, 0, 1, 1); s.setAttribute('opacity', t > 0.8 && t < 3.6 ? 1 - p : 0); });
    }
  };
}
