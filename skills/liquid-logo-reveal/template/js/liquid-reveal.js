// Liquid logo reveal: a refracting liquid bead carries the mark, ruptures, leaves the lockup.
// Adapted from the structure of heygen-com/hyperframes-launches/liquid-brand-refraction (Apache-2.0, (c) HeyGen, Inc.).
// Everything is a pure function of seek time (renderAt) so renders are deterministic.
import * as THREE from "three";
import { RoomEnvironment } from "../vendor/three/examples/jsm/environments/RoomEnvironment.js";

const W = 1920, H = 1080;
const root = document.getElementById("root");
const canvas = document.getElementById("liquid-canvas");
const wordmarkEl = document.getElementById("wordmark");
const cfg = {
  logo: root.dataset.logoSrc,
  text: root.dataset.wordmark,
  ink: root.dataset.ink,
  fields: root.dataset.fields.split(",").map((c) => new THREE.Color(c.trim())),
};

// ---- Timing (seconds). Edit here; everything below derives from it. ----
const T = {
  establish: 0.7,     // close crop -> full bead
  pressureStart: 2.4, // squash begins
  comma: 3.0,         // total stillness begins (freeze all motion)
  pop: 3.4,           // rupture frame
  dockStart: 3.6,     // mark slides to its lockup slot, wordmark wipes out
  dockEnd: 4.1,       // lockup complete, upright, still
  dropletsGone: 5.0,  // satellites finished shrinking away
  spinEnd: 2.9,       // mark's spin inside the bead settles
};

// ---- Lockup layout (px, 1920x1080) ----
const L = { markPx: 250, gap: 48, fontPx: 150, centerY: 540 };

// ---- Renderer / camera ----
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setSize(W, H, false);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
const MARK_Z = -0.35;
// px per world unit at the mark's depth (camera rests at z=7)
const PXU = H / (2 * (7 - MARK_Z) * Math.tan(THREE.MathUtils.degToRad(17.5)));

// Procedural studio environment: gives the glass something to reflect without any HDRI asset.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---- Load the mark + font up front (nothing fetched at seek time) ----
const logoTex = await new THREE.TextureLoader().loadAsync(cfg.logo);
logoTex.colorSpace = THREE.SRGBColorSpace;
logoTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
await document.fonts.load(`700 ${L.fontPx}px Inter`);
const mctx = document.createElement("canvas").getContext("2d");
mctx.font = `700 ${L.fontPx}px Inter`;
mctx.letterSpacing = `${-0.03 * L.fontPx}px`;
const textW = Math.ceil(mctx.measureText(cfg.text).width);
const lockW = L.markPx + L.gap + textW;
const lockLeft = (W - lockW) / 2;
const markFinalX = (lockLeft + L.markPx / 2 - W / 2) / PXU; // world units
const wordLeft = lockLeft + L.markPx + L.gap;
Object.assign(wordmarkEl.style, {
  left: `${wordLeft}px`,
  width: `${textW + 8}px`,
  fontSize: `${L.fontPx}px`,
  letterSpacing: "-0.03em",
  color: cfg.ink,
});
wordmarkEl.textContent = cfg.text;

// ---- Background colour fields (the glass needs colour to refract) ----
const bg = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 8.5),
  new THREE.ShaderMaterial({
    depthWrite: false, depthTest: false, toneMapped: false,
    uniforms: { c0: { value: cfg.fields[0] }, c1: { value: cfg.fields[1] }, c2: { value: cfg.fields[2] } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ",
    fragmentShader: `precision highp float; varying vec2 vUv; uniform vec3 c0,c1,c2;
      float f(vec2 uv, vec2 c, vec2 s){ vec2 d=(uv-c)/s; return exp(-dot(d,d)*1.7); }
      void main(){
        vec3 base = vec3(0.98,0.976,0.965);
        vec3 col = mix(base, c0, f(vUv, vec2(0.80,0.30), vec2(0.34,0.42))*0.50);
        col = mix(col, c1, f(vUv, vec2(0.16,0.66), vec2(0.40,0.50))*0.80);
        col = mix(col, c2, f(vUv, vec2(0.30,0.14), vec2(0.20,0.18))*0.35);
        gl_FragColor = vec4(col, 1.0);
      }`,
  }),
);
bg.position.z = -3.5;
bg.renderOrder = -10;
scene.add(bg);

scene.add(new THREE.HemisphereLight(0xffffff, 0xffb48a, 2.0));
const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(-4, 5, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0xffa070, 2.0); rim.position.set(5, -2, 3); scene.add(rim);

// ---- Liquid material: physical transmission + noise-displaced vertices ----
const SIMPLEX = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m*=m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

function liquidMaterial() {
  const uTime = { value: 0 };
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transmission: 1, roughness: 0, metalness: 0, ior: 1.6, thickness: 3.2,
    specularIntensity: 2, clearcoat: 1, clearcoatRoughness: 0, dispersion: 1.5, envMapIntensity: 1.2,
    transparent: true, attenuationColor: new THREE.Color(0xffc9a6), attenuationDistance: 3,
  });
  m.onBeforeCompile = (s) => {
    s.uniforms.uTime = uTime;
    s.vertexShader = s.vertexShader.replace("#include <common>",
      `#include <common>\n${SIMPLEX}\nuniform float uTime;\nfloat disp(vec3 p, vec3 w){ return snoise(p*1.5 + uTime*0.4 + w*0.1)*0.15; }`);
    // Displace along the normal, then rebuild the normal from two neighbouring samples.
    s.vertexShader = s.vertexShader.replace("#include <begin_vertex>",
      `vec3 pos = position;
       vec4 w0 = modelMatrix*vec4(pos,1.0);
       vec3 tng = cross(normal, vec3(0.0,1.0,0.0)); if (length(tng)<0.1) tng = cross(normal, vec3(1.0,0.0,0.0));
       tng = normalize(tng); vec3 btg = normalize(cross(normal,tng));
       vec3 p1 = pos + tng*0.01; vec3 p2 = pos + btg*0.01;
       vec3 q0 = pos + normal*disp(pos,w0.xyz);
       vec3 q1 = p1 + normal*disp(p1,(modelMatrix*vec4(p1,1.0)).xyz);
       vec3 q2 = p2 + normal*disp(p2,(modelMatrix*vec4(p2,1.0)).xyz);
       objectNormal = normalize(cross(q1-q0,q2-q0));
       vec3 transformed = q0;`);
  };
  m.customProgramCacheKey = () => "liquid-logo-reveal-v1";
  m.userData.uTime = uTime;
  return m;
}
const heroMat = liquidMaterial();
const dropMat = liquidMaterial();
const hero = new THREE.Mesh(new THREE.SphereGeometry(1.5, 128, 128), heroMat);
hero.renderOrder = 4;
scene.add(hero);

// ---- The mark: one plane behind the bead (refracted) and one drawn after rupture ----
const aspect = logoTex.image.width / logoTex.image.height;
const EXT = 1.54;
const pw = aspect >= 1 ? EXT : EXT * aspect, ph = aspect >= 1 ? EXT / aspect : EXT;
const geo = new THREE.PlaneGeometry(pw, ph);
const markBehind = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: logoTex, alphaTest: 0.02, depthWrite: true, toneMapped: false, side: THREE.DoubleSide }));
const markFront = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
markBehind.renderOrder = 1; markFront.renderOrder = 2;
const mark = new THREE.Group();
mark.add(markBehind, markFront);
mark.position.z = MARK_Z;
scene.add(mark);
const markFinalScale = L.markPx / (Math.max(pw, ph) * PXU);

// ---- Satellite droplets: fixed golden-angle layout, no randomness ----
const drops = [];
const GA = THREE.MathUtils.degToRad(137.508);
for (let i = 0; i < 15; i++) {
  const r = 0.1 + 0.025 * (i % 5);
  const a = THREE.MathUtils.degToRad(12) + i * GA;
  const ring = 1.72 + 0.16 * (i % 4);
  const y = Math.sin(a * 1.37) * (1.2 + 0.07 * (i % 3));
  const x = Math.cos(a) * ring;
  const base = new THREE.Vector3(x, y, -0.15 + 0.16 * ((i % 5) - 2));
  const dir = new THREE.Vector3(x, y * 0.88, 0.08 * ((i % 3) - 1)).normalize();
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), dropMat);
  mesh.renderOrder = 3;
  mesh.userData = { base, dir, delay: (i % 4) / 30, travel: 1.65 + 0.18 * (i % 4) };
  drops.push(mesh); scene.add(mesh);
}

// ---- Math helpers ----
const c01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (v) => { const p = c01(v); return p * p * (3 - 2 * p); };
const pow = (v, n) => Math.pow(c01(v), n);
const out3 = (v) => 1 - Math.pow(1 - c01(v), 3);
const lerp = THREE.MathUtils.lerp;

// The liquid's shader clock advances only during authored windows, freezing on the comma.
function liquidClock(t) {
  if (t <= T.comma) return t;
  if (t <= T.pop) return T.comma;
  if (t <= T.dockEnd) return T.comma + (t - T.pop);
  return T.comma + (T.dockEnd - T.pop);
}

function renderAt(raw) {
  const t = Math.max(0, Math.min(7, Number(raw) || 0));
  const establish = smooth(t / T.establish);
  const pressure = pow((t - T.pressureStart) / (T.comma - T.pressureStart), 3);
  const rupture = pow((t - T.pop) / 0.2, 4);

  camera.position.set(0, 0, lerp(6.55, 7, establish));
  camera.lookAt(0, 0, 0);

  const base = lerp(1.08, 1, establish);
  const k = lerp(1, 0.02, rupture);
  hero.scale.set(base * lerp(1, 1.1, pressure) * k, base * lerp(1, 0.78, pressure) * k, base * k);
  hero.position.y = 0.1;
  hero.visible = t < T.pop + 0.22;

  // Mark: spins and settles inside the bead (illegible), swells with pressure, recoils at pop, docks.
  markBehind.visible = t < T.pop + 0.22; // stays refracted while the shell collapses
  markFront.visible = t >= T.pop + 0.22;
  const spin = 1 - Math.pow(1 - c01(t / T.spinEnd), 4);
  let s = lerp(0.92, 1, smooth(t / T.establish));
  let x = 0, rotZ = 0, y = lerp(0.02, 0.14, pressure);
  if (t >= T.pop && t < T.dockStart) {
    const r = smooth((t - T.pop) / (T.dockStart - T.pop));
    s = lerp(1.06, 0.97, r); rotZ = THREE.MathUtils.degToRad(lerp(0, 4, r)); y = 0.14;
  } else if (t >= T.dockStart) {
    const d = smooth((t - T.dockStart) / (T.dockEnd - T.dockStart));
    s = lerp(0.97, markFinalScale, d); rotZ = THREE.MathUtils.degToRad(lerp(4, 0, d));
    x = lerp(0, markFinalX, d); y = lerp(0.14, (H / 2 - L.centerY) / PXU, d);
  } else if (t >= T.pressureStart) {
    s = lerp(1, 1.06, pressure);
  }
  mark.scale.setScalar(s);
  mark.position.set(x, y, MARK_Z);
  mark.rotation.set(0, t < T.pop ? (1 - spin) * -Math.PI * 4 : 0, rotZ);

  // Wordmark wipes out from the mark's side once the bead is gone.
  const wipe = smooth((t - T.dockStart) / (T.dockEnd - T.dockStart));
  // The text emerges from behind the mark's right edge: left inset tracks the mark, right inset opens with the wipe.
  const markRight = W / 2 + x * PXU + (s * Math.max(pw, ph) * PXU) / 2;
  const leftInset = Math.max(0, markRight + 8 - wordLeft);
  wordmarkEl.style.clipPath = t < T.dockStart ? "inset(0 100% 0 0)" : `inset(0 ${(1 - wipe) * 100}% 0 ${leftInset}px)`;

  for (const d of drops) {
    const { base, dir, delay, travel } = d.userData;
    const born = smooth((t - 0.5) / 1.2);
    if (t < T.pop + delay) { d.position.copy(base); d.scale.setScalar(lerp(0.4, 1, born) * (t < T.pressureStart ? 1 : 1)); continue; }
    const launch = out3((t - T.pop - delay) / 0.8);
    const vanish = smooth((t - (T.pop + 0.9)) / (T.dropletsGone - T.pop - 0.9));
    d.position.copy(base).addScaledVector(dir, travel * launch);
    d.position.y -= 0.3 * launch * launch + 0.25 * vanish;
    d.scale.setScalar(lerp(1, 0.76, launch) * (1 - vanish) + 0.0001);
  }

  const clock = liquidClock(t);
  heroMat.userData.uTime.value = clock;
  dropMat.userData.uTime.value = clock;
  renderer.render(scene, camera);
}

window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(window.__hfThreeTime || 0);
