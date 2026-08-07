/* =====================================================================
   HERO — WebGL (Three.js)
   ---------------------------------------------------------------------
   A single full-screen quad running a fragment shader that:
     • cover-fits two textures regardless of their aspect ratio
     • melts between them along a simplex-noise displacement field
     • warps UVs around the pointer with eased momentum
     • adds chromatic aberration that scales with pointer velocity
     • breathes (slow zoom) and vignettes

   Degrades on purpose: if WebGL is unavailable, the module never marks
   the hero `gl-ready`, so the CSS crossfade fallback stays visible.
   Under prefers-reduced-motion the loop is not started at all — one
   still frame is rendered instead.
   ===================================================================== */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform vec2  uSizeA;      // natural pixel size of texture A
  uniform vec2  uSizeB;
  uniform vec2  uRes;        // canvas size in px
  uniform float uProgress;   // 0 -> A, 1 -> B
  uniform float uTime;
  uniform vec2  uMouse;      // eased, 0..1
  uniform float uVelocity;   // eased pointer speed
  uniform float uScroll;     // 0..1 through the hero
  uniform float uPower;      // global intensity (0 disables motion)

  varying vec2 vUv;

  /* ---- simplex noise (Ashima / webgl-noise, 2D) ---- */
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                             + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  /* ---- background-size: contain, in UV space ----
     The whole artwork must stay visible: these are design pieces with
     their own typography, and cropping them mid-word looks broken.
     INSET leaves a margin so the melt displacement never pushes the
     image past the panel edge. */
  const float INSET = 0.93;
  vec2 containUv(vec2 uv, vec2 res, vec2 img) {
    vec2 s = res / img;
    float scale = min(s.x, s.y) * INSET;
    vec2 size = img * scale;
    vec2 offset = (res - size) * 0.5;
    return (uv * res - offset) / size;
  }

  /* 1 inside the artwork rect, 0 outside — with a 1px-ish soft edge. */
  float inside(vec2 uv) {
    vec2 s = smoothstep(vec2(0.0), vec2(0.0035), uv) *
             (1.0 - smoothstep(vec2(0.9965), vec2(1.0), uv));
    return s.x * s.y;
  }

  void main() {
    vec2 uv = vUv;

    /* No breathing zoom here: the artwork is contained, so any zoom > 1
       would crop it. Depth comes from a slow scroll-driven drift instead. */
    vec2 cuv = uv + vec2(0.0, uScroll * 0.035);

    /* --- pointer well: pull pixels toward the cursor, falls off fast --- */
    vec2 toMouse = cuv - uMouse;
    toMouse.x *= uRes.x / uRes.y;             // keep the well circular
    float dist = length(toMouse);
    float well = smoothstep(0.42, 0.0, dist);
    float pull = well * (0.030 + uVelocity * 0.10) * uPower;
    cuv -= normalize(toMouse + 1e-5) * pull;

    /* --- melt field: two octaves of noise, one slow one fast --- */
    float n  = snoise(cuv * 2.6 + uTime * 0.055);
    float n2 = snoise(cuv * 7.0 - uTime * 0.09) * 0.35;
    float field = n + n2;

    /* Progress runs a soft edge across the noise field so the images
       dissolve into each other instead of cross-fading flatly. */
    float p = smoothstep(0.0, 1.0, uProgress);
    float edge = smoothstep(p - 0.42, p + 0.42, (field * 0.5 + 0.5) * 0.55 + p * 0.6);
    float mixAmt = 1.0 - edge;

    /* Displacement peaks mid-transition, so it settles when idle. */
    float turbulence = sin(p * 3.14159) ;
    vec2 disp = vec2(field, snoise(cuv * 3.1 - uTime * 0.04)) * 0.075 * turbulence * uPower;

    vec2 uvA = containUv(cuv + disp * (1.0 - mixAmt), uRes, uSizeA);
    vec2 uvB = containUv(cuv - disp * mixAmt,         uRes, uSizeB);

    /* --- chromatic aberration, strongest near a fast-moving cursor --- */
    float ca = (0.0016 + uVelocity * 0.010 + turbulence * 0.004) * uPower;
    vec2 dir = normalize(toMouse + 1e-5) * well;

    vec3 colA, colB;
    colA.r = texture2D(uTexA, uvA + dir * ca).r;
    colA.g = texture2D(uTexA, uvA).g;
    colA.b = texture2D(uTexA, uvA - dir * ca).b;
    colB.r = texture2D(uTexB, uvB + dir * ca).r;
    colB.g = texture2D(uTexB, uvB).g;
    colB.b = texture2D(uTexB, uvB - dir * ca).b;

    vec3 col = mix(colA, colB, mixAmt);

    /* --- ember bloom under the cursor --- */
    col += vec3(1.0, 0.42, 0.07) * well * (0.05 + uVelocity * 0.22) * uPower;

    /* --- gentle contrast lift; no vignette, it would dirty the artwork --- */
    col = mix(col, col * col * (3.0 - 2.0 * col), 0.12);

    /* --- letterbox: fade to the panel colour outside the artwork rect --- */
    float m = mix(inside(uvA), inside(uvB), mixAmt);
    vec3 backdrop = vec3(0.055, 0.055, 0.065);
    col = mix(backdrop, col, m);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function createHeroGL(canvas, sources, hooks = {}) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch (e) {
    return null; // no WebGL — CSS fallback stays
  }
  if (!renderer.getContext()) return null;

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTexA:     { value: null },
    uTexB:     { value: null },
    uSizeA:    { value: new THREE.Vector2(1, 1) },
    uSizeB:    { value: new THREE.Vector2(1, 1) },
    uRes:      { value: new THREE.Vector2(1, 1) },
    uProgress: { value: 0 },
    uTime:     { value: 0 },
    uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
    uVelocity: { value: 0 },
    uScroll:   { value: 0 },
    uPower:    { value: reduced ? 0 : 1 },
  };

  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms })
  ));

  /* ---------- textures ---------- */
  const loader = new THREE.TextureLoader();
  const textures = [];
  let loadedCount = 0;

  const loadOne = (url) => new Promise((resolve) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        loadedCount++;
        hooks.onProgress?.(loadedCount / sources.length);
        resolve(tex);
      },
      undefined,
      () => { loadedCount++; hooks.onProgress?.(loadedCount / sources.length); resolve(null); }
    );
  });

  /* ---------- pointer ---------- */
  const target = { x: 0.5, y: 0.5 };
  const eased = { x: 0.5, y: 0.5 };
  let vTarget = 0, vEased = 0;
  let lastX = 0.5, lastY = 0.5;

  function onPointer(e) {
    const r = canvas.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width;
    target.y = 1 - (e.clientY - r.top) / r.height;
    vTarget = Math.min(Math.hypot(target.x - lastX, target.y - lastY) * 12, 1);
    lastX = target.x; lastY = target.y;
  }
  window.addEventListener("pointermove", onPointer, { passive: true });

  /* ---------- transition state ---------- */
  let current = 0;
  let from = 0, to = 0;
  let tStart = 0, tDur = 1.5;
  let animating = false;

  function goTo(index) {
    if (!textures.length) return;
    index = ((index % textures.length) + textures.length) % textures.length;
    if (index === current || animating) return;
    from = current; to = index;
    uniforms.uTexA.value = textures[from];
    uniforms.uTexB.value = textures[to];
    uniforms.uSizeA.value.copy(sizes[from]);
    uniforms.uSizeB.value.copy(sizes[to]);
    uniforms.uProgress.value = 0;
    tStart = clock.getElapsedTime();
    animating = true;
    current = index;
    if (reduced) { uniforms.uProgress.value = 1; animating = false; render(); }
  }

  /* ---------- resize ----------
     Re-checked every frame rather than driven only by ResizeObserver.
     RO delivers on the rendering steps, so a canvas laid out while the
     tab is hidden (or before webfonts settle) can keep a stale, low-res
     drawing buffer — which renders the artwork visibly blurry. The
     comparison is free; setSize only runs when the size really changed. */
  let lastW = 0, lastH = 0;

  function resize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    if (w === lastW && h === lastH) return;
    lastW = w; lastH = h;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
    if (reduced) render();
  }
  addEventListener("resize", resize);

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  let rafId = 0;
  let visible = true;

  function render() { renderer.render(scene, camera); }

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!visible) return;

    resize(); // no-op unless the laid-out size actually changed

    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;

    // ease pointer + velocity toward target (momentum sells the warp)
    eased.x += (target.x - eased.x) * 0.055;
    eased.y += (target.y - eased.y) * 0.055;
    uniforms.uMouse.value.set(eased.x, eased.y);
    vTarget *= 0.92;
    vEased += (vTarget - vEased) * 0.08;
    uniforms.uVelocity.value = vEased;

    // hero scroll progress
    const rect = canvas.getBoundingClientRect();
    uniforms.uScroll.value = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);

    if (animating) {
      const p = Math.min((t - tStart) / tDur, 1);
      // easeInOutCubic
      uniforms.uProgress.value = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      if (p >= 1) {
        animating = false;
        uniforms.uTexA.value = textures[to];
        uniforms.uSizeA.value.copy(sizes[to]);
        uniforms.uProgress.value = 0;
      }
    }
    render();
  }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  /* ---------- boot ---------- */
  const sizes = [];
  let ready = false;

  Promise.all(sources.map(loadOne)).then((loaded) => {
    const ok = loaded.filter(Boolean);
    if (!ok.length) return; // keep the CSS fallback
    ok.forEach((tex) => {
      textures.push(tex);
      sizes.push(new THREE.Vector2(tex.image.naturalWidth || 1, tex.image.naturalHeight || 1));
    });
    uniforms.uTexA.value = textures[0];
    uniforms.uTexB.value = textures[Math.min(1, textures.length - 1)];
    uniforms.uSizeA.value.copy(sizes[0]);
    uniforms.uSizeB.value.copy(sizes[Math.min(1, sizes.length - 1)]);
    resize();
    ready = true;
    hooks.onReady?.();
    if (reduced) render(); else tick();
  });

  return {
    goTo,
    get ready() { return ready; },
    get index() { return current; },
    destroy() {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      textures.forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}

/* Hand the factory to the classic-script runtime in main.js.
   Modules run after deferred classic scripts, so main.js has already
   registered _bootHeroGL by the time we get here. */
window.RS = window.RS || {};
RS.createHeroGL = createHeroGL;
RS._bootHeroGL?.();
