/* =====================================================================
   HERO — WebGL (Three.js)
   ---------------------------------------------------------------------
   A single quad that contain-fits two textures regardless of their aspect
   ratio and crossfades between them. That is the whole effect.

   No displacement, noise, pointer warp, chromatic aberration, zoom or
   colour grade: the slides are finished design pieces, and distorting one
   reads as a broken render rather than as craft. Pixels are sampled 1:1
   from the source and only blended by opacity.

   Degrades on purpose: if WebGL is unavailable, the module never marks
   the hero `gl-ready`, so the CSS fallback stays visible.
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

  varying vec2 vUv;

  /* ---- background-size: contain, in UV space ----
     The whole artwork stays visible: these are finished design pieces with
     their own typography, and cropping one mid-word looks broken. */
  vec2 containUv(vec2 uv, vec2 res, vec2 img) {
    vec2 s = res / img;
    float scale = min(s.x, s.y);
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
    /* Straight crossfade. No noise, no displacement, no aberration, no
       grade, no vignette — every pixel is the source artwork, sampled 1:1
       and only blended by opacity. */
    vec2 uvA = containUv(vUv, uRes, uSizeA);
    vec2 uvB = containUv(vUv, uRes, uSizeB);

    vec3 backdrop = vec3(0.055, 0.055, 0.065);
    vec3 colA = mix(backdrop, texture2D(uTexA, uvA).rgb, inside(uvA));
    vec3 colB = mix(backdrop, texture2D(uTexB, uvB).rgb, inside(uvB));

    gl_FragColor = vec4(mix(colA, colB, uProgress), 1.0);
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

  /* Colour passthrough.
     Three.js normally decodes an sRGB texture to linear on sample and
     re-encodes to sRGB on output — but the re-encode lives in the
     `colorspace_fragment` chunk, which built-in materials include and a
     custom ShaderMaterial does not. Leaving the texture as SRGBColorSpace
     therefore decoded to linear and wrote linear straight out, lifting and
     desaturating the artwork. Decoding nothing and encoding nothing means
     the stored pixels arrive on screen exactly as authored. */
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

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
        tex.colorSpace = THREE.NoColorSpace;   // no decode — see passthrough note
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
    if (w === lastW && h === lastH) return false;
    lastW = w; lastH = h;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
    return true;
  }
  addEventListener("resize", () => { if (resize()) render(); });

  /* ---------- loop ---------- */
  const clock = new THREE.Clock();
  let rafId = 0;
  let visible = true;

  function render() { renderer.render(scene, camera); }

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!visible) return;

    // Nothing animates at rest now, so only redraw when the crossfade is
    // running or the canvas actually changed size.
    const resized = resize();
    if (!animating) {
      if (resized) render();
      return;
    }

    const p = Math.min((clock.getElapsedTime() - tStart) / tDur, 1);
    // easeInOutCubic
    uniforms.uProgress.value = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    if (p >= 1) {
      animating = false;
      uniforms.uTexA.value = textures[to];
      uniforms.uSizeA.value.copy(sizes[to]);
      uniforms.uProgress.value = 0;
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
    // Both slots start on the same frame, so the first paint can't ghost
    // the next slide through the dissolve mask.
    uniforms.uTexA.value = textures[0];
    uniforms.uTexB.value = textures[0];
    uniforms.uSizeA.value.copy(sizes[0]);
    uniforms.uSizeB.value.copy(sizes[0]);
    resize();
    // Paint the first frame explicitly. The loop below only draws while a
    // crossfade is running or the canvas resized, so without this the
    // canvas stays blank until the first slide change — and `gl-ready` has
    // already faded out the CSS fallback behind it.
    render();
    ready = true;
    hooks.onReady?.();
    if (!reduced) tick();
  });

  return {
    goTo,
    get ready() { return ready; },
    get index() { return current; },
    destroy() {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("resize", resize);
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
