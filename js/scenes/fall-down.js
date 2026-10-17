// fall down：積み木の塔がぐらつく→傾く→崩れ落ちて床に散らばる（例文 The tower of blocks fell down.）
import { seg, lerp, easeIn, easeInOut, hump } from '../ease.js';

export const meta = { duration: 3.4, beats: [[0, 'ぐらつく'], [0.95, '倒れる'], [2.2, '崩れ落ちた']] };

export function create(k) {
  const { scene, camera, rbox, C } = k;
  k.ground(0xece6f6, 60);
  const S = 0.7;
  const colors = [C.blue, C.yellow, C.coral, C.mint, 0xa58bf3, C.blue];
  const N = 5;
  const blocks = colors.slice(0, N).map((c) => {
    const m = rbox(S, S, S, 0.09, c);
    scene.add(m);
    return m;
  });
  // 落ちた後の位置（右側へ散らばる）
  const rest = [
    [0.15, 0.2, 0.3],
    [0.95, -0.35, 1.2],
    [1.75, 0.35, 0.5],
    [2.45, -0.15, 2.0],
    [3.1, 0.4, 1.4],
    [3.7, -0.2, 2.8]
  ];
  camera.position.set(1.3, 3.2, 8.2);
  camera.lookAt(1.3, 1.45, 0);
  k.sun.position.set(-2, 9, 6);

  const PX = S / 2; // 倒れるときの支点（右下の角）
  const T_REL = 1.45;
  const tilted = (i, th) => {
    const dx = -PX, dy = S / 2 + S * i;
    return {
      x: PX + dx * Math.cos(th) + dy * Math.sin(th),
      y: -dx * Math.sin(th) + dy * Math.cos(th),
      r: -th
    };
  };
  const thetaAt = (t) => {
    const wob = Math.sin(t * 13) * 0.05 * seg(t, 0, 0.9) * (1 - seg(t, 0.9, 1.05));
    return wob + 0.62 * easeIn(seg(t, 0.95, T_REL));
  };

  return {
    update(t) {
      const th = thetaAt(t);
      blocks.forEach((m, i) => {
        if (t < T_REL) {
          const p = tilted(i, th);
          m.position.set(p.x, p.y, 0);
          m.rotation.set(0, 0, p.r);
          return;
        }
        // 支えを失った後は、それぞれ落ちて床で小さく弾む
        const r0 = tilted(i, thetaAt(T_REL));
        const [xf, zf, rf] = rest[i];
        const t1 = T_REL + 0.42 + i * 0.06;
        const p = seg(t, T_REL, t1);
        const x = lerp(r0.x, xf + (i > 2 ? 0.2 : 0), p);
        const y = lerp(r0.y, S / 2, easeIn(p)) + 0.28 * hump(seg(t, t1, t1 + 0.32)) * (i % 2 ? 1 : 0.6);
        const z = lerp(0, zf, p);
        m.position.set(x, y, z);
        m.rotation.set(zf * 0.5 * hump(p), rf * 0.25 * p, lerp(r0.r, -Math.PI / 2 * Math.round(rf), easeInOut(p)));
      });
    }
  };
}
