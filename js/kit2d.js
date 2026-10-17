// 2D（SVG）シーン用の道具箱。座標系は viewBox 0 0 400 300、地面は y=236 前後。
const NS = 'http://www.w3.org/2000/svg';
export const W = 400;
export const H = 300;

export const pal = {
  ink: '#2A3242',
  sub: '#7A8597',
  line: '#D9DFE7',
  skyTop: '#EAF4FB',
  skyBottom: '#F8FBFD',
  floor: '#EEF1F5',
  floorEdge: '#DDE3EA',
  indoorTop: '#F6F3EE',
  indoorBottom: '#FBFAF7',
  mint: '#5FCDB8',
  mintDark: '#3BAE98',
  coral: '#FF8E77',
  coralDark: '#E86F57',
  blue: '#6AA8F7',
  blueDark: '#4A8BE0',
  yellow: '#FFCF5C',
  yellowDark: '#E9B43A',
  violet: '#A58BF3',
  wood: '#E3C49B',
  woodDark: '#C9A577',
  white: '#FFFFFF',
  paper: '#FFFFFF',
  water: '#8FD3F4',
  coffee: '#8A5A3C',
  milk: '#FFFFFF',
  red: '#F2685B',
  green: '#59C27A',
  shadow: 'rgba(40,52,70,0.13)'
};

let uid = 0;

export function createKit2D(svg) {
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  const defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs);
  const root = document.createElementNS(NS, 'g');
  svg.appendChild(root);

  const el = (tag, attrs = {}, parent = root) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const set = (n, attrs) => {
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const g = (attrs = {}, parent = root) => el('g', attrs, parent);
  // 平行移動・回転・拡大をまとめて指定（回転・拡大の中心は要素のローカル原点）
  const tf = (n, x = 0, y = 0, rot = 0, sx = 1, sy = sx) => {
    n.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`);
    return n;
  };
  const text = (x, y, str, attrs = {}, parent = root) => {
    const t = el('text', {
      x, y,
      'font-family': 'Nunito, "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif',
      'font-weight': 800,
      'font-size': 16,
      fill: pal.ink,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      ...attrs
    }, parent);
    t.textContent = str;
    return t;
  };
  const gradient = (stops, vertical = true) => {
    const id = 'g' + ++uid;
    const lg = el('linearGradient', vertical ? { id, x1: 0, y1: 0, x2: 0, y2: 1 } : { id, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, lg));
    return `url(#${id})`;
  };
  const clip = (shapeFn) => {
    const id = 'c' + ++uid;
    const cp = el('clipPath', { id }, defs);
    shapeFn(cp);
    return `url(#${id})`;
  };

  // 背景：空（屋外）または室内の壁＋床
  const backdrop = ({ floorY = 236, mood = 'outdoor' } = {}) => {
    const top = mood === 'indoor' ? pal.indoorTop : mood === 'evening' ? '#FCE6D6' : pal.skyTop;
    const bottom = mood === 'indoor' ? pal.indoorBottom : mood === 'evening' ? '#FFF5EC' : pal.skyBottom;
    el('rect', { x: 0, y: 0, width: W, height: H, fill: gradient([[0, top], [1, bottom]]) });
    el('rect', { x: 0, y: floorY, width: W, height: H - floorY, fill: pal.floor });
    el('rect', { x: 0, y: floorY, width: W, height: 2, fill: pal.floorEdge });
    return floorY;
  };

  const shadow = (cx, cy, rx, ry = rx * 0.22, parent = root) =>
    el('ellipse', { cx, cy, rx, ry, fill: pal.shadow }, parent);

  // オリジナルキャラクター「まめ」：丸いカプセル形。原点＝足元中央。
  const buddy = ({ color = pal.mint, dark = pal.mintDark, x = 200, y = 236, scale = 1, facing = 1, parent = root } = {}) => {
    const outer = g({}, parent);
    const sh = shadow(0, 0, 30, 6, outer);
    const flip = g({}, outer);
    const legL = el('line', { x1: 0, y1: 0, x2: 0, y2: 15, stroke: dark, 'stroke-width': 10, 'stroke-linecap': 'round' }, g({}, flip));
    const legR = el('line', { x1: 0, y1: 0, x2: 0, y2: 15, stroke: dark, 'stroke-width': 10, 'stroke-linecap': 'round' }, g({}, flip));
    const legLG = legL.parentNode, legRG = legR.parentNode;
    const body = g({}, flip); // 体（傾き・つぶれの単位）
    const armBack = g({}, body);
    el('rect', { x: -30, y: -80, width: 60, height: 80, rx: 28, fill: color }, body);
    el('ellipse', { cx: -9, cy: -58, rx: 10, ry: 16, fill: '#FFFFFF', opacity: 0.22 }, body);
    const face = g({}, body);
    const eyeL = el('ellipse', { cx: -10, cy: -54, rx: 3.6, ry: 5, fill: pal.ink }, face);
    const eyeR = el('ellipse', { cx: 10, cy: -54, rx: 3.6, ry: 5, fill: pal.ink }, face);
    el('circle', { cx: -18, cy: -44, r: 4, fill: '#FF9C8C', opacity: 0.45 }, face);
    el('circle', { cx: 18, cy: -44, r: 4, fill: '#FF9C8C', opacity: 0.45 }, face);
    const mouth = el('path', { d: 'M -5 -43 Q 0 -38 5 -43', stroke: pal.ink, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, face);
    const armFront = g({}, body);
    const mkArm = (parent) => {
      const a = g({}, parent);
      el('line', { x1: 0, y1: 0, x2: 0, y2: 24, stroke: dark, 'stroke-width': 9, 'stroke-linecap': 'round' }, a);
      const hand = el('circle', { cx: 0, cy: 26, r: 6.5, fill: color, stroke: dark, 'stroke-width': 2.5 }, a);
      return { a, hand };
    };
    const armL = mkArm(armBack);
    const armR = mkArm(armFront);
    const mouths = {
      smile: 'M -5 -43 Q 0 -38 5 -43',
      flat: 'M -4.5 -41.5 L 4.5 -41.5',
      sad: 'M -5 -39 Q 0 -44 5 -39',
      open: 'M -4 -43 Q 0 -35 4 -43 Z',
      grin: 'M -7 -44 Q 0 -35 7 -44 Z'
    };
    const st = { x, y, armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, facing };
    const apply = () => {
      tf(outer, st.x, st.y, 0, scale, scale);
      tf(flip, 0, 0, 0, st.facing, 1);
      tf(sh, 0, 0, 0, 1 - st.lift / 160, 1);
      const sw = Math.sin(st.walk) * 26;
      tf(legLG, -12, -14 - st.lift, sw);
      tf(legRG, 12, -14 - st.lift, -sw);
      const bob = Math.abs(Math.sin(st.walk)) * 3;
      // 体：足元（0,-12）を中心に傾け、上下につぶす
      body.setAttribute('transform', `translate(0 ${(-10 - bob - st.lift).toFixed(2)}) rotate(${st.lean.toFixed(2)}) scale(${(2 - st.squash).toFixed(3)} ${st.squash.toFixed(3)})`);
      tf(armL.a, -27, -46, st.armL);
      tf(armR.a, 27, -46, -st.armR);
      const lx = st.look * 6;
      face.setAttribute('transform', `translate(${lx.toFixed(2)} 0)`);
      const ry = 5 * (1 - st.blink);
      eyeL.setAttribute('ry', Math.max(0.6, ry));
      eyeR.setAttribute('ry', Math.max(0.6, ry));
      mouth.setAttribute('d', mouths[st.mood] || mouths.smile);
      mouth.setAttribute('fill', st.mood === 'open' || st.mood === 'grin' ? pal.ink : 'none');
    };
    apply();
    return {
      g: outer, body, armL, armR, mouth,
      // pose({x, y, armL, armR, lean, squash, walk, look, mood, blink, lift, facing})
      pose(p) { Object.assign(st, p); apply(); },
      state: st,
      // 手先のおおよそのワールド座標（体の傾き・つぶれは無視した近似）
      handPos(side = 'R') {
        const ang = ((side === 'R' ? st.armR : st.armL) * Math.PI) / 180;
        const sx = side === 'R' ? 27 : -27;
        const dir = side === 'R' ? 1 : -1;
        const hx = sx + dir * Math.sin(ang) * 26;
        const hy = -46 + Math.cos(ang) * 26 - 10 - st.lift;
        return { x: st.x + hx * st.facing * scale, y: st.y + hy * scale };
      }
    };
  };

  return { svg, root, defs, el, set, g, tf, text, gradient, clip, backdrop, shadow, buddy, pal, W, H };
}
