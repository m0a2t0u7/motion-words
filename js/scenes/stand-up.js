// stand up：いすに座っている→前かがみになる→体を起こして立ち上がる（例文 Please stand up.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 3.4, beats: [[0, '座っている'], [0.75, '前かがみになる'], [1.25, '立ち上がる']] };

export function chair(k, color) {
  const { THREE, rbox } = k;
  const g = new THREE.Group();
  const seat = rbox(1.15, 0.12, 0.95, 0.05, color);
  seat.position.y = 0.26;
  const back = rbox(1.15, 0.95, 0.12, 0.05, color);
  back.position.set(0, 0.78, -0.42);
  g.add(seat, back);
  [[-0.48, -0.38], [0.48, -0.38], [-0.48, 0.38], [0.48, 0.38]].forEach(([x, z]) => {
    const l = rbox(0.09, 0.26, 0.09, 0.03, k.C.woodDark);
    l.position.set(x, 0.12, z);
    g.add(l);
  });
  return k.shade(g);
}

export function create(k) {
  const { scene, camera, C } = k;
  k.ground(0xe9edf2, 60);
  const c = chair(k, C.wood);
  c.position.set(0, 0, -0.2);
  scene.add(c);
  const b = k.buddy();
  scene.add(b);

  camera.position.set(4.4, 1.9, 3.6);
  camera.lookAt(0, 1.0, 0);
  k.sun.position.set(-3, 9, 6);

  const SIT_Y = -0.2, SIT_Z = -0.2;
  return {
    update(t) {
      const lean = easeInOut(seg(t, 0.6, 1.15));
      const rise = easeInOut(seg(t, 1.15, 2.05));
      const sit = 1 - rise;
      const settle = wobble(seg(t, 2.05, 2.8), 1.2, 5) * 0.04;
      b.position.set(0, lerp(SIT_Y, 0, rise) + Math.max(0, settle), lerp(SIT_Z, 0.45, easeOut(rise)));
      b.userData.pose({
        sit,
        lean: lean * 0.55 * (1 - rise) + Math.sin(Math.PI * rise) * 0.18,
        armL: lean * 0.7 * (1 - rise) + Math.sin(Math.PI * rise) * 0.35,
        armR: lean * 0.7 * (1 - rise) + Math.sin(Math.PI * rise) * 0.35,
        blink: t > 0.25 && t < 0.38 ? 1 : 0
      });
    }
  };
}
