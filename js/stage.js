// モーション表示部。2D（SVG）と3D（WebGL）を切り替え、シーンの時間 t を管理する。
// シーンは js/scenes/<id>.js を必要になったときだけ読み込む（項目が増えても初期読み込みは軽いまま）。
const modCache = new Map();
const loadScene = (id) => {
  if (!modCache.has(id)) modCache.set(id, import(`./scenes/${id}.js`));
  return modCache.get(id);
};
let kit3dMod = null;
const loadKit3d = () => (kit3dMod ||= import('./kit3d.js'));
let tplMod = null;
const loadTpl = () => (tplMod ||= import('./tpl.js'));
let kit2dMod = null;
const loadKit2d = () => (kit2dMod ||= import('./kit2d.js'));

export class Stage {
  constructor(host, { onBeat = () => {}, onLoading = () => {} } = {}) {
    this.host = host;
    this.onBeat = onBeat;
    this.onLoading = onLoading;
    this.layer = document.createElement('div');
    this.layer.className = 'stage-layer';
    host.appendChild(this.layer);
    this.renderer = null;
    this.canvas = null;
    this.svg = null;
    this.current = null; // { id, kind, meta, inst, k }
    this.mode = 'loop';
    this.t0 = performance.now();
    this.frozen = null;
    this.lastBeat = -1;
    this.loadSeq = 0;
    this.visible = true;
    this.running = false;
    this.hold = 1.5; // ループ時、動作が終わってから次の再生までの間
    this._tick = this._tick.bind(this);
    document.addEventListener('visibilitychange', () => this._wake());
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => {
        this.visible = es[0].isIntersecting;
        this._wake();
      }).observe(host);
    }
    if ('ResizeObserver' in window) new ResizeObserver(() => this._resize()).observe(host);
  }

  get duration() {
    return this.current?.meta?.duration || 3;
  }
  get beats() {
    return this.current?.meta?.beats || [];
  }
  // 現在のシーン時刻（秒）
  get time() {
    if (this.frozen !== null) return this.frozen;
    const raw = (performance.now() - this.t0) / 1000;
    if (this.mode === 'loop') {
      const cyc = this.duration + this.hold;
      return Math.min(raw % cyc, this.duration);
    }
    return Math.min(raw, this.duration);
  }
  // 再生（1回だけ動かして最後の状態で止める）を最初から
  restart(mode = this.mode) {
    this.mode = mode;
    this.frozen = null;
    this.t0 = performance.now();
    this.lastBeat = -1;
    this._wake();
  }
  setMode(mode) {
    if (mode === this.mode) return;
    this.restart(mode);
  }
  // テスト・静止画用：時刻を固定
  seek(t) {
    this.frozen = t;
    this._draw();
  }
  // 動作が最後まで終わるまでの残り秒数
  remaining() {
    return Math.max(0, this.duration - this.time);
  }

  async load(item) {
    const seq = ++this.loadSeq;
    const kind = item.motion;
    if (!kind) {
      this._teardown();
      this._placeholder('この表現のモーションは準備中です');
      return false;
    }
    this.onLoading(true);
    try {
      const isTpl = kind === 'tpl';
      const [mod, kitMod] = await Promise.all([isTpl ? loadTpl() : loadScene(item.id), kind === '3d' ? loadKit3d() : loadKit2d()]);
      if (seq !== this.loadSeq) return false; // 読み込み中に別の項目へ移った
      this._teardown();
      let k;
      if (kind === '3d') {
        this._ensureRenderer(kitMod.THREE);
        if (!this.renderer) {
          this._placeholder('この端末では3D表示を使えません');
          return false;
        }
        k = kitMod.createKit3D(this.renderer);
        this.canvas.style.display = 'block';
      } else {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('class', 'stage-svg');
        this.svg.setAttribute('role', 'img');
        this.svg.setAttribute('aria-label', `${item.en} のモーション`);
        this.layer.appendChild(this.svg);
        k = kitMod.createKit2D(this.svg);
        if (this.canvas) this.canvas.style.display = 'none';
      }
      const inst = isTpl ? mod.create(k, item.tpl || {}) : mod.create(k);
      const meta = isTpl ? mod.metaFor(item.tpl || {}) : mod.meta;
      this.current = { id: item.id, kind: isTpl ? '2d' : kind, meta, inst, k };
      if (kind === '3d') this._resize();
      this.restart(this.mode);
      return true;
    } catch (e) {
      console.error(e);
      if (seq === this.loadSeq) {
        this._teardown();
        this._placeholder('モーションを読み込めませんでした');
      }
      return false;
    } finally {
      if (seq === this.loadSeq) this.onLoading(false);
    }
  }

  _ensureRenderer(THREE) {
    if (this.renderer || this._noGL) return;
    try {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'stage-canvas';
      this.layer.appendChild(this.canvas);
      const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'low-power' });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      r.shadowMap.enabled = true;
      r.shadowMap.type = THREE.PCFSoftShadowMap;
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.05;
      r.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer = r;
      this.canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
      this.canvas.addEventListener('webglcontextrestored', () => this._draw());
    } catch (e) {
      console.warn('WebGL unavailable', e);
      if (this.canvas) this.canvas.remove();
      this.canvas = null;
      this._noGL = true;
      this.renderer = null;
    }
  }

  _teardown() {
    if (this.current?.inst?.dispose) this.current.inst.dispose();
    if (this.current?.kind === '3d') this.current.k.disposeAll();
    this.current = null;
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }
    const ph = this.layer.querySelector('.stage-placeholder');
    if (ph) ph.remove();
  }

  _placeholder(msg) {
    if (this.canvas) this.canvas.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'stage-placeholder';
    d.textContent = msg;
    this.layer.appendChild(d);
    this.onBeat(-1, 0);
  }

  _resize() {
    if (!this.renderer || this.current?.kind !== '3d') return;
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    const cam = this.current.k.camera;
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    this._draw();
  }

  _draw() {
    const c = this.current;
    if (!c) return;
    const t = this.time;
    c.inst.update(t);
    if (c.kind === '3d' && this.renderer) this.renderer.render(c.k.scene, c.k.camera);
    const beats = this.beats;
    let bi = -1;
    for (let i = 0; i < beats.length; i++) if (t >= beats[i][0]) bi = i;
    if (bi !== this.lastBeat) {
      this.lastBeat = bi;
      this.onBeat(bi, t);
    }
  }

  _wake() {
    if (this.running) return;
    if (document.hidden || !this.visible) return;
    this.running = true;
    requestAnimationFrame(this._tick);
  }

  _tick() {
    if (document.hidden || !this.visible) {
      this.running = false;
      return;
    }
    this._draw();
    // 再生モードで動作が終わり、静止した後は描画を止めて電池を節約
    if (this.mode === 'once' && this.frozen === null && this.time >= this.duration) {
      this._draw();
      this.running = false;
      return;
    }
    if (this.frozen !== null) {
      this.running = false;
      return;
    }
    requestAnimationFrame(this._tick);
  }
}
