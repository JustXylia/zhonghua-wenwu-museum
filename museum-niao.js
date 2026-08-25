import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

const MODEL_PATH = 'niao-web.glb';

const RELIC_INFO = {
  palette: [
    { name: '青铜绿', value: '#4a7c59' },
    { name: '铜锈蓝', value: '#5b8ea6' },
    { name: '古铜金', value: '#a68b5b' },
    { name: '灰白锈', value: '#c0c0bb' }
  ],
  tags: ['青铜鸟', '巴蜀', '图腾', '神鸟', '礼器', '商周'],
  metadata: [
    { label: 'DYNASTY', value: '商周' },
    { label: 'TYPE', value: '青铜礼器' },
    { label: 'CRAFT', value: '青铜铸造' },
    { label: 'COLLECTION', value: '三峡博物馆' }
  ]
};

const HOTSPOTS = [
  {
    id: 0,
    pos: { x: 0, y: 0.55, z: 0.10 },
    title: '鸟首高昂',
    body: '青铜鸟头部高昂，喙部尖利，双目圆睁，神态警觉而威严。鸟首以写实与夸张相结合的手法塑造——写实在于喙、目的解剖精度，夸张在于颈部弧线的戏剧张力，体现了巴蜀工匠"似与不似之间"的造型理念。'
  },
  {
    id: 1,
    pos: { x: -0.30, y: 0.20, z: 0.15 },
    title: '羽翼纹饰',
    body: '鸟身两侧以云雷纹和羽状纹刻画翅膀，纹饰细密而有序排列，以"三层花"工艺凸现层次：主纹为浮雕羽翎，地纹为云雷纹，轮廓线为阴刻。展开的羽翼既是写实的翅膀，也象征太阳神鸟的翎羽光芒。'
  },
  {
    id: 2,
    pos: { x: 0, y: 0.05, z: -0.30 },
    title: '尾羽舒展',
    body: '尾部以扇形展开，尾羽分层排列，末端上翘如孔雀开屏。在巴蜀神话中，鸟尾象征太阳的光芒。三星堆和金沙遗址出土的"太阳神鸟"金饰同样以旋涡状尾羽象征太阳，可见鸟图腾在巴蜀文明中的核心地位。'
  },
  {
    id: 3,
    pos: { x: 0, y: -0.35, z: 0 },
    title: '器座基台',
    body: '青铜鸟立于方形台座之上，台座中空，可能原为嵌于大型器物顶部的饰件。台座四面或有铭文、图语符号，用于标识器物归属。鸟与台的组合体现了"鸟栖于树、神降于器"的祭祀理念，是沟通天地的礼仪重器。'
  },
  {
    id: 4,
    pos: { x: 0.25, y: 0.35, z: -0.15 },
    title: '范铸匠心',
    body: '整器采用"分范合铸"工艺铸造：鸟首、身、翼、尾、台座分段制范，合范后一次浇铸成型。鸟身各部分衔接处可见范线痕迹，翼羽的细密纹饰则在泥范上逐一刻画。这种将整体造型与细节刻画统一于铸造工序的技法，代表了商周青铜铸造的高超水平。'
  }
];

const TOUR_VIEWPOINTS = [
  { azimuth: 0.0, polar: Math.PI / 2.2, distance: 3.0, duration: 3000 },
  { azimuth: Math.PI * 0.5, polar: Math.PI / 2.0, distance: 2.0, duration: 3500 },
  { azimuth: Math.PI, polar: Math.PI / 2.3, distance: 2.5, duration: 3000 },
  { azimuth: Math.PI * 1.5, polar: Math.PI / 2.1, distance: 1.8, duration: 3500 },
  { azimuth: 0.0, polar: Math.PI / 2.0, distance: 3.2, duration: 3000 }
];

let renderer, scene, camera, controls, labelRenderer;
let model = null;
let modelCenter = new THREE.Vector3();
let modelSize = new THREE.Vector3();
let modelRadius = 1;
const hotspotObjects = [];
let hotspotsVisible = true;
let autoRotate = false;
let tourMode = false;
let tourIndex = 0;
let tourStartTime = 0;
let initialCameraPos = new THREE.Vector3(0, 0.5, 4.5);
let initialCameraTarget = new THREE.Vector3(0, 0, 0);

const dom = {
  canvasContainer: document.getElementById('canvas-container'),
  loadingScreen: document.getElementById('loading-screen'),
  loadingBar: document.getElementById('loadingBar'),
  loadingPercent: document.getElementById('loadingPercent'),
  palette: document.getElementById('palette'),
  tags: document.getElementById('tags'),
  metadata: document.getElementById('metadata'),
  infoPanel: document.getElementById('infoPanel'),
  dragHandle: document.getElementById('dragHandle'),
  dragHint: document.getElementById('dragHint'),
  scrollContent: document.getElementById('scrollContent'),
  btnRotate: document.getElementById('btnRotate'),
  btnTour: document.getElementById('btnTour'),
  btnHotspots: document.getElementById('btnHotspots'),
  btnReset: document.getElementById('btnReset'),
  btnInfo: document.getElementById('btnInfo'),
  tourIndicator: document.getElementById('tourIndicator'),
  tooltip: document.getElementById('hotspotTooltip'),
  htTitle: document.getElementById('htTitle'),
  htBody: document.getElementById('htBody')
};

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a0a, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  dom.canvasContainer.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  dom.canvasContainer.appendChild(labelRenderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.Fog(0x0a0a0a, 8, 20);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.5, 4.5);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.8;
  controls.panSpeed = 0.5;
  controls.minDistance = 1.5;
  controls.maxDistance = 10;
  controls.minPolarAngle = Math.PI * 0.15;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.target.set(0, 0, 0);
  controls.update();

  const ambient = new THREE.AmbientLight(0x3a3528, 0.35);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffd9a0, 1.2);
  keyLight.position.set(3, 4, 2);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x6080a0, 0.5);
  fillLight.position.set(-3, 2, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x4a7c59, 0.6);
  rimLight.position.set(0, 2, -4);
  scene.add(rimLight);

  const groundLight = new THREE.HemisphereLight(0x1a1a18, 0x0a0a0a, 0.3);
  scene.add(groundLight);

  const groundGeo = new THREE.CircleGeometry(5, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d0d, roughness: 0.7, metalness: 0.3,
    transparent: true, opacity: 0.5
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.1;
  scene.add(ground);

  createDust();
  loadModel();
  setupUI();
  setupControls();
  window.addEventListener('resize', onResize);
  animate();
}

function fitToView() {
  if (!model) return;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const fov = camera.fov * Math.PI / 180;
  const aspect = camera.aspect;
  const distH = (size.y / 2) / Math.tan(fov / 2);
  const distW = (size.x / 2) / (aspect * Math.tan(fov / 2));
  let distance = Math.max(distH, distW) * 1.2;
  distance = Math.max(controls.minDistance + 0.5, Math.min(controls.maxDistance - 0.5, distance));
  const dir = new THREE.Vector3(0, 0.15, 1).normalize();
  camera.position.copy(center).add(dir.multiplyScalar(distance));
  controls.target.copy(center);
  controls.update();
  initialCameraPos.copy(camera.position);
  initialCameraTarget.copy(center);
}

function loadModel() {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
  dracoLoader.setDecoderConfig({ type: 'js' });
  loader.setDRACOLoader(dracoLoader);

  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/');
  ktx2Loader.detectSupport(renderer);
  loader.setKTX2Loader(ktx2Loader);

  loader.load(MODEL_PATH, (gltf) => {
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      box.getCenter(modelCenter);
      box.getSize(modelSize);
      modelRadius = Math.max(modelSize.x, modelSize.y, modelSize.z) / 2;
      const scale = 1.0 / modelRadius;
      model.scale.setScalar(scale);
      model.position.sub(modelCenter.multiplyScalar(scale));
      model.position.y = 0;
      fitToView();
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mat = child.material;
          if (mat && mat.isMeshStandardMaterial) {
            mat.envMapIntensity = 0.8;
          }
        }
      });
      scene.add(model);
      createHotspots();
      setTimeout(() => {
        dom.loadingScreen.classList.add('hidden');
        setTimeout(() => { dom.loadingScreen.style.display = 'none'; }, 800);
      }, 300);
    },
    (xhr) => {
      if (xhr.total) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        dom.loadingBar.style.width = pct + '%';
        dom.loadingPercent.textContent = pct + '%';
      } else {
        dom.loadingBar.style.width = '50%';
        dom.loadingPercent.textContent = '加载中...';
      }
    },
    (err) => {
      console.error('Model load error:', err);
      dom.loadingPercent.textContent = '加载失败';
      dom.loadingPercent.style.color = 'rgba(200,120,120,0.6)';
    }
  );
}

function createHotspots() {
  HOTSPOTS.forEach((spot) => {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.dataset.num = spot.id + 1;
    div.setAttribute('aria-label', spot.title);
    const cssObj = new CSS2DObject(div);
    cssObj.position.set(spot.pos.x, spot.pos.y, spot.pos.z);
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      showHotspotTooltip(spot, e);
      hotspotObjects.forEach(h => h.element.classList.remove('active'));
      div.classList.add('active');
    });
    div.addEventListener('mouseenter', (e) => { showHotspotTooltip(spot, e); });
    div.addEventListener('mouseleave', () => { hideHotspotTooltip(); div.classList.remove('active'); });
    div.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      showHotspotTooltip(spot, { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }, { passive: true });
    model.add(cssObj);
    hotspotObjects.push({ element: div, object: cssObj, data: spot });
  });
}

function showHotspotTooltip(spot, e) {
  dom.htTitle.textContent = spot.title;
  dom.htBody.textContent = spot.body;
  dom.tooltip.classList.add('visible');
  const x = Math.min(e.clientX || window.innerWidth / 2, window.innerWidth - 300);
  const y = Math.min(e.clientY || window.innerHeight / 2, window.innerHeight - 120);
  dom.tooltip.style.left = (x + 16) + 'px';
  dom.tooltip.style.top = (y + 16) + 'px';
}

function hideHotspotTooltip() { dom.tooltip.classList.remove('visible'); }

function toggleHotspots() {
  hotspotsVisible = !hotspotsVisible;
  hotspotObjects.forEach(h => { h.element.style.display = hotspotsVisible ? '' : 'none'; });
  dom.btnHotspots.classList.toggle('active', hotspotsVisible);
  if (!hotspotsVisible) hideHotspotTooltip();
}

function createDust() {
  const N = 800;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.008, color: 0x4a7c59, transparent: true, opacity: 0.15, depthWrite: false, blending: THREE.AdditiveBlending });
  const dust = new THREE.Points(geo, mat);
  scene.add(dust);
  scene.userData.dust = dust;
}

function toggleAutoRotate() {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 0.8;
  dom.btnRotate.classList.toggle('active', autoRotate);
}

function toggleTourMode() {
  tourMode = !tourMode;
  dom.btnTour.classList.toggle('active', tourMode);
  dom.tourIndicator.classList.toggle('active', tourMode);
  if (tourMode) { tourIndex = 0; tourStartTime = performance.now(); controls.enabled = false; }
  else { controls.enabled = true; }
}

function resetView() {
  animateCamera(initialCameraPos, initialCameraTarget, 800);
  if (tourMode) toggleTourMode();
}

function animateCamera(targetPos, targetTarget, duration) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();
  function step() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(startPos, targetPos, ease);
    controls.target.lerpVectors(startTarget, targetTarget, ease);
    controls.update();
    if (t < 1) requestAnimationFrame(step);
  }
  step();
}

function updateTour() {
  const viewpoint = TOUR_VIEWPOINTS[tourIndex];
  const elapsed = performance.now() - tourStartTime;
  const t = Math.min(1, elapsed / viewpoint.duration);
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const nextIndex = (tourIndex + 1) % TOUR_VIEWPOINTS.length;
  const nextVp = TOUR_VIEWPOINTS[nextIndex];
  const azimuth = THREE.MathUtils.lerp(viewpoint.azimuth, nextVp.azimuth, ease);
  const polar = THREE.MathUtils.lerp(viewpoint.polar, nextVp.polar, ease);
  const distance = THREE.MathUtils.lerp(viewpoint.distance, nextVp.distance, ease);
  const x = distance * Math.sin(polar) * Math.sin(azimuth);
  const y = distance * Math.cos(polar);
  const z = distance * Math.sin(polar) * Math.cos(azimuth);
  camera.position.set(x, y, z);
  controls.target.set(0, 0, 0);
  controls.update();
  if (t >= 1) { tourIndex = nextIndex; tourStartTime = performance.now(); }
}

function setupUI() {
  RELIC_INFO.palette.forEach(color => {
    const item = document.createElement('div');
    item.className = 'ip-palette-item';
    const dot = document.createElement('div');
    dot.className = 'ip-color-dot';
    dot.style.background = color.value;
    const name = document.createElement('div');
    name.className = 'ip-color-name';
    name.textContent = color.name;
    item.appendChild(dot);
    item.appendChild(name);
    dom.palette.appendChild(item);
  });
  RELIC_INFO.tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'ip-tag';
    span.textContent = tag;
    dom.tags.appendChild(span);
  });
  RELIC_INFO.metadata.forEach(item => {
    const span = document.createElement('div');
    span.className = 'ip-meta-item';
    const label = document.createElement('div');
    label.className = 'ip-meta-label';
    label.textContent = item.label;
    const value = document.createElement('div');
    value.className = 'ip-meta-value';
    value.textContent = item.value;
    span.appendChild(label);
    span.appendChild(value);
    dom.metadata.appendChild(span);
  });
}

function setupControls() {
  dom.btnRotate.addEventListener('click', toggleAutoRotate);
  dom.btnTour.addEventListener('click', toggleTourMode);
  dom.btnHotspots.addEventListener('click', toggleHotspots);
  dom.btnReset.addEventListener('click', resetView);
  dom.btnInfo.addEventListener('click', () => {
    dom.infoPanel.classList.toggle('expanded');
    dom.btnInfo.classList.toggle('active');
    updateDragHint();
  });
  dom.dragHandle.addEventListener('click', () => {
    dom.infoPanel.classList.toggle('expanded');
    updateDragHint();
  });
  let touchStartY = 0;
  let isDragging = false;
  dom.dragHandle.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; isDragging = true; }, { passive: true });
  dom.dragHandle.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaY = touchStartY - e.touches[0].clientY;
    if (deltaY > 40 && !dom.infoPanel.classList.contains('expanded')) { dom.infoPanel.classList.add('expanded'); updateDragHint(); isDragging = false; }
    else if (deltaY < -40 && dom.infoPanel.classList.contains('expanded')) {
      if (dom.scrollContent.scrollTop <= 0) { dom.infoPanel.classList.remove('expanded'); updateDragHint(); isDragging = false; }
    }
  }, { passive: true });
  dom.dragHandle.addEventListener('touchend', () => { isDragging = false; }, { passive: true });
  document.addEventListener('keydown', (e) => {
    switch(e.code) {
      case 'KeyR': toggleAutoRotate(); break;
      case 'KeyT': toggleTourMode(); break;
      case 'KeyH': toggleHotspots(); break;
      case 'Escape': if (tourMode) toggleTourMode(); hideHotspotTooltip(); break;
    }
  });
  renderer.domElement.addEventListener('pointerdown', () => { hideHotspotTooltip(); hotspotObjects.forEach(h => h.element.classList.remove('active')); });
  dom.btnHotspots.classList.add('active');
}

function updateDragHint() {
  if (dom.infoPanel.classList.contains('expanded')) { dom.dragHint.textContent = '向下滑动收起 ↓'; }
  else { dom.dragHint.textContent = '向上滑动查看详情 ↑'; }
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  fitToView();
}

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;
  if (scene.userData.dust) { scene.userData.dust.rotation.y = time * 0.015; }
  if (tourMode) { updateTour(); }
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

init();
