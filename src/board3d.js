import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { diffPieces } from './pieces.js';

const FILES = 'abcdefgh';
const TAU = Math.PI * 2;

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

/* ---------- piece modelling ---------- */
function arc(cx, cy, r, a0, a1, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return pts;
}
const BASE = [[0, 0], [0.36, 0], [0.37, 0.03], [0.36, 0.07], [0.33, 0.09], [0.33, 0.12], [0.29, 0.15], [0.24, 0.17]];

function lathe(points, seg = 40) {
  const v = points.map(p => new THREE.Vector2(Math.max(0, p[0]), p[1]));
  const g = new THREE.LatheGeometry(v, seg);
  g.computeVertexNormals();
  return g;
}

function buildGeometries() {
  const G = {};
  // Pawn
  G.P = [lathe([...BASE, [0.2, 0.2], [0.15, 0.3], [0.12, 0.38], [0.2, 0.4], [0.2, 0.43], [0.12, 0.45], ...arc(0, 0.57, 0.15, -Math.PI / 2 + 0.55, Math.PI / 2, 10)])];
  // Rook
  G.R = [lathe([...BASE, [0.24, 0.2], [0.2, 0.26], [0.2, 0.58], [0.25, 0.62], [0.27, 0.66], [0.27, 0.76], [0.19, 0.76], [0.19, 0.7], [0, 0.7]])];
  const merlon = new THREE.BoxGeometry(0.1, 0.08, 0.1);
  for (let i = 0; i < 6; i++) {
    const m = merlon.clone(); const a = i / 6 * TAU;
    m.rotateY(-a); m.translate(Math.cos(a) * 0.225, 0.8, Math.sin(a) * 0.225);
    G.R.push(m);
  }
  // Bishop
  G.B = [lathe([...BASE, [0.2, 0.22], [0.14, 0.36], [0.11, 0.52], [0.2, 0.55], [0.2, 0.59], [0.12, 0.61],
    [0.16, 0.66], [0.18, 0.72], [0.17, 0.8], [0.13, 0.88], [0.06, 0.94], [0.03, 0.96], ...arc(0, 1.0, 0.045, -Math.PI / 2 + 0.6, Math.PI / 2, 6)])];
  // Queen
  G.Q = [lathe([...BASE, [0.21, 0.22], [0.15, 0.38], [0.12, 0.6], [0.21, 0.64], [0.21, 0.68], [0.13, 0.7],
    [0.16, 0.8], [0.22, 0.92], [0.25, 0.96], [0.2, 0.98], [0.12, 1.02], ...arc(0, 1.07, 0.06, -Math.PI / 2 + 0.5, Math.PI / 2, 6)])];
  const bead = new THREE.SphereGeometry(0.04, 12, 8);
  for (let i = 0; i < 9; i++) { const b = bead.clone(); const a = i / 9 * TAU; b.translate(Math.cos(a) * 0.235, 0.985, Math.sin(a) * 0.235); G.Q.push(b); }
  // King
  G.K = [lathe([...BASE, [0.22, 0.22], [0.16, 0.38], [0.13, 0.64], [0.22, 0.68], [0.22, 0.72], [0.14, 0.74],
    [0.17, 0.84], [0.22, 0.96], [0.2, 1.0], [0.12, 1.04], [0.08, 1.06], [0, 1.07]])];
  const cv = new THREE.BoxGeometry(0.07, 0.24, 0.07); cv.translate(0, 1.18, 0);
  const ch = new THREE.BoxGeometry(0.19, 0.065, 0.07); ch.translate(0, 1.2, 0);
  G.K.push(cv, ch);
  // Knight: turned base + extruded head
  G.N = [lathe([...BASE, [0.24, 0.2], [0.22, 0.24], [0, 0.24]])];
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0.2);
  s.lineTo(0.2, 0.2);
  s.quadraticCurveTo(0.21, 0.34, 0.08, 0.46);
  s.quadraticCurveTo(0.22, 0.5, 0.31, 0.56);
  s.quadraticCurveTo(0.37, 0.64, 0.3, 0.7);
  s.quadraticCurveTo(0.2, 0.8, 0.06, 0.86);
  s.lineTo(0.04, 0.98);
  s.lineTo(-0.04, 0.88);
  s.quadraticCurveTo(-0.2, 0.84, -0.24, 0.62);
  s.quadraticCurveTo(-0.27, 0.4, -0.2, 0.2);
  const head = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3, curveSegments: 10 });
  head.translate(0, 0, -0.1);
  G.N.push(head);
  return G;
}

/* ---------- procedural textures ---------- */
function woodTexture(base, seed) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  let r = seed * 9301 + 49297;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 70; i++) {
    const y0 = rnd() * 256, amp = 2 + rnd() * 5, freq = 0.01 + rnd() * 0.02, ph = rnd() * 6;
    g.strokeStyle = rnd() > 0.5 ? `rgba(0,0,0,${0.03 + rnd() * 0.05})` : `rgba(255,255,255,${0.02 + rnd() * 0.04})`;
    g.lineWidth = 0.6 + rnd() * 1.6;
    g.beginPath();
    for (let x = 0; x <= 256; x += 8) { const y = y0 + Math.sin(x * freq + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function radialTexture(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, inner); grd.addColorStop(0.55, inner.replace(/[\d.]+\)$/, m => (parseFloat(m) * 0.45).toFixed(3) + ')')); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function labelTexture(color, flipped) {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  const unit = S / 9.2, off = 0.6 * unit;
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 ${unit * 0.3}px "Inter Tight", system-ui, sans-serif`;
  const put = (txt, x, y) => {
    g.save(); g.translate(x, y); if (flipped) g.rotate(Math.PI); g.fillText(txt, 0, 0); g.restore();
  };
  for (let i = 0; i < 8; i++) {
    const x = off + (i + 0.5) * unit;
    // files on the edge nearest the player, ranks on the player's left
    if (!flipped) { put(FILES[i], x, S - off / 2); put(String(8 - i), off / 2, x); }
    else { put(FILES[i], x, off / 2); put(String(8 - i), S - off / 2, x); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/* ---------- the view ---------- */
export class Board3D {
  constructor(el, ctrl, theme) {
    this.el = el; this.ctrl = ctrl;
    this.orientation = 'w';
    this.pieces = []; // {id, piece, sq, obj}
    this.nextId = 1;
    this.anims = [];
    this.dirty = true;
    this.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.classList.add('board3d');
    el.appendChild(renderer.domElement);

    const scene = this.scene = new THREE.Scene();
    const cam = this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    cam.position.set(0, 10.4, 8.6);

    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2018, 0.9));
    const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
    key.position.set(-4, 10, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -6.5, right: 6.5, top: 6.5, bottom: -6.5, near: 1, far: 30 });
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fb4ff, 0.7); rim.position.set(5, 6, -6); scene.add(rim);

    // board
    this.boardGroup = new THREE.Group(); scene.add(this.boardGroup);
    this.tileMat = {
      light: new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0 }),
      dark: new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0 })
    };
    const tileGeo = new THREE.BoxGeometry(1, 0.14, 1);
    for (let i = 0; i < 64; i++) {
      const isDark = ((i >> 3) + (i & 7)) % 2 === 1;
      const m = new THREE.Mesh(tileGeo, isDark ? this.tileMat.dark : this.tileMat.light);
      m.position.set((i & 7) - 3.5, -0.07, (i >> 3) - 3.5);
      if (i % 3 === 1) m.rotation.y = Math.PI / 2; // vary grain direction
      m.receiveShadow = true;
      this.boardGroup.add(m);
    }
    this.frameMat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.05 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(9.3, 0.34, 9.3), this.frameMat);
    frame.position.y = -0.19; frame.receiveShadow = true; frame.castShadow = true;
    this.boardGroup.add(frame);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(8.12, 0.15, 8.12), new THREE.MeshStandardMaterial({ color: 0xc9a15b, roughness: 0.3, metalness: 0.8 }));
    trim.position.y = -0.085; this.boardGroup.add(trim);
    this.labels = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 9.2), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
    this.labels.rotation.x = -Math.PI / 2; this.labels.position.y = -0.018;
    this.boardGroup.add(this.labels);

    // table + soft contact shadow
    const table = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.ShadowMaterial({ opacity: 0.35 }));
    table.rotation.x = -Math.PI / 2; table.position.y = -0.36; table.receiveShadow = true;
    scene.add(table);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 12.5), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.5)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = -0.355; scene.add(glow);

    // square overlays
    this.overlays = [];
    const ovGeo = new THREE.PlaneGeometry(1, 1);
    const dotGeo = new THREE.CircleGeometry(0.15, 32);
    const ringGeo = new THREE.RingGeometry(0.38, 0.47, 48);
    this.checkTex = radialTexture('rgba(255,70,60,0.95)', 'rgba(255,70,60,0)');
    for (let i = 0; i < 64; i++) {
      const pos = new THREE.Vector3((i & 7) - 3.5, 0.004, (i >> 3) - 3.5);
      const ov = new THREE.Mesh(ovGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
      ov.rotation.x = -Math.PI / 2; ov.position.copy(pos); ov.visible = false; ov.renderOrder = 1;
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0x14202e, transparent: true, opacity: 0.38, depthWrite: false }));
      dot.rotation.x = -Math.PI / 2; dot.position.copy(pos).setY(0.008); dot.visible = false; dot.renderOrder = 2;
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x14202e, transparent: true, opacity: 0.42, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.copy(pos).setY(0.008); ring.visible = false; ring.renderOrder = 2;
      this.boardGroup.add(ov, dot, ring);
      this.overlays.push({ ov, dot, ring });
    }

    // pieces
    this.geo = buildGeometries();
    this.pieceMat = {
      w: new THREE.MeshPhysicalMaterial({ color: 0xf1e7d4, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.2 }),
      b: new THREE.MeshPhysicalMaterial({ color: 0x2b2420, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2 })
    };

    // controls
    const controls = this.controls = new OrbitControls(cam, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true; controls.dampingFactor = 0.09;
    controls.minDistance = 8; controls.maxDistance = 22;
    controls.minPolarAngle = 0.05; controls.maxPolarAngle = 1.32;
    controls.target.set(0, 0, 0.3);
    controls.addEventListener('change', () => { this.dirty = true; });
    controls.addEventListener('start', () => { this.userMoved = true; });

    this.ray = new THREE.Raycaster();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.setTheme(theme);
    this.bindPointer();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(el);
    this.resize();
    this.active = true;
    const loop = t => {
      if (!this.active) return;
      this.raf = requestAnimationFrame(loop);
      this.step(t);
    };
    this.raf = requestAnimationFrame(loop);
  }

  setTheme(theme) {
    this.tileMat.light.map = woodTexture(theme.light, 3);
    this.tileMat.dark.map = woodTexture(theme.dark, 7);
    this.tileMat.light.needsUpdate = this.tileMat.dark.needsUpdate = true;
    this.frameMat.map = woodTexture(theme.frame, 11);
    this.frameMat.needsUpdate = true;
    this.theme = theme;
    this.labels.material.map = labelTexture(theme.label, this.orientation === 'b');
    this.labels.material.needsUpdate = true;
    this.dirty = true;
  }

  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // keep the whole board in view on narrow screens
    this.camera.fov = 36;
    this.camera.updateProjectionMatrix();
    if (!this.userMoved) this.fitCamera();
    this.dirty = true;
  }

  /* Place the camera at the default angle, as close as possible while keeping the whole board in view */
  fitCamera(sideSign) {
    const s = sideSign || (this.orientation === 'w' ? 1 : -1);
    const cam = this.camera, ctr = this.controls.target;
    const dir = new THREE.Vector3(0, 0.82, 0.57 * s).normalize();
    const pts = [];
    for (const x of [-4.65, 4.65]) for (const z of [-4.65, 4.65]) { pts.push(new THREE.Vector3(x, -0.36, z)); pts.push(new THREE.Vector3(x, 1.25, z)); }
    const v = new THREE.Vector3();
    let best = { d: 14, tz: 0 };
    for (let tz = -0.6; tz <= 1.2; tz += 0.15) {
      ctr.set(0, 0, tz * s);
      let lo = 6, hi = 30;
      for (let i = 0; i < 22; i++) {
        const d = (lo + hi) / 2;
        cam.position.copy(ctr).addScaledVector(dir, d); cam.lookAt(ctr); cam.updateMatrixWorld();
        let ok = true, ymin = 1, ymax = -1;
        for (const p of pts) { v.copy(p).project(cam); if (Math.abs(v.x) > 0.97 || Math.abs(v.y) > 0.95) ok = false; ymin = Math.min(ymin, v.y); ymax = Math.max(ymax, v.y); }
        if (ok) hi = d; else lo = d;
      }
      if (hi < best.d || best.d === 14) best = { d: hi, tz };
    }
    ctr.set(0, 0, best.tz * s);
    cam.position.copy(ctr).addScaledVector(dir, best.d); cam.lookAt(ctr);
    this.controls.maxDistance = Math.max(best.d * 1.6, 16);
    this.controls.minDistance = Math.min(best.d * 0.6, 8);
    this.dirty = true;
    return { pos: cam.position.clone(), tz: ctr.z };
  }

  sqPos(sq) { return new THREE.Vector3((sq & 7) - 3.5, 0, (sq >> 3) - 3.5); }

  makePiece(p) {
    const color = p === p.toUpperCase() ? 'w' : 'b', t = p.toUpperCase();
    const g = new THREE.Group();
    for (const geo of this.geo[t]) {
      const m = new THREE.Mesh(geo, this.pieceMat[color]);
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
    }
    if (t === 'N') g.rotation.y = color === 'w' ? 1.0 : Math.PI + 1.0; // three-quarter profile toward the opponent
    if (t === 'B') g.rotation.y = color === 'w' ? 0 : Math.PI;
    g.scale.setScalar(t === 'P' ? 0.92 : 1);
    g.userData.baseScale = g.scale.x;
    this.scene.add(g);
    return g;
  }

  setOrientation(o, animate = true) {
    if (o === this.orientation) return;
    this.orientation = o;
    this.stopMomentum();
    const cam = this.camera, ctr = this.controls.target;
    const off = cam.position.clone().sub(ctr);
    const startAng = Math.atan2(off.x, off.z), r = Math.hypot(off.x, off.z), y = off.y;
    const targetAng = o === 'w' ? 0 : Math.PI;
    let d = targetAng - startAng; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
    const tz0 = ctr.z, tz1 = -tz0;
    this.labels.material.map = labelTexture(this.theme.label, o === 'b');
    this.labels.material.needsUpdate = true;
    this.anim(animate && !this.reduced ? 700 : 1, k => {
      const a = startAng + d * k;
      ctr.z = tz0 + (tz1 - tz0) * k;
      cam.position.set(ctr.x + Math.sin(a) * r, ctr.y + y, ctr.z + Math.cos(a) * r);
      cam.lookAt(ctr);
    });
    this.anims[this.anims.length - 1].camera = true;
  }

  /* drop any leftover orbit momentum so scripted camera moves land exactly */
  stopMomentum() {
    const c = this.controls;
    c.enableDamping = false; c.update(); c.enableDamping = true;
  }

  resetCamera() {
    this.stopMomentum();
    const ctr = this.controls.target, cam = this.camera;
    const from = cam.position.clone(), tz0 = ctr.z;
    const fit = this.fitCamera();
    cam.position.copy(from); ctr.z = tz0; cam.lookAt(ctr);
    this.userMoved = false;
    this.anim(this.reduced ? 1 : 600, k => { cam.position.lerpVectors(from, fit.pos, k); ctr.z = tz0 + (fit.tz - tz0) * k; cam.lookAt(ctr); });
    this.anims[this.anims.length - 1].camera = true;
  }

  anim(ms, fn, done) {
    this.anims.push({ start: performance.now(), ms, fn, done });
    this.dirty = true;
  }

  step(now) {
    if (this.anims.length) {
      const keep = [];
      for (const a of this.anims) {
        let k = Math.min(1, (now - a.start) / a.ms);
        if (k < 0) k = 0;
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        a.fn(e, k);
        if (k < 1) keep.push(a); else if (a.done) a.done();
      }
      this.anims = keep;
      this.dirty = true;
    }
    if (!this.anims.some(x => x.camera) && this.controls.update()) this.dirty = true;
    if (this.dirty) { this.renderer.render(this.scene, this.camera); this.dirty = false; }
  }

  setPosition(board, animate) {
    animate = animate && !this.reduced;
    const diff = diffPieces(this.pieces, board);
    const byId = new Map(this.pieces.map(p => [p.id, p]));
    const next = [];
    for (const k of diff.keep) {
      const p = byId.get(k.id);
      if (p.piece !== board[k.sq]) { // promotion: swap model
        this.scene.remove(p.obj); p.piece = board[k.sq];
        const o = this.makePiece(p.piece); o.position.copy(p.obj.position); p.obj = o;
      }
      const off = !p.obj.position.equals(this.sqPos(k.sq));
      if (p.sq !== k.sq || (off && p !== this.dragging)) this.movePiece(p, k.sq, animate);
      p.sq = k.sq;
      next.push(p);
    }
    for (const id of diff.remove) {
      const p = byId.get(id);
      if (animate) {
        const o = p.obj, s0 = o.scale.x;
        this.anim(260, k => { o.scale.setScalar(s0 * (1 - k * 0.9)); o.position.y = -k * 0.3; }, () => this.scene.remove(o));
      } else this.scene.remove(p.obj);
    }
    for (const a of diff.add) {
      const obj = this.makePiece(a.piece);
      obj.position.copy(this.sqPos(a.sq));
      const p = { id: this.nextId++, piece: a.piece, sq: a.sq, obj };
      if (animate) { const s = obj.userData.baseScale; obj.scale.setScalar(0.01); this.anim(260, k => obj.scale.setScalar(s * Math.max(0.01, k))); }
      next.push(p);
    }
    this.pieces = next;
    this.dirty = true;
  }

  movePiece(p, sq, animate) {
    const o = p.obj, from = o.position.clone(), to = this.sqPos(sq);
    if (!animate) { o.position.copy(to); return; }
    const dist = from.distanceTo(to);
    const lift = p.piece.toUpperCase() === 'N' ? 0.9 : Math.min(0.5, 0.12 + dist * 0.06);
    const ms = Math.min(420, 220 + dist * 35);
    const startY = from.y;
    this.anim(ms, k => {
      o.position.lerpVectors(from, to, k);
      o.position.y = startY * (1 - k) + Math.sin(k * Math.PI) * lift;
    });
  }

  setHighlights(h) {
    const BRASS = 0xd6a94e, LAST = 0xf2d16b, HINT = 0x5fb3ff;
    for (let i = 0; i < 64; i++) {
      const { ov, dot, ring } = this.overlays[i];
      let color = null, op = 0, map = null;
      if (h.lastMove && (h.lastMove.from === i || h.lastMove.to === i)) { color = LAST; op = 0.38; }
      if (h.hint && (h.hint.from === i || h.hint.to === i)) { color = HINT; op = 0.5; }
      if (h.selected === i) { color = BRASS; op = 0.62; }
      if (h.check === i) { color = 0xffffff; op = 1; map = this.checkTex; }
      ov.visible = color !== null;
      if (ov.visible) {
        ov.material.color.set(color); ov.material.opacity = op;
        if (ov.material.map !== map) { ov.material.map = map; ov.material.needsUpdate = true; }
      }
      const t = h.targets && h.targets.find(t => t.sq === i);
      dot.visible = !!t && !t.capture;
      ring.visible = !!t && t.capture;
    }
    this.pickable = h.pickable || new Set();
    this.targetSet = new Set((h.targets || []).map(t => t.sq));
    this.dirty = true;
  }

  pointerToBoard(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    // prefer hitting a piece model (tall pieces overlap the square behind them)
    const objs = this.pieces.map(p => p.obj);
    const hits = this.ray.intersectObjects(objs, true);
    let pieceSq = -1;
    if (hits.length) {
      let o = hits[0].object; while (o.parent && o.parent !== this.scene) o = o.parent;
      const p = this.pieces.find(p => p.obj === o); if (p) pieceSq = p.sq;
    }
    const pt = new THREE.Vector3();
    const onPlane = this.ray.ray.intersectPlane(this.plane, pt);
    let sq = -1;
    if (onPlane) {
      const c = Math.floor(pt.x + 4), rr = Math.floor(pt.z + 4);
      if (c >= 0 && c < 8 && rr >= 0 && rr < 8) sq = rr * 8 + c;
    }
    return { sq, pieceSq, point: onPlane ? pt : null };
  }

  bindPointer() {
    const canvas = this.renderer.domElement;
    let drag = null;
    // capture phase on the wrapper so we decide before OrbitControls sees the event
    this.el.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      const hit = this.pointerToBoard(e);
      // clicking a piece selects that piece even if the ray lands on the square behind it
      let sq = hit.sq;
      if (hit.pieceSq >= 0 && (this.pickable.has(hit.pieceSq) || this.targetSet.has(hit.pieceSq))) sq = hit.pieceSq;
      if (sq < 0) { this.ctrl.pointerDown(-1); return; }
      const res = this.ctrl.pointerDown(sq);
      if (res && res.drag) {
        const p = this.pieces.find(p => p.sq === sq);
        if (!p) return;
        e.stopPropagation(); e.preventDefault();
        this.controls.enabled = false;
        this.dragging = p;
        drag = { from: sq, p, sx: e.clientX, sy: e.clientY, moved: false, wasSelected: res.wasSelected, id: e.pointerId };
        canvas.setPointerCapture(e.pointerId);
      } else if (res === 'moved' || (res && res.consumed)) {
        e.stopPropagation();
      }
    }, true);

    canvas.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) {
        if (e.buttons) return;
        const hit = this.pointerToBoard(e);
        const over = (hit.pieceSq >= 0 && this.pickable.has(hit.pieceSq)) || (hit.sq >= 0 && (this.pickable.has(hit.sq) || this.targetSet.has(hit.sq)));
        canvas.style.cursor = over ? 'pointer' : 'grab';
        return;
      }
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
      drag.moved = true;
      canvas.style.cursor = 'grabbing';
      const hit = this.pointerToBoard(e);
      if (hit.point) {
        drag.p.obj.position.set(hit.point.x, 0.55, hit.point.z);
        drag.over = hit.sq;
        this.dirty = true;
      }
    });

    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      this.controls.enabled = true;
      canvas.style.cursor = '';
      let to = d.from;
      if (d.moved && e.type !== 'pointercancel') to = d.over !== undefined ? d.over : -1;
      const moved = this.ctrl.pointerUp(d.from, e.type === 'pointercancel' ? -1 : to, d.moved, d.wasSelected);
      this.dragging = null;
      if (!moved) this.movePiece(d.p, d.p.sq, true);
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  setVisible(v) {
    this.el.hidden = !v;
    if (v) { this.resize(); this.dirty = true; }
  }
}
