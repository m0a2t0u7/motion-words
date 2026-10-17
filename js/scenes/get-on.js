// get on：バス停でドアの前に来る→ステップを上がって乗り込む→ドアが閉まり、窓に姿が見える（例文 We got on the bus at the station.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'バスの前へ'], [1.45, '乗り込む'], [2.75, '乗った']] };

export function create(k) {
  const { THREE, scene, camera, rbox, cyl, sphere, C, mat } = k;
  k.ground(0xe9edf2, 60);
  // 歩道
  const walk = rbox(14, 0.12, 2.2, 0.04, 0xdfe4ea);
  walk.position.set(0, 0.06, 0.9);
  scene.add(walk);
  // バス
  const bus = k.vehicle({ len: 5.2, color: C.blue, doorAt: 0.9, windows: 4 });
  bus.position.set(0, 0, -0.85);
  // 戸口の暗い部分
  const opening = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.42), mat(0x2f3a4f, { roughness: 1 }));
  opening.position.set(0.9, 0.38 + 0.83, 0.9 + 0.024);
  bus.add(opening);
  // 窓に見える乗客（乗ったあとに現れる）
  const face = new THREE.Group();
  const head = sphere(0.26, C.mint);
  head.scale.set(1, 1.1, 0.6);
  face.add(head);
  [-0.08, 0.08].forEach((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), mat(C.ink));
    e.position.set(x, 0.05, 0.15);
    face.add(e);
  });
  face.position.set(-0.625, 1.66, 0.9);
  bus.add(face);
  scene.add(bus);
  // バス停の標識
  const pole = cyl(0.05, 0.05, 2.0, C.grayDark);
  pole.position.set(3.0, 1.0, 1.6);
  const sign = cyl(0.32, 0.32, 0.06, C.coral);
  sign.rotation.x = Math.PI / 2;
  sign.position.set(3.0, 2.05, 1.6);
  const plate = k.label('BUS', { w: 0.5, h: 0.22, bg: '#ff8e77', fg: '#ffffff', size: 120 });
  plate.position.set(3.0, 2.05, 1.64);
  scene.add(pole, sign, plate);

  const b = k.buddy();
  b.scale.setScalar(0.62);
  scene.add(b);
  camera.position.set(1.3, 3.0, 9.4);
  camera.lookAt(0.7, 1.15, 0);
  k.sun.position.set(3, 9, 7);

  const DOOR_X = 0.9, DOOR_Z = 0.05;
  return {
    update(t) {
      // 右から歩いてくる
      const w = seg(t, 0, 1.25);
      const x = lerp(4.2, DOOR_X, easeOut(w));
      const walking = t < 1.25;
      const turn = easeInOut(seg(t, 1.1, 1.5));
      // ステップを上がって中へ
      const inP = easeInOut(seg(t, 1.5, 2.6));
      const step = Math.sin(Math.PI * seg(t, 1.6, 2.0)) * 0.22 + easeOut(seg(t, 1.75, 2.1)) * 0.3;
      b.position.set(x, step, lerp(0.75, DOOR_Z - 1.1, inP));
      b.rotation.y = lerp(-Math.PI / 2, -Math.PI, turn);
      b.visible = inP < 0.98;
      b.userData.pose({
        walk: walking ? t * 9 : inP > 0 && inP < 1 ? (t - 1.5) * 9 : 0,
        walkAmp: walking ? 1 - easeOut(w) * 0.6 : inP > 0 && inP < 1 ? 0.7 : 0
      });
      // ドア：最初は開いていて、乗ったら閉まる
      bus.userData.door(1 - easeInOut(seg(t, 2.65, 3.15)));
      opening.visible = t < 3.15;
      // 窓に乗客の顔
      const f = backOut(seg(t, 3.15, 3.6));
      face.scale.setScalar(Math.max(0.001, f));
      // 発車前の小さな揺れ
      bus.position.y = Math.sin(Math.PI * seg(t, 3.0, 3.3)) * 0.03;
    }
  };
}
