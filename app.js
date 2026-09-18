import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);
const canvas = $('stage');
const video = $('sourceVideo');
const input = $('videoInput');
const playBtn = $('playBtn');
const rewindBtn = $('rewindBtn');
const scrubber = $('scrubber');
const currentTimeEl = $('currentTime');
const totalTimeEl = $('totalTime');
const sphereToggle = $('sphereToggle');
const gridToggle = $('gridToggle');
const radiusSlider = $('radiusSlider');
const strengthSlider = $('strengthSlider');
const sliceSlider = $('sliceSlider');
const brightnessSlider = $('brightnessSlider');
const gridOpacitySlider = $('gridOpacitySlider');
const radiusOut = $('radiusOut');
const strengthOut = $('strengthOut');
const sliceOut = $('sliceOut');
const brightnessOut = $('brightnessOut');
const gridOpacityOut = $('gridOpacityOut');
const gridOpacityBlock = $('gridOpacityBlock');
const modeSlicesBtn = $('modeSlicesBtn');
const modeSolidBtn = $('modeSolidBtn');
const modeOut = $('modeOut');
const clipStartInput = $('clipStart');
const clipDurationInput = $('clipDuration');
const processBtn = $('processBtn');
const resetViewBtn = $('resetViewBtn');
const panelToggle = $('panelToggle');
const panel = $('panel');
const closePanel = $('closePanel');
const dropHint = $('dropHint');
const status = $('status');
const statusText = $('statusText');
const statusBar = $('statusBar');

const state = {
  clipStart: 0,
  clipDuration: 5,
  slices: 64,
  visualMode: 'slices',
  brightness: 1,
  gridOpacity: 0.20,
  playing: false,
  progress: 0,
  lastT: performance.now(),
  sourceUrl: null,
  hasVideo: false,
  aspect: 16 / 9,
  planeW: 5.6,
  planeD: 3.15,
  timeH: 4.4,
};

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight, false);
renderer.setClearColor(0x000000, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, 0.03, 120);
camera.position.set(7.7, 5.4, 8.1);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.enablePan = true;
controls.minDistance = 3.0;
controls.maxDistance = 20;
controls.target.set(0, 0.15, 0);
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 0.62));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
keyLight.position.set(5, 7, 4);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xaec6ff, 2.1, 12, 2);
rimLight.position.set(-3, 2.5, 4);
scene.add(rimLight);

const volume = new THREE.Group();
scene.add(volume);

let sliceMesh = null;
let sliceMaterial = null;
let atlasTexture = null;
let boxLines = null;
let gridLines = null;
let sphere = null;
let axesGroup = null;

const atlasCanvas = document.createElement('canvas');
const atlasCtx = atlasCanvas.getContext('2d', { alpha: false, desynchronized: true });

function setStatus(text, p = 0) {
  status.hidden = false;
  statusText.textContent = text;
  statusBar.style.width = `${Math.round(p * 100)}%`;
}
function clearStatus() { status.hidden = true; }

function fitDimensions(aspect) {
  const maxSide = 5.6;
  if (aspect >= 1) {
    state.planeW = maxSide;
    state.planeD = maxSide / aspect;
  } else {
    state.planeD = maxSide;
    state.planeW = maxSide * aspect;
  }
  state.timeH = THREE.MathUtils.clamp(Math.max(state.planeW, state.planeD) * 0.78, 3.6, 5.2);
}

function disposeObj(obj) {
  if (!obj) return;
  obj.traverse?.((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose?.());
    else child.material?.dispose?.();
  });
  obj.removeFromParent?.();
}

function makeAtlasLayout(count, aspect) {
  const mobile = matchMedia('(max-width: 760px)').matches;
  const maxTex = renderer.capabilities.maxTextureSize || 4096;
  let tileW = mobile ? 256 : 320;

  // Si el video es vertical y hay muchas rebanadas, reducimos la resolución
  // de cada mini-fotograma antes de superar el tamaño máximo de textura de la GPU.
  for (let attempt = 0; attempt < 12; attempt++) {
    const tileH = Math.max(72, Math.round(tileW / Math.max(0.12, aspect)));
    let cols = Math.max(1, Math.ceil(Math.sqrt(count * (tileH / tileW))));
    let rows = Math.ceil(count / cols);

    while (cols > 1 && (cols - 1) * tileW <= maxTex && Math.ceil(count / (cols - 1)) * tileH <= maxTex) {
      cols--;
      rows = Math.ceil(count / cols);
    }

    if (cols * tileW <= maxTex && rows * tileH <= maxTex) {
      return { cols, rows, tileW, tileH };
    }
    tileW = Math.max(96, Math.floor(tileW * 0.84));
  }

  const tileH = Math.max(72, Math.round(tileW / Math.max(0.12, aspect)));
  const cols = Math.max(1, Math.min(count, Math.floor(maxTex / tileW)));
  const rows = Math.ceil(count / cols);
  return { cols, rows, tileW, tileH };
}

function buildDemoAtlas() {
  state.aspect = 16 / 9;
  fitDimensions(state.aspect);
  const count = state.slices;
  const L = makeAtlasLayout(count, state.aspect);
  atlasCanvas.width = L.cols * L.tileW;
  atlasCanvas.height = L.rows * L.tileH;
  atlasCtx.fillStyle = '#0a0a0b';
  atlasCtx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
  for (let i = 0; i < count; i++) {
    const col = i % L.cols;
    const row = Math.floor(i / L.cols);
    drawDemoFrame(atlasCtx, col * L.tileW, row * L.tileH, L.tileW, L.tileH, i / Math.max(1, count - 1));
  }
  uploadAtlas(L);
  rebuildVolume(L, true);
}

function drawDemoFrame(ctx, x, y, w, h, t) {
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1a1a1d');
  g.addColorStop(1, '#09090a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(240,240,240,.62)';
  ctx.lineWidth = Math.max(2, w / 110);
  const stripe = h / 10;
  for (let k = -2; k < 14; k++) {
    const yy = k * stripe + h * .12;
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(w, yy + h * .18);
    ctx.stroke();
  }
  const people = 12;
  for (let p = 0; p < people; p++) {
    const phase = (t * 1.25 + p / people) % 1;
    const px = phase * (w * 1.25) - w * .12;
    const py = h * (.18 + (p % 6) * .11) + Math.sin((p * 1.7 + t * 4) * Math.PI) * 4;
    const s = h * (.038 + (p % 3) * .006);
    ctx.fillStyle = p === 2 ? 'rgba(205,88,71,.98)' : `rgba(${165 + (p % 4) * 18},${165 + (p % 3) * 14},${170 + (p % 2) * 20},.94)`;
    ctx.beginPath();
    ctx.arc(px, py - s * .85, s * .22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(px - s * .17, py - s * .65, s * .34, s * .72);
  }
  ctx.restore();
}

function uploadAtlas(layout) {
  atlasTexture?.dispose?.();
  atlasTexture = new THREE.CanvasTexture(atlasCanvas);
  atlasTexture.colorSpace = THREE.SRGBColorSpace;
  atlasTexture.minFilter = THREE.LinearFilter;
  atlasTexture.magFilter = THREE.LinearFilter;
  atlasTexture.generateMipmaps = false;
  atlasTexture.flipY = false;
  atlasTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 1);
  atlasTexture.needsUpdate = true;
  atlasTexture.userData.layout = layout;
}

function cloneGeometryIntoInstanced(base, count) {
  const geo = new THREE.InstancedBufferGeometry();
  if (base.index) geo.index = base.index.clone();
  for (const [name, attr] of Object.entries(base.attributes)) geo.setAttribute(name, attr.clone());

  const sliceArr = new Float32Array(count);
  const frameArr = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    sliceArr[i] = i / Math.max(1, count - 1);
    frameArr[i] = i;
  }
  geo.setAttribute('aSlice', new THREE.InstancedBufferAttribute(sliceArr, 1));
  geo.setAttribute('aFrame', new THREE.InstancedBufferAttribute(frameArr, 1));
  geo.instanceCount = count;
  base.dispose();
  return geo;
}

function rebuildVolume(layout = atlasTexture?.userData.layout, resetCamera = false) {
  if (!layout || !atlasTexture) return;

  disposeObj(sliceMesh); sliceMesh = null;
  disposeObj(boxLines); boxLines = null;
  disposeObj(gridLines); gridLines = null;
  disposeObj(sphere); sphere = null;
  disposeObj(axesGroup); axesGroup = null;

  const count = state.slices;
  const mobile = matchMedia('(max-width: 760px)').matches;
  const segX = mobile ? 34 : 46;
  const segZ = Math.max(18, Math.round(segX / Math.max(0.45, state.aspect)));
  const solid = state.visualMode === 'solid';
  const slabH = state.timeH / Math.max(1, count) * 1.045;

  const base = solid
    ? new THREE.BoxGeometry(state.planeW, slabH, state.planeD, segX, 1, segZ)
    : new THREE.PlaneGeometry(state.planeW, state.planeD, segX, segZ);

  if (!solid) base.rotateX(-Math.PI / 2);
  const geo = cloneGeometryIntoInstanced(base, count);

  sliceMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uAtlas: { value: atlasTexture },
      uCols: { value: layout.cols },
      uRows: { value: layout.rows },
      uProgress: { value: state.clipDuration ? state.progress / state.clipDuration : 0 },
      uTimeH: { value: state.timeH },
      uPlaneW: { value: state.planeW },
      uPlaneD: { value: state.planeD },
      uSlabH: { value: slabH },
      uSolidMode: { value: solid ? 1 : 0 },
      uSphereOn: { value: sphereToggle.checked ? 1 : 0 },
      uRadius: { value: Number(radiusSlider.value) },
      uStrength: { value: Number(strengthSlider.value) },
      uBrightness: { value: state.brightness },
      uSliceStep: { value: 1 / Math.max(1, count - 1) },
    },
    vertexShader: `
      precision highp float;
      attribute float aSlice;
      attribute float aFrame;
      varying vec3 vLocalPos;
      varying vec3 vLocalNormal;
      varying float vSlice;
      varying float vFrame;
      varying float vInfluence;
      uniform float uTimeH;
      uniform float uSlabH;
      uniform float uSolidMode;
      uniform float uSphereOn;
      uniform float uRadius;
      uniform float uStrength;

      void main(){
        vec3 p = position;
        float planeY = (aSlice - 0.5) * uTimeH;
        float slabY = -0.5 * uTimeH + 0.5 * uSlabH + aSlice * (uTimeH - uSlabH);
        p.y += mix(planeY, slabY, uSolidMode);

        vec3 delta = -p;
        float d = length(delta);
        float q = clamp(1.0 - d / max(uRadius, 0.001), 0.0, 1.0);
        float inf = q*q*(3.0-2.0*q) * uSphereOn;
        vec3 dir = delta / max(d, 0.0001);

        // La geometría del propio fotograma se curva hacia la esfera.
        p += dir * inf * uStrength * uRadius * 0.38;
        // Compresión adicional del eje temporal para hacer visible la dilatación.
        p.y += sign(-p.y) * inf * uStrength * uRadius * 0.10;

        vLocalPos = position;
        vLocalNormal = normal;
        vSlice = aSlice;
        vFrame = aFrame;
        vInfluence = inf;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uAtlas;
      uniform float uCols;
      uniform float uRows;
      uniform float uProgress;
      uniform float uPlaneW;
      uniform float uPlaneD;
      uniform float uSolidMode;
      uniform float uBrightness;
      uniform float uSliceStep;
      varying vec3 vLocalPos;
      varying vec3 vLocalNormal;
      varying float vSlice;
      varying float vFrame;
      varying float vInfluence;

      vec2 videoUV(){
        vec3 n = normalize(vLocalNormal);
        vec3 an = abs(n);
        vec2 uvVideo;

        // Caras superior/inferior: fotograma completo.
        if (uSolidMode < 0.5 || an.y >= max(an.x, an.z)) {
          uvVideo = vec2(vLocalPos.x / uPlaneW + 0.5, vLocalPos.z / uPlaneD + 0.5);
        }
        // Caras frontal/trasera: borde superior o inferior del fotograma.
        else if (an.z >= an.x) {
          float edgeV = n.z > 0.0 ? 1.0 : 0.0;
          uvVideo = vec2(vLocalPos.x / uPlaneW + 0.5, edgeV);
        }
        // Caras izquierda/derecha: borde lateral del fotograma.
        else {
          float edgeU = n.x > 0.0 ? 1.0 : 0.0;
          uvVideo = vec2(edgeU, vLocalPos.z / uPlaneD + 0.5);
        }

        return mix(vec2(0.004), vec2(0.996), clamp(uvVideo, 0.0, 1.0));
      }

      void main(){
        // Medio paso extra hace que el primer fotograma exista de verdad en t = 0.
        if (vSlice > uProgress + uSliceStep * 0.52) discard;

        float col = mod(vFrame, uCols);
        float row = floor(vFrame / uCols);
        vec2 atlasUV = (vec2(col, row) + videoUV()) / vec2(uCols, uRows);
        vec4 tex = texture2D(uAtlas, atlasUV);
        vec3 color = max(vec3(0.0), tex.rgb * uBrightness);

        if (uSolidMode > 0.5) {
          gl_FragColor = vec4(color, 1.0);
          return;
        }

        float age = clamp((uProgress - vSlice) / max(uProgress, uSliceStep), 0.0, 1.0);
        float nearest = 1.0 - smoothstep(0.0, uSliceStep * 1.10, abs(vSlice - uProgress));
        float trail = mix(0.14, 0.055, age);
        float alpha = min(0.98, trail + nearest * 0.86);
        alpha *= mix(1.0, 1.04, vInfluence);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: !solid,
    depthWrite: solid,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
  });

  sliceMesh = new THREE.Mesh(geo, sliceMaterial);
  sliceMesh.frustumCulled = false;
  volume.add(sliceMesh);

  buildBoxAndGrid();
  buildSphere();
  buildAxes();
  if (resetCamera) resetView();
}

function buildBoxAndGrid() {
  const box = new THREE.BoxGeometry(state.planeW, state.timeH, state.planeD);
  boxLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(box),
    new THREE.LineBasicMaterial({ color: 0x7c7c84, transparent: true, opacity: .34, depthWrite: false })
  );
  boxLines.renderOrder = 6;
  volume.add(boxLines);
  box.dispose();

  const pts = [];
  const W = state.planeW, H = state.timeH, D = state.planeD;
  const nx = 8, ny = 8, nz = 8;

  // Planos horizontales XZ.
  for (let iy = 1; iy < ny; iy++) {
    const y = -H / 2 + H * iy / ny;
    for (let iz = 0; iz <= nz; iz++) {
      const z = -D / 2 + D * iz / nz;
      pts.push(-W / 2, y, z, W / 2, y, z);
    }
    for (let ix = 0; ix <= nx; ix++) {
      const x = -W / 2 + W * ix / nx;
      pts.push(x, y, -D / 2, x, y, D / 2);
    }
  }

  // Columnas temporales internas.
  for (let ix = 1; ix < nx; ix++) {
    const x = -W / 2 + W * ix / nx;
    for (let iz = 1; iz < nz; iz++) {
      const z = -D / 2 + D * iz / nz;
      pts.push(x, -H / 2, z, x, H / 2, z);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  gridLines = new THREE.LineSegments(
    g,
    new THREE.LineBasicMaterial({
      color: 0xc2c2ca,
      transparent: true,
      opacity: state.gridOpacity,
      depthWrite: false,
      depthTest: false,
    })
  );
  gridLines.visible = gridToggle.checked;
  gridLines.renderOrder = 20;
  volume.add(gridLines);
}

function buildSphere() {
  const r = 0.28;
  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(r, 48, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x020204,
      roughness: .16,
      metalness: .55,
      clearcoat: 1,
      clearcoatRoughness: .12,
      emissive: 0x030305,
    })
  );
  sphere.visible = sphereToggle.checked;
  volume.add(sphere);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(r * 1.09, 36, 24),
    new THREE.MeshBasicMaterial({ color: 0xd3dcf2, transparent: true, opacity: .055, side: THREE.BackSide, depthWrite: false })
  );
  halo.name = 'halo';
  sphere.add(halo);
}

function makeTextSprite(text) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = '600 32px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = 'rgba(238,238,242,.84)';
  ctx.fillText(text, 14, 55);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(1.7, .32, 1);
  return s;
}

function buildAxes() {
  axesGroup = new THREE.Group();
  const W = state.planeW, H = state.timeH, D = state.planeD;
  const o = new THREE.Vector3(-W / 2 - .16, -H / 2 - .06, -D / 2 - .16);
  const c = 0xb8b8be;
  const axT = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), o, H * .68, c, .15, .065);
  const axY = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), o, W * .44, c, .15, .065);
  const axZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), o, D * .52, c, .15, .065);
  axesGroup.add(axT, axY, axZ);

  const t = makeTextSprite('X · Tiempo');
  t.position.copy(o).add(new THREE.Vector3(.02, H * .73, 0));
  const y = makeTextSprite('Y · Espacio');
  y.position.copy(o).add(new THREE.Vector3(W * .50, .10, 0));
  const z = makeTextSprite('Z · Espacio');
  z.position.copy(o).add(new THREE.Vector3(0, .10, D * .62));
  axesGroup.add(t, y, z);
  volume.add(axesGroup);
}

function resetView() {
  const s = Math.max(state.planeW, state.planeD, state.timeH);
  camera.position.set(s * 1.22, s * .88, s * 1.34);
  controls.target.set(0, 0, 0);
  controls.update();
}

async function ensureVideoFrameReady() {
  if (video.readyState >= 2) return;
  await new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };
    const ok = () => finish(resolve);
    const err = () => finish(() => reject(video.error || new Error('El video no entregó un fotograma decodificado.')));
    const timer = setTimeout(ok, 3500);
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener('loadeddata', ok);
      video.removeEventListener('canplay', ok);
      video.removeEventListener('error', err);
    };
    video.addEventListener('loadeddata', ok, { once: true });
    video.addEventListener('canplay', ok, { once: true });
    video.addEventListener('error', err, { once: true });
  });
}

async function seekVideo(t) {
  if (!Number.isFinite(t)) return;
  if (Math.abs(video.currentTime - t) < 0.012 && video.readyState >= 2) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    return;
  }
  await new Promise((resolve, reject) => {
    const ok = () => { cleanup(); requestAnimationFrame(() => resolve()); };
    const err = () => { cleanup(); reject(video.error || new Error('No se pudo leer ese fotograma.')); };
    const cleanup = () => {
      video.removeEventListener('seeked', ok);
      video.removeEventListener('error', err);
    };
    video.addEventListener('seeked', ok, { once: true });
    video.addEventListener('error', err, { once: true });
    video.currentTime = Math.min(Math.max(0, t), Math.max(0, video.duration - .002));
  });
}

async function processVideo() {
  if (!state.hasVideo || !Number.isFinite(video.duration)) return buildDemoAtlas();

  state.playing = false;
  playBtn.textContent = '▶';
  let start = Math.max(0, Number(clipStartInput.value) || 0);
  let dur = Math.max(0.2, Number(clipDurationInput.value) || 5);
  if (start >= video.duration) start = Math.max(0, video.duration - 0.2);
  dur = Math.min(dur, Math.max(0.2, video.duration - start));
  state.clipStart = start;
  state.clipDuration = dur;
  clipStartInput.value = start.toFixed(1);
  clipDurationInput.value = dur.toFixed(1);
  scrubber.max = dur;
  scrubber.value = 0;
  state.progress = 0;
  totalTimeEl.textContent = `${dur.toFixed(1)} s`;
  currentTimeEl.textContent = '0.0';

  state.aspect = video.videoWidth / Math.max(1, video.videoHeight);
  fitDimensions(state.aspect);
  const count = state.slices;
  const L = makeAtlasLayout(count, state.aspect);
  atlasCanvas.width = L.cols * L.tileW;
  atlasCanvas.height = L.rows * L.tileH;
  atlasCtx.fillStyle = '#000';
  atlasCtx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
  setStatus('Rebanando el video en el eje temporal…', 0);

  try {
    await ensureVideoFrameReady();
    for (let i = 0; i < count; i++) {
      const f = i / Math.max(1, count - 1);
      const t = start + f * dur;
      await seekVideo(t);
      const col = i % L.cols;
      const row = Math.floor(i / L.cols);
      atlasCtx.drawImage(video, col * L.tileW, row * L.tileH, L.tileW, L.tileH);
      setStatus(`Fotograma ${i + 1} de ${count}`, (i + 1) / count);
    }
    uploadAtlas(L);
    rebuildVolume(L, true);
    dropHint.classList.add('hidden');
    clearStatus();
  } catch (err) {
    console.error(err);
    setStatus('No pude decodificar ese video. Prueba MP4/H.264 o un clip más corto.', 1);
    setTimeout(clearStatus, 3200);
  }
}

function loadVideoFile(file) {
  if (!file || !file.type.startsWith('video/')) return;
  if (state.sourceUrl) URL.revokeObjectURL(state.sourceUrl);
  state.sourceUrl = URL.createObjectURL(file);
  video.src = state.sourceUrl;
  video.load();
  setStatus('Leyendo video…', 0.08);
  video.onloadedmetadata = () => {
    state.hasVideo = true;
    const d = video.duration;
    clipStartInput.max = Math.max(0, d - .2).toFixed(1);
    const defaultDur = Math.min(5, d);
    clipDurationInput.max = Math.min(8, d).toFixed(1);
    clipDurationInput.value = defaultDur.toFixed(1);
    state.clipDuration = defaultDur;
    processVideo();
  };
}

function setVisualMode(mode) {
  if (mode !== 'slices' && mode !== 'solid') return;
  state.visualMode = mode;
  modeSlicesBtn.classList.toggle('active', mode === 'slices');
  modeSolidBtn.classList.toggle('active', mode === 'solid');
  modeOut.textContent = mode === 'solid' ? 'Sólido' : 'Rebanadas';
  rebuildVolume(atlasTexture?.userData.layout, false);
}

function updateGridUI() {
  const on = gridToggle.checked;
  gridOpacityBlock.classList.toggle('off', !on);
  if (gridLines) gridLines.visible = on;
}

function updatePlayback(now) {
  const dt = Math.min(.05, (now - state.lastT) / 1000);
  state.lastT = now;

  if (state.playing) {
    state.progress += dt;
    if (state.progress >= state.clipDuration) {
      state.progress = state.clipDuration;
      state.playing = false;
      playBtn.textContent = '▶';
    }
    scrubber.value = state.progress;
    currentTimeEl.textContent = state.progress.toFixed(1);
  }

  if (sliceMaterial) {
    sliceMaterial.uniforms.uProgress.value = state.clipDuration ? state.progress / state.clipDuration : 0;
    sliceMaterial.uniforms.uSphereOn.value = sphereToggle.checked ? 1 : 0;
    sliceMaterial.uniforms.uRadius.value = Number(radiusSlider.value);
    sliceMaterial.uniforms.uStrength.value = Number(strengthSlider.value);
    sliceMaterial.uniforms.uBrightness.value = state.brightness;
  }
  if (sphere) sphere.visible = sphereToggle.checked;
  if (gridLines) {
    gridLines.visible = gridToggle.checked;
    gridLines.material.opacity = state.gridOpacity;
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(updatePlayback);
}

input.addEventListener('change', () => loadVideoFile(input.files?.[0]));
processBtn.addEventListener('click', processVideo);

playBtn.addEventListener('click', () => {
  if (state.progress >= state.clipDuration - .001) state.progress = 0;
  state.playing = !state.playing;
  playBtn.textContent = state.playing ? 'Ⅱ' : '▶';
});

rewindBtn.addEventListener('click', () => {
  state.playing = false;
  state.progress = 0;
  scrubber.value = 0;
  currentTimeEl.textContent = '0.0';
  playBtn.textContent = '▶';
});

scrubber.addEventListener('input', () => {
  state.playing = false;
  playBtn.textContent = '▶';
  state.progress = Number(scrubber.value);
  currentTimeEl.textContent = state.progress.toFixed(1);
});

radiusSlider.addEventListener('input', () => {
  radiusOut.textContent = Number(radiusSlider.value).toFixed(2);
});
strengthSlider.addEventListener('input', () => {
  strengthOut.textContent = Number(strengthSlider.value).toFixed(2);
});

brightnessSlider.addEventListener('input', () => {
  state.brightness = Number(brightnessSlider.value) / 100;
  brightnessOut.textContent = `${brightnessSlider.value}%`;
});

gridOpacitySlider.addEventListener('input', () => {
  state.gridOpacity = Number(gridOpacitySlider.value) / 100;
  gridOpacityOut.textContent = `${gridOpacitySlider.value}%`;
  if (gridLines) gridLines.material.opacity = state.gridOpacity;
});

gridToggle.addEventListener('change', updateGridUI);

sliceSlider.addEventListener('input', () => {
  sliceOut.textContent = sliceSlider.value;
});
sliceSlider.addEventListener('change', () => {
  state.slices = Number(sliceSlider.value);
  state.hasVideo ? processVideo() : buildDemoAtlas();
});

modeSlicesBtn.addEventListener('click', () => setVisualMode('slices'));
modeSolidBtn.addEventListener('click', () => setVisualMode('solid'));
resetViewBtn.addEventListener('click', resetView);
panelToggle.addEventListener('click', () => panel.classList.toggle('open'));
closePanel.addEventListener('click', () => panel.classList.remove('open'));

for (const ev of ['dragenter', 'dragover']) {
  document.addEventListener(ev, (e) => {
    e.preventDefault();
    dropHint.classList.add('drag');
  });
}
for (const ev of ['dragleave', 'drop']) {
  document.addEventListener(ev, (e) => {
    e.preventDefault();
    dropHint.classList.remove('drag');
  });
}
document.addEventListener('drop', (e) => {
  const f = [...(e.dataTransfer?.files || [])].find(file => file.type.startsWith('video/'));
  if (f) loadVideoFile(f);
});

addEventListener('resize', () => {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    state.playing = false;
    playBtn.textContent = '▶';
  }
});

sphereToggle.checked = false;
gridToggle.checked = false;
state.brightness = Number(brightnessSlider.value) / 100;
state.gridOpacity = Number(gridOpacitySlider.value) / 100;
state.slices = Number(sliceSlider.value);
setVisualMode('slices');
updateGridUI();
buildDemoAtlas();
scrubber.max = state.clipDuration;
totalTimeEl.textContent = `${state.clipDuration.toFixed(1)} s`;
requestAnimationFrame(updatePlayback);
