// hit the road：朝、荷物を車に積む→エンジンがかかる→道路へ走り出して出発する（例文 We should hit the road early tomorrow.）
import { seg, lerp, easeIn, wobble } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '荷物を積む'], [1.3, '走り出す'], [2.6, '出発した']] };

export function create(k) {
  const { THREE, scene, camera, rbox, cyl, sphere, C, mat } = k;
  // 朝の空
  scene.background = new THREE.Color(0xfde8d7);
  scene.fog = new THREE.Fog(0xfde8d7, 16, 40);
  k.hemi.color = new THREE.Color(0xfff1e4);
  k.ground(0xe6eedf, 120);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffc27a }));
  sun.position.set(9, 2.2, -22);
  scene.add(sun);
  // 道路
  const road = rbox(80, 0.04, 2.6, 0.02, 0xcfd5de);
  road.position.set(20, 0.02, 0.4);
  scene.add(road);
  for (let x = -20; x < 60; x += 2.2) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.01, 0.1), mat(C.white));
    d.position.set(x, 0.045, 0.4);
    scene.add(d);
  }
  // 家
  const house = new THREE.Group();
  const wall = rbox(2.6, 1.8, 2.0, 0.08, 0xfbe9dc);
  wall.position.y = 0.9;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.1, 4), mat(C.coral));
  roof.position.y = 2.35;
  roof.rotation.y = Math.PI / 4;
  const door = rbox(0.6, 1.0, 0.05, 0.04, C.blue);
  door.position.set(0.5, 0.5, 1.02);
  house.add(wall, roof, door);
  k.shade(house);
  house.position.set(-2.2, 0, -2.6);
  scene.add(house);
  // 道ばたの木
  [[0.4, -2.9], [3.5, -2.8], [6.4, -2.4], [9, -2.9], [13, -2.5]].forEach(([x, z]) => {
    const tr = sphere(0.6, 0x9fd8b4);
    tr.position.set(x, 0.7, z);
    scene.add(tr);
  });

  // 車（屋根にスーツケース）
  const car = new THREE.Group();
  const body = rbox(2.3, 0.62, 1.3, 0.25, C.mint);
  body.position.y = 0.62;
  const cabin = rbox(1.3, 0.58, 1.16, 0.25, C.mint);
  cabin.position.set(-0.2, 1.08, 0);
  const glass = rbox(1.14, 0.4, 1.18, 0.18, C.glass, { roughness: 0.15 });
  glass.position.set(-0.2, 1.1, 0);
  const rack = rbox(1.1, 0.05, 1.0, 0.02, 0x6d7889);
  rack.position.set(-0.2, 1.4, 0);
  car.add(body, cabin, glass, rack);
  const wheels = [];
  [[-0.72, 0.62], [0.72, 0.62], [-0.72, -0.62], [0.72, -0.62]].forEach(([x, z]) => {
    const w = new THREE.Group();
    const tire = cyl(0.3, 0.3, 0.22, C.ink);
    tire.rotation.x = Math.PI / 2;
    const spoke = rbox(0.42, 0.06, 0.24, 0.02, C.gray);
    w.add(tire, spoke);
    w.position.set(x, 0.3, z);
    car.add(w);
    wheels.push(w);
  });
  const bag = new THREE.Group();
  const case1 = rbox(0.9, 0.42, 0.6, 0.08, C.coral);
  const handle = rbox(0.3, 0.06, 0.06, 0.03, C.ink);
  handle.position.y = 0.24;
  bag.add(case1, handle);
  car.add(bag);
  k.shade(car);
  scene.add(car);
  // 排気の煙
  const puffs = [0, 1, 2].map(() => {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    scene.add(p);
    return p;
  });

  camera.position.set(2.0, 3.4, 12.5);
  camera.lookAt(2.0, 1.0, 0);
  k.sun.position.set(6, 9, 6);

  const X0 = -0.8;
  const T_GO = 1.5;
  // 出発後は加速して右へ（camera は固定）
  const xAt = (t) => X0 + (t > T_GO ? 1.25 * Math.pow(t - T_GO, 1.7) : 0);

  return {
    update(t) {
      // スーツケースが屋根に載る
      const drop = seg(t, 0.1, 0.75);
      bag.position.set(-0.2, lerp(2.8, 1.64, easeIn(drop)) + (drop >= 1 ? wobble(seg(t, 0.75, 1.2), 1.5, 6) * 0.05 : 0), 0);
      bag.visible = t > 0.1;
      // エンジン始動の小さな揺れ
      const shake = t > 1.05 && t < T_GO ? Math.sin(t * 70) * 0.012 : 0;
      const x = xAt(t);
      car.position.set(x, shake, 0.45);
      car.rotation.z = t > T_GO ? 0.04 * Math.exp(-(t - T_GO) * 3) * Math.sin((t - T_GO) * 9) : 0;
      wheels.forEach((w) => (w.rotation.z = -(x - X0) / 0.3));
      puffs.forEach((p, i) => {
        const q = seg(t, 1.1 + i * 0.18, 1.9 + i * 0.18);
        p.material.opacity = q > 0 && q < 1 ? 0.7 * (1 - q) : 0;
        p.position.set(xAt(1.1 + i * 0.18) - 1.3 - q * 0.6, 0.35 + q * 0.4, 0.45);
        p.scale.setScalar(0.6 + q * 1.4);
      });
    }
  };
}
