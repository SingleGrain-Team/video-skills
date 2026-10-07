/* Everything the film says lives here. Replace every value; keep the shape.
   Counts: 4 beats, 3 stats, 3 summary points work best for the 30s timeline. */
window.FILM = {
  hook: { line: "<b class=\"acc\">N</b> files changed.", sub: "Nobody is reading that diff." },
  diff: {
    title: "pending changes · your-repo",
    headline: "That is a lot<br>to take in.",
    // Real hunks only, copied from the actual diff (<= 8 lines each, 5-8 files).
    files: [
      { path: "path/to/file.ts", add: 10, del: 2, lines: [
        " unchanged context line",
        "-removed line copied from the diff",
        "+added line copied from the diff" ] }
    ],
    stats: [
      { value: 15, label: "files changed" },
      { value: 135, label: "lines added" },
      { value: 5, label: "brand-new files" }
    ]
  },
  hardRead: "Too much to read<span class=\"acc\">.</span>",
  summary: {
    tag: "In plain words",
    title: "One sentence a<br>non-engineer gets.",
    points: ["What changed for the user.", "Why it is better.", "What stays the same."]
  },
  // Each beat: one capability, one real snippet (max 5 lines, 1 highlighted).
  beats: [
    { title: "Capability one", desc: "One sentence of what it means for the user.", file: "path/to/file.ts",
      code: [ { t: "const REAL = \"line from the diff\";", hl: true } ] },
    { title: "Capability two", desc: "…", file: "path/to/file.ts", code: [ { t: "// real line", hl: true } ] },
    { title: "Capability three", desc: "…", file: "path/to/file.ts", code: [ { t: "// real line", hl: true } ] },
    { title: "Capability four", desc: "…", file: "path/to/file.ts", code: [ { t: "// real line", hl: true } ] }
  ],
  cta: {
    logo: "",                       // e.g. "assets/logo.png" (your own mark) or "" for none
    head: "Get it today.",
    command: "npx your-install-command",
    url: "example.com/path"
  }
};
