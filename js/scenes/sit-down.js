// sit down：ベンチの前まで歩く→向きを変える→腰を下ろして座る（例文 She sat down on the bench.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '立っている'], [1.85, '腰を下ろす'], [2.75, '座った']] };

export function create(k) {
  const { THREE, scene, camera, rbox, sphere, cyl, C } = k;
  k.ground(0xe3f0e6, 60);
  // 公園のベンチ
  const bench = new THREE.Group();
  const slats = [0, 1, 2].map((i) => {
    const s = rbox(2.6, 0.08, 0.26, 0.03, C.wood);
    s.position.set(0, 0.3, -0.3 + i * 0.29);
    return s;
  });
  const backs = [0, 1].map((i) => {
    const s = rbox(2.6, 0.22, 0.07, 0.03, C.wood);
    s.position.set(0, 0.62 + i * 0.3, -0.5);
    return s;
  });
  bench.add(...slats, ...backs);
  [-1.1, 1.1].forEach((x) => {
    const f = rbox(0.1, 0.3, 0.8, 0.03, 0x6d7889);
    f.position.set(x, 0.15, -0.05);
    const p = rbox(0.1, 0.75, 0.08, 0.03, 0x6d7889);
    p.position.set(x, 0.62, -0.5);
    bench.add(f, p);
  });
  k.shade(bench);
  bench.position.z = -0.1;
  scene.add(bench);
  // 奥の木
  const trunk = cyl(0.14, 0.18, 1.6, 0xb99572);
  trunk.position.set(2.6, 0.8, -2.2);
  const crown = sphere(1.0, 0x9fd8b4);
  crown.position.set(2.6, 2.1, -2.2);
  scene.add(trunk, crown);

  const b = k.buddy(C.coral, 0xe86f57);
  scene.add(b);
  camera.position.set(1.6, 2.2, 6.4);
  camera.lookAt(-0.2, 0.9, 0);
  k.sun.position.set(-2, 9, 6);

  const SIT_Y = -0.2;
  return {
    update(t) {
      // 歩いてくる（最後はゆっくり止まる）
      const w = seg(t, 0, 1.45);
      const x = lerp(-3.4, -0.2, easeOut(w));
      const walking = t < 1.45;
      // 向きを変える（横向き→正面）
      const turn = easeInOut(seg(t, 1.35, 1.85));
      // 腰を下ろす：後ろへ下がりながら低くなる
      const s = easeInOut(seg(t, 1.85, 2.75));
      const land = wobble(seg(t, 2.72, 3.4), 1.3, 5) * 0.035;
      b.position.set(x, lerp(0, SIT_Y, s) + (s >= 1 ? land : 0), lerp(0.55, -0.05, s));
      b.rotation.y = lerp(Math.PI / 2, 0, turn);
      b.userData.pose({
        walk: walking ? t * 9 : 0,
        walkAmp: walking ? 1 - easeOut(w) * 0.6 : 0,
        sit: s,
        lean: Math.sin(Math.PI * s) * 0.32,
        armL: Math.sin(Math.PI * s) * 0.45,
        armR: Math.sin(Math.PI * s) * 0.45,
        blink: t > 3.1 && t < 3.22 ? 1 : 0
      });
    }
  };
}
