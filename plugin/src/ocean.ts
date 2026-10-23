/**
 * dsh-ascii-ocean-bg — canvas controller.
 *
 * Finds the AppFrame through the stable `data-shell-overlay` marker, appends an
 * absolutely positioned canvas under the frame's other children, and rebinds the
 * frame's own surface tokens to translucent washes so the water reads through
 * the sidebar, the conversation and the right rail.
 *
 * Two palettes, one renderer: the engine always paints black water with pale
 * glyphs, so the dark theme shows it as-is and the light theme inverts it into
 * an ink-on-paper drawing rather than muddy grey.
 *
 * Everything is imperative DOM plus the ocean engine — no slots, no React — and
 * every trigger is coalesced into one reconciliation per animation frame, so
 * chat streaming cannot turn the observers into a hot loop.
 */
import { OceanEngine } from "../../src/engine";
import { getConfig, subscribe } from "./config";
import type { OceanConfig } from "./config";

const NS = "dsh-ascii-ocean-bg";
const FRAME_ATTR = "data-dsh-ocean";
const CANVAS_ATTR = "data-dsh-ocean-canvas";
const LIVE_ATTR = "data-dsh-ocean-live";
const SCHEME_ATTR = "data-dsh-ocean-scheme";

/**
 * Build the stylesheet from config.
 *
 * The washes are `color-mix` percentages rather than fixed colors: mixing toward
 * `transparent` keeps the theme's own base and sidebar fills as the pigment, so
 * the result tracks whatever palette the user is running instead of hard-coding
 * one. `translucency` moves that mixture.
 */
function stylesheet(config: OceanConfig): string {
  const t = config.translucency;
  // 0 → fully opaque wash, 1 → nearly clear water.
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
 * read as noise. Raise the fill at document scope — translucent, just not busy —
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

interface OceanHandle {
  canvas: HTMLCanvasElement;
  engine: OceanEngine;
  /** Roster signature the mounted engine was built with. */
  roster: string;
}

export interface OceanController {
  /** Reconcile by hand (the `refresh()` console escape hatch). */
  refresh(): void;
  /** Drop every observer, the canvas and the injected stylesheet. */
  destroy(): void;
}

/** Everything that needs a remount when it changes: the sharks and the whales. */
function rosterKey(config: OceanConfig): string {
  return JSON.stringify([config.sharks, config.whales]);
}

/** Which palette the document is actually presenting. */
function scheme(config: OceanConfig): "dark" | "light" {
  if (config.palette !== "auto") return config.palette;
  if (document.body?.hasAttribute("data-ds-dark-theme")) return "dark";
  if (document.documentElement.style.colorScheme === "dark") return "dark";
  return "light";
}

/** The AppFrame root: the element whose overlay layer owns the whole frame box. */
function findFrame(): HTMLElement | null {
  const overlay = document.querySelector<HTMLElement>("[data-shell-overlay]");
  return overlay?.parentElement ?? null;
}

/**
 * Mount the ocean and keep it reconciled with the config store and the frame.
 * @returns the controller the plugin disposes on unload.
 */
export function createOcean(): OceanController {
  let host: HTMLElement | null = null;
  let handle: OceanHandle | null = null;
  let styleEl: HTMLStyleElement | null = null;
  let frameObserver: MutationObserver | null = null;
  let themeObserver: MutationObserver | null = null;
  let unsubscribe: (() => void) | null = null;
  let mediaQuery: MediaQueryList | null = null;
  let pending = 0;

  function ensureStyle(): void {
    const tagId = `${NS}/style.css`;
    const config = getConfig();
    if (!styleEl?.isConnected) {
      styleEl =
        document.querySelector<HTMLStyleElement>(`style[data-plugin-css="${tagId}"]`) ??
        document.createElement("style");
      styleEl.dataset.plugin = NS;
      styleEl.dataset.pluginCss = tagId;
      if (!styleEl.isConnected) document.head.appendChild(styleEl);
    }
    const next = stylesheet(config);
    if (styleEl.textContent !== next) styleEl.textContent = next;
  }

  function mountInto(frame: HTMLElement) {
    const config = getConfig();
    frame.setAttribute(FRAME_ATTR, "");
    const canvas = document.createElement("canvas");
    canvas.setAttribute(CANVAS_ATTR, "");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.fontFamily = '"Geist Mono", ui-monospace, Menlo, monospace';
    // Appended, not prepended: React owns this element's children, and its
    // insertion arithmetic stays correct when unfamiliar nodes sit at the end.
    // The z-index split in CSS keeps the canvas under every sibling anyway.
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

  /** Reconcile the canvas against the current frame, palette and enabled flag. */
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
    // The cap is a live property of the running engine: changing it must not
    // remount the canvas (that would restart the simulation).
    handle?.engine.setFrameCap(config.fpsCap);
    if (
      handle &&
      frame === host &&
      handle.canvas.isConnected &&
      handle.roster === rosterKey(config)
    ) {
      return;
    }
    unmount();
    host = frame;
    document.documentElement.setAttribute(LIVE_ATTR, "");
    mountInto(frame);
  }

  /** Coalesce every trigger into one reconcile per frame. */
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
        attributeFilter: ["data-ds-dark-theme"],
      });
    }
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "data-platform", "data-fullscreen"],
    });

    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", schedule);

    // The settings page (or the console) can change the config at any time.
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
