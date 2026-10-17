// slow down：速く走る車が、横断歩道の手前でだんだん減速し、止まらずにゆっくり進む（例文 The car slowed down at the crosswalk.）
import { seg, lerp, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '速く走る'], [1.0, '減速する'], [2.9, 'ゆっくり進む']] };

// 速度（1単位/秒 = 10km/h として表示）
const V0 = 6.0, V1 = 1.1, TA = 1.0, TB = 2.9;
const speedAt = (t) => {
  if (t < TA) return V0;
  if (t < TB) {
    const p = (t - TA) / (TB - TA);
    return lerp(V0, V1, 1 - (1 - p) * (1 - p)); // 最初は強く、最後はなめらかに減速
  }
  return V1;
};
// 位置＝速度の積分（数値積分を事前計算）
const DT = 0.01;
const table = [0];
for (let t = DT; t <= 6; t += DT) table.push(table[table.length - 1] + speedAt(t) * DT);
const posAt = (t) => {
  const i = clamp(t / DT, 0, table.length - 1);
  const a = Math.floor(i);
  return lerp(table[a], table[Math.min(a + 1, table.length - 1)], i - a);
};

export function create(k) {
  const { THREE, scene, camera, rbox, cyl, C, mat } = k;
  k.ground(0xe2efe5, 140);
  const X0 = -9;
  const endX = X0 + posAt(4.2);
  // 道路と中央線
  const road = rbox(120, 0.04, 3.4, 0.02, 0xcfd5de);
  road.position.set(20, 0.02, 0);
  scene.add(road);
  for (let x = -30; x < 60; x += 2.2) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.01, 0.12), mat(C.white));
    d.position.set(x, 0.045, 0);
    scene.add(d);
  }
  // 横断歩道（車が最後に近づいていく位置）
  const CW = endX + 1.9;
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.012, 0.3), mat(C.white));
    s.position.set(CW + 0.45, 0.046, -1.5 + i * 0.5);
    scene.add(s);
  }
  // 道ばたの木（速さの手がかり）
  for (let i = 0; i < 26; i++) {
    const x = -24 + i * 2.1;
    const tr = k.sphere(0.55 + (i % 3) * 0.12, 0x9fd8b4);
    tr.position.set(x, 0.65, -3.0 - (i % 2) * 0.7);
    scene.add(tr);
  }

  // 車
  const car = new THREE.Group();
  const body = rbox(2.3, 0.62, 1.3, 0.25, C.coral);
  body.position.y = 0.62;
  const cabin = rbox(1.25, 0.6, 1.16, 0.25, C.coral);
  cabin.position.set(-0.2, 1.1, 0);
  const glass = rbox(1.1, 0.42, 1.18, 0.18, C.glass, { roughness: 0.15 });
  glass.position.set(-0.2, 1.12, 0);
  const light = rbox(0.08, 0.14, 0.3, 0.04, 0xfff3c4);
  light.position.set(1.15, 0.7, 0.38);
  const light2 = light.clone();
  light2.position.z = -0.38;
  car.add(body, cabin, glass, light, light2);
  const wheels = [];
  [[-0.72, 0.62], [0.72, 0.62], [-0.72, -0.62], [0.72, -0.62]].forEach(([x, z]) => {
    const w = new THREE.Group();
    const tire = cyl(0.3, 0.3, 0.22, C.ink);
    tire.rotation.x = Math.PI / 2;
    const hub = cyl(0.12, 0.12, 0.23, C.white);
    hub.rotation.x = Math.PI / 2;
    const spoke = rbox(0.42, 0.06, 0.24, 0.02, C.gray);
    w.add(tire, hub, spoke);
    w.position.set(x, 0.3, z);
    car.add(w);
    wheels.push(w);
  });
  k.shade(car);
  scene.add(car);

  // スピードメーター（画面右下に固定）
  scene.add(camera);
  const hud = new THREE.Group();
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = 'rgba(255,255,255,0.92)';
  c.beginPath();
  c.arc(128, 140, 118, Math.PI, 0);
  c.lineTo(246, 190);
  c.lineTo(10, 190);
  c.closePath();
  c.fill();
  c.lineWidth = 16;
  c.lineCap = 'round';
  c.strokeStyle = '#d9dfe7';
  c.beginPath();
  c.arc(128, 140, 92, Math.PI * 1.05, Math.PI * 1.95);
  c.stroke();
  c.fillStyle = '#2a3242';
  c.font = '800 34px Nunito, sans-serif';
  c.textAlign = 'center';
  c.fillText('km/h', 128, 182);
  c.font = '800 26px Nunito, sans-serif';
  c.fillText('0', 36, 176);
  c.fillText('60', 220, 176);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false }));
  dial.renderOrder = 10;
  hud.add(dial);
  const needle = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.06), new THREE.MeshBasicMaterial({ color: 0xe86f57, depthTest: false, transparent: true }));
  needle.geometry.translate(0.15, 0, 0);
  needle.renderOrder = 11;
  needle.position.set(0, -0.042, 0.001);
  hud.add(needle);
  hud.position.set(1.02, -0.66, -4);
  camera.add(hud);

  return {
    update(t) {
      const x = X0 + posAt(t);
      car.position.set(x, 0, 0.75);
      wheels.forEach((w) => (w.rotation.z = -x / 0.3));
      // 減速時は少し前に沈む
      const decel = t > TA && t < TB ? 1 - Math.abs((t - (TA + TB) / 2) / ((TB - TA) / 2)) : 0;
      car.rotation.z = -0.025 * decel;
      // カメラは車を追う
      camera.position.set(x - 0.6, 3.0, 8.4);
      camera.lookAt(x + 0.8, 0.8, 0);
      k.sun.position.set(x + 3, 10, 6);
      k.sun.target.position.set(x, 0, 0);
      // メーター：0〜60km/h を左右180度に
      const kmh = speedAt(t) * 10;
      needle.rotation.z = Math.PI - (kmh / 60) * Math.PI;
    }
  };
}
