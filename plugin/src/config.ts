/**
 * dsh-ascii-ocean-bg — shared configuration state.
 *
 * One store, two consumers: the canvas controller reads it to decide what to
 * paint, and the settings page reads and writes it. Everything the page changes
 * is applied to the live ocean immediately and persisted per browser, so a
 * reload keeps the roster the user picked instead of snapping back to the
 * profile's patch row.
 *
 * Precedence: profile patch row (embedded into the index by the host half) <
 * localStorage. The store is deliberately tiny — no framework, no schema — and
 * `normalize` is the only gate, so a hand-edited localStorage blob degrades to
 * defaults instead of breaking the import.
 */
import type { SharkKind, SharkSpec } from "../../src/world";
import type { WhaleKind, WhaleSpec } from "../../src/whale";

/** Paint ceilings the settings page offers, fastest first. */
export const FRAME_CAPS = [60, 30, 15] as const;

export type FrameCap = (typeof FRAME_CAPS)[number];

export interface OceanConfig {
  /** Mount at all. `false` leaves the GUI exactly as shipped. */
  enabled: boolean;
  /** Canvas opacity over the frame, 0–1. */
  opacity: number;
  /** Which sharks to swim, biggest first. */
  sharks: SharkSpec[];
  /** Which whales share the water. Empty by default: whales are opt-in. */
  whales: WhaleSpec[];
  /** `auto` follows the active theme; `dark`/`light` pin the wash recipe. */
  palette: "auto" | "dark" | "light";
  /** How far the surface washes let the water through, 0–1 (0 = opaque GUI). */
  translucency: number;
  /** Paint ceiling in frames per second. */
  fpsCap: FrameCap;
}

/** The global the host half embeds in the index; see lib/index.js. */
export const CONFIG_GLOBAL = "__DSH_ASCII_OCEAN_CONFIG__";

/** Full-config blob written by the settings page. */
const CONFIG_KEY = "dsh-ascii-ocean-bg:config";
/** Legacy toggle key, still honored so an old switch state keeps working. */
const ENABLED_KEY = "dsh-ascii-ocean-bg:enabled";

export const DEFAULTS: OceanConfig = {
  enabled: true,
  opacity: 0.78,
  palette: "auto",
  translucency: 0.44,
  fpsCap: 60,
  sharks: [
    { kind: "hammerhead", size: 1 },
    { kind: "tiger", size: 0.86 },
    { kind: "thresher", size: 0.8 },
    { kind: "mako", size: 0.72 },
  ],
  whales: [],
};

/** Every species the renderer knows, in the order the settings page lists them. */
export const SPECIES: { kind: SharkKind; zh: string; en: string }[] = [
  { kind: "classic", zh: "大白鲨", en: "Great white" },
  { kind: "hammerhead", zh: "锤头鲨", en: "Hammerhead" },
  { kind: "greathammer", zh: "巨型锤头", en: "Great hammerhead" },
  { kind: "tiger", zh: "虎鲨", en: "Tiger" },
  { kind: "zebra", zh: "豹纹鲨", en: "Zebra" },
  { kind: "mako", zh: "灰鲭鲨", en: "Mako" },
  { kind: "thresher", zh: "长尾鲨", en: "Thresher" },
  { kind: "nurse", zh: "护士鲨", en: "Nurse" },
];

/** Most sharks the engine keeps in one roster. */
export const MAX_SPECIES = 6;

/**
 * Whales, in the order the settings page lists them. Each one's size comes from
 * WHALE_CONFIG in the engine, so a chip only carries the kind.
 */
export const WHALES: { kind: WhaleKind; zh: string; en: string }[] = [
  { kind: "humpback", zh: "座头鲸", en: "Humpback" },
  { kind: "bluewhale", zh: "蓝鲸", en: "Blue whale" },
  { kind: "spermwhale", zh: "抹香鲸", en: "Sperm whale" },
];

/** Most whales at once: two already cross the whole frame. */
export const MAX_WHALES = 2;

const ALIASES: Record<string, SharkKind> = {
  greatwhite: "classic",
  white: "classic",
  scalloped: "hammerhead",
  smooth: "hammerhead",
  leopard: "zebra",
  sandtiger: "tiger",
  porbeagle: "mako",
  fox: "thresher",
  tawny: "nurse",
};

const KIND_SET = new Set<string>(SPECIES.map((row) => row.kind));

/** Friendly spellings a patch row or the console might use for a whale. */
const WHALE_ALIASES: Record<string, WhaleKind> = {
  blue: "bluewhale",
  bluewhale: "bluewhale",
  humpback: "humpback",
  humpbackwhale: "humpback",
  sperm: "spermwhale",
  spermwhale: "spermwhale",
};

const WHALE_SET = new Set<string>(WHALES.map((row) => row.kind));

/** Accept the friendly roster shapes a profile patch is likely to carry. */
export function normalizeSharks(input: unknown, fallback: SharkSpec[]): SharkSpec[] {
  if (!Array.isArray(input) || input.length === 0) return fallback;
  const rows: SharkSpec[] = [];
  input.forEach((raw, index) => {
    const size = 1 - index * 0.1;
    if (typeof raw === "string") {
      const kind = ALIASES[raw.toLowerCase()] ?? (raw.toLowerCase() as SharkKind);
      if (KIND_SET.has(kind)) rows.push({ kind, size: Math.max(0.4, size) });
      return;
    }
    if (raw && typeof raw === "object") {
      const row = raw as { kind?: unknown; size?: unknown };
      if (typeof row.kind !== "string") return;
      const kind = ALIASES[row.kind.toLowerCase()] ?? (row.kind.toLowerCase() as SharkKind);
      if (!KIND_SET.has(kind)) return;
      const bound = typeof row.size === "number" ? row.size : Math.max(0.4, size);
      rows.push({ kind, size: Math.min(1.6, Math.max(0.25, bound)) });
    }
  });
  return rows.length ? rows.slice(0, MAX_SPECIES) : fallback;
}

/**
 * Accept the whale shapes a profile patch is likely to carry. Unlike the shark
 * roster this list may be empty: the water works fine without whales.
 */
export function normalizeWhales(input: unknown, fallback: WhaleSpec[]): WhaleSpec[] {
  if (!Array.isArray(input)) return fallback;
  const rows: WhaleSpec[] = [];
  for (const raw of input) {
    if (typeof raw === "string") {
      const key = raw.trim().toLowerCase();
      const kind = WHALE_ALIASES[key] ?? (WHALE_SET.has(key) ? (key as WhaleKind) : null);
      if (kind) rows.push({ kind });
      continue;
    }
    if (raw && typeof raw === "object") {
      const row = raw as { kind?: unknown; size?: unknown };
      if (typeof row.kind !== "string") continue;
      const key = row.kind.trim().toLowerCase();
      const kind = WHALE_ALIASES[key] ?? (WHALE_SET.has(key) ? (key as WhaleKind) : null);
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

export function normalize(input: unknown): OceanConfig {
  const raw = (input && typeof input === "object" ? input : {}) as Partial<OceanConfig>;
  const clamp01 = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : DEFAULTS.enabled,
    opacity: clamp01(raw.opacity, DEFAULTS.opacity),
    palette: raw.palette === "dark" || raw.palette === "light" ? raw.palette : "auto",
    translucency: clamp01(raw.translucency, DEFAULTS.translucency),
    fpsCap: FRAME_CAPS.includes(raw.fpsCap as FrameCap) ? (raw.fpsCap as FrameCap) : DEFAULTS.fpsCap,
    sharks: normalizeSharks(raw.sharks, DEFAULTS.sharks),
    whales: normalizeWhales(raw.whales, DEFAULTS.whales),
  };
}

/** Build the whale roster the engine wants from the chips the page has selected. */
export function whaleRosterOf(kinds: readonly WhaleKind[]): WhaleSpec[] {
  return kinds.slice(0, MAX_WHALES).map((kind) => ({ kind }));
}

/** Build the roster the engine wants from the species the page has selected. */
export function rosterOf(kinds: readonly SharkKind[]): SharkSpec[] {
  return kinds.slice(0, MAX_SPECIES).map((kind, index) => ({
    kind,
    size: Math.max(0.4, 1 - index * 0.1),
  }));
}

function readStored(): Partial<OceanConfig> {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed as Partial<OceanConfig>;
    }
  } catch {
    /* corrupt blob: fall through to the legacy switch */
  }
  try {
    const legacy = window.localStorage.getItem(ENABLED_KEY);
    if (legacy !== null) return { enabled: legacy !== "off" };
  } catch {
    /* private mode */
  }
  return {};
}

function writeStored(next: OceanConfig) {
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
        whales: next.whales,
      }),
    );
    // Keep the legacy key in step so the console toggle and the page agree.
    window.localStorage.setItem(ENABLED_KEY, next.enabled ? "on" : "off");
  } catch {
    /* private mode: the choice stays page-local */
  }
}

let base: OceanConfig = DEFAULTS;
let current: OceanConfig = DEFAULTS;
const listeners = new Set<() => void>();
let persistTimer = 0;

function notify() {
  for (const listener of listeners) listener();
}

/** Schedule the (synchronous, small) localStorage write off the drag path. */
function schedulePersist(next: OceanConfig) {
  if (persistTimer) window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    persistTimer = 0;
    writeStored(next);
  }, 160);
}

/** Fold the embedded patch config and the browser's saved choices together. */
export function initConfig(embedded: unknown): OceanConfig {
  base = normalize(embedded);
  current = normalize({ ...base, ...readStored() });
  return current;
}

export function getConfig(): OceanConfig {
  return current;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Patch the live config, persist it, and fan out to subscribers.
 * @param patch - fields to change; anything invalid normalizes to the default.
 */
export function updateConfig(patch: Partial<OceanConfig>): OceanConfig {
  current = normalize({ ...current, ...patch });
  schedulePersist(current);
  notify();
  return current;
}

/** Drop the user's choices and return to what the profile patch row asked for. */
export function resetConfig(): OceanConfig {
  current = normalize(base);
  if (persistTimer) {
    window.clearTimeout(persistTimer);
    persistTimer = 0;
  }
  writeStored(current);
  notify();
  return current;
}

/** Whether the saved state differs from the profile default. */
export function isCustomized(): boolean {
  return JSON.stringify(current) !== JSON.stringify(base);
}
