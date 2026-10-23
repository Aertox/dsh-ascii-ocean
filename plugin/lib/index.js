/**
 * Host half of dsh-ascii-ocean-bg.
 *
 * The background itself is browser-only, but a client bundle never receives the
 * loader row's config — the boot graph carries only id, url, inject and
 * external. Browser-facing settings therefore travel the same way every other
 * page setting does: the host validates the row's config and embeds it in the
 * index response, and the browser half reads it back off `globalThis`.
 *
 * Validation is hand-written on purpose. This package has no dependencies at
 * all, so a config typo degrades to a warning plus defaults instead of a failed
 * plugin import.
 */

export const name = "ascii-ocean-bg";

/** The global the browser half reads; kept in sync with src/client.ts. */
const CONFIG_GLOBAL = "__DSH_ASCII_OCEAN_CONFIG__";

const SHARK_KINDS = new Set([
  "classic",
  "hammerhead",
  "zebra",
  "tiger",
  "greathammer",
  "mako",
  "thresher",
  "nurse",
]);

/** Whales the engine knows; the roster is opt-in, so this may end up empty. */
const WHALE_KINDS = new Set(["bluewhale", "humpback", "spermwhale"]);

/** Friendly spellings mapped onto the engine's species keys. */
const ALIASES = {
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

/** Friendly spellings a patch row may use for a whale. */
const WHALE_ALIASES = {
  blue: "bluewhale",
  bluewhale: "bluewhale",
  humpback: "humpback",
  humpbackwhale: "humpback",
  sperm: "spermwhale",
  spermwhale: "spermwhale",
};

/** Most whales at once, matching MAX_WHALES in the browser half. */
const MAX_WHALES = 2;

/** Paint ceilings the settings page offers; a patch row may pick any of them. */
const FRAME_CAPS = [60, 30, 15];

const DEFAULTS = {
  enabled: true,
  opacity: 0.78,
  translucency: 0.44,
  palette: "auto",
  fpsCap: 60,
  sharks: [
    { kind: "hammerhead", size: 1 },
    { kind: "tiger", size: 0.86 },
    { kind: "thresher", size: 0.8 },
    { kind: "mako", size: 0.72 },
  ],
  whales: [],
};

const clamp = (value, lo, hi) => (value < lo ? lo : value > hi ? hi : value);
const clamp01 = (value) => clamp(value, 0, 1);

/** Resolve one roster entry to a species the renderer knows, or `null`. */
function sharkOf(raw, index) {
  const stepDown = Math.max(0.4, 1 - index * 0.1);
  if (typeof raw === "string") {
    const key = raw.trim().toLowerCase();
    const kind = ALIASES[key] ?? key;
    return SHARK_KINDS.has(kind) ? { kind, size: stepDown } : null;
  }
  if (raw !== null && typeof raw === "object" && typeof raw.kind === "string") {
    const key = raw.kind.trim().toLowerCase();
    const kind = ALIASES[key] ?? key;
    if (!SHARK_KINDS.has(kind)) return null;
    const size = typeof raw.size === "number" && Number.isFinite(raw.size) ? raw.size : stepDown;
    return { kind, size: clamp(size, 0.25, 1.6) };
  }
  return null;
}

/** Resolve one whale entry, or `null` when the name is not one we swim. */
function whaleOf(raw) {
  if (typeof raw === "string") {
    const key = raw.trim().toLowerCase();
    const kind = WHALE_ALIASES[key] ?? key;
    return WHALE_KINDS.has(kind) ? { kind } : null;
  }
  if (raw !== null && typeof raw === "object" && typeof raw.kind === "string") {
    const key = raw.kind.trim().toLowerCase();
    const kind = WHALE_ALIASES[key] ?? key;
    if (!WHALE_KINDS.has(kind)) return null;
    if (typeof raw.size === "number" && Number.isFinite(raw.size)) {
      return { kind, size: clamp(raw.size, 0.4, 2.4) };
    }
    return { kind };
  }
  return null;
}

/**
 * Validate a loader row's config into the shape the page expects.
 * @param config - raw config handed to apply() by the loader.
 * @param warn - sink for rejections, so a typo is visible instead of silent.
 */
export function normalizeConfig(config, warn = () => {}) {
  if (config === undefined || config === null) return { ...DEFAULTS };
  if (typeof config !== "object") {
    warn("config must be an object; using defaults");
    return { ...DEFAULTS };
  }

  const next = { ...DEFAULTS };

  if (config.enabled !== undefined) {
    if (typeof config.enabled === "boolean") next.enabled = config.enabled;
    else warn("config.enabled must be a boolean; keeping the default");
  }

  for (const key of ["opacity", "translucency"]) {
    if (config[key] === undefined) continue;
    if (typeof config[key] === "number" && Number.isFinite(config[key])) {
      next[key] = clamp01(config[key]);
    } else {
      warn(`config.${key} must be a number in 0..1; keeping the default`);
    }
  }

  if (config.fpsCap !== undefined) {
    if (FRAME_CAPS.includes(config.fpsCap)) next.fpsCap = config.fpsCap;
    else warn(`config.fpsCap must be one of ${FRAME_CAPS.join(", ")}; keeping the default`);
  }

  if (config.palette !== undefined) {
    if (config.palette === "auto" || config.palette === "dark" || config.palette === "light") {
      next.palette = config.palette;
    } else {
      warn('config.palette must be "auto", "dark" or "light"; keeping the default');
    }
  }

  if (config.sharks !== undefined) {
    if (!Array.isArray(config.sharks) || config.sharks.length === 0) {
      warn("config.sharks must be a non-empty list; keeping the default roster");
    } else {
      const roster = config.sharks
        .map((raw, index) => {
          const shark = sharkOf(raw, index);
          if (shark === null) warn(`config.sharks[${index}] is not a known species; skipped`);
          return shark;
        })
        .filter((shark) => shark !== null)
        .slice(0, 6);
      if (roster.length > 0) next.sharks = roster;
      else warn("config.sharks matched no known species; keeping the default roster");
    }
  }

  if (config.whales !== undefined) {
    if (!Array.isArray(config.whales)) {
      warn("config.whales must be a list; keeping the default (no whales)");
    } else {
      const roster = config.whales
        .map((raw, index) => {
          const whale = whaleOf(raw);
          if (whale === null) warn(`config.whales[${index}] is not a known whale; skipped`);
          return whale;
        })
        .filter((whale) => whale !== null)
        .slice(0, MAX_WHALES);
      next.whales = roster;
    }
  }

  return next;
}

/**
 * Mount the host side: embed the validated config for the browser half.
 * @param ctx - host context that may acquire the Web server.
 * @param config - the loader row's config.
 */
export function apply(ctx, config) {
  const resolved = normalizeConfig(config, (message) => {
    ctx.logger?.("ascii-ocean-bg", message);
  });

  ctx.on("webserver/index-inject", (table) => {
    table.push({ kind: "global", name: CONFIG_GLOBAL, value: resolved });
  });
}
