/**
 * dsh-ascii-ocean-bg — settings page.
 *
 * Registers one entry into the settings panel's `settings.section` slot: the
 * species roster, the wash strength and the palette, all writing straight into
 * the shared config store so the water behind the panel changes as you drag.
 *
 * Nothing here is host-owned state. A background is a per-browser preference,
 * so choices persist in localStorage and the profile's patch row stays the
 * deployment default — which is also why this page never needs a host restart.
 */
import { useSyncExternalStore } from "react";
import {
  FRAME_CAPS,
  MAX_SPECIES,
  MAX_WHALES,
  SPECIES,
  WHALES,
  getConfig,
  isCustomized,
  resetConfig,
  rosterOf,
  subscribe,
  updateConfig,
  whaleRosterOf,
} from "./config";
import type { OceanConfig } from "./config";
import type { SharkKind } from "../../src/world";
import type { WhaleKind } from "../../src/whale";

/** Dictionary namespace owned by the plugin. */
export const NS = "settings.asciiOcean";

type Translate = (key: string, params?: Record<string, unknown>) => string;

const zh: Record<string, string> = {
  title: "背景设置",
  description: "海面铺在界面下方，鲨群、鲸鱼和尾迹在侧栏与对话后面游动。",
  enabled: "显示背景",
  enabledHint: "关掉就回到出厂界面；这项选择会记住。",
  species: "物种",
  speciesHint: "点击添加或移除，最多 {max} 种；列表越靠前体型越大。",
  selected: "已选 {count} 种",
  full: "已达上限 {max} 种",
  opacity: "不透明度",
  opacityHint: "画布整体的浓度，越低越淡。",
  translucency: "透明程度",
  translucencyHint: "界面底色让开多少，越高海面越透；太高会影响正文可读性。",
  palette: "配色",
  paletteHint: "跟随界面主题，或把海面钉成深色 / 浅色。",
  fps: "帧率上限",
  fpsHint: "每秒最多画几帧。鲨鱼按真实时间游动，降低只减少绘制次数，不改变速度。",
  fpsNote: "30 帧约省一半 CPU，15 帧约省四分之三。",
  paletteAuto: "跟随",
  paletteDark: "深色",
  paletteLight: "浅色",
  restore: "恢复默认",
  restored: "已恢复为档案默认值",
  customized: "当前使用的是本浏览器保存的设置",
  defaults: "当前使用的是档案默认值",
  resetHint: "恢复默认会清掉本浏览器保存的选择。",
  speciesClassic: "大白鲨",
  speciesHammerhead: "锤头鲨",
  speciesGreathammer: "巨型锤头",
  speciesTiger: "虎鲨",
  speciesZebra: "豹纹鲨",
  speciesMako: "灰鲭鲨",
  speciesThresher: "长尾鲨",
  speciesNurse: "护士鲨",
  whales: "鲸鱼",
  whalesHint: "可选，最多 {max} 条。鲸不捕食，只按自己的节奏慢慢巡游，体型远大于鲨鱼。",
  whalesSelected: "已选 {count} 条",
  whalesFull: "已达上限 {max} 条",
  whalesNone: "没有鲸鱼",
  speciesHumpback: "座头鲸",
  speciesBluewhale: "蓝鲸",
  speciesSpermwhale: "抹香鲸",
  saved: "设置只保存在这个浏览器，不影响其他设备。",
};

const en: Record<string, string> = {
  title: "Background",
  description: "The ocean sits under the interface; sharks, whales and their wake swim behind the sidebar and the transcript.",
  enabled: "Show background",
  enabledHint: "Turning this off returns the stock interface; the choice is remembered.",
  species: "Species",
  speciesHint: "Click to add or remove, up to {max}; earlier entries swim larger.",
  selected: "{count} selected",
  full: "Limit of {max} reached",
  opacity: "Opacity",
  opacityHint: "Overall density of the canvas — lower is fainter.",
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
  whalesHint: "Optional, up to {max}. Whales never hunt — they just cruise at their own pace, far bigger than any shark.",
  whalesSelected: "{count} selected",
  whalesFull: "Limit of {max} reached",
  whalesNone: "No whales",
  speciesHumpback: "Humpback",
  speciesBluewhale: "Blue whale",
  speciesSpermwhale: "Sperm whale",
  saved: "Settings stay in this browser and do not follow you to other devices.",
};

const CSS = `
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

const CSS_TAG = "dsh-ascii-ocean-bg/settings.css";

/**
 * The settings shell picks nav glyphs from a closed list of section ids and
 * falls back to its own gear for every other id — `settings.section` projects
 * only id / order / label, so a registrant cannot pass an icon. Third-party
 * sections therefore claim their own row once the dialog is mounted and swap
 * the gear for a mask, which is what this marker + stylesheet pair does.
 */
const NAV_MARKER = "data-dsh-ocean-nav-icon";
const NAV_ROW_SELECTOR = '[role="dialog"] nav button';

/** Dorsal fin over a water line, drawn black because a mask reads alpha only. */
const FIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000">' +
  '<path d="M6.4 19.4c1.1-5 3.4-9.2 8.1-13.6-.5 4.6.6 8.1 3.7 11.6-3.6 1.9-7.6 2.4-11.8 2z"/>' +
  '<rect x="2" y="20.6" width="20" height="1.6" rx=".8"/>' +
  '<rect x="2" y="17" width="3" height="1.2" rx=".6"/>' +
  '<rect x="19" y="17" width="3" height="1.2" rx=".6"/>' +
  "</svg>";

function navIconCss(maskUrl: string): string {
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
    "}",
  ].join("\n");
}

/**
 * Mark the nav row this page owns, so it carries the fin instead of the gear.
 * @param ctx - client context, for effect ownership.
 * @param resolveLabel - the same label thunk the section registration passes.
 */
function installNavIcon(
  ctx: { effect(body: () => () => void, label?: string): void },
  resolveLabel: () => string,
): void {
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
      // Nothing to mark until the settings dialog exists; skipping keeps the
      // observer free while the transcript streams.
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

interface SectionProps {
  t: Translate;
  close?: () => void;
}

/** One titled row: copy on the left, control on the right. */
function Row(props: { title: string; desc?: string; children: unknown }) {
  return (
    <div className="aob-row">
      <div className="aob-copy">
        <div className="aob-title">{props.title}</div>
        {props.desc ? <div className="aob-desc">{props.desc}</div> : null}
      </div>
      {props.children as never}
    </div>
  );
}

/** A row whose control needs the full width (the species chips). */
function Block(props: { title: string; desc?: string; meta?: string; children: unknown }) {
  return (
    <div className="aob-block">
      <div className="aob-copy">
        <div className="aob-title">{props.title}</div>
        {props.desc ? <div className="aob-desc">{props.desc}</div> : null}
      </div>
      {props.children as never}
      {props.meta ? <div className="aob-meta">{props.meta}</div> : null}
    </div>
  );
}

function speciesLabel(t: Translate, kind: SharkKind | WhaleKind): string {
  const key = `species${kind.charAt(0).toUpperCase()}${kind.slice(1)}`;
  const copy = t(key);
  return copy === key ? kind : copy;
}

/** The background page: the ocean's own controls, live and persisted. */
export function OceanSection(props: SectionProps) {
  const { t } = props;
  const config: OceanConfig = useSyncExternalStore(subscribe, getConfig, getConfig);
  const selected: SharkKind[] = config.sharks.map((row) => row.kind);
  const whales: WhaleKind[] = config.whales.map((row) => row.kind);
  const full = selected.length >= MAX_SPECIES;
  const whalesFull = whales.length >= MAX_WHALES;
  const customized = isCustomized();

  const toggleSpecies = (kind: SharkKind) => {
    const next = selected.includes(kind)
      ? selected.filter((row) => row !== kind)
      : [...selected, kind];
    if (next.length === 0) return; // the engine always wants one shark
    updateConfig({ sharks: rosterOf(next) });
  };

  // Whales are genuinely optional: the water reads fine with none.
  const toggleWhale = (kind: WhaleKind) => {
    const next = whales.includes(kind) ? whales.filter((row) => row !== kind) : [...whales, kind];
    updateConfig({ whales: whaleRosterOf(next) });
  };

  return (
    <div className="aob-section">
      <div className="aob-lead">{t("description")}</div>

      <Row title={t("enabled")} desc={t("enabledHint")}>
        <button
          type="button"
          role="switch"
          aria-checked={config.enabled ? "true" : "false"}
          aria-label={t("enabled")}
          className="aob-switch"
          onClick={() => updateConfig({ enabled: !config.enabled })}
        />
      </Row>

      <Block
        title={t("species")}
        desc={t("speciesHint", { max: MAX_SPECIES })}
        meta={full ? t("full", { max: MAX_SPECIES }) : t("selected", { count: selected.length })}
      >
        <div className="aob-chips">
          {SPECIES.map((row) => {
            const on = selected.includes(row.kind);
            return (
              <button
                key={row.kind}
                type="button"
                aria-pressed={on ? "true" : "false"}
                disabled={!on && full}
                className="aob-chip"
                onClick={() => toggleSpecies(row.kind)}
              >
                {speciesLabel(t, row.kind)}
              </button>
            );
          })}
        </div>
      </Block>

      <Block
        title={t("whales")}
        desc={t("whalesHint", { max: MAX_WHALES })}
        meta={
          whalesFull
            ? t("whalesFull", { max: MAX_WHALES })
            : whales.length
              ? t("whalesSelected", { count: whales.length })
              : t("whalesNone")
        }
      >
        <div className="aob-chips">
          {WHALES.map((row) => {
            const on = whales.includes(row.kind);
            return (
              <button
                key={row.kind}
                type="button"
                aria-pressed={on ? "true" : "false"}
                disabled={!on && whalesFull}
                className="aob-chip"
                onClick={() => toggleWhale(row.kind)}
              >
                {speciesLabel(t, row.kind)}
              </button>
            );
          })}
        </div>
      </Block>

      <Row title={t("opacity")} desc={t("opacityHint")}>
        <div className="aob-slider">
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={config.opacity}
            aria-label={t("opacity")}
            onChange={(event) => updateConfig({ opacity: Number(event.currentTarget.value) })}
          />
          <span className="aob-value">{config.opacity.toFixed(2)}</span>
        </div>
      </Row>

      <Row title={t("translucency")} desc={t("translucencyHint")}>
        <div className="aob-slider">
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={config.translucency}
            aria-label={t("translucency")}
            onChange={(event) =>
              updateConfig({ translucency: Number(event.currentTarget.value) })
            }
          />
          <span className="aob-value">{config.translucency.toFixed(2)}</span>
        </div>
      </Row>

      <Row title={t("palette")} desc={t("paletteHint")}>
        <div className="aob-seg" role="group" aria-label={t("palette")}>
          {(["auto", "dark", "light"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={config.palette === option ? "true" : "false"}
              onClick={() => updateConfig({ palette: option })}
            >
              {t(`palette${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
            </button>
          ))}
        </div>
      </Row>

      <Row title={t("fps")} desc={`${t("fpsHint")} ${t("fpsNote")}`}>
        <div className="aob-seg" role="group" aria-label={t("fps")}>
          {FRAME_CAPS.map((cap) => (
            <button
              key={cap}
              type="button"
              aria-pressed={config.fpsCap === cap ? "true" : "false"}
              onClick={() => updateConfig({ fpsCap: cap })}
            >
              {cap}
            </button>
          ))}
        </div>
      </Row>

      <div className="aob-foot">
        <div className="aob-notes">
          {customized ? t("customized") : t("defaults")} · {t("saved")}
        </div>
        <button
          type="button"
          className="aob-reset"
          disabled={!customized}
          onClick={() => resetConfig()}
        >
          {t("restore")}
        </button>
      </div>
    </div>
  );
}

/**
 * Register the settings page into the settings panel's section list.
 * @param ctx - browser plugin context that declared `slots` and `locale`.
 */
export function registerOceanSettings(ctx: {
  locale: { bind(ns: string): Translate; register(ns: string, dicts: unknown): () => void };
  slots: { inject(key: string, effect: () => () => void): () => void; register(options: unknown, component: unknown): () => void };
  effect(body: () => () => void, label?: string): void;
}) {
  const t = ctx.locale.bind(NS);
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ascii-ocean: settings dictionaries");
  installNavIcon(ctx, () => t("title"));
  ctx.effect(
    () =>
      ctx.slots.inject("settings.section", () => {
        ensureCss();
        return ctx.slots.register(
          {
            name: "settings.section",
            id: "ascii-ocean",
            order: 60,
            label: () => t("title"),
            locale: NS,
          },
          OceanSection,
        );
      }),
    "ascii-ocean: settings page",
  );
}
