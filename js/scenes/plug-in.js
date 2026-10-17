// plug in：床に落ちたランプのプラグを拾い、電源タップの差込口へ差し込む→ランプが点く（例文 Plug in the lamp, please.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.8, beats: [[0, 'ランプは消灯'], [1.8, 'プラグを運ぶ'], [3.7, '差して点灯']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 48, width: 80, height: 58, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 80, y1: 48, x2: 80, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  // 机とランプ
  el('rect', { x: 276, y: 202, width: 124, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: 286, y: 211, width: 8, height: 25, fill: pal.woodDark });
  k.shadow(340, 237, 62, 5);
  const glow = g({});
  [70, 50, 34].forEach((r, i) => el('circle', { r, fill: pal.yellow, opacity: 0.16 + i * 0.05 }, glow));
  tf(glow, 336, 142);
  el('rect', { x: 326, y: 196, width: 20, height: 7, rx: 3, fill: pal.sub });
  el('rect', { x: 333, y: 150, width: 6, height: 48, rx: 2, fill: '#A9B4C4' });
  const shade = el('path', { d: 'M 316 152 L 356 152 L 346 118 L 326 118 Z', fill: '#C9D2DE' });
  const rays = g({});
  [[-32, -4], [0, -12], [32, -4]].forEach(([x, y]) => el('line', { x1: x, y1: y, x2: x * 1.35, y2: y * 1.6 - 8, stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, rays));
  tf(rays, 336, 108);
  // 電源タップ
  const SLOT = 156;
  const cord = el('path', { d: 'M 0 0', fill: 'none', stroke: '#4A5266', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const plug = g({});
  const pin = g({}, plug);
  el('rect', { x: -4.5, y: 7, width: 2.6, height: 8, fill: '#B8C2D0' }, pin);
  el('rect', { x: 1.9, y: 7, width: 2.6, height: 8, fill: '#B8C2D0' }, pin);
  el('rect', { x: -8, y: -9, width: 16, height: 17, rx: 4, fill: '#4A5266' }, plug);
  el('rect', { x: -5, y: -7, width: 4, height: 8, rx: 2, fill: '#fff', opacity: 0.25 }, plug);
  const strip = g({});
  el('rect', { x: 112, y: 224, width: 80, height: 12, rx: 4, fill: '#EDEFF3', stroke: '#C5CDD9', 'stroke-width': 1.5 }, strip);
  [138, SLOT, 174].forEach((x) => el('rect', { x: x - 6, y: 224, width: 12, height: 3, rx: 1.5, fill: '#4A5266' }, strip));
  el('circle', { cx: 184, cy: 230, r: 2.2, fill: pal.red }, strip);
  const led = strip.lastChild;
  const spark = g({});
  [-1, 0, 1].forEach((d) => el('line', { x1: d * 8, y1: -4, x2: d * 15, y2: -12, stroke: pal.yellow, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, spark));
  const b = k.buddy({ x: 262, y: FY, scale: 0.85, facing: -1 });
  // ひもはプラグ・人物より後ろに描くため、順序を入れ替える
  k.root.insertBefore(cord, b.g); k.root.insertBefore(plug, b.g.nextSibling);
  k.root.appendChild(strip); k.root.appendChild(spark);
  const LAMP = { x: 336, y: 201 };
  const REST = { x: 222, y: 228 };

  function poseAt(t) {
    let x = 262, arm = 12, sq = 1, lean = 0, walking = false;
    const stoop = easeInOut(seg(t, 0.8, 1.25)) * (1 - easeInOut(seg(t, 1.5, 1.95)));
    sq = 1 - 0.2 * stoop; lean = 8 * stoop;
    if (t < 1.25) arm = lerp(12, 45, easeOut(seg(t, 0.8, 1.25)));
    else if (t < 1.95) arm = lerp(45, 70, easeInOut(seg(t, 1.5, 1.95)));
    else arm = 70;
    const w = easeInOut(seg(t, 1.95, 2.9));
    x = lerp(262, 200, w); walking = w > 0 && w < 1;
    if (t > 3.15) arm = lerp(70, 36, easeInOut(seg(t, 3.15, 3.5)));
    if (t > 3.9) arm = lerp(36, 12, easeInOut(seg(t, 3.9, 4.4)));
    if (t > 3.15 && t < 3.9) lean = 5 * easeOut(seg(t, 3.15, 3.45));
    return { x, armR: arm, armL: walking ? Math.sin(t * 10) * 14 : 8, squash: sq, lean, walk: walking ? t * 10 : 0, mood: t > 3.6 ? 'grin' : 'smile', look: 0.5 };
  }

  return {
    update(t) {
      b.pose(poseAt(t));
      const h = hand(b);
      // プラグ：床 → 手 → 差込口
      let px, py, rot;
      const grab = easeOut(seg(t, 1.2, 1.5));
      const seat = easeOut(seg(t, 3.3, 3.5));
      if (t < 1.2) { px = REST.x; py = REST.y; rot = 90; }
      else { px = lerp(REST.x, h.x, grab); py = lerp(REST.y, h.y + 9, grab); rot = lerp(90, 0, grab); }
      if (t > 3.3) { px = lerp(h.x, SLOT, 1 - seat * 0) ; px = SLOT; py = lerp(h.y + 9, 216, seat); rot = 0; }
      const press = t > 3.45 ? wobble(seg(t, 3.45, 3.9), 2, 6) * 0.8 : 0;
      tf(plug, px, py + press, rot);
      // コード
      const sy = 'M ' + LAMP.x + ' ' + LAMP.y + ' Q ' + ((LAMP.x + px) / 2) + ' ' + Math.min(240, Math.max(LAMP.y, py) + 22) + ' ' + px + ' ' + (py - (rot === 0 ? 8 : -4));
      cord.setAttribute('d', sy);
      // 差し込み火花とランプ点灯
      const sp = seg(t, 3.45, 3.8);
      tf(spark, SLOT, 222, 0, 0.5 + hump(sp));
      spark.setAttribute('opacity', sp > 0 && sp < 1 ? 1 : 0);
      const flick = t > 3.55 ? (t < 3.85 ? (Math.sin(t * 60) > 0 ? 1 : 0.2) : 1) : 0;
      const on = t > 3.55 ? (t < 3.85 ? flick : 1) : 0;
      shade.setAttribute('fill', on > 0.5 ? '#FFE08A' : '#C9D2DE');
      glow.setAttribute('opacity', on);
      rays.setAttribute('opacity', on * (0.6 + 0.4 * Math.sin(t * 6)));
      led.setAttribute('fill', t > 3.45 ? pal.green : pal.red);
    }
  };
}
