// 3D シーン用の道具箱。丸みのある素材・やわらかい影・共通キャラクター「まめ」と手のモデル。
import * as THREE from '../vendor/three.js';
export { THREE };

export const C = {
  sky: 0xeaf3fb,
  ground: 0xeef1f5,
  mint: 0x5fcdb8,
  mintDark: 0x3bae98,
  coral: 0xff8e77,
  blue: 0x6aa8f7,
  yellow: 0xffcf5c,
  white: 0xffffff,
  wood: 0xe3c49b,
  woodDark: 0xc9a577,
  ink: 0x2a3242,
  gray: 0xc9d1dc,
  grayDark: 0x9aa5b4,
  road: 0xd5dbe3,
  glass: 0xbfe3f5,
  red: 0xf2685b,
  skin: 0xf4bf9f
};

const matCache = new Map();

export function createKit3D(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.sky);
  scene.fog = new THREE.Fog(C.sky, 18, 42);
  const camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 100);
  camera.position.set(0, 3.2, 9);
  camera.lookAt(0, 1, 0);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd6dbe3, 1.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.9);
  sun.position.set(4, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 5;
  scene.add(sun);
  scene.add(sun.target);

  const mat = (color, opts = {}) => {
    const { unique, ...rest } = opts;
    const key = color + JSON.stringify(rest);
    if (!unique && matCache.has(key)) return matCache.get(key);
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.0, ...rest });
    if (!unique) matCache.set(key, m);
    return m;
  };
  const shade = (mesh, cast = true, receive = true) => {
    mesh.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = cast;
        o.receiveShadow = receive;
      }
    });
    return mesh;
  };
  const rbox = (w, h, d, r, color, opts) => shade(new THREE.Mesh(new THREE.RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2)), mat(color, opts)));
  const sphere = (r, color, opts) => shade(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), mat(color, opts)));
  const capsule = (r, len, color, opts) => shade(new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), mat(color, opts)));
  const cyl = (rt, rb, h, color, opts, seg = 32) => shade(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, opts)));
  const group = (...kids) => {
    const g = new THREE.Group();
    kids.forEach((k) => g.add(k));
    return g;
  };

  // 地面：影だけを受ける大きな面＋色の面
  const ground = (color = C.ground, size = 60) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat(color, { roughness: 0.95 }));
    m.rotation.x = -Math.PI / 2;
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };

  // 手（右手、手のひらが -Y 向き＝下向き）。grip(0..1) で指を曲げる。
  // 原点は手首。指先は +X 方向。
  const hand = (color = C.skin) => {
    const root = new THREE.Group();
    const palm = rbox(0.62, 0.2, 0.56, 0.1, color);
    palm.position.set(0.3, 0, 0);
    root.add(palm);
    const fingers = [];
    const zs = [-0.2, -0.067, 0.067, 0.2];
    zs.forEach((z, i) => {
      const base = new THREE.Group();
      base.position.set(0.6, 0, z);
      const len = i === 0 || i === 3 ? 0.17 : 0.21;
      const s1 = capsule(0.062, len, color);
      s1.rotation.z = Math.PI / 2;
      s1.position.x = len / 2 + 0.03;
      base.add(s1);
      const knuckle = new THREE.Group();
      knuckle.position.x = len + 0.07;
      const s2 = capsule(0.058, len * 0.8, color);
      s2.rotation.z = Math.PI / 2;
      s2.position.x = (len * 0.8) / 2 + 0.03;
      knuckle.add(s2);
      base.add(knuckle);
      root.add(base);
      fingers.push({ base, knuckle });
    });
    const thumb = new THREE.Group();
    thumb.position.set(0.2, -0.02, 0.3);
    const t1 = capsule(0.07, 0.2, color);
    t1.rotation.z = Math.PI / 2;
    t1.position.x = 0.13;
    thumb.add(t1);
    thumb.rotation.y = -0.55;
    root.add(thumb);
    const wrist = capsule(0.2, 0.5, color);
    wrist.rotation.z = Math.PI / 2;
    wrist.position.x = -0.32;
    wrist.scale.set(1, 1, 1.15);
    root.add(wrist);
    root.userData.grip = (p) => {
      fingers.forEach((f) => {
        f.base.rotation.z = -p * 1.15;
        f.knuckle.rotation.z = -p * 1.25;
      });
      thumb.rotation.z = -p * 0.7;
      thumb.rotation.y = -0.55 + p * 0.35;
    };
    root.userData.grip(0);
    return shade(root);
  };

  // キャラクター「まめ」：原点は足元。pose() で姿勢を指定。
  const buddy = (color = C.mint, dark = C.mintDark) => {
    const root = new THREE.Group();
    const hips = new THREE.Group();
    hips.position.y = 0.62;
    root.add(hips);
    const body = new THREE.Group();
    hips.add(body);
    const torso = capsule(0.5, 0.62, color);
    torso.position.y = 0.72;
    body.add(torso);
    const eyeM = mat(C.ink, { roughness: 0.3 });
    const eyes = [];
    [-0.17, 0.17].forEach((x) => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), eyeM);
      e.scale.set(1, 1.35, 0.6);
      e.position.set(x, 1.0, 0.47);
      body.add(e);
      eyes.push(e);
    });
    [-0.3, 0.3].forEach((x) => {
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), mat(0xff9c8c, { roughness: 0.8 }));
      c.scale.set(1, 0.7, 0.3);
      c.position.set(x, 0.86, 0.44);
      body.add(c);
    });
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16, Math.PI), eyeM);
    smile.rotation.z = Math.PI;
    smile.position.set(0, 0.86, 0.49);
    body.add(smile);
    const mkArm = (side) => {
      const sh = new THREE.Group();
      sh.position.set(side * 0.5, 0.78, 0);
      const a = capsule(0.11, 0.36, dark);
      a.position.y = -0.24;
      sh.add(a);
      const h = sphere(0.13, color);
      h.position.y = -0.48;
      sh.add(h);
      sh.rotation.z = side * 0.18;
      body.add(sh);
      return sh;
    };
    const armL = mkArm(-1);
    const armR = mkArm(1);
    const mkLeg = (side) => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.22, 0.08, 0);
      const l = capsule(0.12, 0.44, dark);
      l.position.y = -0.3;
      hip.add(l);
      const foot = rbox(0.24, 0.12, 0.34, 0.06, dark);
      foot.position.set(0, -0.6, 0.06);
      hip.add(foot);
      hips.add(hip);
      return hip;
    };
    const legL = mkLeg(-1);
    const legR = mkLeg(1);
    shade(root);
    // pose: walk(位相rad), sit(0..1), lean(rad), armUpL/R(rad), hop(高さ)
    root.userData.pose = ({ walk = 0, walkAmp = 0, sit = 0, lean = 0, armL: aL = 0, armR: aR = 0, hop = 0, blink = 0 } = {}) => {
      const sw = Math.sin(walk) * 0.55 * walkAmp;
      legL.rotation.x = sw - sit * 1.5;
      legR.rotation.x = -sw - sit * 1.5;
      // 座ると膝から下が前に出る（簡略：足ごと前へ）
      hips.position.y = 0.62 + hop + Math.abs(Math.cos(walk)) * 0.04 * walkAmp - sit * 0.02;
      body.rotation.x = lean;
      armL.rotation.x = -sw * 0.8 - aL;
      armR.rotation.x = sw * 0.8 - aR;
      eyes.forEach((e) => (e.scale.y = 1.35 * (1 - blink * 0.85)));
    };
    root.userData.pose({});
    return root;
  };

  // 簡単な乗り物の箱型ボディ（バス・電車）
  const vehicle = ({ len = 4.6, h = 1.9, w = 1.8, color = C.blue, doorAt = 0.9, windows = 4 } = {}) => {
    const g = new THREE.Group();
    const bodyM = rbox(len, h, w, 0.35, color);
    bodyM.position.y = h / 2 + 0.38;
    g.add(bodyM);
    const glassM = mat(C.glass, { roughness: 0.15, metalness: 0.1 });
    const winW = (len - 1.4) / windows;
    for (let i = 0; i < windows; i++) {
      const x = -len / 2 + 0.55 + i * winW + winW / 2;
      if (Math.abs(x - doorAt) < 0.5) continue;
      const wv = new THREE.Mesh(new THREE.BoxGeometry(winW - 0.18, 0.62, 0.02), glassM);
      wv.position.set(x, h * 0.7 + 0.38, w / 2 + 0.005);
      g.add(wv);
    }
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(len - 0.4, 0.12, 0.02), mat(C.white));
    stripe.position.set(0, 0.85, w / 2 + 0.006);
    g.add(stripe);
    [-len / 2 + 0.9, len / 2 - 0.9].forEach((x) => {
      [-1, 1].forEach((s) => {
        const wh = cyl(0.36, 0.36, 0.3, C.ink, { roughness: 0.8 });
        wh.rotation.x = Math.PI / 2;
        wh.position.set(x, 0.36, s * (w / 2 - 0.08));
        g.add(wh);
      });
    });
    // ドア（左右に開く2枚）
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.4, 0.04), mat(C.glass, { roughness: 0.2 }));
    const doorR = doorL.clone();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.52, 0.03), mat(C.white));
    frame.position.set(doorAt, 0.38 + 0.76 + 0.06, w / 2 + 0.004);
    g.add(frame);
    doorL.position.set(doorAt - 0.22, 0.38 + 0.82, w / 2 + 0.02);
    doorR.position.set(doorAt + 0.22, 0.38 + 0.82, w / 2 + 0.02);
    g.add(doorL, doorR);
    g.userData.door = (p) => {
      doorL.position.x = doorAt - 0.22 - p * 0.42;
      doorR.position.x = doorAt + 0.22 + p * 0.42;
    };
    // ステップ
    const step = rbox(0.9, 0.12, 0.35, 0.05, C.grayDark);
    step.position.set(doorAt, 0.42, w / 2 + 0.1);
    g.add(step);
    return shade(g);
  };

  // 手＋前腕＋袖。原点は手首、前腕は -X 方向へ伸びる。
  const armHand = (S = 1.25, sleeveColor = C.blue) => {
    const rig = new THREE.Group();
    const h = hand(C.skin);
    h.scale.setScalar(S);
    rig.add(h);
    const arm = capsule(0.26, 2.6, C.skin);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(-1.9 * S, 0, 0);
    rig.add(arm);
    const sleeve = capsule(0.34, 1.6, sleeveColor);
    sleeve.rotation.z = Math.PI / 2;
    sleeve.position.set(-3.2 * S, 0, 0);
    rig.add(sleeve);
    shade(rig);
    return { rig, hand: h };
  };

  // 文字を描いた板（標識・看板用）
  const label = (text, { w = 1.6, h = 0.5, bg = '#ffffff', fg = '#2a3242', size = 64 } = {}) => {
    const cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = Math.round((512 * h) / w);
    const c = cv.getContext('2d');
    c.fillStyle = bg;
    c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = fg;
    c.font = `800 ${size}px Nunito, system-ui, sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, cv.width / 2, cv.height / 2 + 4);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
    return m;
  };

  const disposeAll = () => {
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && o.material.map) {
        o.material.map.dispose();
        o.material.dispose();
      }
    });
  };

  return { THREE, scene, camera, sun, hemi, mat, rbox, sphere, capsule, cyl, group, ground, hand, armHand, label, buddy, vehicle, shade, C, disposeAll };
}
