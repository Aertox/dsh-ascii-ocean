/**
 * dsh-ascii-ocean-bg — client half.
 *
 * Two effects, one shared store:
 *
 * - the ocean controller mounts the canvas under the AppFrame and repaints the
 *   frame's surface tokens (see ./ocean.ts);
 * - the settings page registers a `settings.section` entry so the roster, the
 *   wash strength and the palette can be edited from 设置 → 背景设置 (see
 *   ./settings.tsx).
 *
 * Config precedence is the profile patch row, then whatever this browser saved;
 * both paths land in ./config.ts, so the page and the canvas can never disagree.
 * `window.__dshOcean` keeps the console escape hatches working.
 */
import { CONFIG_GLOBAL, getConfig, initConfig, updateConfig } from "./config";
import type { OceanConfig } from "./config";
import { createOcean } from "./ocean";
import { registerOceanSettings } from "./settings";

/** Services the browser context must provide before this plugin runs. */
export const inject = ["slots", "locale"];

/** Host row config never reaches a browser bundle; the index global does. */
function pageConfig(): unknown {
  return (globalThis as unknown as Record<string, unknown>)[CONFIG_GLOBAL];
}

export function apply(ctx: any, rawConfig?: unknown): void {
  initConfig(rawConfig ?? pageConfig());

  ctx.effect(() => {
    const ocean = createOcean();

    const api = {
      /** Turn the background on or off; the choice survives reloads. */
      setEnabled(next: boolean) {
        return updateConfig({ enabled: next }).enabled;
      },
      toggle() {
        return api.setEnabled(!getConfig().enabled);
      },
      get enabled() {
        return getConfig().enabled;
      },
      /** Patch the live config (sharks, whales, opacity, translucency, palette). */
      configure(next: unknown): OceanConfig {
        const patch = next && typeof next === "object" ? (next as Partial<OceanConfig>) : {};
        return { ...updateConfig(patch) };
      },
      get config() {
        return { ...getConfig() };
      },
      /** Re-read the frame and palette by hand. */
      refresh() {
        ocean.refresh();
      },
    };
    (window as unknown as Record<string, unknown>).__dshOcean = api;

    return () => {
      delete (window as unknown as Record<string, unknown>).__dshOcean;
      ocean.destroy();
    };
  }, "ascii-ocean: canvas + surface sync");

  // The settings page owns its own effects (dictionaries, nav glyph, slot entry);
  // they belong to this fiber, so unloading the plugin takes the page with it.
  registerOceanSettings(ctx);
}
