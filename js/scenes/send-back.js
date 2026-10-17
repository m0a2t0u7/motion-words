// send back：こわれたカップを箱に戻して封をし、配達員に渡して送り主へ返す（例文 I sent back the broken cup.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 4.8, beats: [[0, 'こわれたカップ'], [2.0, '配達員に渡す'], [4.0, '送り主へ戻る']] };
const F = (f) => (Math.abs(f) < 0.08 ? (f < 0 ? -0.08 : 0.08) : f);

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E3E8EE' });
  // 机
  el('rect', { x: 14, y: 202, width: 92, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 20, y: 210, width: 7, height: 26, fill: pal.woodDark });
  el('rect', { x: 93, y: 210, width: 7, height: 26, fill: pal.woodDark });
  k.shadow(60, 237, 50, 5);
  // 配送車（後ろから見た形）。扉は開閉する
  const van = g({});
  el('rect', { x: 328, y: 112, width: 76, height: 124, rx: 8, fill: '#F2F5F9', stroke: pal.line, 'stroke-width': 2 }, van);
  el('rect', { x: 336, y: 124, width: 58, height: 92, rx: 4, fill: '#3C4558' }, van);
  el('rect', { x: 336, y: 206, width: 58, height: 10, fill: '#2C3344' }, van);
  el('rect', { x: 324, y: 224, width: 84, height: 10, rx: 4, fill: pal.sub }, van);
  el('rect', { x: 330, y: 190, width: 5, height: 14, rx: 2, fill: pal.red }, van);
  const inner = g({}, van);
  const mkDoor = (hx, dir) => {
    const d = g({}, van);
    const p = g({}, d);
    el('rect', { x: dir > 0 ? 0 : -29, y: 0, width: 29, height: 92, rx: 3, fill: '#E6EBF2', stroke: '#C5CDD9', 'stroke-width': 2 }, p);
    el('rect', { x: dir > 0 ? 5 : -24, y: 14, width: 19, height: 30, rx: 3, fill: '#fff', opacity: 0.7 }, p);
    return { d, p, hx };
  };
  const dL = mkDoor(336, 1), dR = mkDoor(394, -1);
  const sign = g({}, van);
  tf(sign, 365, 142);
  el('circle', { r: 0, fill: pal.blue }, sign);
  // 戻る矢印（ドアが閉まると見える）
  const arrow = g({}, van);
  tf(arrow, 365, 170);
  arrow.setAttribute('opacity', 0);
  el('circle', { r: 17, fill: pal.blue }, arrow);
  el('path', { d: 'M 7 5 Q 8 -8 -4 -8 L -4 -13 L -13 -6 L -4 1 L -4 -4 Q 2 -4 2 5 Z', fill: '#fff' }, arrow);

  // 箱
  const box = g({});
  const cup = g({}, box);
  el('rect', { x: -9, y: -22, width: 15, height: 14, rx: 3, fill: '#fff', stroke: '#B8C2D0', 'stroke-width': 1.5 }, cup);
  el('path', { d: 'M 6 -19 Q 13 -19 11 -13 Q 10 -10 6 -11', fill: 'none', stroke: '#B8C2D0', 'stroke-width': 2.5 }, cup);
  el('path', { d: 'M -3 -22 L -6 -17 L -1 -14 L -5 -9', fill: 'none', stroke: pal.red, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, cup);
  el('path', { d: 'M 8 -10 L 14 -9 L 11 -3 Z', fill: '#fff', stroke: '#B8C2D0', 'stroke-width': 1.2 }, cup);
  el('rect', { x: -15, y: -10, width: 30, height: 22, rx: 2, fill: '#DDB98A' }, box);
  el('rect', { x: -15, y: 6, width: 30, height: 6, rx: 2, fill: '#C9A06F' }, box);
  const mkFlap = (px, w) => {
    const f = g({}, box);
    el('rect', { x: w > 0 ? 0 : -15, y: -3, width: 15, height: 4, rx: 1.5, fill: '#C9A06F' }, f);
    return f;
  };
  const fL = mkFlap(-15, 1), fR = mkFlap(15, -1);
  const tape = el('rect', { x: -3, y: -11, width: 6, height: 24, fill: pal.yellow, opacity: 0 }, box);

  // 人物
  const b = k.buddy({ x: 108, y: FY, scale: 0.85, facing: -1 });
  const c = k.buddy({ x: 285, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('path', { d: 'M -24 -74 Q 0 -108 24 -74 Z', fill: pal.blue }, c.body);
  el('rect', { x: 2, y: -80, width: 30, height: 6, rx: 3, fill: pal.blueDark }, c.body);
  const TX = 64, TY = 191;

  return {
    update(t) {
      // 1) カップを押し込み、ふたを閉じて封をする
      const press = seg(t, 0.4, 0.8), close = easeInOut(seg(t, 0.85, 1.35)), tp = seg(t, 1.35, 1.55);
      tf(cup, 0, 14 * easeInOut(press));
      tf(fL, -15, -10, -80 * (1 - close));
      tf(fR, 15, -10, 80 * (1 - close));
      tape.setAttribute('opacity', tp > 0 ? 1 : 0);
      tape.setAttribute('height', 24 * tp);
      // 2) 持ち上げて渡す
      const turn = easeInOut(seg(t, 1.6, 2.0));
      const wp = seg(t, 2.0, 2.8);
      const bx = t < 2.0 ? 108 : lerp(108, 195, easeInOut(wp));
      const bw = t > 2.0 && t < 2.8;
      const lift = easeOut(seg(t, 1.5, 1.9));
      const down = easeInOut(seg(t, 3.05, 3.4));
      let arm = t < 0.4 ? 100 : t < 0.8 ? lerp(110, 125, press) : t < 1.4 ? 122 + 12 * Math.sin(seg(t, 0.85, 1.35) * Math.PI) : lerp(125, 78, lift);
      arm = lerp(arm, 12, down);
      b.pose({
        x: bx, facing: F(lerp(-1, 1, turn)), armR: arm, armL: bw ? Math.sin((t - 2) * 9) * 18 : 8,
        walk: bw ? (t - 2) * 9 : 0, lean: t > 0.4 && t < 1.4 ? 8 : 0, mood: t < 1.5 ? 'sad' : 'smile', look: 0.3
      });
      const hb = b.handPos('R');
      // 配達員
      const ct = easeInOut(seg(t, 3.05, 3.4));
      const cw = seg(t, 3.4, 3.85);
      const cx = lerp(285, 308, easeInOut(cw));
      const put = easeOut(seg(t, 3.8, 4.15));
      c.pose({
        x: cx, facing: F(lerp(-1, 1, ct)), walk: cw > 0 && cw < 1 ? (t - 3.4) * 9 : 0,
        armR: t < 2.6 ? 12 : t < 3.4 ? lerp(12, 78, easeOut(seg(t, 2.5, 2.8))) : lerp(78 + 20 * put, 12, easeInOut(seg(t, 4.25, 4.6))), armL: 8, mood: 'smile', look: 0.3
      });
      const hc = c.handPos('R');
      // 箱の位置：机 → 本人の手 → 配達員の手 → 荷台の中
      let px, py, sc = 1;
      const pk = easeOut(seg(t, 1.45, 1.95));
      if (t < 2.7) { px = lerp(TX, hb.x, pk); py = lerp(TY, hb.y - 10, pk); }
      else if (t < 3.8) { const s = easeOut(seg(t, 2.6, 2.9)); px = lerp(hb.x, hc.x, s); py = lerp(hb.y - 10, hc.y - 10, s); if (t > 2.9) { px = hc.x; py = hc.y - 10; } }
      else { const s = easeInOut(seg(t, 3.8, 4.2)); px = lerp(hc.x, 365, s); py = lerp(hc.y - 10, 190, s); sc = lerp(1, 0.85, s); }
      tf(box, px, py, 0, sc);
      const parent = t >= 4.05 ? inner : root();
      if (box.parentNode !== parent) parent.appendChild(box);
      // 扉
      const dc = easeInOut(seg(t, 4.3, 4.75));
      [dL, dR].forEach((o) => { tf(o.d, o.hx, 124); tf(o.p, 0, 0, 0, lerp(0.14, 1, dc), 1); });
      arrow.setAttribute('opacity', seg(t, 4.65, 4.8));
    }
  };
  function root() { return k.root; }
}
