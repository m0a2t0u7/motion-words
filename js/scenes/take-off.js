// take off：滑走路を加速→車輪が地面を離れる→機首を上げて空へ上がる（例文 The plane took off on time.）
import { seg, easeInOut, smooth, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '走り出す'], [1.7, '地面を離れる'], [2.6, '空へ上がる']] };

export function create(k) {
  const { THREE, scene, camera, rbox, sphere, capsule, cyl, C, mat } = k;
  k.ground(0xe4f1e8, 120);
  // 滑走路と白線
  const runway = rbox(70, 0.04, 3.2, 0.02, 0xcfd6df);
  runway.position.set(20, 0.02, 0);
  scene.add(runway);
  for (let x = -12; x < 55; x += 2.4) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.01, 0.14), mat(C.white));
    d.position.set(x, 0.05, 0);
    d.receiveShadow = true;
    scene.add(d);
  }
  // 奥の木（速度感の手がかり）
  for (let i = 0; i < 22; i++) {
    const x = -14 + i * 3.1 + ((i * 37) % 7) * 0.2;
    const z = -6 - ((i * 13) % 5) * 0.6;
    const tree = sphere(0.7 + ((i * 7) % 3) * 0.15, 0x9fd8b4);
    tree.position.set(x, 0.8, z);
    scene.add(tree);
  }
  // 雲
  const clouds = [];
  [[2, 6.5, -8], [9, 8, -10], [16, 7, -9], [-4, 7.5, -10]].forEach(([x, y, z]) => {
    const c = new THREE.Group();
    [[0, 0, 1.1], [1.1, -0.2, 0.8], [-1, -0.25, 0.75]].forEach(([dx, dy, r]) => {
      const s = sphere(r, C.white, { roughness: 1 });
      s.castShadow = false;
      s.position.set(dx, dy, 0);
      c.add(s);
    });
    c.position.set(x, y, z);
    scene.add(c);
    clouds.push(c);
  });

  // 飛行機（丸みのあるおもちゃ風）
  const plane = new THREE.Group();
  const body = capsule(0.42, 2.6, C.white);
  body.rotation.z = Math.PI / 2;
  plane.add(body);
  const stripe = capsule(0.425, 2.3, C.blue);
  stripe.rotation.z = Math.PI / 2;
  stripe.scale.set(1, 1, 0.2);
  stripe.position.set(0, -0.05, 0.24);
  plane.add(stripe);
  const wing = rbox(0.95, 0.1, 3.4, 0.05, C.white);
  wing.position.set(0.1, -0.12, 0);
  plane.add(wing);
  const tailFin = rbox(0.55, 0.7, 0.1, 0.05, C.coral);
  tailFin.position.set(-1.5, 0.5, 0);
  tailFin.rotation.z = 0.3;
  plane.add(tailFin);
  const stab = rbox(0.5, 0.08, 1.3, 0.04, C.coral);
  stab.position.set(-1.6, 0.12, 0);
  plane.add(stab);
  [-0.95, 0.95].forEach((z) => {
    const eng = cyl(0.17, 0.17, 0.55, C.gray);
    eng.rotation.z = Math.PI / 2;
    eng.position.set(0.25, -0.33, z);
    plane.add(eng);
  });
  for (let i = 0; i < 6; i++) {
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), mat(0x5b6880, { roughness: 0.3 }));
    w.position.set(0.85 - i * 0.32, 0.12, 0.4);
    w.scale.set(1, 1.2, 0.4);
    plane.add(w);
  }
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10), mat(0x5b6880, { roughness: 0.25 }));
  cockpit.position.set(1.45, 0.16, 0);
  cockpit.scale.set(0.8, 0.6, 1.6);
  plane.add(cockpit);
  const gear = new THREE.Group();
  [[0.95, 0], [-0.25, 0.42], [-0.25, -0.42]].forEach(([x, z]) => {
    const strut = cyl(0.04, 0.04, 0.3, C.grayDark);
    strut.position.set(x, -0.45, z);
    const wheel = cyl(0.12, 0.12, 0.09, C.ink);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, -0.6, z);
    gear.add(strut, wheel);
  });
  plane.add(gear);
  k.shade(plane);
  scene.add(plane);

  const GROUND_Y = 0.72; // 車輪が滑走路に接する高さ
  const T_LIFT = 1.7;
  // 位置：等加速度で走り、離陸後も同じ速さで進む
  const A = 3.0;
  const xAt = (t) => (t < T_LIFT ? -4 + 0.5 * A * t * t : -4 + 0.5 * A * T_LIFT * T_LIFT + A * T_LIFT * (t - T_LIFT) * 1.0 + 0.4 * (t - T_LIFT) * (t - T_LIFT));

  return {
    update(t) {
      const x = xAt(t);
      const air = Math.max(0, t - T_LIFT);
      const y = GROUND_Y + 1.15 * Math.pow(air, 1.55);
      // 機首上げ：離陸直前から
      const pitch = 0.2 * smooth(seg(t, T_LIFT - 0.35, T_LIFT + 0.4)) - 0.06 * smooth(seg(t, 3.4, 4.2));
      plane.position.set(x, y, 0);
      plane.rotation.z = pitch;
      // 滑走中の細かな振動
      if (t < T_LIFT) plane.position.y += Math.sin(t * 60) * 0.006 * clamp(t);
      // 離陸後に車輪をしまう
      const g = 1 - easeInOut(seg(t, T_LIFT + 0.7, T_LIFT + 1.3));
      gear.scale.set(1, Math.max(0.001, g), 1);
      gear.position.y = (1 - g) * 0.25;
      // カメラは機体を追いかけ、高度は半分だけ追う（地面が遠ざかって見える）
      const camX = x * 0.92 + 0.6;
      const camY = (y - GROUND_Y) * 0.55;
      camera.position.set(camX - 1.6, 3.4 + camY, 11.5);
      camera.lookAt(camX, 1.15 + camY * 1.05, 0);
      // 影が機体を追うように光源も移動
      k.sun.position.set(x + 3, 10, 6);
      k.sun.target.position.set(x, 0, 0);
    }
  };
}
