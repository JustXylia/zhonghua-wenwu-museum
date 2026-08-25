import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ============================================================
// Config
// ============================================================
const MODEL_PATH = 'sanyangzun-compressed.glb';

const RELIC_INFO = {
  palette: [
    { name: '青铜绿', value: '#4a7c59' },
    { name: '铜锈蓝', value: '#5b8ea6' },
    { name: '古铜褐', value: '#8b6f47' },
    { name: '灰白色', value: '#c0c0bb' }
  ],
  tags: ['范铸', '浮雕', '兽首', '饕餮纹', '礼器', '三阳开泰'],
  metadata: [
    { label: 'DYNASTY', value: '商代晚期' },
    { label: 'TYPE', value: '盛酒礼器' },
    { label: 'CRAFT', value: '青铜范铸' },
    { label: 'COLLECTION', value: '三峡博物馆' }
  ]
};

const HOTSPOTS = [
  {
    id: 0,
    pos: { x: 0.30, y: 0.35, z: 0 },
    title: '三羊开泰',
    body: '肩部铸有三个向外探出的立体羊首，等距分布于器身肩部。羊谐音"阳"，三羊寓意"三阳开泰"——《易经》以正月为泰卦，三阳生于下，冬去春来、阴消阳长。这是商代常见的吉祥纹饰母题，将自然生灵与哲学信仰融为一体。'
  },
  {
    id: 1,
    pos: { x: -0.25, y: 0.15, z: 0.25 },
    title: '饕餮纹',
    body: '腹部饰以饕餮纹（兽面纹），以云雷纹为地纹。饕餮是传说中贪食的猛兽，《吕氏春秋》载"周鼎著饕餮，有首无身"。这种纹饰是商代青铜器的核心装饰，象征着威严与神权，也是沟通天地、祭祀先祖的视觉媒介。'
  },
  {
    id: 2,
    pos: { x: 0, y: 0.50, z: 0.25 },
    title: '颈部纹饰',
    body: '颈部饰以夔龙纹和弦纹，弦纹将纹饰分区，形成层次分明的装饰带。夔龙为单足神兽，《说文》载"夔，神魑也，如龙一足"。颈部纹饰与腹部饕餮形成主次呼应，体现了商代铸铜工艺的规范与秩序。'
  },
  {
    id: 3,
    pos: { x: 0, y: -0.42, z: 0 },
    title: '圈足',
    body: '底部为高圈足，上有十字形镂孔。圈足既保证器物稳固，镂孔则是为了在铸造时便于排气，防止铜液产生气孔。这种功能与审美的统一设计，是商代范铸工艺智慧的结晶，也为后世青铜器圈足设计奠定了范式。'
  },
  {
    id: 4,
    pos: { x: 0.30, y: 0.28, z: -0.35 },
    title: '范铸痕迹',
    body: '器身可见合范铸造留下的范线痕迹。商代采用"分范合铸"工艺：先以泥塑胎，再分段制作外范与芯范，拼合后浇铸铜液。每一件青铜器都是独一无二的，范线就是它的"身份证"，记录着三千年前工匠的手作痕迹。'
  }
];

const TOUR_VIEWPOINTS = [
  { azimuth: 0.0, polar: Math.PI / 2.2, distance: 3.0, duration: 3000 },
  { azimuth: Math.PI * 0.5, polar: Math.PI / 2.0, distance: 2.0, duration: 3500 },
  { azimuth: Math.PI, polar: Math.PI / 2.3, distance: 2.5, duration: 3000 },
  { azimuth: Math.PI * 1.5, polar: Math.PI / 2.1, distance: 1.8, duration: 3500 },
  { azimuth: 0.0, polar: Math.PI / 2.0, distance: 3.2, duration: 3000 }
];

// ============================================================
// State
// ============================================================
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

// ============================================================
// DOM
// ============================================================
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

// ============================================================
// Init
// ============================================================
function init() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a0a, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  dom.canvasContainer.appendChild(renderer.domElement);

  // CSS2D renderer for hotspots
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  dom.canvasContainer.appendChild(labelRenderer.domElement);

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);
  scene.fog = new THREE.Fog(0x0a0a0a, 8, 20);

  // Environment for PBR materials
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

  // Camera
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.5, 4.5);

  // Controls
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

  // Lighting setup for bronze
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

  // Subtle ground reflection plane
  const groundGeo = new THREE.CircleGeometry(5, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0d0d0d,
    roughness: 0.7,
    metalness: 0.3,
    transparent: true,
    opacity: 0.5
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.1;
  scene.add(ground);

  // Dust particles
  createDust();

  // Load model
  loadModel();

  // UI setup
  setupUI();
  setupControls();

  // Resize
  window.addEventListener('resize', onResize);

  // Start animation loop
  animate();
}

// ============================================================
// Model loading
// ============================================================
function fitToView() {
  if (!model) return;

  // Compute world-space bounding box after scaling
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Use the larger of width/height as the fitting constraint
  const fov = camera.fov * Math.PI / 180;
  const aspect = camera.aspect;

  // Distance to fit height
  const distH = (size.y / 2) / Math.tan(fov / 2);
  // Distance to fit width (account for aspect ratio)
  const distW = (size.x / 2) / (aspect * Math.tan(fov / 2));

  // Take the larger distance and add 20% margin
  let distance = Math.max(distH, distW) * 1.2;

  // Clamp to min/max
  distance = Math.max(controls.minDistance + 0.5, Math.min(controls.maxDistance - 0.5, distance));

  // Position camera slightly above center, looking at model center
  const dir = new THREE.Vector3(0, 0.15, 1).normalize();
  camera.position.copy(center).add(dir.multiplyScalar(distance));

  controls.target.copy(center);
  controls.update();

  // Save as initial view for reset
  initialCameraPos.copy(camera.position);
  initialCameraTarget.copy(center);
}

function loadModel() {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
  dracoLoader.setDecoderConfig({ type: 'js' });
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    MODEL_PATH,
    (gltf) => {
      model = gltf.scene;

      // Compute bounding box and normalize to radius 1.0
      const box = new THREE.Box3().setFromObject(model);
      box.getCenter(modelCenter);
      box.getSize(modelSize);
      modelRadius = Math.max(modelSize.x, modelSize.y, modelSize.z) / 2;

      const scale = 1.0 / modelRadius;
      model.scale.setScalar(scale);
      model.position.sub(modelCenter.multiplyScalar(scale));
      model.position.y = 0;

      // After normalization, fit camera to show entire model
      fitToView();

      // Enable shadows and material tweaks
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mat = child.material;
          if (mat && mat.isMeshStandardMaterial) {
            mat.envMapIntensity = 0.8;
            if (mat.color) {
              // Slight bronze tint enhancement
              const c = mat.color;
              const boost = 1.05;
              c.r = Math.min(1, c.r * boost);
              c.g = Math.min(1, c.g * boost * 0.98);
              c.b = Math.min(1, c.b * boost * 0.92);
            }
          }
        }
      });

      scene.add(model);

      // Create hotspots
      createHotspots();

      // Hide loading screen
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

// ============================================================
// Hotspots
// ============================================================
function createHotspots() {
  HOTSPOTS.forEach((spot) => {
    const div = document.createElement('div');
    div.className = 'hotspot';
    div.dataset.num = spot.id + 1;
    div.setAttribute('aria-label', spot.title);

    const cssObj = new CSS2DObject(div);
    // Position hotspot relative to model bounds (normalized -0.5 to 0.5)
    // Scale to model size
    const px = spot.pos.x;
    const py = spot.pos.y;
    const pz = spot.pos.z;
    cssObj.position.set(px, py, pz);

    div.addEventListener('click', (e) => {
      e.stopPropagation();
      showHotspotTooltip(spot, e);
      hotspotObjects.forEach(h => h.element.classList.remove('active'));
      div.classList.add('active');
    });

    div.addEventListener('mouseenter', (e) => {
      showHotspotTooltip(spot, e);
    });

    div.addEventListener('mouseleave', () => {
      hideHotspotTooltip();
      div.classList.remove('active');
    });

    // Touch support
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

function hideHotspotTooltip() {
  dom.tooltip.classList.remove('visible');
}

function toggleHotspots() {
  hotspotsVisible = !hotspotsVisible;
  hotspotObjects.forEach(h => {
    h.element.style.display = hotspotsVisible ? '' : 'none';
  });
  dom.btnHotspots.classList.toggle('active', hotspotsVisible);
  if (!hotspotsVisible) hideHotspotTooltip();
}

// ============================================================
// Dust particles
// ============================================================
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
  const mat = new THREE.PointsMaterial({
    size: 0.008,
    color: 0x4a7c59,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const dust = new THREE.Points(geo, mat);
  scene.add(dust);
  scene.userData.dust = dust;
}

// ============================================================
// Controls
// ============================================================
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
  if (tourMode) {
    tourIndex = 0;
    tourStartTime = performance.now();
    controls.enabled = false;
  } else {
    controls.enabled = true;
  }
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
    const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic

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
  const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad

  // Interpolate from current viewpoint to next
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

  if (t >= 1) {
    tourIndex = nextIndex;
    tourStartTime = performance.now();
  }
}

// ============================================================
// UI setup
// ============================================================
function setupUI() {
  // Palette
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

  // Tags
  RELIC_INFO.tags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'ip-tag';
    span.textContent = tag;
    dom.tags.appendChild(span);
  });

  // Metadata
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

  // Mobile bottom sheet: tap drag handle to toggle
  dom.dragHandle.addEventListener('click', (e) => {
    dom.infoPanel.classList.toggle('expanded');
    updateDragHint();
  });

  // Mobile bottom sheet: touch drag to expand/collapse
  let touchStartY = 0;
  let isDragging = false;

  dom.dragHandle.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  dom.dragHandle.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaY = touchStartY - e.touches[0].clientY;
    if (deltaY > 40 && !dom.infoPanel.classList.contains('expanded')) {
      dom.infoPanel.classList.add('expanded');
      updateDragHint();
      isDragging = false;
    } else if (deltaY < -40 && dom.infoPanel.classList.contains('expanded')) {
      // Only collapse if scroll content is at top
      if (dom.scrollContent.scrollTop <= 0) {
        dom.infoPanel.classList.remove('expanded');
        updateDragHint();
        isDragging = false;
      }
    }
  }, { passive: true });

  dom.dragHandle.addEventListener('touchend', () => {
    isDragging = false;
  }, { passive: true });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    switch(e.code) {
      case 'KeyR': toggleAutoRotate(); break;
      case 'KeyT': toggleTourMode(); break;
      case 'KeyH': toggleHotspots(); break;
      case 'Escape':
        if (tourMode) toggleTourMode();
        hideHotspotTooltip();
        break;
    }
  });

  // Close tooltip on canvas click
  renderer.domElement.addEventListener('pointerdown', () => {
    hideHotspotTooltip();
    hotspotObjects.forEach(h => h.element.classList.remove('active'));
  });

  // Default hotspots active
  dom.btnHotspots.classList.add('active');
}

function updateDragHint() {
  if (dom.infoPanel.classList.contains('expanded')) {
    dom.dragHint.textContent = '向下滑动收起 ↓';
  } else {
    dom.dragHint.textContent = '向上滑动查看详情 ↑';
  }
}

// ============================================================
// Resize
// ============================================================
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  // Re-fit model to view on orientation change
  fitToView();
}

// ============================================================
// Animation loop
// ============================================================
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;

  // Dust drift
  if (scene.userData.dust) {
    scene.userData.dust.rotation.y = time * 0.015;
  }

  // Tour mode
  if (tourMode) {
    updateTour();
  }

  controls.update();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// ============================================================
// Boot
// ============================================================
init();
