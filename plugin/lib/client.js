window.__ModuleLoader__.load({id:"dsh-ascii-ocean-bg",factory:(require)=>{const module={exports:{}};const exports=module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.ts
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);

// src/config.ts
var FRAME_CAPS = [60, 30, 15];
var CONFIG_GLOBAL = "__DSH_ASCII_OCEAN_CONFIG__";
var CONFIG_KEY = "dsh-ascii-ocean-bg:config";
var ENABLED_KEY = "dsh-ascii-ocean-bg:enabled";
var DEFAULTS = {
  enabled: true,
  opacity: 0.78,
  palette: "auto",
  translucency: 0.44,
  fpsCap: 60,
  sharks: [
    { kind: "hammerhead", size: 1 },
    { kind: "tiger", size: 0.86 },
    { kind: "thresher", size: 0.8 },
    { kind: "mako", size: 0.72 }
  ],
  whales: []
};
var SPECIES = [
  { kind: "classic", zh: "\u5927\u767D\u9CA8", en: "Great white" },
  { kind: "hammerhead", zh: "\u9524\u5934\u9CA8", en: "Hammerhead" },
  { kind: "greathammer", zh: "\u5DE8\u578B\u9524\u5934", en: "Great hammerhead" },
  { kind: "tiger", zh: "\u864E\u9CA8", en: "Tiger" },
  { kind: "zebra", zh: "\u8C79\u7EB9\u9CA8", en: "Zebra" },
  { kind: "mako", zh: "\u7070\u9CAD\u9CA8", en: "Mako" },
  { kind: "thresher", zh: "\u957F\u5C3E\u9CA8", en: "Thresher" },
  { kind: "nurse", zh: "\u62A4\u58EB\u9CA8", en: "Nurse" }
];
var MAX_SPECIES = 6;
var WHALES = [
  { kind: "humpback", zh: "\u5EA7\u5934\u9CB8", en: "Humpback" },
  { kind: "bluewhale", zh: "\u84DD\u9CB8", en: "Blue whale" },
  { kind: "spermwhale", zh: "\u62B9\u9999\u9CB8", en: "Sperm whale" }
];
var MAX_WHALES = 2;
var ALIASES = {
  greatwhite: "classic",
  white: "classic",
  scalloped: "hammerhead",
  smooth: "hammerhead",
  leopard: "zebra",
  sandtiger: "tiger",
  porbeagle: "mako",
  fox: "thresher",
  tawny: "nurse"
};
var KIND_SET = new Set(SPECIES.map((row) => row.kind));
var WHALE_ALIASES = {
  blue: "bluewhale",
  bluewhale: "bluewhale",
  humpback: "humpback",
  humpbackwhale: "humpback",
  sperm: "spermwhale",
  spermwhale: "spermwhale"
};
var WHALE_SET = new Set(WHALES.map((row) => row.kind));
function normalizeSharks(input, fallback) {
  if (!Array.isArray(input) || input.length === 0) return fallback;
  const rows = [];
  input.forEach((raw, index) => {
    const size = 1 - index * 0.1;
    if (typeof raw === "string") {
      const kind = ALIASES[raw.toLowerCase()] ?? raw.toLowerCase();
      if (KIND_SET.has(kind)) rows.push({ kind, size: Math.max(0.4, size) });
      return;
    }
    if (raw && typeof raw === "object") {
      const row = raw;
      if (typeof row.kind !== "string") return;
      const kind = ALIASES[row.kind.toLowerCase()] ?? row.kind.toLowerCase();
      if (!KIND_SET.has(kind)) return;
      const bound = typeof row.size === "number" ? row.size : Math.max(0.4, size);
      rows.push({ kind, size: Math.min(1.6, Math.max(0.25, bound)) });
    }
  });
  return rows.length ? rows.slice(0, MAX_SPECIES) : fallback;
}
function normalizeWhales(input, fallback) {
  if (!Array.isArray(input)) return fallback;
  const rows = [];
  for (const raw of input) {
    if (typeof raw === "string") {
      const key = raw.trim().toLowerCase();
      const kind = WHALE_ALIASES[key] ?? (WHALE_SET.has(key) ? key : null);
      if (kind) rows.push({ kind });
      continue;
    }
    if (raw && typeof raw === "object") {
      const row = raw;
      if (typeof row.kind !== "string") continue;
      const key = row.kind.trim().toLowerCase();
      const kind = WHALE_ALIASES[key] ?? (WHALE_SET.has(key) ? key : null);
      if (!kind) continue;
      if (typeof row.size === "number" && Number.isFinite(row.size)) {
        rows.push({ kind, size: Math.min(2.4, Math.max(0.4, row.size)) });
      } else {
        rows.push({ kind });
      }
    }
  }
  return rows.slice(0, MAX_WHALES);
}
function normalize(input) {
  const raw = input && typeof input === "object" ? input : {};
  const clamp01 = (v, fallback) => typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULTS.enabled,
    opacity: clamp01(raw.opacity, DEFAULTS.opacity),
    palette: raw.palette === "dark" || raw.palette === "light" ? raw.palette : "auto",
    translucency: clamp01(raw.translucency, DEFAULTS.translucency),
    fpsCap: FRAME_CAPS.includes(raw.fpsCap) ? raw.fpsCap : DEFAULTS.fpsCap,
    sharks: normalizeSharks(raw.sharks, DEFAULTS.sharks),
    whales: normalizeWhales(raw.whales, DEFAULTS.whales)
  };
}
function whaleRosterOf(kinds) {
  return kinds.slice(0, MAX_WHALES).map((kind) => ({ kind }));
}
function rosterOf(kinds) {
  return kinds.slice(0, MAX_SPECIES).map((kind, index) => ({
    kind,
    size: Math.max(0.4, 1 - index * 0.1)
  }));
}
function readStored() {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
  }
  try {
    const legacy = window.localStorage.getItem(ENABLED_KEY);
    if (legacy !== null) return { enabled: legacy !== "off" };
  } catch {
  }
  return {};
}
function writeStored(next) {
  try {
    window.localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({
        enabled: next.enabled,
        opacity: next.opacity,
        palette: next.palette,
        translucency: next.translucency,
        fpsCap: next.fpsCap,
        sharks: next.sharks,
        whales: next.whales
      })
    );
    window.localStorage.setItem(ENABLED_KEY, next.enabled ? "on" : "off");
  } catch {
  }
}
var base = DEFAULTS;
var current = DEFAULTS;
var listeners = /* @__PURE__ */ new Set();
var persistTimer = 0;
function notify() {
  for (const listener of listeners) listener();
}
function schedulePersist(next) {
  if (persistTimer) window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    persistTimer = 0;
    writeStored(next);
  }, 160);
}
function initConfig(embedded) {
  base = normalize(embedded);
  current = normalize({ ...base, ...readStored() });
  return current;
}
function getConfig() {
  return current;
}
function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function updateConfig(patch) {
  current = normalize({ ...current, ...patch });
  schedulePersist(current);
  notify();
  return current;
}
function resetConfig() {
  current = normalize(base);
  if (persistTimer) {
    window.clearTimeout(persistTimer);
    persistTimer = 0;
  }
  writeStored(current);
  notify();
  return current;
}
function isCustomized() {
  return JSON.stringify(current) !== JSON.stringify(base);
}

// ../src/math.ts
var TAU = Math.PI * 2;
var clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
var rand = (lo, hi) => lo + Math.random() * (hi - lo);
var randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));
function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
function angleDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}
function hash3(x, y, z) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041);
  h = Math.imul(h ^ h >>> 13, 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
var K1 = 1 / 260;
var K2 = 1 / 310;
var K3 = 1 / 190;
var CURRENT_SCALE = 3400;
function current2(x, y, t, out) {
  const a = x * K1 + t * 0.07;
  const b = y * K2 - t * 0.05;
  const c = (x + y) * K3 + t * 0.11;
  out.x = (-K2 * Math.sin(a) * Math.sin(b) + 0.5 * K3 * Math.cos(c)) * CURRENT_SCALE;
  out.y = (-K1 * Math.cos(a) * Math.cos(b) - 0.5 * K3 * Math.cos(c)) * CURRENT_SCALE;
  return out;
}

// ../src/species.ts
var SPECIES2 = [
  {
    name: "sardine",
    cruise: 36,
    maxSpeed: 64,
    minSpeed: 18,
    weight: 3,
    schoolSize: [18, 28],
    spacing: [1.8, 1.1],
    align: 1.6,
    cohesion: 1.6,
    jitter: 40,
    mill: 70,
    verticalDrag: 0.5
  },
  {
    name: "anchovy",
    cruise: 46,
    maxSpeed: 78,
    minSpeed: 22,
    weight: 3,
    schoolSize: [20, 32],
    spacing: [1.5, 1],
    align: 3.2,
    cohesion: 0.45,
    jitter: 30,
    mill: 0,
    verticalDrag: 1.4
  },
  {
    name: "silverside",
    cruise: 40,
    maxSpeed: 70,
    minSpeed: 20,
    weight: 3,
    schoolSize: [12, 20],
    spacing: [2, 1.1],
    align: 2.4,
    cohesion: 1.1,
    jitter: 35,
    mill: 0,
    verticalDrag: 1.6
  },
  {
    name: "mackerel",
    cruise: 32,
    maxSpeed: 60,
    minSpeed: 16,
    weight: 2,
    schoolSize: [5, 9],
    spacing: [2.6, 1.3],
    align: 2,
    cohesion: 0.9,
    jitter: 25,
    mill: 0,
    verticalDrag: 2
  },
  {
    name: "goby",
    cruise: 26,
    maxSpeed: 56,
    minSpeed: 10,
    weight: 1,
    schoolSize: [8, 12],
    spacing: [1.4, 1.1],
    align: 0.35,
    cohesion: 1.4,
    jitter: 110,
    mill: 0,
    verticalDrag: 0.3
  }
];
var TOTAL_WEIGHT = SPECIES2.reduce((sum, s) => sum + s.weight, 0);
function pickSpecies() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < SPECIES2.length; i++) {
    r -= SPECIES2[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

// ../src/whale.ts
var WHALE_CONFIG = {
  // The longest animal that has ever lived: a long, even taper, a dorsal fin
  // no bigger than a thumbnail set right at the tail, mottled slate-blue skin.
  bluewhale: {
    label: "blue whale \xB7 \u84DD\u9CB8",
    size: 1.9,
    cruise: 26,
    agility: 0.42,
    bend: 0.03,
    weight: 1
  },
  // Stocky and knobbly: tubercles on the rostrum, scythe pectorals a third of
  // the body, a stubby dorsal hump ahead of a row of knuckles.
  humpback: {
    label: "humpback \xB7 \u5EA7\u5934\u9CB8",
    size: 1.35,
    cruise: 32,
    agility: 0.62,
    bend: 0.04,
    weight: 2
  },
  // A third of the body is a blunt, squared head; no dorsal fin, just a hump,
  // and loose wrinkled skin over the whole front half.
  spermwhale: {
    label: "sperm whale \xB7 \u62B9\u9999\u9CB8",
    size: 1.55,
    cruise: 29,
    agility: 0.5,
    bend: 0.035,
    weight: 1
  }
};
var WHALE_KINDS = Object.keys(WHALE_CONFIG);
var DEFAULT_WHALES = [];
function whaleSize(spec) {
  return spec.size ?? WHALE_CONFIG[spec.kind].size;
}

// ../src/world.ts
var SHARK_NODES = 20;
var DEFAULT_SHARKS = [
  { kind: "classic", size: 1 },
  { kind: "classic", size: 0.7 },
  { kind: "classic", size: 0.84 },
  { kind: "classic", size: 0.77 }
];
var FISH_SEPARATION_K = 420;
var FISH_ALIGN_K = 1.4;
var FISH_COHESION_K = 1;
var FISH_FLEE_K = 1100;
var BLIND_COS = -0.6;
var World = class {
  /** fishCount overrides the area-based population (the sidebar wants a single small school). */
  constructor(sharkSpecs = DEFAULT_SHARKS, fishCount, whaleSpecs = DEFAULT_WHALES) {
    this.sharkSpecs = sharkSpecs;
    this.fishCount = fishCount;
    this.whaleSpecs = whaleSpecs;
  }
  width = 0;
  height = 0;
  time = 0;
  fish = [];
  sharks = [];
  whales = [];
  events = [];
  pointer = { x: 0, y: 0, active: false };
  /** Fish neighbourhood radius; the spatial hash bucket size matches it. */
  perception = 60;
  /** Per-species personal space in px (x, y). */
  sepX = [];
  sepY = [];
  foreignSep = 40;
  bucketCols = 0;
  bucketRows = 0;
  bucketHead = new Int32Array(0);
  bucketCount = new Uint16Array(0);
  bucketNext = new Int32Array(0);
  lastSpawn = 0;
  tmp = { x: 0, y: 0 };
  /** Scratch for bodyFear(), so the fish loop allocates nothing. */
  fearTmp = { x: 0, y: 0, fear: 0 };
  resize(width, height, cellW, cellH) {
    const first = this.width === 0;
    this.width = width;
    this.height = height;
    this.sepX = SPECIES2.map((sp) => sp.spacing[0] * cellW);
    this.sepY = SPECIES2.map((sp) => sp.spacing[1] * cellH);
    this.perception = Math.max(cellH * 3, cellW * 5.5);
    this.foreignSep = cellW * 3;
    if (first || this.fish.length === 0) {
      this.seed();
      return;
    }
    for (const f of this.fish) {
      f.x = clamp(f.x, 0, width);
      f.y = clamp(f.y, 0, height);
    }
  }
  seed() {
    const { width: W, height: H } = this;
    const minSide = Math.min(W, H);
    const baseLength = clamp(minSide * 0.44, 170, 430);
    const sharkCount = this.sharkSpecs.length;
    this.sharks = [];
    for (let i = 0; i < sharkCount; i++) {
      const { kind, size } = this.sharkSpecs[i];
      const length = baseLength * size;
      const orbitRadius = minSide * rand(0.28, 0.4);
      const a = i / sharkCount * TAU + rand(-0.4, 0.4);
      const orbitDir = i % 2 === 0 ? 1 : -1;
      const x = W / 2 + Math.cos(a) * orbitRadius * (W / minSide) * 0.9;
      const y = H / 2 + Math.sin(a) * orbitRadius;
      const heading = a + orbitDir * Math.PI / 2;
      this.sharks.push({
        id: i + 1,
        kind,
        length,
        nodes: this.buildSpine(x, y, heading, length),
        heading,
        speed: 30,
        phase: rand(0, TAU),
        turn: 0,
        hunger: rand(0.25, 0.75),
        wander: 0,
        orbitDir,
        orbitRadius,
        target: null,
        retargetAt: 0,
        depth: size
      });
    }
    this.sharks.sort((a, b) => a.length - b.length);
    this.whales = [];
    for (let i = 0; i < this.whaleSpecs.length; i++) {
      const spec = this.whaleSpecs[i];
      const cfg = WHALE_CONFIG[spec.kind];
      const length = baseLength * whaleSize(spec);
      const orbitRadius = minSide * rand(0.34, 0.48);
      const a = i / this.whaleSpecs.length * TAU + rand(-0.3, 0.3);
      const orbitDir = i % 2 === 0 ? 1 : -1;
      const x = W / 2 + Math.cos(a) * orbitRadius * (W / minSide) * 0.85;
      const y = H / 2 + Math.sin(a) * orbitRadius;
      const heading = a + orbitDir * Math.PI / 2;
      this.whales.push({
        id: 1e3 + i,
        kind: spec.kind,
        length,
        nodes: this.buildSpine(x, y, heading, length),
        heading,
        speed: cfg.cruise,
        phase: rand(0, TAU),
        turn: 0,
        wander: 0,
        orbitDir,
        orbitRadius,
        depth: rand(0.6, 0.95)
      });
    }
    const total = this.fishCount ?? clamp(Math.round(W * H / 4400), 85, 340);
    this.fish = [];
    while (this.fish.length < total) {
      const species = pickSpecies();
      const sp = SPECIES2[species];
      const size = Math.min(randInt(sp.schoolSize[0], sp.schoolSize[1]), total - this.fish.length);
      const millDir = Math.random() < 0.5 ? 1 : -1;
      const cx = rand(W * 0.06, W * 0.94);
      const cy = rand(H * 0.08, H * 0.92);
      const dir = (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.5, 0.5);
      for (let k = 0; k < size; k++) {
        this.fish.push({
          x: cx + rand(-1, 1) * this.sepX[species] * Math.sqrt(size),
          y: cy + rand(-1, 1) * this.sepY[species] * Math.sqrt(size) * 0.6,
          vx: Math.cos(dir) * sp.cruise,
          vy: Math.sin(dir) * sp.cruise,
          species,
          alarm: 0,
          alive: true,
          respawnAt: 0,
          phase: rand(0, TAU),
          turn: 0,
          depth: rand(0.55, 1),
          millDir
        });
      }
    }
    this.bucketNext = new Int32Array(this.fish.length);
  }
  splash(x, y) {
    this.events.push({ kind: "splash", x, y });
    const r = 240;
    for (const f of this.fish) {
      if (!f.alive) continue;
      const dx = f.x - x;
      const dy = f.y - y;
      const d = Math.hypot(dx, dy);
      if (d > r || d < 1e-3) continue;
      const k = (1 - d / r) * 260;
      f.vx += dx / d * k;
      f.vy += dy / d * k;
      f.alarm = 1;
    }
  }
  step(dt) {
    this.time += dt;
    this.rebuildHash();
    this.stepFish(dt);
    this.stepSharks(dt);
    this.stepWhales(dt);
    this.respawn();
  }
  /** Lay a straight spine out behind a snout position, snout first. */
  buildSpine(x, y, heading, length) {
    const nodes = new Float32Array(SHARK_NODES * 2);
    const seg = length / (SHARK_NODES - 1);
    for (let n = 0; n < SHARK_NODES; n++) {
      nodes[n * 2] = x - Math.cos(heading) * seg * n;
      nodes[n * 2 + 1] = y - Math.sin(heading) * seg * n;
    }
    return nodes;
  }
  rebuildHash() {
    const size = this.perception;
    const pad = 2;
    this.bucketCols = Math.ceil(this.width / size) + pad * 2;
    this.bucketRows = Math.ceil(this.height / size) + pad * 2;
    const n = this.bucketCols * this.bucketRows;
    if (this.bucketHead.length !== n) {
      this.bucketHead = new Int32Array(n);
      this.bucketCount = new Uint16Array(n);
    }
    this.bucketHead.fill(-1);
    this.bucketCount.fill(0);
    if (this.bucketNext.length !== this.fish.length) {
      this.bucketNext = new Int32Array(this.fish.length);
    }
    for (let i = 0; i < this.fish.length; i++) {
      const f = this.fish[i];
      if (!f.alive) continue;
      const b = this.bucketOf(f.x, f.y);
      this.bucketNext[i] = this.bucketHead[b];
      this.bucketHead[b] = i;
      this.bucketCount[b]++;
    }
  }
  bucketOf(x, y) {
    const size = this.perception;
    const c = clamp(Math.floor(x / size) + 2, 0, this.bucketCols - 1);
    const r = clamp(Math.floor(y / size) + 2, 0, this.bucketRows - 1);
    return r * this.bucketCols + c;
  }
  stepFish(dt) {
    const { fish, sharks, whales, pointer, width: W, height: H, time } = this;
    const R = this.perception;
    const R2 = R * R;
    const foreignSep = this.foreignSep;
    const size = this.perception;
    const cols = this.bucketCols;
    const rows = this.bucketRows;
    const head = this.bucketHead;
    const next = this.bucketNext;
    const cur = this.tmp;
    const calmDecay = Math.exp(-dt * 0.7);
    const contagion = Math.min(1, dt * 6);
    for (let i = 0; i < fish.length; i++) {
      const f = fish[i];
      if (!f.alive) continue;
      const sp = SPECIES2[f.species];
      const spread = 1 + 1.8 * f.alarm;
      const sepX = this.sepX[f.species] * spread;
      const sepY = this.sepY[f.species] * spread;
      const speed = Math.hypot(f.vx, f.vy) || 1;
      const hx = f.vx / speed;
      const hy = f.vy / speed;
      let ax = 0;
      let ay = 0;
      let sx = 0;
      let sy = 0;
      let avx = 0;
      let avy = 0;
      let cx = 0;
      let cy = 0;
      let n = 0;
      let neighbourAlarm = 0;
      const bc = clamp(Math.floor(f.x / size) + 2, 0, cols - 1);
      const br = clamp(Math.floor(f.y / size) + 2, 0, rows - 1);
      for (let r = Math.max(0, br - 1); r <= Math.min(rows - 1, br + 1); r++) {
        for (let c = Math.max(0, bc - 1); c <= Math.min(cols - 1, bc + 1); c++) {
          let j = head[r * cols + c];
          while (j !== -1) {
            if (j !== i) {
              const o = fish[j];
              const dx = o.x - f.x;
              const dy = o.y - f.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < R2 && d2 > 1e-6) {
                const d = Math.sqrt(d2);
                if ((dx * hx + dy * hy) / d > BLIND_COS) {
                  const qx = dx / sepX;
                  const qy = dy / sepY;
                  const q2 = qx * qx + qy * qy;
                  if (q2 < 1) {
                    const q = Math.sqrt(q2) || 1e-3;
                    const k = (1 - q) / q;
                    sx -= qx * k;
                    sy -= qy * k;
                  }
                  if (o.species === f.species) {
                    avx += o.vx;
                    avy += o.vy;
                    cx += dx;
                    cy += dy;
                    n++;
                  } else if (d < foreignSep) {
                    const k = (1 - d / foreignSep) / d * 0.6;
                    sx -= dx * k;
                    sy -= dy * k;
                  }
                  if (o.alarm > neighbourAlarm) neighbourAlarm = o.alarm;
                }
              }
            }
            j = next[j];
          }
        }
      }
      ax += sx * FISH_SEPARATION_K;
      ay += sy * FISH_SEPARATION_K;
      if (n > 0) {
        const alignK = FISH_ALIGN_K * sp.align;
        const cohesionK = FISH_COHESION_K * sp.cohesion * (1 - 0.8 * f.alarm);
        ax += (avx / n - f.vx) * alignK + cx / n * cohesionK;
        ay += (avy / n - f.vy) * alignK + cy / n * cohesionK;
        if (sp.mill > 0) {
          const cl = Math.hypot(cx, cy) || 1;
          ax += -cy / cl * f.millDir * sp.mill * (1 - f.alarm);
          ay += cx / cl * f.millDir * sp.mill * (1 - f.alarm);
        }
      }
      let fear = 0;
      for (const sh of sharks) {
        const push = this.bodyFear(f, sh.nodes, sh.heading, sh.length, 1);
        ax += push.x;
        ay += push.y;
        fear = Math.max(fear, push.fear);
      }
      for (const wh of whales) {
        const push = this.bodyFear(f, wh.nodes, wh.heading, wh.length, 0.45);
        ax += push.x;
        ay += push.y;
        fear = Math.max(fear, push.fear);
      }
      if (pointer.active) {
        const pr = 130;
        const dx = f.x - pointer.x;
        const dy = f.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < pr && d > 1e-3) {
          const w = (1 - d / pr) ** 2;
          ax += dx / d * FISH_FLEE_K * w;
          ay += dy / d * FISH_FLEE_K * w;
          fear = Math.max(fear, Math.sqrt(w) * 0.8);
        }
      }
      let alarm = Math.max(f.alarm * calmDecay, fear);
      const relayed = neighbourAlarm * 0.86;
      if (relayed > alarm) alarm += (relayed - alarm) * contagion;
      f.alarm = alarm;
      const m = 36;
      if (f.x < m) ax += (m - f.x) * 7;
      else if (f.x > W - m) ax -= (f.x - (W - m)) * 7;
      if (f.y < m) ay += (m - f.y) * 7;
      else if (f.y > H - m) ay -= (f.y - (H - m)) * 7;
      current2(f.x, f.y, time, cur);
      ax += cur.x * 0.5 + (Math.random() - 0.5) * sp.jitter;
      ay += cur.y * 0.5 + (Math.random() - 0.5) * sp.jitter;
      ay -= f.vy * sp.verticalDrag * (1 - 0.7 * f.alarm);
      const preferred = sp.cruise * (1 + 1.3 * f.alarm);
      ax += (preferred - speed) * hx * 1.6;
      ay += (preferred - speed) * hy * 1.6;
      const before = Math.atan2(f.vy, f.vx);
      f.vx += ax * dt;
      f.vy += ay * dt;
      const maxSpeed = sp.maxSpeed * (1 + 1.8 * f.alarm);
      const s = Math.hypot(f.vx, f.vy);
      if (s > maxSpeed) {
        f.vx *= maxSpeed / s;
        f.vy *= maxSpeed / s;
      } else if (s < sp.minSpeed && s > 1e-3) {
        f.vx *= sp.minSpeed / s;
        f.vy *= sp.minSpeed / s;
      }
      f.turn += (angleDiff(before, Math.atan2(f.vy, f.vx)) / dt - f.turn) * Math.min(1, dt * 8);
      f.phase += dt * (7 + Math.hypot(f.vx, f.vy) * 0.12);
      f.x = clamp(f.x + f.vx * dt, -60, W + 60);
      f.y = clamp(f.y + f.vy * dt, -60, H + 60);
    }
  }
  stepSharks(dt) {
    const { sharks, whales, width: W, height: H, time } = this;
    const minSide = Math.min(W, H);
    const cxW = W / 2;
    const cyW = H / 2;
    for (const sh of sharks) {
      const L = sh.length;
      const nodes = sh.nodes;
      const hx = nodes[0];
      const hy = nodes[1];
      sh.hunger = Math.min(1, sh.hunger + dt * 0.03);
      let dx = Math.cos(sh.heading);
      let dy = Math.sin(sh.heading);
      sh.wander = clamp(sh.wander + (Math.random() - 0.5) * dt * 3.2, -1.1, 1.1);
      dx += Math.cos(sh.heading + sh.wander) * 0.45;
      dy += Math.sin(sh.heading + sh.wander) * 0.45;
      if (time >= sh.retargetAt) {
        sh.target = this.findPrey(sh);
        sh.retargetAt = time + 0.45;
      }
      const t = sh.target;
      let hunting = false;
      let closing = 0;
      if (t && t.alive && sh.hunger > 0.3) {
        const tx = t.x + t.vx * 0.35 - hx;
        const ty = t.y + t.vy * 0.35 - hy;
        const d = Math.hypot(tx, ty) || 1;
        const w = 1.4 + 2.6 * sh.hunger;
        dx += tx / d * w;
        dy += ty / d * w;
        hunting = true;
        closing = clamp(1 - d / (L * 0.9), 0, 1);
      } else {
        const rx = (hx - cxW) / (W / minSide);
        const ry = hy - cyW;
        const r = Math.hypot(rx, ry) || 1;
        const radius = sh.orbitRadius * (1 + 0.15 * Math.sin(time * 0.05 + sh.id));
        const radial = clamp((radius - r) / radius, -1, 1);
        dx += (-ry / r * sh.orbitDir + rx / r * radial * 0.9) * 0.55;
        dy += (rx / r * sh.orbitDir + ry / r * radial * 0.9) * 0.55;
      }
      for (const other of sharks) {
        if (other === sh) continue;
        for (let k = 0; k < SHARK_NODES; k += 4) {
          const ox = hx - other.nodes[k * 2];
          const oy = hy - other.nodes[k * 2 + 1];
          const d = Math.hypot(ox, oy);
          const range = (L + other.length) * 0.45;
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 3;
            dx += ox / d * w;
            dy += oy / d * w;
          }
        }
      }
      for (const wh of whales) {
        for (let k = 0; k < SHARK_NODES; k += 2) {
          const ox = hx - wh.nodes[k * 2];
          const oy = hy - wh.nodes[k * 2 + 1];
          const d = Math.hypot(ox, oy);
          const range = L * 0.3 + wh.length * 0.2;
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 4;
            dx += ox / d * w;
            dy += oy / d * w;
          }
        }
      }
      const ex = (hx - cxW) / (W * 0.3);
      const ey = (hy - cyW) / (H * 0.16);
      const e2 = ex * ex + ey * ey;
      if (e2 < 1) {
        const e = Math.sqrt(e2) || 1e-3;
        const w = (1 - e) * (hunting ? 1 : 2.5);
        dx += ex / e * w;
        dy += ey / e * w;
      }
      const over = Math.max(-hx, hx - W, -hy, hy - H);
      if (over > -L * 0.05) {
        const w = clamp((over + L * 0.05) / (L * 0.35), 0, 1) * 3.5;
        const toX = cxW - hx;
        const toY = cyW - hy;
        const d = Math.hypot(toX, toY) || 1;
        dx += toX / d * w;
        dy += toY / d * w;
      }
      const desired = Math.atan2(dy, dx);
      const agility = Math.min(hunting ? 1.7 + closing : 0.8, sh.speed / (L * 0.22));
      const maxTurn = agility * dt;
      const turned = clamp(angleDiff(sh.heading, desired), -maxTurn, maxTurn);
      sh.heading += turned;
      sh.turn += (turned / dt - sh.turn) * Math.min(1, dt * 3);
      const cruise = 30 + L * 0.04;
      const targetSpeed = hunting ? cruise * (1.45 + closing * 1.5) : cruise;
      sh.speed += (targetSpeed - sh.speed) * Math.min(1, dt * 1.1);
      sh.phase += dt * (2 + sh.speed / 24);
      this.followSpine(nodes, sh.heading, sh.speed, dt, L, 0.16);
      if (sh.hunger > 0.15) {
        const mouthR = L * 0.05 + 8;
        const mx = nodes[0];
        const my = nodes[1];
        for (const f of this.fish) {
          if (!f.alive) continue;
          if ((f.x - mx) ** 2 + (f.y - my) ** 2 < mouthR * mouthR) {
            f.alive = false;
            f.respawnAt = time + rand(3, 8);
            sh.hunger = Math.max(0, sh.hunger - 0.16);
            this.events.push({ kind: "eat", x: f.x, y: f.y });
          }
        }
      }
    }
  }
  /**
   * Whales steer like a supertanker: a wide, breathing circuit, a very slow
   * yaw, and a soft spine. No hunting, no feeding — the fish part around them
   * and the sharks get out of the way.
   */
  stepWhales(dt) {
    const { whales, width: W, height: H, time } = this;
    const minSide = Math.min(W, H);
    const cxW = W / 2;
    const cyW = H / 2;
    for (const wh of whales) {
      const L = wh.length;
      const cfg = WHALE_CONFIG[wh.kind];
      const nodes = wh.nodes;
      const hx = nodes[0];
      const hy = nodes[1];
      let dx = Math.cos(wh.heading);
      let dy = Math.sin(wh.heading);
      wh.wander = clamp(wh.wander + (Math.random() - 0.5) * dt * 0.5, -0.45, 0.45);
      dx += Math.cos(wh.heading + wh.wander) * 0.5;
      dy += Math.sin(wh.heading + wh.wander) * 0.5;
      const rx = (hx - cxW) / (W / minSide);
      const ry = hy - cyW;
      const r = Math.hypot(rx, ry) || 1;
      const radius = wh.orbitRadius * (1 + 0.2 * Math.sin(time * 0.03 + wh.id));
      const radial = clamp((radius - r) / radius, -1, 1);
      dx += (-ry / r * wh.orbitDir + rx / r * radial * 0.6) * 0.24;
      dy += (rx / r * wh.orbitDir + ry / r * radial * 0.6) * 0.24;
      const ex = (hx - cxW) / (W * 0.34);
      const ey = (hy - cyW) / (H * 0.2);
      const e2 = ex * ex + ey * ey;
      if (e2 < 1) {
        const e = Math.sqrt(e2) || 1e-3;
        const w = (1 - e) * 0.9;
        dx += ex / e * w;
        dy += ey / e * w;
      }
      for (const other of whales) {
        if (other === wh) continue;
        for (let k = 0; k < SHARK_NODES; k += 4) {
          const ox = hx - other.nodes[k * 2];
          const oy = hy - other.nodes[k * 2 + 1];
          const d = Math.hypot(ox, oy);
          const range = (L + other.length) * 0.25;
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 2.5;
            dx += ox / d * w;
            dy += oy / d * w;
          }
        }
      }
      const m = Math.min(L * 0.4, Math.min(W, H) * 0.3);
      if (hx < m) dx += (m - hx) / m * 4;
      else if (hx > W - m) dx -= (hx - (W - m)) / m * 4;
      if (hy < m) dy += (m - hy) / m * 4;
      else if (hy > H - m) dy -= (hy - (H - m)) / m * 4;
      const desired = Math.atan2(dy, dx);
      const maxTurn = Math.min(cfg.agility, wh.speed / (L * 0.5)) * dt;
      const turned = clamp(angleDiff(wh.heading, desired), -maxTurn, maxTurn);
      wh.heading += turned;
      wh.turn += (turned / dt - wh.turn) * Math.min(1, dt * 2);
      wh.speed += (cfg.cruise - wh.speed) * Math.min(1, dt * 0.5);
      wh.phase += dt * (0.5 + wh.speed / 45);
      this.followSpine(nodes, wh.heading, wh.speed, dt, L, cfg.bend);
    }
  }
  /**
   * Move the snout forward and drag the rest of the spine behind it, with a
   * stiffness limit per joint so the body bends into a C at most and never
   * folds back on itself. Shared by sharks and whales.
   */
  followSpine(nodes, heading, speed, dt, L, maxBend) {
    nodes[0] += Math.cos(heading) * speed * dt;
    nodes[1] += Math.sin(heading) * speed * dt;
    const seg = L / (SHARK_NODES - 1);
    let prevAngle = heading + Math.PI;
    for (let k = 1; k < SHARK_NODES; k++) {
      const px = nodes[(k - 1) * 2];
      const py = nodes[(k - 1) * 2 + 1];
      let angle = Math.atan2(nodes[k * 2 + 1] - py, nodes[k * 2] - px);
      angle = prevAngle + clamp(angleDiff(prevAngle, angle), -maxBend, maxBend);
      nodes[k * 2] = px + Math.cos(angle) * seg;
      nodes[k * 2 + 1] = py + Math.sin(angle) * seg;
      prevAngle = angle;
    }
  }
  /**
   * Push a fish away from one swimming body (shark or whale). Distance is
   * measured to the nearest point along the front half of the body, so fish
   * also give the flanks a wide berth. Returns a shared scratch pod — use it
   * before the next call.
   */
  bodyFear(f, nodes, heading, length, gain) {
    const out = this.fearTmp;
    out.x = 0;
    out.y = 0;
    out.fear = 0;
    const fearR = length * 0.6 + 60;
    let best = Infinity;
    let bx = 0;
    let by = 0;
    for (let k = 0; k <= 12; k += 3) {
      const nx = nodes[k * 2];
      const ny = nodes[k * 2 + 1];
      const d2 = (f.x - nx) ** 2 + (f.y - ny) ** 2;
      if (d2 < best) {
        best = d2;
        bx = nx;
        by = ny;
      }
    }
    const d = Math.sqrt(best);
    if (d >= fearR || d < 1e-3) return out;
    let w = 1 - d / fearR;
    w *= w;
    const awayX = (f.x - bx) / d;
    const awayY = (f.y - by) / d;
    const hx = Math.cos(heading);
    const hy = Math.sin(heading);
    const side = hx * (f.y - nodes[1]) - hy * (f.x - nodes[0]) >= 0 ? 1 : -1;
    out.x = (awayX * 0.7 - hy * side * 0.9) * FISH_FLEE_K * w * gain;
    out.y = (awayY * 0.7 + hx * side * 0.9) * FISH_FLEE_K * w * gain;
    out.fear = Math.sqrt(w) * gain;
    return out;
  }
  /**
   * Pick prey in the shark's forward cone, preferring close fish in sparse
   * buckets (stragglers) over fish buried in a dense school.
   */
  findPrey(sh) {
    const range = sh.length * 0.9 + 160;
    const hx = sh.nodes[0];
    const hy = sh.nodes[1];
    const fx = Math.cos(sh.heading);
    const fy = Math.sin(sh.heading);
    let best = null;
    let bestScore = Infinity;
    let currentScore = Infinity;
    for (const f of this.fish) {
      if (!f.alive) continue;
      const dx = f.x - hx;
      const dy = f.y - hy;
      const d = Math.hypot(dx, dy);
      if (d > range || d < 1e-3) continue;
      const cos = (dx * fx + dy * fy) / d;
      if (cos < 0.2) continue;
      const crowd = this.bucketCount[this.bucketOf(f.x, f.y)];
      const score = d * (1 + (1 - cos) * 0.8) * (1 + crowd * 0.07);
      if (score < bestScore) {
        bestScore = score;
        best = f;
      }
      if (f === sh.target) currentScore = score;
    }
    if (sh.target && currentScore < bestScore * 1.3) return sh.target;
    return best;
  }
  respawn() {
    const { time, width: W, height: H } = this;
    const due = [];
    for (const f of this.fish) if (!f.alive && f.respawnAt <= time) due.push(f);
    if (due.length === 0) return;
    if (due.length < 6 && time - this.lastSpawn < 9) return;
    this.lastSpawn = time;
    const side = randInt(0, 3);
    const along = rand(0.15, 0.85);
    const x = side === 0 ? -20 : side === 1 ? W + 20 : along * W;
    const y = side === 2 ? -20 : side === 3 ? H + 20 : along * H;
    const inward = Math.atan2(H / 2 - y, W / 2 - x) + rand(-0.5, 0.5);
    const species = pickSpecies();
    const sp = SPECIES2[species];
    const millDir = Math.random() < 0.5 ? 1 : -1;
    for (const f of due.slice(0, sp.schoolSize[1])) {
      f.alive = true;
      f.species = species;
      f.alarm = 0;
      f.turn = 0;
      f.millDir = millDir;
      f.x = x + rand(-1, 1) * this.perception;
      f.y = y + rand(-1, 1) * this.perception;
      f.vx = Math.cos(inward) * sp.cruise * 1.4;
      f.vy = Math.sin(inward) * sp.cruise * 1.4;
    }
  }
};

// ../src/renderer.ts
var ALPHA_LEVELS = 6;
var FISH_ALPHAS = [0.28, 0.42, 0.58, 0.74, 0.9];
var DOT_RGB = [
  [48, 52, 235],
  [52, 205, 60],
  [228, 50, 44],
  [190, 212, 255],
  [110, 230, 255]
];
var DOT_BASE_ALPHA = [1, 1, 1, 1, 1];
var WAKE = DOT_RGB.length - 1;
var ACCENTS = ["#e0892c", "#e03a32", "#b44ae0", "#33c8cc", "#3cb54a", "#3150e8", "#d9c14a"];
var SKIN_RAMP = ":;t%SX8#@";
var FIN_GLYPHS = "%;tS:";
var RIDGE_GLYPHS = "@8%";
var EDGE_HEAVY = ":;";
var EDGE_LIGHT = ".',`";
var FLAG_BODY = 1;
var FLAG_EDGE = 2;
var FLAG_FIN = 3;
var FLAG_RIDGE = 4;
var FLAG_EYE = 5;
var FLAG_MARK = 6;
var MARK_GLYPHS = "#%@";
var SUBSAMPLES = [0.25, 0.3, 0.75, 0.3, 0.25, 0.72, 0.75, 0.72];
function classicHalfWidth(s) {
  if (s < 0.13) return 0.09 * Math.pow(Math.sin(s / 0.13 * Math.PI / 2), 0.95);
  if (s < 0.3) return 0.09 + 0.016 * smoothstep(0.13, 0.3, s);
  if (s < 0.84) return 0.019 + 0.087 * Math.pow(1 - (s - 0.3) / 0.54, 1.25);
  const k = (s - 0.84) / 0.16;
  return 0.019 * (1 - k) + 0.012 * Math.sin(k * Math.PI);
}
var SHAPES = {
  classic: {
    halfWidth: classicHalfWidth,
    pectoral: [0.15, 0.43, 0.55, 0.26],
    falcate: true,
    pelvic: [0.57, 0.65, 0.69, 0.085],
    caudal: 0.085,
    dorsal: [0.33, 0.47],
    secondDorsal: [0.71, 0.76],
    eye: [0.1, 0.14],
    gills: [0.19, 0.29],
    tint: [0.92, 0.97, 1.05]
  },
  // Slim neck under a wide, swept-back cephalofoil (drawn in sampleShark),
  // tall first dorsal, long upper tail lobe. Bronze-olive grey.
  hammerhead: {
    halfWidth: (s) => {
      if (s < 0.06) return 0.045;
      if (s < 0.3) return 0.045 + 0.061 * smoothstep(0.06, 0.3, s);
      return classicHalfWidth(s) * 0.92;
    },
    head: { span: 0.17, sweep: 0.035, depth: 0.09, notch: 0 },
    pectoral: [0.17, 0.4, 0.5, 0.22],
    falcate: true,
    pelvic: [0.56, 0.63, 0.67, 0.075],
    caudal: 0.11,
    dorsal: [0.28, 0.44],
    secondDorsal: [0.7, 0.74],
    eye: null,
    gills: [0.16, 0.26],
    tint: [0.96, 0.98, 0.9]
  },
  // Blunt, square snout on a heavy body; barred back. Warm grey-brown.
  tiger: {
    halfWidth: (s) => {
      if (s < 0.13) return 0.1 * Math.pow(Math.sin(s / 0.13 * Math.PI / 2), 0.45);
      if (s < 0.3) return 0.1 + 0.014 * smoothstep(0.13, 0.3, s);
      if (s < 0.84) return 0.019 + 0.095 * Math.pow(1 - (s - 0.3) / 0.54, 1.2);
      const k = (s - 0.84) / 0.16;
      return 0.019 * (1 - k) + 0.012 * Math.sin(k * Math.PI);
    },
    pectoral: [0.15, 0.42, 0.53, 0.25],
    falcate: true,
    pelvic: [0.57, 0.65, 0.69, 0.085],
    caudal: 0.095,
    dorsal: [0.33, 0.46],
    secondDorsal: [0.71, 0.75],
    eye: [0.08, 0.12],
    gills: [0.19, 0.28],
    markStyle: "tiger",
    tint: [1.02, 0.95, 0.84]
  },
  // Short rounded head, body done by half-length, then a long ribbon of a
  // tail fin. Broad rounded pectorals, spotted sandy skin.
  zebra: {
    halfWidth: (s) => {
      if (s < 0.1) return 0.075 * Math.pow(Math.sin(s / 0.1 * Math.PI / 2), 0.7);
      if (s < 0.28) return 0.075 + 0.025 * smoothstep(0.1, 0.28, s);
      if (s < 0.55) return 0.022 + 0.078 * Math.pow(1 - (s - 0.28) / 0.27, 1.1);
      const k = (s - 0.55) / 0.45;
      return 0.022 * (1 - k * k) + 0.012 * Math.sin(k * Math.PI);
    },
    pectoral: [0.12, 0.3, 0.36, 0.19],
    falcate: false,
    pelvic: [0.42, 0.48, 0.51, 0.065],
    caudal: 0,
    dorsal: [0.36, 0.44],
    secondDorsal: [0.49, 0.53],
    eye: [0.06, 0.09],
    gills: [0.13, 0.2],
    markStyle: "zebra",
    tint: [1.08, 0.97, 0.74]
  },
  // Great hammerhead: a broader, nearly straight-edged cephalofoil with a notch at the centre,
  // a towering sickle first dorsal (drawn long and bright from above), and a cooler slate skin.
  greathammer: {
    halfWidth: (s) => {
      if (s < 0.05) return 0.04;
      if (s < 0.3) return 0.04 + 0.07 * smoothstep(0.05, 0.3, s);
      return classicHalfWidth(s) * 0.95;
    },
    head: { span: 0.21, sweep: 6e-3, depth: 0.085, notch: 0.014 },
    pectoral: [0.16, 0.38, 0.49, 0.24],
    falcate: true,
    pelvic: [0.55, 0.62, 0.67, 0.085],
    caudal: 0.13,
    dorsal: [0.24, 0.45],
    secondDorsal: [0.68, 0.74],
    eye: null,
    gills: [0.15, 0.25],
    tint: [0.86, 0.93, 1.02]
  },
  // Shortfin mako: a long conical snout, a torpedo body that narrows hard to the tail stalk,
  // and a tall crescent tail. Metallic indigo back.
  mako: {
    halfWidth: (s) => {
      if (s < 0.17) return 0.088 * Math.pow(Math.sin(s / 0.17 * Math.PI / 2), 1.5);
      if (s < 0.32) return 0.088 + 0.012 * smoothstep(0.17, 0.32, s);
      if (s < 0.86) return 0.014 + 0.086 * Math.pow(1 - (s - 0.32) / 0.54, 1.45);
      const k = (s - 0.86) / 0.14;
      return 0.014 * (1 - k) + 0.01 * Math.sin(k * Math.PI);
    },
    pectoral: [0.18, 0.4, 0.5, 0.21],
    falcate: true,
    pelvic: [0.58, 0.64, 0.68, 0.06],
    caudal: 0.13,
    dorsal: [0.34, 0.45],
    secondDorsal: [0.76, 0.79],
    eye: [0.11, 0.15],
    gills: [0.2, 0.3],
    tint: [0.78, 0.9, 1.2]
  },
  // Thresher: a compact body over the front half, then the upper tail lobe as a long whip
  // that's as long as the shark itself. Big eyes, long sickle pectorals, bronze-violet skin.
  thresher: {
    halfWidth: (s) => {
      if (s < 0.08) return 0.07 * Math.pow(Math.sin(s / 0.08 * Math.PI / 2), 0.75);
      if (s < 0.2) return 0.07 + 0.02 * smoothstep(0.08, 0.2, s);
      if (s < 0.48) return 0.012 + 0.078 * Math.pow(1 - (s - 0.2) / 0.28, 1.3);
      const k = (s - 0.48) / 0.52;
      return 0.012 * (1 - k) + 6e-3 * Math.sin(k * Math.PI * 0.9) + 2e-3;
    },
    pectoral: [0.12, 0.27, 0.36, 0.2],
    falcate: true,
    pelvic: [0.37, 0.41, 0.44, 0.045],
    caudal: 0,
    dorsal: [0.24, 0.32],
    secondDorsal: [0.45, 0.47],
    eye: [0.05, 0.1],
    gills: [0.11, 0.18],
    tint: [1, 0.9, 1.08]
  },
  // Nurse shark: a blunt, broad head, a heavy flattened body with both dorsals set far back,
  // rounded paddle pectorals, and a long low tail with no lower lobe. Tawny brown.
  nurse: {
    halfWidth: (s) => {
      if (s < 0.08) return 0.085 * Math.pow(Math.sin(s / 0.08 * Math.PI / 2), 0.4);
      if (s < 0.3) return 0.085 + 0.02 * smoothstep(0.08, 0.3, s);
      if (s < 0.72) return 0.022 + 0.083 * Math.pow(1 - (s - 0.3) / 0.42, 1.1);
      const k = (s - 0.72) / 0.28;
      return 0.022 * (1 - k * k) + 0.014 * Math.sin(k * Math.PI);
    },
    pectoral: [0.16, 0.34, 0.4, 0.17],
    falcate: false,
    pelvic: [0.45, 0.52, 0.55, 0.075],
    caudal: 0,
    dorsal: [0.5, 0.58],
    secondDorsal: [0.63, 0.69],
    eye: [0.05, 0.075],
    gills: [0.14, 0.22],
    tint: [1.1, 0.96, 0.76]
  }
};
var WHALE_SHAPES = {
  // Blue whale: a broad, rounded head flowing into a long, even taper, a
  // dorsal fin the size of a thumbnail set right at the tail, and wide swept
  // flukes. Slate-blue, dappled with pale mottling.
  bluewhale: {
    halfWidth: (s) => {
      if (s < 0.24) return 0.104 * Math.pow(Math.sin(s / 0.24 * Math.PI / 2), 0.5);
      if (s < 0.34) return 0.104 + 0.011 * smoothstep(0.24, 0.34, s);
      if (s < 0.86) return 0.03 + 0.085 * Math.pow(1 - (s - 0.34) / 0.52, 1.15);
      const k = (s - 0.86) / 0.14;
      return 0.03 * (1 - k) + 0.013 * Math.sin(k * Math.PI);
    },
    pectoral: [0.14, 0.37, 0.3, 0.19],
    falcate: false,
    fluke: true,
    caudal: 0.14,
    dorsal: [0.82, 0.865],
    eye: [0.115, 0.14],
    blowhole: true,
    falloff: 0.3,
    markStyle: "mottle",
    tint: [0.88, 0.99, 1.18]
  },
  // Humpback: stocky and knobbly — tubercles across the rostrum, scythe
  // pectorals reaching a third of the body, a stubby dorsal hump, then a row
  // of knuckles on the tail stock. Near-black above, wide pale flukes.
  humpback: {
    halfWidth: (s) => {
      if (s < 0.14) return 0.096 * Math.pow(Math.sin(s / 0.14 * Math.PI / 2), 0.42);
      if (s < 0.3) return 0.096 + 0.022 * smoothstep(0.14, 0.3, s);
      if (s < 0.86) return 0.045 + 0.073 * Math.pow(1 - (s - 0.3) / 0.56, 1.05);
      const k = (s - 0.86) / 0.14;
      return 0.045 * (1 - k) + 0.011 * Math.sin(k * Math.PI);
    },
    pectoral: [0.15, 0.36, 0.31, 0.31],
    falcate: false,
    fluke: true,
    caudal: 0.185,
    dorsal: [0.54, 0.62],
    secondDorsal: [0.67, 0.8],
    eye: [0.075, 0.1],
    blowhole: true,
    falloff: 0.3,
    markStyle: "tubercle",
    tint: [0.78, 0.86, 1.02]
  },
  // Sperm whale: a third of the body is a blunt, squared head; no dorsal fin,
  // just a low hump; loose wrinkled skin over the whole front half, and broad
  // squarish flukes. Charcoal grey with a cold cast.
  spermwhale: {
    halfWidth: (s) => {
      if (s < 0.3) return 0.099 * Math.pow(Math.sin(s / 0.3 * Math.PI / 2), 0.3);
      if (s < 0.36) return 0.099 + 6e-3 * smoothstep(0.3, 0.36, s);
      if (s < 0.88) return 0.034 + 0.071 * Math.pow(1 - (s - 0.36) / 0.52, 1.05);
      const k = (s - 0.88) / 0.12;
      return 0.034 * (1 - k) + 8e-3 * Math.sin(k * Math.PI);
    },
    pectoral: [0.19, 0.38, 0.31, 0.12],
    falcate: false,
    fluke: true,
    caudal: 0.12,
    dorsal: [0.56, 0.66],
    eye: [0.3, 0.33],
    blowhole: true,
    falloff: 0.3,
    markStyle: "wrinkle",
    tint: [0.82, 0.9, 1.06]
  }
};
var SHARK_KINDS = Object.keys(SHAPES);
var WHALE_KINDS2 = Object.keys(WHALE_SHAPES);
var BODY_TINTS = [
  ...SHARK_KINDS.map((k) => SHAPES[k].tint),
  ...WHALE_KINDS2.map((k) => WHALE_SHAPES[k].tint)
];
function inTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}
function paintGrid(g, W, H, cw, ch, dpr) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.strokeStyle = "rgba(255,255,255,0.055)";
  g.lineWidth = 1;
  g.beginPath();
  for (let c = 0; c <= Math.ceil(W / cw); c++) {
    const x = Math.round(c * cw * dpr) + 0.5;
    g.moveTo(x, 0);
    g.lineTo(x, H * dpr);
  }
  for (let r = 0; r <= Math.ceil(H / ch); r++) {
    const y = Math.round(r * ch * dpr) + 0.5;
    g.moveTo(0, y);
    g.lineTo(W * dpr, y);
  }
  g.stroke();
}
var AsciiRenderer = class {
  constructor(canvas) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.bg = document.createElement("canvas");
    for (let c = 0; c < DOT_RGB.length; c++) {
      const [r, g, b] = DOT_RGB[c];
      for (let l = 0; l < ALPHA_LEVELS; l++) {
        const a = DOT_BASE_ALPHA[c] * (l + 1) / ALPHA_LEVELS;
        this.dotStyles.push(`rgba(${r},${g},${b},${a.toFixed(3)})`);
      }
    }
  }
  ctx;
  bg;
  dpr = 1;
  width = 0;
  height = 0;
  cw = 12;
  ch = 18;
  cols = 0;
  rows = 0;
  fontFamily = "ui-monospace, Menlo, monospace";
  dotKind = new Uint8Array(0);
  // 0 none, 1 blue, 2 green, 3 red, 4 pale
  dotPhase = new Float32Array(0);
  dotFreq = new Float32Array(0);
  energy = new Float32Array(0);
  energyTmp = new Float32Array(0);
  heat = new Float32Array(0);
  bucketOf = new Uint8Array(0);
  bucketOrder = new Int32Array(0);
  bucketCounts = new Int32Array(DOT_RGB.length * ALPHA_LEVELS + 1);
  dotStyles = [];
  sharkFlag = new Uint8Array(0);
  sharkShade = new Float32Array(0);
  sharkKey = new Uint32Array(0);
  sharkDepth = new Float32Array(0);
  sharkKind = new Uint8Array(0);
  /** Cells darkened by a shark's shadow on the seabed. */
  sharkShadow = new Uint8Array(0);
  spine = new Float32Array(SHARK_NODES * 2);
  arc = new Float32Array(SHARK_NODES);
  arcTotal = 1;
  shape = SHAPES.classic;
  sharkId = 0;
  finTipLeft = 0;
  finTipRight = 0;
  // Scratch outputs of sampleShark(), to avoid allocating per sample.
  hitFlag = 0;
  hitShade = 0;
  hitS = 0;
  hitV = 0;
  hitDist = 0;
  /** Cells holding a fish this frame (frame stamp); dots skip them. */
  fishStamp = new Uint32Array(0);
  frameId = 0;
  /** Fish cells bucketed by brightness, so each bucket is one fillStyle. */
  fishBuckets = FISH_ALPHAS.map(() => []);
  fishStyles = FISH_ALPHAS.map((a) => `rgba(230,238,255,${a})`);
  get cellWidth() {
    return this.cw;
  }
  get cellHeight() {
    return this.ch;
  }
  setFontFamily(family) {
    if (family) this.fontFamily = family;
  }
  resize(width, height, dpr) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.cw = clamp(Math.round(width / 124), 8, 13);
    this.ch = Math.round(this.cw * 1.45);
    this.cols = Math.ceil(width / this.cw);
    this.rows = Math.ceil(height / this.ch);
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.bg.width = this.canvas.width;
    this.bg.height = this.canvas.height;
    const n = this.cols * this.rows;
    this.dotKind = new Uint8Array(n);
    this.dotPhase = new Float32Array(n);
    this.dotFreq = new Float32Array(n);
    this.energy = new Float32Array(n);
    this.energyTmp = new Float32Array(n);
    this.heat = new Float32Array(n);
    this.bucketOf = new Uint8Array(n);
    this.bucketOrder = new Int32Array(n);
    this.sharkFlag = new Uint8Array(n);
    this.sharkShade = new Float32Array(n);
    this.sharkKey = new Uint32Array(n);
    this.sharkDepth = new Float32Array(n);
    this.sharkKind = new Uint8Array(n);
    this.sharkShadow = new Uint8Array(n);
    this.fishStamp = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      const col = i % this.cols;
      const row = i / this.cols | 0;
      this.dotKind[i] = 0;
      this.dotPhase[i] = hash3(col, row, 23) * Math.PI * 2;
      this.dotFreq[i] = 0.3 + hash3(col, row, 37) * 1.1;
    }
    this.paintBackground();
  }
  paintBackground() {
    const g = this.bg.getContext("2d");
    if (!g) return;
    const { width: W, height: H, dpr, cw, ch } = this;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#000";
    g.fillRect(0, 0, W, H);
    paintGrid(g, W, H, cw, ch, dpr);
  }
  render(world, dt) {
    const { ctx, dpr, cols, ch } = this;
    if (cols === 0) return;
    const t = world.time;
    this.consumeEvents(world);
    this.rasterizeBodies(world.sharks, world.whales, t);
    this.depositWake(world);
    this.diffuse(dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.bg, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.markFish(world);
    this.drawDots(t);
    ctx.font = `600 ${Math.round(ch * 0.74)}px ${this.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.drawHeat();
    this.drawFish();
    this.drawSharks(t);
  }
  // ── simulation → field ──────────────────────────────────────────────
  cellIndex(x, y) {
    const c = Math.floor(x / this.cw);
    const r = Math.floor(y / this.ch);
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
    return r * this.cols + c;
  }
  stamp(field, x, y, radius, amount) {
    const c0 = Math.floor(x / this.cw);
    const r0 = Math.floor(y / this.ch);
    for (let r = r0 - radius; r <= r0 + radius; r++) {
      for (let c = c0 - radius; c <= c0 + radius; c++) {
        if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) continue;
        const d = Math.hypot(c - c0, (r - r0) * 1.4);
        if (d > radius + 0.5) continue;
        const i = r * this.cols + c;
        field[i] = Math.min(1.6, field[i] + amount * (1 - d / (radius + 1)));
      }
    }
  }
  consumeEvents(world) {
    for (const e of world.events) {
      if (e.kind === "eat") {
        this.stamp(this.heat, e.x, e.y, 2, 1);
        this.stamp(this.energy, e.x, e.y, 3, 0.9);
      } else {
        this.stamp(this.energy, e.x, e.y, 6, 1.4);
      }
    }
    world.events.length = 0;
  }
  depositWake(world) {
    const { energy } = this;
    for (const f of world.fish) {
      if (!f.alive) continue;
      const i = this.cellIndex(f.x, f.y);
      if (i >= 0) energy[i] = Math.min(1.6, energy[i] + 0.012 + f.alarm * 0.03);
    }
    for (const sh of world.sharks) {
      for (let k = SHARK_NODES - 6; k < SHARK_NODES; k++) {
        const i = this.cellIndex(sh.nodes[k * 2], sh.nodes[k * 2 + 1]);
        if (i >= 0) energy[i] = Math.min(1.6, energy[i] + 0.05 + sh.speed * 12e-4);
      }
    }
    for (const wh of world.whales) {
      for (let k = SHARK_NODES - 7; k < SHARK_NODES; k++) {
        const i = this.cellIndex(wh.nodes[k * 2], wh.nodes[k * 2 + 1]);
        if (i >= 0) energy[i] = Math.min(1.6, energy[i] + 0.075 + wh.speed * 2e-3);
      }
    }
    if (world.pointer.active) {
      this.stamp(energy, world.pointer.x, world.pointer.y, 1, 0.08);
    }
  }
  /** Blur + decay so wakes spread out like ripples and fade. */
  diffuse(dt) {
    const { cols, rows, energy, energyTmp: tmp, heat } = this;
    const decay = Math.exp(-dt * 1.5);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const l = c > 0 ? energy[i - 1] : energy[i];
        const rt = c < cols - 1 ? energy[i + 1] : energy[i];
        const u = r > 0 ? energy[i - cols] : energy[i];
        const d = r < rows - 1 ? energy[i + cols] : energy[i];
        tmp[i] = (energy[i] * 4 + l + rt + u + d) * 0.125 * decay;
      }
    }
    this.energy = tmp;
    this.energyTmp = energy;
    const heatDecay = Math.exp(-dt * 2.2);
    for (let i = 0; i < heat.length; i++) heat[i] *= heatDecay;
  }
  // ── sharks ──────────────────────────────────────────────────────────
  /**
   * Classify one point against the current shark (spine/arc already built).
   * Body coordinates: s along the spine (0 snout → 1 tail), v across it.
   * Writes hit* fields and returns whether the point is on the shark.
   */
  sampleShark(px, py, L) {
    const { spine, arc } = this;
    const N = SHARK_NODES;
    let best = Infinity;
    let bestS = 0;
    let bestSign = 1;
    let bestNx = 0;
    let bestNy = 0;
    for (let k = 0; k < N - 1; k++) {
      const ax = spine[k * 2];
      const ay = spine[k * 2 + 1];
      const sx = spine[(k + 1) * 2] - ax;
      const sy = spine[(k + 1) * 2 + 1] - ay;
      const len2 = sx * sx + sy * sy || 1;
      const u2 = clamp(((px - ax) * sx + (py - ay) * sy) / len2, 0, 1);
      const qx = ax + sx * u2;
      const qy = ay + sy * u2;
      const d2 = (px - qx) ** 2 + (py - qy) ** 2;
      if (d2 < best) {
        best = d2;
        const len = Math.sqrt(len2);
        bestS = (arc[k] + u2 * len) / this.arcTotal;
        bestSign = sx * (py - ay) - sy * (px - ax) >= 0 ? 1 : -1;
        bestNx = -sy / len * bestSign;
        bestNy = sx / len * bestSign;
      }
    }
    const a = Math.sqrt(best);
    const s = bestS;
    const u = s * L;
    const shape = this.shape;
    const w = shape.halfWidth(s) * L;
    this.hitDist = a;
    this.hitS = s;
    this.hitV = a * bestSign;
    const head = this.shape.head;
    if (head && u < L * (head.sweep + head.depth + head.notch)) {
      const span = L * head.span;
      const r = a / span;
      const front = L * head.sweep * r * r + L * head.notch * Math.max(0, 1 - r / 0.14);
      const depth = L * head.depth * (1 - 0.2 * r * r * r * r);
      if (r <= 1 && u >= front && u <= front + depth) {
        this.hitFlag = r > 0.84 ? FLAG_EYE : FLAG_BODY;
        this.hitShade = r > 0.84 ? 0 : 0.62 - 0.2 * r + (u < front + L * 0.012 ? 0.1 : 0);
        return true;
      }
    }
    if (a <= w) {
      const across = a / (w || 1);
      const facing = (bestNx * -0.6 + bestNy * -0.8) * across;
      let shade = 0.58 - across * across * (shape.falloff ?? 0.42) + facing * 0.26;
      let flag = FLAG_BODY;
      const markStyle = shape.markStyle;
      if (s > shape.dorsal[0] && s < shape.dorsal[1] && across < 0.3) {
        flag = FLAG_RIDGE;
        shade = 1;
      } else if (shape.secondDorsal && s > shape.secondDorsal[0] && s < shape.secondDorsal[1] && across < 0.4) {
        shade = Math.max(shade, 0.82);
      } else if (shape.blowhole && s < 0.028 && across < 0.3) {
        flag = FLAG_EYE;
        shade = 0;
      } else if (shape.eye && s > shape.eye[0] && s < shape.eye[1] && across > 0.6) {
        flag = FLAG_EYE;
        shade = 0;
      } else if (shape.gills && s > shape.gills[0] && s < shape.gills[1] && across > 0.58) {
        if (Math.floor((s - shape.gills[0]) / (shape.gills[1] - shape.gills[0]) * 5) % 2 === 0) shade *= 0.45;
      } else if (s < 0.05) {
        shade = Math.max(shade, 0.7);
      } else if (markStyle === "zebra" && s > 0.08 && s < 0.55 && (across < 0.1 || Math.abs(across - 0.6) < 0.08)) {
        shade = Math.max(shade, 0.8);
      } else if (markStyle === "mottle" && this.mottle(s, a * bestSign, L)) {
        shade = Math.min(1, shade + 0.34);
      } else if (markStyle === "wrinkle" && s < 0.4) {
        shade *= 1 - 0.16 * (0.5 + 0.5 * Math.sin(across * 22 + s * 6));
      } else if (this.marked(s, a * bestSign, L, across)) {
        flag = FLAG_MARK;
      }
      this.hitFlag = flag;
      this.hitShade = shade;
      return true;
    }
    const tip = bestSign > 0 ? this.finTipRight : this.finTipLeft;
    const [p0, p1, p2] = shape.pectoral;
    if (inTriangle(u, a, L * p0, 0, L * p1, 0, L * p2, tip) && // Falcate (sickle) fins get a concave trailing edge.
    !(shape.falcate && inTriangle(u, a, L * p1, 0, L * (p1 + (p2 - p1) * 0.33), tip * 0.55, L * p2, tip))) {
      this.hitFlag = this.marked(s, a * bestSign, L, 0) ? FLAG_MARK : FLAG_FIN;
      this.hitShade = 0.38 + 0.22 * (1 - clamp(a / tip, 0, 1));
      return true;
    }
    let pelvicHit = false;
    if (shape.pelvic) {
      const [v0, v1, v2, vr] = shape.pelvic;
      pelvicHit = inTriangle(u, a, L * v0, 0, L * v1, 0, L * v2, L * vr);
    }
    const tailHit = shape.caudal > 0 && (shape.fluke ? a > L * 0.02 && inTriangle(u, a, L * 0.84, 0, L * 0.94, L * shape.caudal, L * 0.99, 0) : inTriangle(u, a, L * 0.86, 0, L * 0.95, 0, L, L * shape.caudal));
    if (pelvicHit || tailHit) {
      this.hitFlag = FLAG_FIN;
      this.hitShade = 0.36;
      return true;
    }
    return false;
  }
  /** Whether a body point (s along, v across) falls on a dark marking. */
  marked(s, v, L, across) {
    switch (this.shape.markStyle) {
      case "tiger": {
        if (s < 0.2 || s > 0.9 || across > 0.85) return false;
        const wobble = 0.35 * Math.sin(v / L * 25 + s * 5);
        const bar = Math.sin(s * Math.PI * 2 * 9 + wobble);
        return bar > 0.65 - 0.5 * smoothstep(0.2, 0.42, s) + 0.4 * smoothstep(0.8, 0.9, s);
      }
      case "zebra": {
        if (s < 0.07) return false;
        const gu = s * L / (L * 0.06);
        const gv = v / (L * 0.045);
        const cu = Math.floor(gu);
        const cv = Math.floor(gv);
        const jx = hash3(cu, cv, this.sharkId) * 0.5 + 0.25;
        const jy = hash3(cu, cv, this.sharkId + 11) * 0.5 + 0.25;
        return (gu - cu - jx) ** 2 + (gv - cv - jy) ** 2 < 0.08;
      }
      case "tubercle": {
        if (s > 0.14) return false;
        const gu = s * L / (L * 0.035);
        const gv = v / (L * 0.03);
        return hash3(Math.floor(gu), Math.floor(gv), this.sharkId + 31) < 0.34;
      }
      default:
        return false;
    }
  }
  /** Blue whale mottling: sparse pale flecks on a jittered grid. */
  mottle(s, v, L) {
    if (s < 0.05 || s > 0.9) return false;
    const gu = s * L / (L * 0.042);
    const gv = v / (L * 0.032);
    const cu = Math.floor(gu);
    const cv = Math.floor(gv);
    const jx = hash3(cu, cv, this.sharkId) * 0.7 + 0.15;
    const jy = hash3(cu, cv, this.sharkId + 13) * 0.7 + 0.15;
    return (gu - cu - jx) ** 2 + (gv - cv - jy) ** 2 < 0.05;
  }
  /**
   * Build a smooth, undulating render spine from each sim spine, then
   * supersample every cell in the body's bounding box against its shape.
   * Fully covered cells become solid skin; partial cells become edge glyphs.
   * Sharks and whales share this pass, so a whale's hide is shaded exactly
   * like a shark's — it is only much larger.
   */
  rasterizeBodies(sharks, whales, t) {
    this.sharkFlag.fill(0);
    this.sharkShadow.fill(0);
    for (const sh of sharks) {
      this.rasterizeBody(
        sh.nodes,
        sh.length,
        sh.speed,
        sh.turn,
        sh.phase,
        sh.id,
        sh.depth,
        SHAPES[sh.kind],
        SHARK_KINDS.indexOf(sh.kind),
        t
      );
    }
    for (const wh of whales) {
      this.rasterizeBody(
        wh.nodes,
        wh.length,
        wh.speed,
        wh.turn,
        wh.phase,
        wh.id,
        wh.depth,
        WHALE_SHAPES[wh.kind],
        SHARK_KINDS.length + WHALE_KINDS2.indexOf(wh.kind),
        t,
        // Whales beat a slow, deep, wide wave rather than a shark's ripple.
        0.075,
        2.6
      );
    }
  }
  /** Rasterise one body — shark or whale — into the shared body-cell fields. */
  rasterizeBody(n, L, speed, turn, phase, id, depth, shape, kindIndex, t, waveAmp = 0.05, waveK = 5.2) {
    const { sharkFlag, sharkShade, sharkKey, sharkDepth, sharkKind, sharkShadow, spine, arc, cw, ch, cols, rows } = this;
    const N = SHARK_NODES;
    const swim = clamp(speed / 60, 0.4, 1.4);
    this.shape = shape;
    this.sharkId = id;
    for (let k = 0; k < N; k++) {
      const s = k / (N - 1);
      const a = Math.max(0, k - 1);
      const b = Math.min(N - 1, k + 1);
      let tx = n[a * 2] - n[b * 2];
      let ty = n[a * 2 + 1] - n[b * 2 + 1];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const amp = L * waveAmp * (0.1 + 0.9 * Math.pow(s, 1.8)) * swim;
      const off = amp * Math.sin(phase - s * waveK);
      spine[k * 2] = n[k * 2] - ty * off;
      spine[k * 2 + 1] = n[k * 2 + 1] + tx * off;
    }
    arc[0] = 0;
    for (let k = 1; k < N; k++) {
      arc[k] = arc[k - 1] + Math.hypot(spine[k * 2] - spine[(k - 1) * 2], spine[k * 2 + 1] - spine[(k - 1) * 2 + 1]);
    }
    this.arcTotal = arc[N - 1] || 1;
    const bank = clamp(turn * 0.45, -0.35, 0.35);
    const flex = 1 + 0.06 * Math.sin(phase * 0.5);
    const reachFin = shape.pectoral[3];
    this.finTipRight = L * reachFin * flex * (1 - bank);
    this.finTipLeft = L * reachFin * flex * (1 + bank);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let k = 0; k < N; k++) {
      minX = Math.min(minX, spine[k * 2]);
      maxX = Math.max(maxX, spine[k * 2]);
      minY = Math.min(minY, spine[k * 2 + 1]);
      maxY = Math.max(maxY, spine[k * 2 + 1]);
    }
    const reach = L * 0.36;
    const c0 = Math.max(0, Math.floor((minX - reach) / cw));
    const c1 = Math.min(cols - 1, Math.floor((maxX + reach) / cw));
    const r0 = Math.max(0, Math.floor((minY - reach) / ch));
    const r1 = Math.min(rows - 1, Math.floor((maxY + reach) / ch));
    if (c0 > c1 || r0 > r1) return;
    const skipBeyond = reach + Math.hypot(cw, ch);
    const shadowDc = Math.round(L * 0.035 / cw) + 1;
    const shadowDr = Math.round(L * 0.02 / ch) + 1;
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const x = c * cw;
        const y = r * ch;
        const centerHit = this.sampleShark(x + cw / 2, y + ch / 2, L);
        if (!centerHit && this.hitDist > skipBeyond) continue;
        const flag = this.hitFlag;
        const shade = this.hitShade;
        const s = this.hitS;
        const v = this.hitV;
        let hits = centerHit ? 1 : 0;
        for (let k = 0; k < SUBSAMPLES.length; k += 2) {
          if (this.sampleShark(x + SUBSAMPLES[k] * cw, y + SUBSAMPLES[k + 1] * ch, L)) hits++;
        }
        if (hits === 0) continue;
        const coverage = hits / 5;
        const i = r * cols + c;
        const key = hash3(Math.round(s * 52), Math.round(v / (cw * 0.9)), id) * 4294967295 >>> 0;
        sharkKey[i] = key;
        sharkDepth[i] = depth;
        sharkKind[i] = kindIndex;
        if (centerHit && coverage >= 0.6) {
          sharkFlag[i] = flag;
          const flicker = (hash3(c, r, Math.floor(t * 6)) - 0.5) * 0.06;
          sharkShade[i] = clamp(shade + flicker, 0, 1);
          const sc = c + shadowDc;
          const sr = r + shadowDr;
          if (sc < cols && sr < rows) sharkShadow[sr * cols + sc] = 1;
        } else {
          sharkFlag[i] = FLAG_EDGE;
          sharkShade[i] = coverage;
        }
      }
    }
  }
  drawSharks(t) {
    const { ctx, cols, rows, cw, ch, sharkFlag, sharkShade, sharkKey, sharkDepth, sharkKind } = this;
    const n = cols * rows;
    for (let i = 0; i < n; i++) {
      const flag = sharkFlag[i];
      if (!flag) continue;
      const col = i % cols;
      const row = i / cols | 0;
      const x = col * cw;
      const y = row * ch;
      const key = sharkKey[i];
      const shade = sharkShade[i];
      const dim = 0.7 + 0.3 * sharkDepth[i];
      const [tr, tg, tb] = BODY_TINTS[sharkKind[i]];
      const isWhale = sharkKind[i] >= SHARK_KINDS.length;
      const spark = isWhale ? 0.03 : 0.09;
      const tick = Math.floor(t * (isWhale ? 1.1 : 2.4) + key % 997 / 97);
      const roll = hash3(key, tick, 7);
      if (flag === FLAG_EDGE) {
        const set = shade >= 0.5 ? EDGE_HEAVY : EDGE_LIGHT;
        const g = (70 + shade * 80) * dim;
        ctx.fillStyle = roll < spark * 0.78 ? ACCENTS[key % ACCENTS.length] : `rgb(${Math.round(g * tr)},${Math.round(g * tg)},${Math.min(255, Math.round(g * tb + 6))})`;
        ctx.fillText(set[(key >>> 8) % set.length], x + cw / 2, y + ch / 2 + 1);
        continue;
      }
      let level;
      let glyph;
      if (flag === FLAG_RIDGE) {
        level = 226;
        glyph = RIDGE_GLYPHS[(key >>> 8) % RIDGE_GLYPHS.length];
      } else if (flag === FLAG_EYE) {
        level = 12;
        glyph = "o";
      } else if (flag === FLAG_MARK) {
        level = 24 + shade * 22;
        glyph = MARK_GLYPHS[(key >>> 8) % MARK_GLYPHS.length];
      } else if (flag === FLAG_FIN) {
        level = 40 + shade * 120;
        glyph = FIN_GLYPHS[(key >>> 8) % FIN_GLYPHS.length];
      } else {
        level = 46 + shade * 160;
        const jitter = (key >>> 4) % 3 - 1;
        glyph = SKIN_RAMP[clamp(Math.floor((1 - shade) * 8.99) + jitter, 0, SKIN_RAMP.length - 1)];
      }
      level *= dim;
      ctx.fillStyle = `rgb(${Math.min(255, Math.round(level * tr))},${Math.min(255, Math.round(level * tg))},${Math.min(255, Math.round(level * tb + 4))})`;
      ctx.fillRect(x + 1, y + 1, cw - 1, ch - 1);
      let color;
      if (flag === FLAG_EYE) color = "#9aa0ad";
      else if (flag === FLAG_MARK) color = `rgb(${Math.round(70 * tr)},${Math.round(70 * tg)},${Math.round(70 * tb)})`;
      else if (roll < spark) color = ACCENTS[key % ACCENTS.length];
      else if (roll < spark * 1.44) color = "#ffffff";
      else color = shade > 0.55 ? "#0e0f13" : "#1b1d24";
      ctx.fillStyle = color;
      ctx.fillText(glyph, x + cw / 2, y + ch / 2 + 1);
    }
  }
  // ── fish, dots, heat ────────────────────────────────────────────────
  /**
   * Snap each fish to a cell and bucket it by brightness: far fish are dim,
   * near fish brighter, and turning or panicking fish glint. Nearer fish
   * claim a cell first when two land in the same one.
   */
  markFish(world) {
    const { fishStamp, fishBuckets, sharkFlag } = this;
    const frame = ++this.frameId;
    for (const bucket of fishBuckets) bucket.length = 0;
    for (let pass = 0; pass < 2; pass++) {
      for (const f of world.fish) {
        if (!f.alive || (f.depth > 0.78 ? 0 : 1) !== pass) continue;
        const i = this.cellIndex(f.x, f.y);
        if (i < 0 || fishStamp[i] === frame || sharkFlag[i]) continue;
        fishStamp[i] = frame;
        const glint = clamp(Math.abs(f.turn) / 3.5, 0, 1);
        const v = 0.3 + 0.4 * (f.depth - 0.55) / 0.45 + 0.3 * Math.max(glint, f.alarm);
        fishBuckets[clamp(Math.floor(v * FISH_ALPHAS.length), 0, FISH_ALPHAS.length - 1)].push(i);
      }
    }
  }
  drawFish() {
    const { ctx, cw, ch, cols, fishBuckets } = this;
    for (let b = 0; b < fishBuckets.length; b++) {
      const bucket = fishBuckets[b];
      if (!bucket.length) continue;
      ctx.fillStyle = this.fishStyles[b];
      for (const i of bucket) {
        ctx.fillText("-", i % cols * cw + cw / 2, (i / cols | 0) * ch + ch / 2 + 1);
      }
    }
  }
  drawHeat() {
    const { ctx, heat, cols, cw, ch } = this;
    for (let i = 0; i < heat.length; i++) {
      const h = heat[i];
      if (h < 0.08) continue;
      const col = i % cols;
      const row = i / cols | 0;
      ctx.fillStyle = h > 0.5 ? `rgba(255,120,60,${h.toFixed(2)})` : `rgba(220,40,40,${(h * 1.6).toFixed(2)})`;
      ctx.fillText(h > 0.6 ? "*" : "\xB7", col * cw + cw / 2, row * ch + ch / 2 + 1);
    }
  }
  /**
   * Every cell's dot twinkles on its own clock, is modulated by slow
   * caustic light bands, and flares cyan where the wake field is strong.
   * Dots are bucketed by colour/alpha so each bucket is one fillStyle.
   */
  drawDots(t) {
    const { ctx, cols, rows, cw, ch, dotKind, dotPhase, dotFreq, energy, sharkFlag, sharkShadow, fishStamp, frameId } = this;
    const { bucketOf, bucketOrder, bucketCounts } = this;
    const n = cols * rows;
    const SKIP = bucketCounts.length - 1;
    bucketCounts.fill(0);
    for (let i = 0; i < n; i++) {
      const e = energy[i];
      const kind = dotKind[i];
      if (sharkFlag[i] || fishStamp[i] === frameId || kind === 0 && e < 0.45) {
        bucketOf[i] = SKIP;
        continue;
      }
      let bucket;
      if (e > 0.45) {
        const level = clamp(Math.floor((e - 0.45) * 5), 0, ALPHA_LEVELS - 1);
        bucket = WAKE * ALPHA_LEVELS + level;
      } else {
        const col = i % cols;
        const row = i / cols | 0;
        const twinkle = 0.5 + 0.5 * Math.sin(t * dotFreq[i] + dotPhase[i]);
        const caustic = 0.85 + 0.15 * Math.sin(col * 0.11 + t * 0.35) * Math.sin(row * 0.17 - t * 0.27);
        let v = clamp((0.55 + 0.45 * twinkle) * caustic + e * 2, 0, 1);
        if (sharkShadow[i]) v *= 0.2;
        bucket = (kind - 1) * ALPHA_LEVELS + clamp(Math.floor(v * ALPHA_LEVELS), 0, ALPHA_LEVELS - 1);
      }
      bucketOf[i] = bucket;
      bucketCounts[bucket]++;
    }
    const starts = new Int32Array(bucketCounts.length);
    for (let b = 1; b < bucketCounts.length; b++) starts[b] = starts[b - 1] + bucketCounts[b - 1];
    const cursor = starts.slice();
    for (let i = 0; i < n; i++) {
      const b = bucketOf[i];
      if (b !== SKIP) bucketOrder[cursor[b]++] = i;
    }
    const small = Math.max(2, Math.round(cw * 0.19));
    const large = small + 1;
    for (let b = 0; b < SKIP; b++) {
      const count = bucketCounts[b];
      if (!count) continue;
      ctx.fillStyle = this.dotStyles[b];
      const size = b >= WAKE * ALPHA_LEVELS ? large : small;
      const start = starts[b];
      for (let k = start; k < start + count; k++) {
        const i = bucketOrder[k];
        const col = i % cols;
        const row = i / cols | 0;
        ctx.fillRect(Math.round(col * cw + cw * 0.66 - size / 2), Math.round(row * ch + ch * 0.64 - size / 2), size, size);
      }
    }
  }
};

// ../src/engine.ts
var STEP = 1 / 60;
var MAX_STEPS = 4;
var OceanEngine = class {
  constructor(canvas, sharks, whales) {
    this.canvas = canvas;
    this.world = new World(sharks, void 0, whales);
    this.renderer = new AsciiRenderer(canvas);
    this.renderer.setFontFamily(getComputedStyle(canvas).fontFamily);
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.intersectionObserver.observe(canvas);
    this.reducedMotion.addEventListener("change", this.onMotionPreference);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("blur", this.onPointerLeave);
    this.resize();
    document.fonts?.load(`600 16px ${getComputedStyle(canvas).fontFamily}`).then(() => {
      if (!this.disposed && this.reducedMotion.matches) this.drawStill();
    });
    this.schedule();
  }
  world;
  renderer;
  raf = 0;
  last = 0;
  acc = 0;
  /** Minimum wall time between paints, in ms; `0` means uncapped. */
  capMs = 0;
  /** Timestamp of the last painted frame (not of the last callback). */
  lastPaint = 0;
  visible = true;
  reducedMotion;
  resizeObserver;
  intersectionObserver;
  disposed = false;
  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener("change", this.onMotionPreference);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerDown);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("blur", this.onPointerLeave);
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.resize(rect.width, rect.height, dpr);
    this.world.resize(rect.width, rect.height, this.renderer.cellWidth, this.renderer.cellHeight);
    if (this.reducedMotion.matches) this.drawStill();
  }
  schedule() {
    cancelAnimationFrame(this.raf);
    if (this.disposed || !this.visible || this.reducedMotion.matches) return;
    this.last = performance.now();
    this.lastPaint = 0;
    this.raf = requestAnimationFrame(this.frame);
  }
  /**
   * Cap how often the canvas is painted, in frames per second.
   *
   * The simulation keeps its fixed timestep: a skipped animation frame only
   * defers the paint, and the next paint advances the world by the elapsed
   * wall time (up to MAX_STEPS). So 30 fps still moves at the same speed as
   * 60 fps, it just draws half as often — which is where the CPU goes.
   *
   * @param fps - ceiling in frames per second; `0` or a non-positive value removes it.
   */
  setFrameCap(fps) {
    const next = Number.isFinite(fps) && fps > 0 ? 1e3 / fps : 0;
    if (next === this.capMs) return;
    this.capMs = next;
    this.lastPaint = 0;
    this.schedule();
  }
  frame = (now) => {
    if (this.capMs > 0 && this.lastPaint && now - this.lastPaint < this.capMs - 1) {
      this.raf = requestAnimationFrame(this.frame);
      return;
    }
    this.lastPaint = now;
    const dt = Math.min(0.1, (now - this.last) / 1e3);
    this.last = now;
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < MAX_STEPS) {
      this.world.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) this.acc = 0;
    this.renderer.render(this.world, dt);
    this.raf = requestAnimationFrame(this.frame);
  };
  /** Reduced motion: let the ecosystem settle, then show a single frame. */
  drawStill() {
    if (this.world.time < 4) {
      for (let i = 0; i < 240; i++) this.world.step(STEP);
    }
    this.renderer.render(this.world, STEP);
  }
  onMotionPreference = () => {
    if (this.reducedMotion.matches) {
      cancelAnimationFrame(this.raf);
      this.drawStill();
    } else {
      this.schedule();
    }
  };
  toLocal(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    return { x, y, inside };
  }
  onPointerMove = (e) => {
    const { x, y, inside } = this.toLocal(e);
    const p = this.world.pointer;
    p.x = x;
    p.y = y;
    p.active = inside && e.pointerType !== "touch";
  };
  onPointerDown = (e) => {
    const { x, y, inside } = this.toLocal(e);
    if (inside && !this.reducedMotion.matches) this.world.splash(x, y);
  };
  onPointerLeave = () => {
    this.world.pointer.active = false;
  };
};

// src/ocean.ts
var NS = "dsh-ascii-ocean-bg";
var FRAME_ATTR = "data-dsh-ocean";
var CANVAS_ATTR = "data-dsh-ocean-canvas";
var LIVE_ATTR = "data-dsh-ocean-live";
var SCHEME_ATTR = "data-dsh-ocean-scheme";
function stylesheet(config) {
  const t = config.translucency;
  const baseKeep = Math.round((1 - t) * 100);
  const sidebarKeep = Math.round((1 - t) * 82);
  const lifted = Math.round((1 - t * 0.9) * 100);
  const liftSidebar = Math.round((1 - t * 0.86) * 100);
  return `
html[${LIVE_ATTR}] [${FRAME_ATTR}] {
  --dsw-alias-bg-base: color-mix(in srgb, var(--dsw-static-neutral-bluish-950) ${baseKeep}%, transparent) !important;
  --dsw-specific-sidebar-fill: color-mix(in srgb, var(--dsw-static-neutral-bluish-900) ${sidebarKeep}%, transparent) !important;
}
html[${LIVE_ATTR}][${SCHEME_ATTR}="light"] [${FRAME_ATTR}] {
  --dsw-alias-bg-base: color-mix(in srgb, #ffffff ${lifted}%, transparent) !important;
  --dsw-specific-sidebar-fill: color-mix(in srgb, #ffffff ${liftSidebar}%, transparent) !important;
}
/*
 * The overlay layer hosts dialogs and menus. Those surfaces paint themselves
 * with the base token, so they get the opaque palette back: a translucent
 * modal over moving water is unreadable.
 */
html[${LIVE_ATTR}] [${FRAME_ATTR}] [data-shell-overlay] {
  --dsw-alias-bg-base: var(--dsw-static-neutral-bluish-950, #151517) !important;
  --dsw-specific-sidebar-fill: var(--dsw-static-neutral-bluish-900, #1b1b1c) !important;
}
html[${LIVE_ATTR}][${SCHEME_ATTR}="light"] [${FRAME_ATTR}] [data-shell-overlay] {
  --dsw-alias-bg-base: var(--dsw-static-neutral-bluish-00, #ffffff) !important;
  --dsw-specific-sidebar-fill: var(--dsw-static-neutral-bluish-50, #f7f7f8) !important;
}
/*
 * Menus and popovers portal to <body>, so they sit above the canvas but still
 * paint with a sheer fill meant for a still backdrop: moving glyphs behind them
 * read as noise. Raise the fill at document scope \u2014 translucent, just not busy \u2014
 * while every real dialog keeps the opaque palette restored above.
 */
html[${LIVE_ATTR}] {
  --dsw-menu-surface-fill: #43454ae0;
}
html[${LIVE_ATTR}][${SCHEME_ATTR}="light"] {
  --dsw-menu-surface-fill: #f8f9faf0;
}
/*
 * The canvas is an absolutely positioned, z-index:0 child of the frame, so it
 * would otherwise paint above the frame's in-flow columns. Lifting exactly the
 * frame's other children above it keeps the columns and every control on top;
 * the overlay layer keeps its own much higher z-index so modals and menus are
 * untouched, and later children (drag handles, the macOS leading seat) still win
 * ties against the columns by document order.
 */
html[${LIVE_ATTR}] [${FRAME_ATTR}] > :not([data-shell-overlay]):not(canvas) {
  z-index: 1;
}
[${FRAME_ATTR}] > canvas[${CANVAS_ATTR}] {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: ${config.opacity};
}
html[${SCHEME_ATTR}="light"] [${FRAME_ATTR}] > canvas[${CANVAS_ATTR}] {
  filter: invert(1) hue-rotate(180deg) contrast(1.08);
  opacity: ${(config.opacity * 0.64).toFixed(2)};
}
@media (prefers-reduced-transparency: reduce) {
  html[${LIVE_ATTR}] [${FRAME_ATTR}] {
    --dsw-alias-bg-base: var(--dsw-static-neutral-bluish-950) !important;
    --dsw-specific-sidebar-fill: var(--dsw-static-neutral-bluish-900) !important;
  }
  html[${LIVE_ATTR}][${SCHEME_ATTR}="light"] [${FRAME_ATTR}] {
    --dsw-alias-bg-base: #ffffff !important;
    --dsw-specific-sidebar-fill: #ffffff !important;
  }
  [${FRAME_ATTR}] > canvas[${CANVAS_ATTR}] { opacity: ${(config.opacity * 0.5).toFixed(2)}; }
}
`;
}
function rosterKey(config) {
  return JSON.stringify([config.sharks, config.whales]);
}
function scheme(config) {
  if (config.palette !== "auto") return config.palette;
  if (document.body?.hasAttribute("data-ds-dark-theme")) return "dark";
  if (document.documentElement.style.colorScheme === "dark") return "dark";
  return "light";
}
function findFrame() {
  const overlay = document.querySelector("[data-shell-overlay]");
  return overlay?.parentElement ?? null;
}
function createOcean() {
  let host = null;
  let handle = null;
  let styleEl = null;
  let frameObserver = null;
  let themeObserver = null;
  let unsubscribe = null;
  let mediaQuery = null;
  let pending = 0;
  function ensureStyle() {
    const tagId = `${NS}/style.css`;
    const config = getConfig();
    if (!styleEl?.isConnected) {
      styleEl = document.querySelector(`style[data-plugin-css="${tagId}"]`) ?? document.createElement("style");
      styleEl.dataset.plugin = NS;
      styleEl.dataset.pluginCss = tagId;
      if (!styleEl.isConnected) document.head.appendChild(styleEl);
    }
    const next = stylesheet(config);
    if (styleEl.textContent !== next) styleEl.textContent = next;
  }
  function mountInto(frame) {
    const config = getConfig();
    frame.setAttribute(FRAME_ATTR, "");
    const canvas = document.createElement("canvas");
    canvas.setAttribute(CANVAS_ATTR, "");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.fontFamily = '"Geist Mono", ui-monospace, Menlo, monospace';
    frame.appendChild(canvas);
    const engine = new OceanEngine(canvas, config.sharks, config.whales);
    engine.setFrameCap(config.fpsCap);
    handle = { canvas, engine, roster: rosterKey(config) };
  }
  function unmount() {
    if (handle) {
      handle.engine.destroy();
      handle.canvas.remove();
      handle = null;
    }
    host?.removeAttribute(FRAME_ATTR);
    host = null;
    document.documentElement.removeAttribute(LIVE_ATTR);
    document.documentElement.removeAttribute(SCHEME_ATTR);
  }
  function reconcile() {
    const config = getConfig();
    if (!config.enabled) {
      if (handle || host) unmount();
      return;
    }
    const frame = findFrame();
    if (!frame) {
      if (handle || host) unmount();
      return;
    }
    document.documentElement.setAttribute(SCHEME_ATTR, scheme(config));
    ensureStyle();
    handle?.engine.setFrameCap(config.fpsCap);
    if (handle && frame === host && handle.canvas.isConnected && handle.roster === rosterKey(config)) {
      return;
    }
    unmount();
    host = frame;
    document.documentElement.setAttribute(LIVE_ATTR, "");
    mountInto(frame);
  }
  function schedule() {
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      reconcile();
    });
  }
  function start() {
    reconcile();
    frameObserver = new MutationObserver(schedule);
    frameObserver.observe(document.documentElement, { childList: true, subtree: true });
    themeObserver = new MutationObserver(schedule);
    if (document.body) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-ds-dark-theme"]
      });
    }
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-platform", "data-fullscreen"]
    });
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", schedule);
    unsubscribe = subscribe(schedule);
  }
  function destroy() {
    unsubscribe?.();
    unsubscribe = null;
    mediaQuery?.removeEventListener("change", schedule);
    mediaQuery = null;
    if (pending) cancelAnimationFrame(pending);
    pending = 0;
    frameObserver?.disconnect();
    themeObserver?.disconnect();
    frameObserver = null;
    themeObserver = null;
    unmount();
    styleEl?.remove();
    styleEl = null;
  }
  start();
  return { refresh: reconcile, destroy };
}

// src/settings.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var NS2 = "settings.asciiOcean";
var zh = {
  title: "\u80CC\u666F\u8BBE\u7F6E",
  description: "\u6D77\u9762\u94FA\u5728\u754C\u9762\u4E0B\u65B9\uFF0C\u9CA8\u7FA4\u3001\u9CB8\u9C7C\u548C\u5C3E\u8FF9\u5728\u4FA7\u680F\u4E0E\u5BF9\u8BDD\u540E\u9762\u6E38\u52A8\u3002",
  enabled: "\u663E\u793A\u80CC\u666F",
  enabledHint: "\u5173\u6389\u5C31\u56DE\u5230\u51FA\u5382\u754C\u9762\uFF1B\u8FD9\u9879\u9009\u62E9\u4F1A\u8BB0\u4F4F\u3002",
  species: "\u7269\u79CD",
  speciesHint: "\u70B9\u51FB\u6DFB\u52A0\u6216\u79FB\u9664\uFF0C\u6700\u591A {max} \u79CD\uFF1B\u5217\u8868\u8D8A\u9760\u524D\u4F53\u578B\u8D8A\u5927\u3002",
  selected: "\u5DF2\u9009 {count} \u79CD",
  full: "\u5DF2\u8FBE\u4E0A\u9650 {max} \u79CD",
  opacity: "\u4E0D\u900F\u660E\u5EA6",
  opacityHint: "\u753B\u5E03\u6574\u4F53\u7684\u6D53\u5EA6\uFF0C\u8D8A\u4F4E\u8D8A\u6DE1\u3002",
  translucency: "\u900F\u660E\u7A0B\u5EA6",
  translucencyHint: "\u754C\u9762\u5E95\u8272\u8BA9\u5F00\u591A\u5C11\uFF0C\u8D8A\u9AD8\u6D77\u9762\u8D8A\u900F\uFF1B\u592A\u9AD8\u4F1A\u5F71\u54CD\u6B63\u6587\u53EF\u8BFB\u6027\u3002",
  palette: "\u914D\u8272",
  paletteHint: "\u8DDF\u968F\u754C\u9762\u4E3B\u9898\uFF0C\u6216\u628A\u6D77\u9762\u9489\u6210\u6DF1\u8272 / \u6D45\u8272\u3002",
  fps: "\u5E27\u7387\u4E0A\u9650",
  fpsHint: "\u6BCF\u79D2\u6700\u591A\u753B\u51E0\u5E27\u3002\u9CA8\u9C7C\u6309\u771F\u5B9E\u65F6\u95F4\u6E38\u52A8\uFF0C\u964D\u4F4E\u53EA\u51CF\u5C11\u7ED8\u5236\u6B21\u6570\uFF0C\u4E0D\u6539\u53D8\u901F\u5EA6\u3002",
  fpsNote: "30 \u5E27\u7EA6\u7701\u4E00\u534A CPU\uFF0C15 \u5E27\u7EA6\u7701\u56DB\u5206\u4E4B\u4E09\u3002",
  paletteAuto: "\u8DDF\u968F",
  paletteDark: "\u6DF1\u8272",
  paletteLight: "\u6D45\u8272",
  restore: "\u6062\u590D\u9ED8\u8BA4",
  restored: "\u5DF2\u6062\u590D\u4E3A\u6863\u6848\u9ED8\u8BA4\u503C",
  customized: "\u5F53\u524D\u4F7F\u7528\u7684\u662F\u672C\u6D4F\u89C8\u5668\u4FDD\u5B58\u7684\u8BBE\u7F6E",
  defaults: "\u5F53\u524D\u4F7F\u7528\u7684\u662F\u6863\u6848\u9ED8\u8BA4\u503C",
  resetHint: "\u6062\u590D\u9ED8\u8BA4\u4F1A\u6E05\u6389\u672C\u6D4F\u89C8\u5668\u4FDD\u5B58\u7684\u9009\u62E9\u3002",
  speciesClassic: "\u5927\u767D\u9CA8",
  speciesHammerhead: "\u9524\u5934\u9CA8",
  speciesGreathammer: "\u5DE8\u578B\u9524\u5934",
  speciesTiger: "\u864E\u9CA8",
  speciesZebra: "\u8C79\u7EB9\u9CA8",
  speciesMako: "\u7070\u9CAD\u9CA8",
  speciesThresher: "\u957F\u5C3E\u9CA8",
  speciesNurse: "\u62A4\u58EB\u9CA8",
  whales: "\u9CB8\u9C7C",
  whalesHint: "\u53EF\u9009\uFF0C\u6700\u591A {max} \u6761\u3002\u9CB8\u4E0D\u6355\u98DF\uFF0C\u53EA\u6309\u81EA\u5DF1\u7684\u8282\u594F\u6162\u6162\u5DE1\u6E38\uFF0C\u4F53\u578B\u8FDC\u5927\u4E8E\u9CA8\u9C7C\u3002",
  whalesSelected: "\u5DF2\u9009 {count} \u6761",
  whalesFull: "\u5DF2\u8FBE\u4E0A\u9650 {max} \u6761",
  whalesNone: "\u6CA1\u6709\u9CB8\u9C7C",
  speciesHumpback: "\u5EA7\u5934\u9CB8",
  speciesBluewhale: "\u84DD\u9CB8",
  speciesSpermwhale: "\u62B9\u9999\u9CB8",
  saved: "\u8BBE\u7F6E\u53EA\u4FDD\u5B58\u5728\u8FD9\u4E2A\u6D4F\u89C8\u5668\uFF0C\u4E0D\u5F71\u54CD\u5176\u4ED6\u8BBE\u5907\u3002"
};
var en = {
  title: "Background",
  description: "The ocean sits under the interface; sharks, whales and their wake swim behind the sidebar and the transcript.",
  enabled: "Show background",
  enabledHint: "Turning this off returns the stock interface; the choice is remembered.",
  species: "Species",
  speciesHint: "Click to add or remove, up to {max}; earlier entries swim larger.",
  selected: "{count} selected",
  full: "Limit of {max} reached",
  opacity: "Opacity",
  opacityHint: "Overall density of the canvas \u2014 lower is fainter.",
  translucency: "Translucency",
  translucencyHint: "How far the surfaces step aside; very high hurts text contrast.",
  palette: "Palette",
  paletteHint: "Follow the interface theme, or pin the water dark or light.",
  fps: "Frame cap",
  fpsHint: "How many frames may be painted per second. Sharks swim on wall time, so lowering it only draws less often.",
  fpsNote: "30 fps saves about half the CPU, 15 fps about three quarters.",
  paletteAuto: "Auto",
  paletteDark: "Dark",
  paletteLight: "Light",
  restore: "Reset to default",
  restored: "Restored the profile defaults",
  customized: "Using the choices saved in this browser",
  defaults: "Using the profile defaults",
  resetHint: "Resetting clears what this browser saved.",
  speciesClassic: "Great white",
  speciesHammerhead: "Hammerhead",
  speciesGreathammer: "Great hammerhead",
  speciesTiger: "Tiger",
  speciesZebra: "Zebra",
  speciesMako: "Mako",
  speciesThresher: "Thresher",
  speciesNurse: "Nurse",
  whales: "Whales",
  whalesHint: "Optional, up to {max}. Whales never hunt \u2014 they just cruise at their own pace, far bigger than any shark.",
  whalesSelected: "{count} selected",
  whalesFull: "Limit of {max} reached",
  whalesNone: "No whales",
  speciesHumpback: "Humpback",
  speciesBluewhale: "Blue whale",
  speciesSpermwhale: "Sperm whale",
  saved: "Settings stay in this browser and do not follow you to other devices."
};
var CSS = `
.aob-section{display:flex;flex-direction:column;width:100%}
.aob-lead{color:var(--dsw-alias-label-secondary);padding:0 0 4px;font-size:12px;line-height:18px}
.aob-row{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.aob-row:last-of-type{border-bottom:none}
.aob-block{display:flex;flex-direction:column;gap:10px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.aob-copy{min-width:0}
.aob-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}
.aob-desc{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}
.aob-switch{position:relative;flex:none;width:34px;height:20px;border-radius:999px;border:none;padding:0;cursor:pointer;background:var(--dsw-alias-border-l3);transition:background .15s ease}
.aob-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}
.aob-switch::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-switch-thumb,#fff);transition:transform .15s ease}
.aob-switch[aria-checked="true"]::after{transform:translateX(14px)}
.aob-chips{display:flex;flex-wrap:wrap;gap:8px}
.aob-chip{border-radius:999px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-family:inherit;font-size:12px;line-height:18px;padding:5px 12px;transition:all .12s ease}
.aob-chip:hover{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}
.aob-chip[aria-pressed="true"]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent)}
.aob-chip:disabled{cursor:not-allowed;opacity:.45}
.aob-meta{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.aob-slider{display:flex;align-items:center;gap:12px;flex:none;width:220px}
.aob-slider input[type=range]{flex:1;min-width:0;accent-color:var(--dsw-alias-brand-primary);cursor:pointer}
.aob-value{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:12px;line-height:18px;width:34px;text-align:right}
.aob-seg{display:inline-flex;flex:none;gap:2px;padding:2px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-interactive-bg-hover)}
.aob-seg button{border:none;border-radius:calc(var(--dsw-radius-md,8px) - 2px);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-family:inherit;font-size:12px;line-height:18px;padding:4px 12px}
.aob-seg button[aria-pressed="true"]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgb(0 0 0 / .2)}
.aob-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 0 0}
.aob-notes{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.aob-reset{flex:none;border-radius:var(--dsw-radius-md,8px);border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font-family:inherit;font-size:12px;line-height:18px;padding:6px 14px}
.aob-reset:hover{background:var(--dsw-alias-interactive-bg-hover)}
.aob-reset:disabled{cursor:default;opacity:.4;background:transparent}
@media (max-width:720px){.aob-row{align-items:flex-start;flex-direction:column;gap:10px}.aob-slider{width:100%}}
`;
var CSS_TAG = "dsh-ascii-ocean-bg/settings.css";
var NAV_MARKER = "data-dsh-ocean-nav-icon";
var NAV_ROW_SELECTOR = '[role="dialog"] nav button';
var FIN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000"><path d="M6.4 19.4c1.1-5 3.4-9.2 8.1-13.6-.5 4.6.6 8.1 3.7 11.6-3.6 1.9-7.6 2.4-11.8 2z"/><rect x="2" y="20.6" width="20" height="1.6" rx=".8"/><rect x="2" y="17" width="3" height="1.2" rx=".6"/><rect x="19" y="17" width="3" height="1.2" rx=".6"/></svg>';
function navIconCss(maskUrl) {
  return [
    `[${NAV_MARKER}] > svg { display: none; }`,
    `[${NAV_MARKER}]::before {`,
    "  content: '';",
    "  flex: none;",
    "  width: 16px;",
    "  height: 16px;",
    "  background-color: currentColor;",
    `  -webkit-mask-image: url("${maskUrl}");`,
    `  mask-image: url("${maskUrl}");`,
    "  -webkit-mask-repeat: no-repeat;",
    "  mask-repeat: no-repeat;",
    "  -webkit-mask-position: center;",
    "  mask-position: center;",
    "  -webkit-mask-size: 16px 16px;",
    "  mask-size: 16px 16px;",
    "}"
  ].join("\n");
}
function installNavIcon(ctx, resolveLabel) {
  ctx.effect(() => {
    const tag = document.createElement("style");
    tag.dataset.plugin = "dsh-ascii-ocean-bg";
    tag.dataset.pluginCss = `${CSS_TAG.replace("settings.css", "nav-icon")}`;
    tag.textContent = navIconCss(`data:image/svg+xml,${encodeURIComponent(FIN_SVG)}`);
    document.head.appendChild(tag);
    let disposed = false;
    let scheduled = false;
    const sync = () => {
      scheduled = false;
      if (disposed) return;
      if (!document.querySelector('[role="dialog"]')) return;
      const wanted = resolveLabel().trim();
      if (!wanted) return;
      for (const row of document.querySelectorAll(NAV_ROW_SELECTOR)) {
        if ((row.textContent ?? "").trim() === wanted) row.setAttribute(NAV_MARKER, "");
        else row.removeAttribute(NAV_MARKER);
      }
    };
    const schedule = () => {
      if (scheduled || disposed) return;
      scheduled = true;
      queueMicrotask(sync);
    };
    sync();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      disposed = true;
      observer.disconnect();
      for (const row of document.querySelectorAll(`[${NAV_MARKER}]`)) {
        row.removeAttribute(NAV_MARKER);
      }
      tag.remove();
    };
  }, "ascii-ocean: settings nav icon");
}
function ensureCss() {
  if (document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`)) return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-ascii-ocean-bg";
  tag.dataset.pluginCss = CSS_TAG;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}
function Row(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-copy", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-title", children: props.title }),
      props.desc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-desc", children: props.desc }) : null
    ] }),
    props.children
  ] });
}
function Block(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-copy", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-title", children: props.title }),
      props.desc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-desc", children: props.desc }) : null
    ] }),
    props.children,
    props.meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-meta", children: props.meta }) : null
  ] });
}
function speciesLabel(t, kind) {
  const key = `species${kind.charAt(0).toUpperCase()}${kind.slice(1)}`;
  const copy = t(key);
  return copy === key ? kind : copy;
}
function OceanSection(props) {
  const { t } = props;
  const config = (0, import_react.useSyncExternalStore)(subscribe, getConfig, getConfig);
  const selected = config.sharks.map((row) => row.kind);
  const whales = config.whales.map((row) => row.kind);
  const full = selected.length >= MAX_SPECIES;
  const whalesFull = whales.length >= MAX_WHALES;
  const customized = isCustomized();
  const toggleSpecies = (kind) => {
    const next = selected.includes(kind) ? selected.filter((row) => row !== kind) : [...selected, kind];
    if (next.length === 0) return;
    updateConfig({ sharks: rosterOf(next) });
  };
  const toggleWhale = (kind) => {
    const next = whales.includes(kind) ? whales.filter((row) => row !== kind) : [...whales, kind];
    updateConfig({ whales: whaleRosterOf(next) });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-section", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-lead", children: t("description") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { title: t("enabled"), desc: t("enabledHint"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        role: "switch",
        "aria-checked": config.enabled ? "true" : "false",
        "aria-label": t("enabled"),
        className: "aob-switch",
        onClick: () => updateConfig({ enabled: !config.enabled })
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Block,
      {
        title: t("species"),
        desc: t("speciesHint", { max: MAX_SPECIES }),
        meta: full ? t("full", { max: MAX_SPECIES }) : t("selected", { count: selected.length }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-chips", children: SPECIES.map((row) => {
          const on = selected.includes(row.kind);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              "aria-pressed": on ? "true" : "false",
              disabled: !on && full,
              className: "aob-chip",
              onClick: () => toggleSpecies(row.kind),
              children: speciesLabel(t, row.kind)
            },
            row.kind
          );
        }) })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Block,
      {
        title: t("whales"),
        desc: t("whalesHint", { max: MAX_WHALES }),
        meta: whalesFull ? t("whalesFull", { max: MAX_WHALES }) : whales.length ? t("whalesSelected", { count: whales.length }) : t("whalesNone"),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-chips", children: WHALES.map((row) => {
          const on = whales.includes(row.kind);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              "aria-pressed": on ? "true" : "false",
              disabled: !on && whalesFull,
              className: "aob-chip",
              onClick: () => toggleWhale(row.kind),
              children: speciesLabel(t, row.kind)
            },
            row.kind
          );
        }) })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { title: t("opacity"), desc: t("opacityHint"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-slider", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "range",
          min: 0,
          max: 1,
          step: 0.02,
          value: config.opacity,
          "aria-label": t("opacity"),
          onChange: (event) => updateConfig({ opacity: Number(event.currentTarget.value) })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "aob-value", children: config.opacity.toFixed(2) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { title: t("translucency"), desc: t("translucencyHint"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-slider", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "range",
          min: 0,
          max: 1,
          step: 0.02,
          value: config.translucency,
          "aria-label": t("translucency"),
          onChange: (event) => updateConfig({ translucency: Number(event.currentTarget.value) })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "aob-value", children: config.translucency.toFixed(2) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { title: t("palette"), desc: t("paletteHint"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-seg", role: "group", "aria-label": t("palette"), children: ["auto", "dark", "light"].map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        "aria-pressed": config.palette === option ? "true" : "false",
        onClick: () => updateConfig({ palette: option }),
        children: t(`palette${option.charAt(0).toUpperCase()}${option.slice(1)}`)
      },
      option
    )) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { title: t("fps"), desc: `${t("fpsHint")} ${t("fpsNote")}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aob-seg", role: "group", "aria-label": t("fps"), children: FRAME_CAPS.map((cap) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        "aria-pressed": config.fpsCap === cap ? "true" : "false",
        onClick: () => updateConfig({ fpsCap: cap }),
        children: cap
      },
      cap
    )) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-foot", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "aob-notes", children: [
        customized ? t("customized") : t("defaults"),
        " \xB7 ",
        t("saved")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "aob-reset",
          disabled: !customized,
          onClick: () => resetConfig(),
          children: t("restore")
        }
      )
    ] })
  ] });
}
function registerOceanSettings(ctx) {
  const t = ctx.locale.bind(NS2);
  ctx.effect(() => ctx.locale.register(NS2, { zh, en }), "ascii-ocean: settings dictionaries");
  installNavIcon(ctx, () => t("title"));
  ctx.effect(
    () => ctx.slots.inject("settings.section", () => {
      ensureCss();
      return ctx.slots.register(
        {
          name: "settings.section",
          id: "ascii-ocean",
          order: 60,
          label: () => t("title"),
          locale: NS2
        },
        OceanSection
      );
    }),
    "ascii-ocean: settings page"
  );
}

// src/client.ts
var inject = ["slots", "locale"];
function pageConfig() {
  return globalThis[CONFIG_GLOBAL];
}
function apply(ctx, rawConfig) {
  initConfig(rawConfig ?? pageConfig());
  ctx.effect(() => {
    const ocean = createOcean();
    const api = {
      /** Turn the background on or off; the choice survives reloads. */
      setEnabled(next) {
        return updateConfig({ enabled: next }).enabled;
      },
      toggle() {
        return api.setEnabled(!getConfig().enabled);
      },
      get enabled() {
        return getConfig().enabled;
      },
      /** Patch the live config (sharks, whales, opacity, translucency, palette). */
      configure(next) {
        const patch = next && typeof next === "object" ? next : {};
        return { ...updateConfig(patch) };
      },
      get config() {
        return { ...getConfig() };
      },
      /** Re-read the frame and palette by hand. */
      refresh() {
        ocean.refresh();
      }
    };
    window.__dshOcean = api;
    return () => {
      delete window.__dshOcean;
      ocean.destroy();
    };
  }, "ascii-ocean: canvas + surface sync");
  registerOceanSettings(ctx);
}

return module.exports;}});
