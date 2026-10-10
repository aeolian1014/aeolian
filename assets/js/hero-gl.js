/* =====================================================================
   HERO — WebGL (Three.js)
   ---------------------------------------------------------------------
   A single quad that contain-fits two textures regardless of their aspect
   ratio and crossfades between them. That is the whole effect.

   No displacement, noise, pointer warp, chromatic aberration, zoom or
   colour grade: the slides are finished design pieces, and distorting one
   reads as a broken render rather than as craft. Pixels are sampled 1:1
   from the source and only blended by opacity.

   Video slides: the poster is the texture until the slide is shown.
   Only then is the video's src attached (lazy), seeked to the poster
   frame and played muted; once it is actually playing it takes over as
   a VideoTexture. Hidden slides and an off-screen hero pause their video.

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

/* sources: [{ src, video?, posterAt? }] — src is an image (or poster). */
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

  /* ---------- video slides ---------- */
  const videos = [];      // index -> { el, tex, live }
  let visible = true;

  const texFor = (i) => (videos[i]?.live ? videos[i].tex : textures[i]);
  const sizeFor = (i) => (videos[i]?.live ? videos[i].size : sizes[i]);

  function playVideo(i) {
    const s = sources[i];
    if (!s?.video || reduced) return;
    let v = videos[i];
    if (!v) {
      const el = document.createElement("video");
      el.muted = true; el.loop = true; el.playsInline = true;
      el.setAttribute("playsinline", ""); el.setAttribute("muted", "");
      el.preload = "auto";
      el.crossOrigin = "anonymous";
      v = videos[i] = { el, tex: null, live: false, size: new THREE.Vector2(1, 1) };
      el.addEventListener("loadedmetadata", () => {
        v.size.set(el.videoWidth || 1, el.videoHeight || 1);
        if (s.posterAt && s.posterAt < el.duration) el.currentTime = s.posterAt;
      }, { once: true });
      el.addEventListener("playing", () => {
        if (v.live) return;
        const tex = new THREE.VideoTexture(el);
        tex.colorSpace = THREE.NoColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        v.tex = tex; v.live = true;
        // Swap the poster for the moving picture in whichever slot shows it.
        const inA = animating ? from === i : current === i;
        const inB = animating ? to === i : current === i;
        if (inA) { uniforms.uTexA.value = tex; uniforms.uSizeA.value.copy(v.size); }
        if (inB) { uniforms.uTexB.value = tex; uniforms.uSizeB.value.copy(v.size); }
      });
      el.src = s.video;   // attached only now — never before the slide shows
    }
    if (visible && !document.hidden) el_play(v.el);
  }
  const el_play = (el) => { const p = el.play(); if (p && p.catch) p.catch(() => {}); };

  function pauseVideo(i) { videos[i]?.el.pause(); }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseVideo(current);
    else if (visible) playVideo(current);
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
    uniforms.uTexA.value = texFor(from);
    uniforms.uTexB.value = texFor(to);
    uniforms.uSizeA.value.copy(sizeFor(from));
    uniforms.uSizeB.value.copy(sizeFor(to));
    uniforms.uProgress.value = 0;
    tStart = clock.getElapsedTime();
    animating = true;
    current = index;
    playVideo(to);
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

  function render() { renderer.render(scene, camera); }

  function tick() {
    rafId = requestAnimationFrame(tick);
    if (!visible) return;

    // At rest, only redraw when a video is playing (its texture needs a
    // fresh frame), the crossfade is running, or the canvas resized.
    const resized = resize();
    if (!animating) {
      if (resized || videos[current]?.live) render();
      return;
    }

    const p = Math.min((clock.getElapsedTime() - tStart) / tDur, 1);
    // easeInOutCubic
    uniforms.uProgress.value = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    if (p >= 1) {
      animating = false;
      if (from !== to) pauseVideo(from);
      uniforms.uTexA.value = texFor(to);
      uniforms.uSizeA.value.copy(sizeFor(to));
      uniforms.uTexB.value = texFor(to);
      uniforms.uSizeB.value.copy(sizeFor(to));
      uniforms.uProgress.value = 0;
    }
    render();
  }

  // Read the LAST entry: one batch can hold an early "not intersecting"
  // (canvas laid out mid-intro) followed by the real state.
  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (!ready) return;
    visible ? playVideo(current) : pauseVideo(current);
  }, { threshold: 0 });
  io.observe(canvas);

  /* ---------- boot ---------- */
  const sizes = [];
  let ready = false;

  Promise.all(sources.map((s) => loadOne(s.src))).then((loaded) => {
    const ok = loaded.filter(Boolean);
    if (!ok.length) return; // keep the CSS fallback
    // Keep slide indices aligned with `sources`: a failed image borrows
    // the first good one instead of shifting every later slide.
    loaded.map((tex) => tex || ok[0]).forEach((tex) => {
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
    playVideo(0);
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
      new Set(textures).forEach((t) => t.dispose());
      videos.forEach((v) => { if (!v) return; v.el.pause(); v.el.removeAttribute("src"); v.tex?.dispose(); });
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
