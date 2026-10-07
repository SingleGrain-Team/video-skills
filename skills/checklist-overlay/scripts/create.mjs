#!/usr/bin/env node
// checklist-overlay generator.
// usage: node create.mjs <spec.json> <recording.mp4> <out-dir> [--hold 2.2]
// spec.json: { title, subtitle?, palette?, steps: [{ label, at }] }   (at = seconds into the recording)
import { execFileSync } from "node:child_process";
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const args = process.argv.slice(2);
const holdIdx = args.indexOf("--hold");
const HOLD = holdIdx >= 0 ? parseFloat(args.splice(holdIdx, 2)[1]) : 2.2;
const [specPath, recPath, outDir] = args;
if (!specPath || !recPath || !outDir) {
  console.error("usage: create.mjs <spec.json> <recording.mp4> <out-dir> [--hold 2.2]");
  process.exit(1);
}
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const P = {
  bg: "#0a0a0b", surface: "#0e0e11", panel: "#1a1a1c", ink: "#f5f1ea",
  muted: "#a8a49b", accent: "#ff6b2b", border: "#2a2a2e", accentInk: "#0a0a0b",
  ...(spec.palette || {}),
};
const steps = [...spec.steps].sort((a, b) => a.at - b.at);
if (!steps.length) throw new Error("spec.steps is empty");

const probe = (...a) => execFileSync("ffprobe", ["-v", "error", ...a], { encoding: "utf8" }).trim();
const [w, h] = probe("-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", recPath).split(",").map(Number);
const recDur = parseFloat(probe("-show_entries", "format=duration", "-of", "csv=p=0", recPath));
const last = steps[steps.length - 1].at;
if (last > recDur) throw new Error(`last step ${last}s is beyond recording length ${recDur}s`);
const total = +(recDur + HOLD).toFixed(2);

mkdirSync(join(outDir, "assets"), { recursive: true });
copyFileSync(recPath, join(outDir, "assets/recording.mp4"));
// last frame, shown under the video so the frame holds after the recording ends
execFileSync("ffmpeg", ["-y", "-v", "error", "-sseof", "-0.2", "-i", recPath, "-frames:v", "1", "-update", "1", join(outDir, "assets/last.png")]);

// layout: 1920x1080. Recording is the hero (fit to a 1264px-wide frame), checklist is a 520px column.
const PAD = 56, GAP = 40, COL = 520, HEAD = 120;
const frameW = 1920 - PAD * 2 - GAP - COL; // 1264
const frameH = Math.round(frameW * h / w);
const frameTop = HEAD + 24 + Math.max(0, Math.round((1080 - HEAD - 24 - PAD - frameH) / 2));
const colTop = frameTop, colH = frameH;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const N = steps.length;

const items = steps.map((s, i) => `
        <li class="item" id="item-${i}">
          <svg class="box" viewBox="0 0 40 40" width="46" height="46">
            <circle class="box-bg" id="bg-${i}" cx="20" cy="20" r="17"/>
            <path class="tick" id="tick-${i}" d="M11.5 20.5 L17.5 26.5 L28.5 14" pathLength="1"/>
          </svg>
          <span class="label">${esc(s.label)}</span>
          <span class="time">${fmt(s.at)}</span>
        </li>`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>${esc(spec.title)}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  :root { --bg:${P.bg}; --surface:${P.surface}; --panel:${P.panel}; --ink:${P.ink}; --muted:${P.muted}; --accent:${P.accent}; --border:${P.border}; --accent-ink:${P.accentInk}; }
  body { margin:0; background:var(--bg); color:var(--ink); font-family:system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif; }
  #root { position:relative; width:100%; height:100%; overflow:hidden; background:var(--bg); }
  #title { position:absolute; left:${PAD}px; top:48px; margin:0; font-size:52px; font-weight:700; letter-spacing:-0.03em; line-height:1.1; }
  #title em { font-style:normal; color:var(--accent); }
  #sub { position:absolute; left:${PAD}px; top:112px; margin:0; font-size:24px; color:var(--muted); letter-spacing:-0.01em; }
  #counter { position:absolute; right:${PAD}px; top:56px; font:600 26px ui-monospace,Menlo,monospace; color:var(--muted); }
  #counter b { color:var(--accent); font-weight:700; }
  #frame { position:absolute; left:${PAD}px; top:${frameTop}px; width:${frameW}px; height:${frameH}px; border-radius:18px; overflow:hidden; background:var(--surface); box-shadow:0 0 0 1px var(--border), 0 30px 80px rgba(0,0,0,.55); }
  #frame video, #frame img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  #ring { position:absolute; left:${PAD}px; top:${frameTop}px; width:${frameW}px; height:${frameH}px; border-radius:18px; box-shadow:0 0 0 4px var(--accent), 0 0 60px rgba(255,107,43,.45); opacity:0; pointer-events:none; }
  #panel { position:absolute; left:${PAD + frameW + GAP}px; top:${colTop}px; width:${COL}px; height:${colH}px; box-sizing:border-box; background:var(--surface); border-radius:18px; box-shadow:0 0 0 1px var(--border); padding:22px; display:flex; flex-direction:column; }
  #list { list-style:none; margin:0; padding:0; flex:1; display:flex; flex-direction:column; gap:12px; }
  .item { flex:1; display:flex; align-items:center; gap:18px; padding:0 20px; border-radius:14px; background:var(--panel); box-shadow:inset 0 0 0 2px transparent; }
  .box { flex:none; overflow:visible; }
  .box-bg { fill:none; stroke:var(--muted); stroke-width:2.5; opacity:.55; }
  .tick { fill:none; stroke:var(--accent-ink); stroke-width:4.5; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:1; stroke-dashoffset:1; }
  .label { flex:1; font-size:32px; font-weight:600; letter-spacing:-0.02em; line-height:1.15; color:var(--muted); }
  .time { font:500 20px ui-monospace,Menlo,monospace; color:var(--muted); opacity:.8; }
  #bar { position:relative; height:8px; border-radius:4px; background:var(--panel); margin-top:20px; overflow:hidden; }
  #bar-fill { position:absolute; inset:0; background:var(--accent); transform-origin:left center; transform:scaleX(0); }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="${total}">
  <h1 id="title">${esc(spec.title)}</h1>
  ${spec.subtitle ? `<p id="sub">${esc(spec.subtitle)}</p>` : ""}
  <div id="counter"><b id="count">0</b> / ${N}</div>
  <div id="frame">
    <img src="assets/last.png" alt="" />
    <video id="rec" src="assets/recording.mp4" class="clip" data-start="0" data-duration="${recDur}" data-track-index="0" muted playsinline></video>
  </div>
  <div id="ring"></div>
  <div id="panel">
    <ol id="list">${items}
    </ol>
    <div id="bar"><div id="bar-fill"></div></div>
  </div>
</div>
<script>
  const steps = ${JSON.stringify(steps.map((s) => s.at))};
  const END = ${total};
  const tl = gsap.timeline({ paused: true });
  const BASE = "${P.panel}", ACC = "${P.accent}", INK = "${P.ink}", ACCINK = "${P.accentInk}";
  // intro
  tl.from("#title, #sub, #counter", { y: -16, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }, 0);
  tl.from("#frame", { scale: 0.97, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.05);
  tl.from("#panel", { x: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.15);
  tl.from(".item", { x: 24, opacity: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }, 0.3);

  steps.forEach((at, i) => {
    const it = "#item-" + i;
    // "up next" cue: starts when the previous step lands (or at 0.5 for the first). This is NOT a tick.
    const cueAt = i === 0 ? 0.5 : steps[i - 1] + 0.35;
    if (cueAt < at - 0.05) tl.to(it, { boxShadow: "inset 0 0 0 2px " + ACC, duration: 0.3 }, cueAt);
    // the tick lands exactly on the step: fill + draw begin at t = at
    tl.to(it, { boxShadow: "inset 0 0 0 2px transparent", duration: 0.25 }, at);
    tl.to("#bg-" + i, { fill: ACC, stroke: ACC, opacity: 1, attr: { r: 18.5 }, duration: 0.18, ease: "power2.out" }, at);
    tl.to("#tick-" + i, { strokeDashoffset: 0, duration: 0.28, ease: "power2.out" }, at + 0.05);
    tl.fromTo("#bg-" + i, { transformOrigin: "50% 50%", scale: 1 }, { scale: 1.22, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, at);
    tl.to(it + " .label", { color: INK, duration: 0.25 }, at);
    tl.to(it + " .time", { color: ACC, opacity: 1, duration: 0.25 }, at);
    tl.fromTo("#ring", { opacity: 0.9 }, { opacity: 0, duration: 0.55, ease: "power2.out" }, at);
    tl.set("#count", { textContent: i + 1 }, at);
    tl.to("#bar-fill", { scaleX: (i + 1) / ${N}, duration: 0.4, ease: "power3.out" }, at);
  });

  // completion: all checked, short hold
  const done = steps[steps.length - 1] + 0.6;
  tl.to("#panel", { boxShadow: "0 0 0 2px " + ACC + ", 0 0 50px rgba(255,107,43,.35)", duration: 0.4 }, done);
  tl.to("#counter", { scale: 1.12, transformOrigin: "right center", duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, done);
  window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
writeFileSync(join(outDir, "index.html"), html);
if (!existsSync(join(outDir, "hyperframes.json"))) writeFileSync(join(outDir, "hyperframes.json"), JSON.stringify({ name: basename(outDir) }, null, 2));
console.log(`wrote ${join(outDir, "index.html")}  frame ${frameW}x${frameH}  duration ${total}s  ticks ${steps.map((s) => s.at).join(", ")}`);
