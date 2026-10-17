// pick out：並んだリンゴの上を手が見比べて動く→いちばん大きいリンゴを選んで取り出す（例文 He picked out the biggest apple.）
import { seg, lerp, easeInOut, smooth, wobble } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '並んでいる'], [0.5, '見比べる'], [2.3, '選び出す']] };

export function create(k) {
  const { THREE, scene, camera, rbox, sphere, cyl, C, mat } = k;
  k.ground(0xe9edf2, 60);
  const top = rbox(7, 0.16, 3, 0.06, C.wood);
  top.position.y = 0.92;
  scene.add(top);
  const TOP = 1.0;

  // リンゴ（大きさを変えて5個。4番目がいちばん大きい）
  const sizes = [0.3, 0.34, 0.28, 0.46, 0.32];
  const colors = [0xe85d4f, 0x9ccc65, 0xe85d4f, 0xe24a3b, 0xf28a52];
  const xs = [-2.0, -1.1, -0.3, 0.75, 1.85];
  const apples = sizes.map((r, i) => {
    const g = new THREE.Group();
    const body = sphere(r, colors[i], { roughness: 0.45 });
    body.scale.set(1, 0.9, 1);
    g.add(body);
    const stem = cyl(0.02, 0.025, r * 0.45, 0x7a5a3a);
    stem.position.y = r * 0.95;
    stem.rotation.z = 0.2;
    g.add(stem);
    const leaf = sphere(r * 0.22, 0x6cbf5b);
    leaf.scale.set(1.4, 0.3, 0.7);
    leaf.position.set(r * 0.22, r * 1.0, 0);
    leaf.rotation.z = -0.4;
    g.add(leaf);
    k.shade(g);
    g.position.set(xs[i], TOP + r * 0.9, 0);
    scene.add(g);
    return g;
  });
  // 選んだリンゴの足元に、選ばれたことを示す輪
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.58, 40), new THREE.MeshBasicMaterial({ color: 0x0e9f8a, transparent: true, opacity: 0 }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(xs[3], TOP + 0.01, 0);
  scene.add(ring);

  const S = 0.95;
  const { rig, hand } = k.armHand(S, C.blue);
  scene.add(rig);
  camera.position.set(0, 3.6, 6.4);
  camera.lookAt(0, 1.2, 0);
  k.sun.position.set(1, 9, 5);

  const PICK = 3;
  const R = sizes[PICK];
  const off = R * 0.8 - 0.6 * S;
  const palm = 0.1 * S;
  const hoverY = TOP + 1.15;

  return {
    update(t) {
      // 1) リンゴの上を左から右へ見比べる（途中で小さく止まる）
      const scan = easeInOut(seg(t, 0.3, 1.9));
      const pause = Math.sin(scan * Math.PI * 4) * 0.12;
      let hx = lerp(xs[0] - 0.6, xs[4] + 0.1, scan) - 0.5 + pause * 0.4;
      let hy = hoverY + Math.sin(scan * Math.PI * 4) * 0.06;
      // 2) いちばん大きいリンゴの上に戻って下ろす
      const back = easeInOut(seg(t, 1.9, 2.4));
      const target = xs[PICK] + off;
      hx = lerp(hx, target, back);
      const down = easeInOut(seg(t, 2.35, 2.75));
      const graspY = TOP + R * 0.9 + R * 0.9 + palm;
      hy = lerp(hy, graspY, down);
      // 3) つかんで持ち上げる
      const g = smooth(seg(t, 2.7, 2.95));
      const up = easeInOut(seg(t, 3.0, 3.8));
      hy += up * 1.0;
      if (t < 0.3) {
        hx = xs[0] - 1.1;
        hy = hoverY + 0.5 * (1 - seg(t, 0, 0.3));
      }
      rig.position.set(hx, hy, 0.05);
      rig.rotation.z = -0.18;
      hand.userData.grip(g * 0.9);
      const a = apples[PICK];
      if (g > 0.5) a.position.set(hx - off, hy - palm - R * 0.9, 0.05);
      else a.position.set(xs[PICK], TOP + R * 0.9, 0);
      a.rotation.z = up * 0.15 + wobble(seg(t, 3.8, 4.2), 1, 5) * 0.05;
      ring.material.opacity = 0.55 * smooth(seg(t, 2.0, 2.4)) * (1 - smooth(seg(t, 3.2, 3.6)));
    }
  };
}
