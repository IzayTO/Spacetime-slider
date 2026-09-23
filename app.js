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
const timelineTicks = $('timelineTicks');
const sphereToggle = $('sphereToggle');
const gridToggle = $('gridToggle');
const radiusSlider = $('radiusSlider');
const strengthSlider = $('strengthSlider');
const sliceSlider = $('sliceSlider');
const brightnessSlider = $('brightnessSlider');
const futureToggle = $('futureToggle');
const futureOpacitySlider = $('futureOpacitySlider');
const gridOpacitySlider = $('gridOpacitySlider');
const radiusOut = $('radiusOut');
const strengthOut = $('strengthOut');
const sliceOut = $('sliceOut');
const brightnessOut = $('brightnessOut');
const futureOpacityOut = $('futureOpacityOut');
const gridOpacityOut = $('gridOpacityOut');
const futureOpacityBlock = $('futureOpacityBlock');
const gridOpacityBlock = $('gridOpacityBlock');
const modeSlicesBtn = $('modeSlicesBtn');
const modeSolidBtn = $('modeSolidBtn');
const modeOut = $('modeOut');
const clipStartInput = $('clipStart');
const clipEndInput = $('clipEnd');
const snapToggle = $('snapToggle');
const trimBar = $('trimBar');
const trimSelection = $('trimSelection');
const trimTicks = $('trimTicks');
const trimStartHandle = $('trimStartHandle');
const trimEndHandle = $('trimEndHandle');
const trimStartOut = $('trimStartOut');
const trimDurationOut = $('trimDurationOut');
const trimEndOut = $('trimEndOut');
const presetButtons = [...document.querySelectorAll('.preset-btn')];
const processBtn = $('processBtn');
const resetViewBtn = $('resetViewBtn');
const panelToggle = $('panelToggle');
const panel = $('panel');
const closePanel = $('closePanel');
const dropHint = $('dropHint');
const orbitalNav = $('orbitalNav');
const orbitalToggle = $('orbitalToggle');
const orbitalItems = [...document.querySelectorAll('.orbital-item')];
const homeLoadBtn = $('homeLoadBtn');
const homeControlsBtn = $('homeControlsBtn');
const homeDemoBtn = $('homeDemoBtn');
const sectionVideo = $('sectionVideo');
const sectionGravity = $('sectionGravity');
const sectionGuides = $('sectionGuides');
const panelTitleEl = $('panelTitle');
const panelEyebrowEl = $('panelEyebrow');
const panelWindows = [...document.querySelectorAll('.panel-window')];
const status = $('status');
const statusText = $('statusText');
const statusBar = $('statusBar');
const clipSettingsHome = $('clipSettingsHome');
const clipSettings = $('clipSettings');
const trimModal = $('trimModal');
const trimModalMount = $('trimModalMount');
const trimAcceptBtn = $('trimAcceptBtn');
const trimPreview = $('trimPreview');
const timeWordsToggle = $('timeWordsToggle');
const secondMarksToggle = $('secondMarksToggle');
const coordinatesToggle = $('coordinatesToggle');
const presentPlaneToggle = $('presentPlaneToggle');
const presentPlaneControls = $('presentPlaneControls');
const presentPlaneSolidBtn = $('presentPlaneSolidBtn');
const presentPlaneGridBtn = $('presentPlaneGridBtn');
const presentPlaneModeOut = $('presentPlaneModeOut');
const presentPlaneColorInput = $('presentPlaneColor');
const presentPlaneOpacitySlider = $('presentPlaneOpacitySlider');
const presentPlaneOutlineSlider = $('presentPlaneOutlineSlider');
const presentPlaneOpacityOut = $('presentPlaneOpacityOut');
const presentPlaneOutlineOut = $('presentPlaneOutlineOut');
const axisLegendEl = document.querySelector('.axis-legend');
const framePreviewToggle = $('framePreviewToggle');
const framePreviewHud = $('framePreviewHud');
const framePreviewCanvas = $('framePreviewCanvas');
const framePreviewTime = $('framePreviewTime');
const framePreviewCount = $('framePreviewCount');
const framePreviewCtx = framePreviewCanvas?.getContext('2d', { alpha: false, desynchronized: true });

const state = {
  clipStart: 0,
  clipDuration: 10,
  clipEnd: 10,
  sourceDuration: 10,
  maxClipDuration: 10,
  snapToSeconds: true,
  slices: 64,
  visualMode: 'slices',
  brightness: 1,
  futureOpacity: 0.22,
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
  showTimeWords: true,
  showSecondMarks: true,
  showCoordinates: true,
  presentPlaneOn: false,
  presentPlaneMode: 'solid',
  presentPlaneOpacity: 0.18,
  presentPlaneOutlineOpacity: 0.42,
  presentPlaneColor: '#f5f5f7',
  processing: false,
};

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(targetPixelRatio());
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
controls.addEventListener('start', () => requestSceneRender(10));
controls.addEventListener('change', () => requestSceneRender(8));
controls.addEventListener('end', () => requestSceneRender(14));

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
let timeRulerGroup = null;
let presentLabel = null;
let pastLabel = null;
let futureLabel = null;
let presentMarker = null;
let timeMarksGroup = null;
let timeWordsGroup = null;
let presentPlaneFill = null;
let presentPlaneGrid = null;
let presentPlaneOutline = null;

const atlasCanvas = document.createElement('canvas');
const atlasCtx = atlasCanvas.getContext('2d', { alpha: false, desynchronized: true });
atlasCtx.imageSmoothingEnabled = true;
try { atlasCtx.imageSmoothingQuality = 'high'; } catch (_) {}

let sceneNeedsRender = true;
let dampingFrames = 0;
let animationFrameHandle = null;
let previewLastFrame = -1;

function ensureAnimationLoop() {
  if (animationFrameHandle != null || state.processing || document.hidden) return;
  state.lastT = performance.now();
  animationFrameHandle = requestAnimationFrame(updatePlayback);
}

function requestSceneRender(frames = 1) {
  sceneNeedsRender = true;
  dampingFrames = Math.max(dampingFrames, frames);
  ensureAnimationLoop();
}

function targetPixelRatio() {
  const mobile = matchMedia('(max-width: 760px)').matches;
  return Math.min(devicePixelRatio || 1, mobile ? 1.7 : 1.8);
}

function syncAppHeight() {
  const h = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${Math.round(h)}px`);
}

function setStatus(text, p = 0) {
  status.hidden = false;
  statusText.textContent = text;
  statusBar.style.width = `${Math.round(p * 100)}%`;
}
function clearStatus() { status.hidden = true; }

function beginProcessing() {
  state.processing = true;
  state.playing = false;
  playBtn.textContent = '▶';
  volume.visible = false;
  if (framePreviewHud) framePreviewHud.hidden = true;
  document.body.classList.remove('frame-preview-on');
  document.body.classList.add('is-processing');
  renderer.clear(true, true, true);
}

function endProcessing(showVolume = true) {
  state.processing = false;
  volume.visible = showVolume;
  document.body.classList.remove('is-processing');
  state.lastT = performance.now();
  previewLastFrame = -1;
  syncFramePreviewVisibility();
  if (showVolume) {
    sceneNeedsRender = true;
    ensureAnimationLoop();
  }
}

let trimPreviewSeekTimer = null;
let trimPreviewSeekTarget = 0;
function scheduleTrimPreviewSeek(time) {
  if (!trimPreview || !trimModal || trimModal.hidden || !Number.isFinite(time)) return;
  trimPreviewSeekTarget = THREE.MathUtils.clamp(time, 0, Math.max(0, getSourceDuration() - 0.001));
  if (trimPreviewSeekTimer) return;
  trimPreviewSeekTimer = setTimeout(() => {
    trimPreviewSeekTimer = null;
    try {
      if (typeof trimPreview.fastSeek === 'function') trimPreview.fastSeek(trimPreviewSeekTarget);
      else trimPreview.currentTime = trimPreviewSeekTarget;
    } catch (_) {}
  }, 70);
}

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

function hexToRgb01(hex) {
  const clean = (hex || '#ffffff').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(ch => ch + ch).join('') : clean.padEnd(6, 'f').slice(0, 6);
  const num = parseInt(full, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function makeAtlasLayout(count, aspect) {
  const mobile = matchMedia('(max-width: 760px)').matches;
  const maxTex = renderer.capabilities.maxTextureSize || 4096;
  // Priorizamos más resolución cuando cabe en una sola textura. Esto reduce
  // el pixelado sin disparar memoria: si el atlas no cabe, el bucle de abajo
  // baja la resolución automáticamente según el límite real de la GPU.
  let tileW;
  if (mobile) tileW = count <= 64 ? 384 : (count <= 104 ? 320 : 256);
  else tileW = count <= 80 ? 480 : (count <= 128 ? 384 : 320);

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
  volume.visible = true;
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
  syncFramePreviewVisibility();
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
  previewLastFrame = -1;
}

function formatPreviewTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const hundredths = Math.floor((safe - Math.floor(safe)) * 100 + 1e-6);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function renderFramePreview(force = false) {
  if (!framePreviewHud || !framePreviewCanvas || !framePreviewCtx || !atlasTexture || !state.framePreviewEnabled || state.processing) return;
  const layout = atlasTexture.userData.layout;
  if (!layout) return;

  const total = Math.max(1, state.slices);
  const normalized = THREE.MathUtils.clamp(state.progress / Math.max(0.001, state.clipDuration), 0, 1);
  const frameIndex = THREE.MathUtils.clamp(Math.round(normalized * Math.max(0, total - 1)), 0, total - 1);

  framePreviewTime.textContent = formatPreviewTime(state.progress);
  framePreviewCount.textContent = `${String(frameIndex + 1).padStart(3, '0')} / ${String(total).padStart(3, '0')}`;

  if (!force && frameIndex === previewLastFrame) return;
  const col = frameIndex % layout.cols;
  const row = Math.floor(frameIndex / layout.cols);
  const targetW = 320;
  const targetH = 180;
  if (framePreviewCanvas.width !== targetW || framePreviewCanvas.height !== targetH) {
    framePreviewCanvas.width = targetW;
    framePreviewCanvas.height = targetH;
    framePreviewCtx.imageSmoothingEnabled = true;
    try { framePreviewCtx.imageSmoothingQuality = 'high'; } catch (_) {}
  }
  framePreviewCtx.fillStyle = '#050506';
  framePreviewCtx.fillRect(0, 0, targetW, targetH);
  const srcAspect = layout.tileW / Math.max(1, layout.tileH);
  const dstAspect = targetW / targetH;
  let dx = 0, dy = 0, dw = targetW, dh = targetH;
  if (srcAspect > dstAspect) {
    dh = targetW / srcAspect;
    dy = (targetH - dh) * 0.5;
  } else {
    dw = targetH * srcAspect;
    dx = (targetW - dw) * 0.5;
  }
  framePreviewCtx.drawImage(
    atlasCanvas,
    col * layout.tileW,
    row * layout.tileH,
    layout.tileW,
    layout.tileH,
    dx,
    dy,
    dw,
    dh
  );
  previewLastFrame = frameIndex;
}

function syncFramePreviewVisibility() {
  if (!framePreviewHud) return;
  const show = state.framePreviewEnabled && !!atlasTexture && !state.processing && volume.visible;
  framePreviewHud.hidden = !show;
  document.body.classList.toggle('frame-preview-on', show);
  if (show) renderFramePreview(true);
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
  disposeObj(timeRulerGroup); timeRulerGroup = null;
  disposeObj(presentPlaneFill); presentPlaneFill = null;
  disposeObj(presentPlaneGrid); presentPlaneGrid = null;
  disposeObj(presentPlaneOutline); presentPlaneOutline = null;
  presentLabel = pastLabel = futureLabel = presentMarker = null;
  timeMarksGroup = null;
  timeWordsGroup = null;

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
      uFutureOn: { value: futureToggle.checked ? 1 : 0 },
      uFutureOpacity: { value: state.futureOpacity },
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
      uniform float uFutureOn;
      uniform float uFutureOpacity;
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
        // Separamos pasado/presente de futuro. Si "Visualizar futuro" está
        // apagado conservamos el comportamiento clásico y descartamos lo que
        // todavía no ha ocurrido.
        float isFuture = step(uProgress + uSliceStep * 0.52, vSlice);
        if (isFuture > 0.5 && uFutureOn < 0.5) discard;

        float col = mod(vFrame, uCols);
        float row = floor(vFrame / uCols);
        vec2 atlasUV = (vec2(col, row) + videoUV()) / vec2(uCols, uRows);
        vec4 tex = texture2D(uAtlas, atlasUV);
        vec3 color = max(vec3(0.0), tex.rgb * uBrightness);

        // El futuro es una huella ya colocada en el volumen, pero no tan
        // definida como lo que ya ocurrió. No inventamos fotogramas: son las
        // mismas rebanadas capturadas del clip, sólo con otra lectura visual.
        float futureDistance = clamp((vSlice - uProgress) / max(1.0 - uProgress, uSliceStep), 0.0, 1.0);
        float futureAlpha = uFutureOpacity * mix(0.15, 0.055, futureDistance);
        vec3 futureColor = color * mix(0.88, 0.68, futureDistance);

        if (uSolidMode > 0.5) {
          if (isFuture > 0.5) {
            gl_FragColor = vec4(futureColor, futureAlpha * 1.45);
          } else {
            gl_FragColor = vec4(color, 1.0);
          }
          return;
        }

        float age = clamp((uProgress - vSlice) / max(uProgress, uSliceStep), 0.0, 1.0);
        float nearest = 1.0 - smoothstep(0.0, uSliceStep * 1.10, abs(vSlice - uProgress));
        float trail = mix(0.14, 0.055, age);
        float pastAlpha = min(0.98, trail + nearest * 0.86);
        pastAlpha *= mix(1.0, 1.04, vInfluence);

        float alpha = mix(pastAlpha, futureAlpha, isFuture);
        vec3 finalColor = mix(color, futureColor, isFuture);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: !solid || futureToggle.checked,
    depthWrite: solid && !futureToggle.checked,
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
  buildTimeRuler();
  buildPresentPlane();
  updateCoordinateVisibility();
  updateTimeInfoVisibility();
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
  const mobile = matchMedia('(max-width: 760px)').matches;
  // Cada línea se subdivide en tramos pequeños. Así el shader puede curvarla
  // suavemente alrededor de la esfera, en vez de mover solo sus extremos.
  const curveSegments = mobile ? 24 : 32;

  const addSegmentedLine = (ax, ay, az, bx, by, bz, segments = curveSegments) => {
    for (let i = 0; i < segments; i++) {
      const t0 = i / segments;
      const t1 = (i + 1) / segments;
      pts.push(
        THREE.MathUtils.lerp(ax, bx, t0),
        THREE.MathUtils.lerp(ay, by, t0),
        THREE.MathUtils.lerp(az, bz, t0),
        THREE.MathUtils.lerp(ax, bx, t1),
        THREE.MathUtils.lerp(ay, by, t1),
        THREE.MathUtils.lerp(az, bz, t1),
      );
    }
  };

  // Planos horizontales XZ.
  for (let iy = 1; iy < ny; iy++) {
    const y = -H / 2 + H * iy / ny;
    for (let iz = 0; iz <= nz; iz++) {
      const z = -D / 2 + D * iz / nz;
      addSegmentedLine(-W / 2, y, z, W / 2, y, z);
    }
    for (let ix = 0; ix <= nx; ix++) {
      const x = -W / 2 + W * ix / nx;
      addSegmentedLine(x, y, -D / 2, x, y, D / 2);
    }
  }

  // Columnas temporales internas.
  for (let ix = 1; ix < nx; ix++) {
    const x = -W / 2 + W * ix / nx;
    for (let iz = 1; iz < nz; iz++) {
      const z = -D / 2 + D * iz / nz;
      addSegmentedLine(x, -H / 2, z, x, H / 2, z);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

  // La cuadrícula usa EXACTAMENTE la misma deformación espacial/temporal
  // que los fotogramas. No hay un segundo modo ni un toggle extra:
  // esfera apagada = recta; esfera encendida = se curva automáticamente.
  const gridMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uSphereOn: { value: sphereToggle.checked ? 1 : 0 },
      uRadius: { value: Number(radiusSlider.value) },
      uStrength: { value: Number(strengthSlider.value) },
      uOpacity: { value: state.gridOpacity },
      uColor: { value: new THREE.Color(0xc2c2ca) },
    },
    vertexShader: `
      precision highp float;
      uniform float uSphereOn;
      uniform float uRadius;
      uniform float uStrength;

      void main(){
        vec3 p = position;
        vec3 delta = -p;
        float d = length(delta);
        float q = clamp(1.0 - d / max(uRadius, 0.001), 0.0, 1.0);
        float inf = q*q*(3.0-2.0*q) * uSphereOn;
        vec3 dir = delta / max(d, 0.0001);

        // Mismo campo visual de deformación que usan los fotogramas.
        p += dir * inf * uStrength * uRadius * 0.38;
        // Misma compresión del eje temporal (Y) usada para sugerir dilatación.
        p.y += sign(-p.y) * inf * uStrength * uRadius * 0.10;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform vec3 uColor;
      uniform float uOpacity;

      void main(){
        gl_FragColor = vec4(uColor, uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
  });

  gridLines = new THREE.LineSegments(g, gridMaterial);
  gridLines.visible = gridToggle.checked;
  gridLines.frustumCulled = false;
  gridLines.renderOrder = 20;
  volume.add(gridLines);
}

function buildPresentPlane() {
  const W = state.planeW * 1.10;
  const D = state.planeD * 1.12;
  const zShift = (D - state.planeD) * 0.5;
  const segX = matchMedia('(max-width: 760px)').matches ? 18 : 24;
  const segZ = Math.max(12, Math.round(segX / Math.max(0.55, state.aspect)));
  const [r, g, b] = hexToRgb01(state.presentPlaneColor);

  const planeGeo = new THREE.PlaneGeometry(W, D, segX, segZ);
  planeGeo.rotateX(-Math.PI / 2);
  planeGeo.translate(0, 0, zShift);

  const deformVS = `
    precision highp float;
    uniform float uPresentY;
    uniform float uSphereOn;
    uniform float uRadius;
    uniform float uStrength;
    varying vec2 vUv;
    void main(){
      vec3 p = position + vec3(0.0, uPresentY, 0.0);
      vec3 delta = -p;
      float d = length(delta);
      float q = clamp(1.0 - d / max(uRadius, 0.001), 0.0, 1.0);
      float inf = q*q*(3.0-2.0*q) * uSphereOn;
      vec3 dir = delta / max(d, 0.0001);
      p += dir * inf * uStrength * uRadius * 0.38;
      p.y += sign(-p.y) * inf * uStrength * uRadius * 0.10;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;

  presentPlaneFill = new THREE.Mesh(
    planeGeo,
    new THREE.ShaderMaterial({
      uniforms: {
        uPresentY: { value: 0 },
        uSphereOn: { value: sphereToggle.checked ? 1 : 0 },
        uRadius: { value: Number(radiusSlider.value) },
        uStrength: { value: Number(strengthSlider.value) },
        uColor: { value: new THREE.Vector3(r, g, b) },
        uOpacity: { value: state.presentPlaneOpacity },
      },
      vertexShader: deformVS,
      fragmentShader: `
        precision highp float;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main(){
          float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
          float fade = smoothstep(0.0, 0.14, edge);
          gl_FragColor = vec4(uColor, uOpacity * fade * 0.95);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      blending: THREE.NormalBlending,
    })
  );
  presentPlaneFill.renderOrder = 16;
  presentPlaneFill.visible = state.presentPlaneOn && state.presentPlaneMode === 'solid';
  volume.add(presentPlaneFill);

  const gridPts = [];
  const gx = 8, gz = 8;
  for (let ix = 0; ix <= gx; ix++) {
    const x = -W / 2 + W * ix / gx;
    gridPts.push(x, 0, -D / 2 + zShift, x, 0, D / 2 + zShift);
  }
  for (let iz = 0; iz <= gz; iz++) {
    const z = -D / 2 + zShift + D * iz / gz;
    gridPts.push(-W / 2, 0, z, W / 2, 0, z);
  }
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPts, 3));
  presentPlaneGrid = new THREE.LineSegments(
    gridGeo,
    new THREE.ShaderMaterial({
      uniforms: {
        uPresentY: { value: 0 },
        uSphereOn: { value: sphereToggle.checked ? 1 : 0 },
        uRadius: { value: Number(radiusSlider.value) },
        uStrength: { value: Number(strengthSlider.value) },
        uColor: { value: new THREE.Vector3(r, g, b) },
        uOpacity: { value: state.presentPlaneOpacity },
      },
      vertexShader: `
        precision highp float;
        uniform float uPresentY;
        uniform float uSphereOn;
        uniform float uRadius;
        uniform float uStrength;
        void main(){
          vec3 p = position + vec3(0.0, uPresentY, 0.0);
          vec3 delta = -p;
          float d = length(delta);
          float q = clamp(1.0 - d / max(uRadius, 0.001), 0.0, 1.0);
          float inf = q*q*(3.0-2.0*q) * uSphereOn;
          vec3 dir = delta / max(d, 0.0001);
          p += dir * inf * uStrength * uRadius * 0.38;
          p.y += sign(-p.y) * inf * uStrength * uRadius * 0.10;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main(){ gl_FragColor = vec4(uColor, uOpacity); }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
    })
  );
  presentPlaneGrid.renderOrder = 17;
  presentPlaneGrid.visible = state.presentPlaneOn && state.presentPlaneMode === 'grid';
  volume.add(presentPlaneGrid);

  const outlineGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W, 0.001, D).translate(0, 0, zShift));
  presentPlaneOutline = new THREE.LineSegments(
    outlineGeo,
    new THREE.ShaderMaterial({
      uniforms: {
        uPresentY: { value: 0 },
        uSphereOn: { value: sphereToggle.checked ? 1 : 0 },
        uRadius: { value: Number(radiusSlider.value) },
        uStrength: { value: Number(strengthSlider.value) },
        uColor: { value: new THREE.Vector3(r, g, b) },
        uOpacity: { value: state.presentPlaneOutlineOpacity },
      },
      vertexShader: `
        precision highp float;
        uniform float uPresentY;
        uniform float uSphereOn;
        uniform float uRadius;
        uniform float uStrength;
        void main(){
          vec3 p = position + vec3(0.0, uPresentY, 0.0);
          vec3 delta = -p;
          float d = length(delta);
          float q = clamp(1.0 - d / max(uRadius, 0.001), 0.0, 1.0);
          float inf = q*q*(3.0-2.0*q) * uSphereOn;
          vec3 dir = delta / max(d, 0.0001);
          p += dir * inf * uStrength * uRadius * 0.38;
          p.y += sign(-p.y) * inf * uStrength * uRadius * 0.10;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main(){ gl_FragColor = vec4(uColor, uOpacity); }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
    })
  );
  presentPlaneOutline.renderOrder = 18;
  presentPlaneOutline.visible = state.presentPlaneOn;
  volume.add(presentPlaneOutline);

  updatePresentPlaneVisibility();
  updatePresentPlanePosition();
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

function makeTextSprite(text, options = {}) {
  const c = document.createElement('canvas');
  c.width = options.canvasW || 512;
  c.height = options.canvasH || 96;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const weight = options.weight || 600;
  const fontSize = options.fontSize || 32;
  ctx.font = `${weight} ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillStyle = options.fill || 'rgba(238,238,242,.84)';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, options.padX || 14, c.height * 0.52);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: options.opacity ?? 1,
    depthTest: false,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(options.scaleX || 1.7, options.scaleY || .32, 1);
  return sprite;
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

function buildTimeRuler() {
  timeRulerGroup = new THREE.Group();
  timeMarksGroup = new THREE.Group();
  timeWordsGroup = new THREE.Group();

  const W = state.planeW, H = state.timeH, D = state.planeD;
  const x = -W / 2 - 0.44;
  const z = D / 2 + 0.12;
  const y0 = -H / 2;
  const y1 = H / 2;

  const lineMat = new THREE.LineBasicMaterial({
    color: 0xb9b9c0,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
    depthTest: false
  });

  const pts = [new THREE.Vector3(x, y0, z), new THREE.Vector3(x, y1, z)];
  const tickTimes = [];
  const dur = Math.max(0.001, state.clipDuration);
  for (let t = 0; t <= Math.floor(dur + 1e-6); t += 1) tickTimes.push(t);
  if (Math.abs(tickTimes[tickTimes.length - 1] - dur) > 0.05) tickTimes.push(dur);

  for (const t of tickTimes) {
    const f = THREE.MathUtils.clamp(t / dur, 0, 1);
    const y = THREE.MathUtils.lerp(y0, y1, f);
    pts.push(new THREE.Vector3(x - 0.12, y, z), new THREE.Vector3(x + 0.14, y, z));

    const label = makeTextSprite(`${Number.isInteger(t) ? t.toFixed(0) : t.toFixed(1)} s`, {
      fontSize: 31,
      weight: 560,
      fill: 'rgba(214,214,220,.76)',
      opacity: 0.9,
      scaleX: 0.88,
      scaleY: 0.20
    });
    label.position.set(x - 0.56, y, z);
    timeMarksGroup.add(label);
  }

  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.LineSegments(g, lineMat);
  line.renderOrder = 40;
  timeMarksGroup.add(line);

  pastLabel = makeTextSprite('PASADO', {
    fontSize: 32, weight: 670, fill: 'rgba(205,205,212,.54)', opacity: 0.58, scaleX: 1.02, scaleY: 0.22
  });
  presentLabel = makeTextSprite('PRESENTE', {
    fontSize: 35, weight: 760, fill: 'rgba(248,248,250,.98)', opacity: 1, scaleX: 1.22, scaleY: 0.25
  });
  futureLabel = makeTextSprite('FUTURO', {
    fontSize: 32, weight: 670, fill: 'rgba(205,205,212,.54)', opacity: 0.58, scaleX: 1.02, scaleY: 0.22
  });

  const labelX = x - 1.08;
  pastLabel.position.set(labelX, y0 + H * 0.25, z);
  presentLabel.position.set(labelX, y0, z);
  futureLabel.position.set(labelX, y0 + H * 0.75, z);
  timeWordsGroup.add(pastLabel, presentLabel, futureLabel);

  presentMarker = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.022, 0.022),
    new THREE.MeshBasicMaterial({ color: 0xf2f2f4, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false })
  );
  presentMarker.position.set(x + 0.07, y0, z);
  presentMarker.renderOrder = 41;
  timeWordsGroup.add(presentMarker);

  timeRulerGroup.add(timeMarksGroup, timeWordsGroup);
  volume.add(timeRulerGroup);
  updateTimeRuler();
}

function updateTimeRuler() {
  if (!timeRulerGroup || !presentLabel || !pastLabel || !futureLabel || !presentMarker) return;
  const H = state.timeH;
  const y0 = -H / 2;
  const y1 = H / 2;
  const f = THREE.MathUtils.clamp(state.progress / Math.max(0.001, state.clipDuration), 0, 1);
  const y = THREE.MathUtils.lerp(y0, y1, f);

  presentLabel.position.y = y;
  presentMarker.position.y = y;

  const pastSpan = y - y0;
  const futureSpan = y1 - y;
  pastLabel.visible = state.showTimeWords && pastSpan > H * 0.06;
  futureLabel.visible = state.showTimeWords && futureSpan > H * 0.06;
  presentLabel.visible = state.showTimeWords;
  presentMarker.visible = state.showTimeWords;

  if (pastLabel.visible) pastLabel.position.y = y0 + pastSpan * 0.48;
  if (futureLabel.visible) futureLabel.position.y = y + futureSpan * 0.52;

  if (timeMarksGroup) timeMarksGroup.visible = state.showSecondMarks;
  if (timeWordsGroup) timeWordsGroup.visible = state.showTimeWords;
}

function updateCoordinateVisibility() {
  state.showCoordinates = coordinatesToggle.checked;
  if (axesGroup) axesGroup.visible = state.showCoordinates;
  if (axisLegendEl) axisLegendEl.style.display = state.showCoordinates ? '' : 'none';
}

function updateTimeInfoVisibility() {
  state.showTimeWords = timeWordsToggle.checked;
  state.showSecondMarks = secondMarksToggle.checked;
  if (timeMarksGroup) timeMarksGroup.visible = state.showSecondMarks;
  if (timeWordsGroup) timeWordsGroup.visible = state.showTimeWords;
  updateTimeRuler();
}

function setPresentPlaneMode(mode) {
  if (mode !== 'solid' && mode !== 'grid') return;
  state.presentPlaneMode = mode;
  presentPlaneSolidBtn.classList.toggle('active', mode === 'solid');
  presentPlaneGridBtn.classList.toggle('active', mode === 'grid');
  presentPlaneModeOut.textContent = mode === 'grid' ? 'Cuadrícula' : 'Sólido';
  updatePresentPlaneVisibility();
}

function updatePresentPlaneControlsUI() {
  state.presentPlaneOn = presentPlaneToggle.checked;
  presentPlaneControls.classList.toggle('off', !state.presentPlaneOn);
  updatePresentPlaneVisibility();
}

function updatePresentPlaneVisibility() {
  const on = state.presentPlaneOn;
  if (presentPlaneFill) presentPlaneFill.visible = on && state.presentPlaneMode === 'solid';
  if (presentPlaneGrid) presentPlaneGrid.visible = on && state.presentPlaneMode === 'grid';
  if (presentPlaneOutline) presentPlaneOutline.visible = on;
}

function updatePresentPlanePosition() {
  const y = THREE.MathUtils.lerp(-state.timeH / 2, state.timeH / 2, THREE.MathUtils.clamp(state.progress / Math.max(0.001, state.clipDuration), 0, 1));
  const objs = [presentPlaneFill, presentPlaneGrid, presentPlaneOutline];
  for (const obj of objs) {
    if (!obj?.material?.uniforms) continue;
    obj.material.uniforms.uPresentY.value = y + 0.006;
    obj.material.uniforms.uSphereOn.value = sphereToggle.checked ? 1 : 0;
    obj.material.uniforms.uRadius.value = Number(radiusSlider.value);
    obj.material.uniforms.uStrength.value = Number(strengthSlider.value);
    if (obj === presentPlaneFill) {
      obj.material.uniforms.uOpacity.value = state.presentPlaneOpacity;
      const [r, g, b] = hexToRgb01(state.presentPlaneColor);
      obj.material.uniforms.uColor.value.set(r, g, b);
    } else if (obj === presentPlaneGrid) {
      obj.material.uniforms.uOpacity.value = Math.max(state.presentPlaneOpacity, 0.05);
      const [r, g, b] = hexToRgb01(state.presentPlaneColor);
      obj.material.uniforms.uColor.value.set(r, g, b);
    } else if (obj === presentPlaneOutline) {
      obj.material.uniforms.uOpacity.value = state.presentPlaneOutlineOpacity;
      const [r, g, b] = hexToRgb01(state.presentPlaneColor);
      obj.material.uniforms.uColor.value.set(r, g, b);
    }
  }
}

function resetView() {
  const s = Math.max(state.planeW, state.planeD, state.timeH);
  camera.position.set(s * 1.22, s * .88, s * 1.34);
  controls.target.set(0, 0, 0);
  controls.update();
  requestSceneRender(4);
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


const MIN_TRIM_DURATION = 0.20;

function getSourceDuration() {
  const d = state.hasVideo && Number.isFinite(video.duration) ? video.duration : state.sourceDuration;
  return Math.max(MIN_TRIM_DURATION, d || state.maxClipDuration);
}

function maybeSnapTrimTime(value) {
  if (!state.snapToSeconds) return value;
  const nearest = Math.round(value);
  const threshold = 0.16;
  return Math.abs(value - nearest) <= threshold ? nearest : value;
}

function normalizedTrimRange(start, end, moved = 'end') {
  const source = getSourceDuration();
  start = THREE.MathUtils.clamp(Number(start) || 0, 0, Math.max(0, source - MIN_TRIM_DURATION));
  end = THREE.MathUtils.clamp(Number(end) || MIN_TRIM_DURATION, MIN_TRIM_DURATION, source);

  if (end - start < MIN_TRIM_DURATION) {
    if (moved === 'start') start = Math.max(0, end - MIN_TRIM_DURATION);
    else end = Math.min(source, start + MIN_TRIM_DURATION);
  }

  if (end - start > state.maxClipDuration) {
    if (moved === 'start') start = Math.max(0, end - state.maxClipDuration);
    else end = Math.min(source, start + state.maxClipDuration);
  }

  if (end > source) {
    end = source;
    start = Math.max(0, end - Math.min(state.maxClipDuration, end));
  }
  if (start < 0) {
    start = 0;
    end = Math.min(source, Math.max(MIN_TRIM_DURATION, Math.min(state.maxClipDuration, end)));
  }

  return { start, end, duration: end - start };
}

function updatePresetButtons() {
  const duration = state.clipEnd - state.clipStart;
  for (const btn of presetButtons) {
    const value = Number(btn.dataset.duration);
    btn.classList.toggle('active', Math.abs(duration - value) < 0.035);
  }
}

function buildTrimTicks() {
  if (!trimTicks) return;
  trimTicks.innerHTML = '';
  const source = getSourceDuration();
  // Keep the editor readable for long source videos: dense seconds for short
  // clips, then increasingly sparse labels while retaining precise handles.
  let step = 1;
  if (source > 30) step = 5;
  if (source > 90) step = 10;
  if (source > 300) step = 30;
  const count = Math.floor(source / step);
  const maxLabels = 16;
  if (count > maxLabels) step *= Math.ceil(count / maxLabels);

  for (let t = 0; t <= source + 1e-6; t += step) {
    const span = document.createElement('span');
    span.className = 'trim-tick';
    span.style.left = `${(t / source) * 100}%`;
    span.textContent = `${Math.round(t)}s`;
    trimTicks.appendChild(span);
  }
  if (source % step > 0.05) {
    const span = document.createElement('span');
    span.className = 'trim-tick';
    span.style.left = '100%';
    span.textContent = `${source < 20 ? source.toFixed(1) : Math.round(source)}s`;
    trimTicks.appendChild(span);
  }
}

function buildTimelineTicks() {
  if (!timelineTicks) return;
  timelineTicks.innerHTML = '';
  const dur = Math.max(MIN_TRIM_DURATION, state.clipDuration);
  const maxLabels = matchMedia('(max-width: 420px)').matches ? 6 : 11;
  let step = 1;
  if (dur > maxLabels - 1) step = 2;
  for (let t = 0; t <= Math.floor(dur + 1e-6); t += step) {
    const span = document.createElement('span');
    span.textContent = `${t}`;
    timelineTicks.appendChild(span);
  }
  const last = timelineTicks.lastElementChild;
  if (!last || Number(last.textContent) < dur - 0.05) {
    const span = document.createElement('span');
    span.textContent = Number.isInteger(dur) ? `${dur}` : dur.toFixed(1);
    timelineTicks.appendChild(span);
  }
}

function syncTrimUI() {
  const source = getSourceDuration();
  const { start, end, duration } = normalizedTrimRange(state.clipStart, state.clipEnd, 'end');
  state.clipStart = start;
  state.clipEnd = end;
  state.clipDuration = duration;

  clipStartInput.value = start.toFixed(2);
  clipEndInput.value = end.toFixed(2);
  clipStartInput.max = Math.max(0, source - MIN_TRIM_DURATION).toFixed(2);
  clipEndInput.max = source.toFixed(2);

  trimStartOut.textContent = `${start.toFixed(2)} s`;
  trimDurationOut.textContent = `${duration.toFixed(2)} s`;
  trimEndOut.textContent = `${end.toFixed(2)} s`;

  const trackWidth = Math.max(1, trimBar.clientWidth - 24);
  const leftPx = 12 + (start / source) * trackWidth;
  const rightPx = 12 + (end / source) * trackWidth;
  trimStartHandle.style.left = `${leftPx}px`;
  trimEndHandle.style.left = `${rightPx}px`;
  trimSelection.style.left = `${leftPx}px`;
  trimSelection.style.width = `${Math.max(2, rightPx - leftPx)}px`;

  updatePresetButtons();
}

function setTrimRange(start, end, moved = 'end', { updateTimeline = false } = {}) {
  const range = normalizedTrimRange(start, end, moved);
  state.clipStart = range.start;
  state.clipEnd = range.end;
  state.clipDuration = range.duration;
  syncTrimUI();
  if (moved === 'start') scheduleTrimPreviewSeek(range.start);
  else if (moved === 'range') scheduleTrimPreviewSeek((range.start + range.end) * 0.5);
  else scheduleTrimPreviewSeek(range.end);
  if (updateTimeline) {
    state.progress = Math.min(state.progress, state.clipDuration);
    scrubber.max = state.clipDuration;
    scrubber.value = state.progress;
    currentTimeEl.textContent = state.progress.toFixed(1);
    totalTimeEl.textContent = `${state.clipDuration.toFixed(1)} s`;
    buildTimelineTicks();
  }
}

function applyDurationPreset(seconds) {
  const source = getSourceDuration();
  const dur = Math.min(Number(seconds), state.maxClipDuration, source);
  let start = state.clipStart;
  let end = start + dur;
  if (end > source) {
    end = source;
    start = Math.max(0, end - dur);
  }
  setTrimRange(start, end, 'end');
}

function trimTimeFromClientX(clientX) {
  const rect = trimBar.getBoundingClientRect();
  const pad = 12;
  const usable = Math.max(1, rect.width - pad * 2);
  const x = THREE.MathUtils.clamp(clientX - rect.left - pad, 0, usable);
  return (x / usable) * getSourceDuration();
}

function attachTrimDrag(handle, kind) {
  let pointerId = null;
  let dragStartX = 0;
  let dragStartA = 0;
  let dragStartB = 0;

  const onPointerDown = (e) => {
    e.preventDefault();
    pointerId = e.pointerId;
    dragStartX = e.clientX;
    dragStartA = state.clipStart;
    dragStartB = state.clipEnd;
    handle.setPointerCapture?.(pointerId);
  };

  const onPointerMove = (e) => {
    if (pointerId !== e.pointerId) return;
    e.preventDefault();
    if (kind === 'start') {
      let t = maybeSnapTrimTime(trimTimeFromClientX(e.clientX));
      t = Math.max(state.clipEnd - state.maxClipDuration, Math.min(t, state.clipEnd - MIN_TRIM_DURATION));
      setTrimRange(t, state.clipEnd, 'start');
    } else if (kind === 'end') {
      let t = maybeSnapTrimTime(trimTimeFromClientX(e.clientX));
      t = Math.min(state.clipStart + state.maxClipDuration, Math.max(t, state.clipStart + MIN_TRIM_DURATION));
      setTrimRange(state.clipStart, t, 'end');
    } else {
      const rect = trimBar.getBoundingClientRect();
      const usable = Math.max(1, rect.width - 24);
      let delta = (e.clientX - dragStartX) / usable * getSourceDuration();
      if (state.snapToSeconds) {
        const snappedStart = maybeSnapTrimTime(dragStartA + delta);
        if (snappedStart !== dragStartA + delta) delta = snappedStart - dragStartA;
        else {
          const snappedEnd = maybeSnapTrimTime(dragStartB + delta);
          if (snappedEnd !== dragStartB + delta) delta = snappedEnd - dragStartB;
        }
      }
      const dur = dragStartB - dragStartA;
      let start = THREE.MathUtils.clamp(dragStartA + delta, 0, Math.max(0, getSourceDuration() - dur));
      setTrimRange(start, start + dur, 'range');
    }
  };

  const onPointerUp = (e) => {
    if (pointerId !== e.pointerId) return;
    handle.releasePointerCapture?.(pointerId);
    pointerId = null;
  };

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('pointermove', onPointerMove);
  handle.addEventListener('pointerup', onPointerUp);
  handle.addEventListener('pointercancel', onPointerUp);
}

attachTrimDrag(trimStartHandle, 'start');
attachTrimDrag(trimEndHandle, 'end');
attachTrimDrag(trimSelection, 'range');

function restoreClipSettingsHome() {
  if (!clipSettings || !clipSettingsHome) return;
  clipSettingsHome.insertAdjacentElement('afterend', clipSettings);
}

function openTrimModal() {
  if (!trimModal || !trimModalMount || !clipSettings) return;
  trimModalMount.appendChild(clipSettings);
  trimModal.hidden = false;
  document.body.classList.add('trim-modal-open');
  if (trimPreview && state.sourceUrl) {
    trimPreview.src = state.sourceUrl;
    trimPreview.load();
    trimPreview.onloadedmetadata = () => scheduleTrimPreviewSeek(state.clipStart);
  }
  requestAnimationFrame(() => {
    buildTrimTicks();
    syncTrimUI();
    scheduleTrimPreviewSeek(state.clipStart);
  });
}

function closeTrimModal() {
  if (!trimModal) return;
  trimModal.hidden = true;
  document.body.classList.remove('trim-modal-open');
  restoreClipSettingsHome();
  if (trimPreview) {
    try { trimPreview.pause(); } catch (_) {}
    trimPreview.removeAttribute('src');
    trimPreview.load();
  }
}

async function processVideo() {
  if (!state.hasVideo || !Number.isFinite(video.duration)) return buildDemoAtlas();

  state.playing = false;
  playBtn.textContent = '▶';
  state.sourceDuration = video.duration;

  const requestedStart = Number(clipStartInput.value);
  const requestedEnd = Number(clipEndInput.value);
  const range = normalizedTrimRange(
    Number.isFinite(requestedStart) ? requestedStart : state.clipStart,
    Number.isFinite(requestedEnd) ? requestedEnd : state.clipEnd,
    'end'
  );
  state.clipStart = range.start;
  state.clipEnd = range.end;
  state.clipDuration = range.duration;
  syncTrimUI();

  const start = state.clipStart;
  const dur = state.clipDuration;
  scrubber.max = dur;
  scrubber.value = 0;
  state.progress = 0;
  totalTimeEl.textContent = `${dur.toFixed(1)} s`;
  currentTimeEl.textContent = '0.0';
  buildTimelineTicks();

  state.aspect = video.videoWidth / Math.max(1, video.videoHeight);
  fitDimensions(state.aspect);
  const count = state.slices;
  const L = makeAtlasLayout(count, state.aspect);
  atlasCanvas.width = L.cols * L.tileW;
  atlasCanvas.height = L.rows * L.tileH;
  atlasCtx.fillStyle = '#000';
  atlasCtx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
  beginProcessing();
  setStatus(`Procesando ${dur.toFixed(2)} s del video…`, 0);

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
    initHomeVisualState();
    endProcessing(true);
    clearStatus();
  } catch (err) {
    console.error(err);
    endProcessing(true);
    setStatus('No pude decodificar ese video. Prueba MP4/H.264 o un recorte más corto.', 1);
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
    initHomeVisualState();
    state.sourceDuration = Math.max(MIN_TRIM_DURATION, video.duration);
    const defaultDur = Math.min(state.maxClipDuration, state.sourceDuration);
    state.clipStart = 0;
    state.clipEnd = defaultDur;
    state.clipDuration = defaultDur;
    buildTrimTicks();
    syncTrimUI();
    clearStatus();
    openTrimModal();
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

function updateFutureUI(rebuild = false) {
  const on = futureToggle.checked;
  futureOpacityBlock.classList.toggle('off', !on);
  if (rebuild && atlasTexture) rebuildVolume(atlasTexture.userData.layout, false);
}

function updatePlayback(now) {
  animationFrameHandle = null;
  const dt = Math.min(.05, Math.max(0, (now - state.lastT) / 1000));
  state.lastT = now;

  // Durante la extracción o cuando la pestaña está oculta no mantenemos un RAF activo.
  if (state.processing || document.hidden) return;

  if (state.playing) {
    state.progress += dt;
    if (state.progress >= state.clipDuration) {
      state.progress = state.clipDuration;
      state.playing = false;
      playBtn.textContent = '▶';
    }
    scrubber.value = state.progress;
    currentTimeEl.textContent = state.progress.toFixed(1);
    sceneNeedsRender = true;
  }

  const shouldRender = state.playing || sceneNeedsRender || dampingFrames > 0;
  if (!shouldRender) return;

  if (sliceMaterial) {
    sliceMaterial.uniforms.uProgress.value = state.clipDuration ? state.progress / state.clipDuration : 0;
    sliceMaterial.uniforms.uSphereOn.value = sphereToggle.checked ? 1 : 0;
    sliceMaterial.uniforms.uRadius.value = Number(radiusSlider.value);
    sliceMaterial.uniforms.uStrength.value = Number(strengthSlider.value);
    sliceMaterial.uniforms.uBrightness.value = state.brightness;
    sliceMaterial.uniforms.uFutureOn.value = futureToggle.checked ? 1 : 0;
    sliceMaterial.uniforms.uFutureOpacity.value = state.futureOpacity;
  }
  if (sphere) sphere.visible = sphereToggle.checked;
  if (gridLines) {
    gridLines.visible = gridToggle.checked;
    gridLines.material.uniforms.uSphereOn.value = sphereToggle.checked ? 1 : 0;
    gridLines.material.uniforms.uRadius.value = Number(radiusSlider.value);
    gridLines.material.uniforms.uStrength.value = Number(strengthSlider.value);
    gridLines.material.uniforms.uOpacity.value = state.gridOpacity;
  }

  updatePresentPlanePosition();
  updateTimeRuler();
  renderFramePreview(false);
  controls.update();
  renderer.render(scene, camera);
  sceneNeedsRender = false;
  if (dampingFrames > 0) dampingFrames--;

  // Sólo seguimos pidiendo frames mientras algo realmente cambia.
  if (state.playing || dampingFrames > 0 || sceneNeedsRender) ensureAnimationLoop();
}

function setOrbitalOpen(open) {
  if (!orbitalNav || !orbitalToggle) return;
  orbitalNav.classList.toggle('open', !!open);
  orbitalToggle.setAttribute('aria-label', open ? 'Cerrar menú orbital' : 'Abrir menú orbital');
  orbitalToggle.querySelector('.orbital-core-mark').textContent = open ? '×' : '+';
}

function closeOrbital() { setOrbitalOpen(false); }

function syncPanelWindow(target = 'video') {
  const labelMap = {
    video: ['CAPAS', 'Video y tiempo'],
    gravity: ['CAPAS', 'Gravedad y cuadrícula'],
    guides: ['CAPAS', 'Rebanadas'],
    clip: ['CAPAS', 'Recorte temporal'],
  };
  state.activePanelTarget = target;
  panelWindows.forEach(win => {
    const active = win.dataset.window === target;
    win.classList.toggle('active', active);
    if (win.tagName === 'DETAILS') win.open = true;
  });
  const [eyebrow, title] = labelMap[target] || labelMap.video;
  if (panelEyebrowEl) panelEyebrowEl.textContent = eyebrow;
  if (panelTitleEl) panelTitleEl.textContent = title;
  orbitalItems.forEach(btn => btn.classList.toggle('active', btn.dataset.panelTarget === target));
}

function openPanelSection(target = 'video') {
  syncPanelWindow(target);
  panel.classList.add('open');
  document.body.classList.add('panel-open');
  if (matchMedia('(max-width: 760px)').matches) closeOrbital();
}

function closePanelUI() {
  panel.classList.remove('open');
  document.body.classList.remove('panel-open');
  closeOrbital();
}

function initHomeVisualState() {
  if (!dropHint) return;
  dropHint.classList.toggle('hidden', state.hasVideo);
}

input.addEventListener('change', () => loadVideoFile(input.files?.[0]));
processBtn.addEventListener('click', async () => {
  const wasModalOpen = trimModal && !trimModal.hidden;
  if (wasModalOpen) closeTrimModal();
  await processVideo();
});

trimAcceptBtn?.addEventListener('click', async () => {
  closeTrimModal();
  await processVideo();
});

snapToggle.addEventListener('change', () => {
  state.snapToSeconds = snapToggle.checked;
});

for (const btn of presetButtons) {
  btn.addEventListener('click', () => applyDurationPreset(Number(btn.dataset.duration)));
}

clipStartInput.addEventListener('change', () => {
  const start = Number(clipStartInput.value);
  setTrimRange(start, state.clipEnd, 'start');
});
clipEndInput.addEventListener('change', () => {
  const end = Number(clipEndInput.value);
  setTrimRange(state.clipStart, end, 'end');
});

playBtn.addEventListener('click', () => {
  if (state.progress >= state.clipDuration - .001) state.progress = 0;
  state.playing = !state.playing;
  playBtn.textContent = state.playing ? 'Ⅱ' : '▶';
  requestSceneRender(1);
});

rewindBtn.addEventListener('click', () => {
  state.playing = false;
  state.progress = 0;
  scrubber.value = 0;
  currentTimeEl.textContent = '0.0';
  playBtn.textContent = '▶';
  requestSceneRender(2);
});

scrubber.addEventListener('input', () => {
  state.playing = false;
  playBtn.textContent = '▶';
  state.progress = Number(scrubber.value);
  currentTimeEl.textContent = state.progress.toFixed(1);
  requestSceneRender(2);
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

framePreviewToggle?.addEventListener('change', () => {
  state.framePreviewEnabled = framePreviewToggle.checked;
  previewLastFrame = -1;
  syncFramePreviewVisibility();
});

futureToggle.addEventListener('change', () => updateFutureUI(true));
futureOpacitySlider.addEventListener('input', () => {
  state.futureOpacity = Number(futureOpacitySlider.value) / 100;
  futureOpacityOut.textContent = `${futureOpacitySlider.value}%`;
  if (sliceMaterial) sliceMaterial.uniforms.uFutureOpacity.value = state.futureOpacity;
});

gridOpacitySlider.addEventListener('input', () => {
  state.gridOpacity = Number(gridOpacitySlider.value) / 100;
  gridOpacityOut.textContent = `${gridOpacitySlider.value}%`;
  if (gridLines) gridLines.material.uniforms.uOpacity.value = state.gridOpacity;
});

gridToggle.addEventListener('change', updateGridUI);

timeWordsToggle.addEventListener('change', updateTimeInfoVisibility);
secondMarksToggle.addEventListener('change', updateTimeInfoVisibility);
coordinatesToggle.addEventListener('change', updateCoordinateVisibility);

presentPlaneToggle.addEventListener('change', updatePresentPlaneControlsUI);
presentPlaneSolidBtn.addEventListener('click', () => setPresentPlaneMode('solid'));
presentPlaneGridBtn.addEventListener('click', () => setPresentPlaneMode('grid'));
presentPlaneColorInput.addEventListener('input', () => {
  state.presentPlaneColor = presentPlaneColorInput.value;
  updatePresentPlanePosition();
});
presentPlaneOpacitySlider.addEventListener('input', () => {
  state.presentPlaneOpacity = Number(presentPlaneOpacitySlider.value) / 100;
  presentPlaneOpacityOut.textContent = `${presentPlaneOpacitySlider.value}%`;
  updatePresentPlanePosition();
});
presentPlaneOutlineSlider.addEventListener('input', () => {
  state.presentPlaneOutlineOpacity = Number(presentPlaneOutlineSlider.value) / 100;
  presentPlaneOutlineOut.textContent = `${presentPlaneOutlineSlider.value}%`;
  updatePresentPlanePosition();
});

sliceSlider.addEventListener('input', () => {
  sliceOut.textContent = sliceSlider.value;
});
sliceSlider.addEventListener('change', () => {
  state.slices = Number(sliceSlider.value);
  if (state.hasVideo) processVideo();
  else requestSceneRender(1);
});

modeSlicesBtn.addEventListener('click', () => setVisualMode('slices'));
modeSolidBtn.addEventListener('click', () => setVisualMode('solid'));
resetViewBtn.addEventListener('click', resetView);
panelToggle.addEventListener('click', () => panel.classList.contains('open') ? closePanelUI() : openPanelSection(state.activePanelTarget || 'video'));
closePanel.addEventListener('click', closePanelUI);
orbitalToggle?.addEventListener('click', () => setOrbitalOpen(!orbitalNav.classList.contains('open')));
orbitalItems.forEach(btn => btn.addEventListener('click', () => {
  const target = btn.dataset.panelTarget || 'video';
  const desktop = matchMedia('(min-width: 761px)').matches;
  if (desktop && panel.classList.contains('open') && state.activePanelTarget === target) {
    closePanelUI();
    return;
  }
  openPanelSection(target);
  if (!desktop) setOrbitalOpen(false);
}));
homeLoadBtn?.addEventListener('click', () => input.click());
homeControlsBtn?.addEventListener('click', () => {
  openPanelSection('video');
  if (matchMedia('(max-width: 760px) and (orientation: portrait)').matches) setOrbitalOpen(true);
});
homeDemoBtn?.addEventListener('click', () => {
  state.hasVideo = false;
  initHomeVisualState();
  buildDemoAtlas();
  resetView();
});
document.addEventListener('click', (e) => {
  const t = e.target;
  if (orbitalNav?.classList.contains('open') && !orbitalNav.contains(t)) closeOrbital();
  if (panel.classList.contains('open') && !panel.contains(t) && !panelToggle.contains(t) && !(orbitalNav && orbitalNav.contains(t))) {
    if (matchMedia('(max-width: 760px)').matches) closePanelUI();
  }
});

panel.addEventListener('input', () => requestSceneRender(2));
panel.addEventListener('change', () => requestSceneRender(2));
panel.addEventListener('click', () => requestSceneRender(1));

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

document.addEventListener('keydown', (e) => {
  if (innerWidth <= 760) return;
  const tag = e.target?.tagName?.toLowerCase?.();
  if (['input','textarea','select','button'].includes(tag) || e.target?.isContentEditable) return;

  if (e.key === 'Escape') {
    closePanelUI();
    closeOrbital();
    return;
  }
  if (!trimModal.hidden) return;

  if (e.code === 'Space') {
    e.preventDefault();
    playBtn.click();
    return;
  }
  if (e.key.toLowerCase() === 'r') {
    e.preventDefault();
    resetView();
    requestSceneRender(4);
    return;
  }
  if (e.key.toLowerCase() === 'm') {
    e.preventDefault();
    setOrbitalOpen(!orbitalNav.classList.contains('open'));
    return;
  }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    state.playing = false;
    playBtn.textContent = '▶';
    const delta = (e.shiftKey ? 1 : 0.1) * (e.key === 'ArrowRight' ? 1 : -1);
    state.progress = THREE.MathUtils.clamp(state.progress + delta, 0, state.clipDuration);
    scrubber.value = state.progress;
    currentTimeEl.textContent = state.progress.toFixed(1);
    requestSceneRender(3);
  }
});

function handleViewportResize() {
  syncAppHeight();
  renderer.setPixelRatio(targetPixelRatio());
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  syncTrimUI();
  buildTimelineTicks();
  requestSceneRender(2);
}
addEventListener('resize', handleViewportResize);
window.visualViewport?.addEventListener('resize', syncAppHeight);
window.visualViewport?.addEventListener('scroll', syncAppHeight);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    state.playing = false;
    playBtn.textContent = '▶';
    if (animationFrameHandle != null) {
      cancelAnimationFrame(animationFrameHandle);
      animationFrameHandle = null;
    }
  } else {
    requestSceneRender(1);
  }
});

sphereToggle.checked = false;
gridToggle.checked = false;
timeWordsToggle.checked = true;
secondMarksToggle.checked = true;
coordinatesToggle.checked = true;
presentPlaneToggle.checked = false;
snapToggle.checked = true;
state.snapToSeconds = true;
state.sourceDuration = 10;
state.clipStart = 0;
state.clipEnd = 10;
state.clipDuration = 10;
state.brightness = Number(brightnessSlider.value) / 100;
state.futureOpacity = Number(futureOpacitySlider.value) / 100;
state.gridOpacity = Number(gridOpacitySlider.value) / 100;
state.slices = Number(sliceSlider.value);
state.presentPlaneOpacity = Number(presentPlaneOpacitySlider.value) / 100;
state.presentPlaneOutlineOpacity = Number(presentPlaneOutlineSlider.value) / 100;
state.presentPlaneColor = presentPlaneColorInput.value;
presentPlaneOpacityOut.textContent = `${presentPlaneOpacitySlider.value}%`;
presentPlaneOutlineOut.textContent = `${presentPlaneOutlineSlider.value}%`;
setVisualMode('slices');
setPresentPlaneMode('solid');
updateFutureUI(false);
updateGridUI();
updatePresentPlaneControlsUI();
buildTrimTicks();
syncTrimUI();
initHomeVisualState();
setOrbitalOpen(false);
syncPanelWindow('video');
syncAppHeight();
volume.visible = false;
scrubber.max = state.clipDuration;
totalTimeEl.textContent = `${state.clipDuration.toFixed(1)} s`;
buildTimelineTicks();
requestSceneRender(1);
