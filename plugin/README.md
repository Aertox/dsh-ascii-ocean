# dsh-ascii-ocean-bg

The [ascii-sharks](../../) ocean as a live backdrop for the DeepSeek Harness Web
GUI. Sharks, whale-sized giants, schools and cyan wake render on a canvas
mounted inside the app frame, and the frame's own surface tokens are rebound to translucent washes so
the water reads through the sidebar, the transcript and the right rail.

```
┌──────────────────────────────────────────────────────────┐
│  sidebar (translucent)  │  conversation (translucent)     │
│   New session           │   ░░  sharks cut through  ░░    │
│   ascii shaders         │   ░░  and the wake lights ░░    │
└──────────────────────────────────────────────────────────┘
```

## What it does

- **One canvas, no layout surgery.** An absolutely positioned `<canvas>` is
  appended to the frame and `z-index`-lifted under its siblings; every column,
  drag handle and popover keeps working exactly as shipped.
- **A settings page of its own.** 设置 → **背景设置** edits the roster (sharks
  and whales), the wash strength and the palette, applies each change to the
  live water as you drag, and remembers it in this browser.
- **Theme-native washes.** Surfaces are `color-mix(...)` toward `transparent`, so
  the pigment stays the user's own palette instead of a hard-coded color.
- **Two palettes.** The engine always paints black water with pale glyphs; the
  light theme inverts it into ink-on-paper rather than muddy grey.
- **Readability first.** Dialogs get the opaque palette back, menu fills are
  raised so moving glyphs never smear through them, and
  `prefers-reduced-transparency` / `prefers-reduced-motion` are both honored.
- **Cheap when hidden.** The engine pauses off-screen, the canvas is
  `pointer-events: none`, and all DOM triggers coalesce into one reconciliation
  per animation frame so chat streaming cannot spin the observers.

## Install

The package is client-only for the browser; its host half (`lib/index.js`) is a
no-op that exists so client-modules has a live loader entry to serve the bundle
from, and it embeds the validated config into the index response.

```sh
# 1. link the package into the profile you boot
ln -sfn "$PWD" ~/.dsh/profiles/<profile>/node_modules/dsh-ascii-ocean-bg

# 2. add the loader row to that profile's patch layer
cat >> ~/.dsh/profiles/<profile>/cordis.patch.yml <<'YML'
- insert:
    - id: ascii-ocean-bg
      name: 'dsh-ascii-ocean-bg'
      config:
        sharks: [hammerhead, tiger, thresher, mako]
        opacity: 0.78
        translucency: 0.44
        palette: auto
YML
```

`cordis.patch.yml` reloads live, so the client bundle mounts on the next config
save. The **host half** is captured at plugin import, so its config injection
needs one host restart before `config` reaches the page.

## Settings page

The plugin registers one entry into the settings panel's `settings.section`
list, so 设置（⌘,）→ **背景设置** appears between the built-in sections:

| Control | Field | Effect |
|---|---|---|
| 显示背景 | `enabled` | Mount at all; off returns the stock interface |
| 物种 | `sharks` | Click to add/remove; up to 6, earlier entries swim larger |
| 鲸鱼 | `whales` | Optional, up to 2; they cruise on their own and never hunt |
| 不透明度 | `opacity` | Canvas density |
| 透明程度 | `translucency` | How far the surface washes step aside |
| 配色 | `palette` | Follow the theme, or pin dark / light |
| 帧率上限 | `fpsCap` | 60 / 30 / 15 painted frames per second — the CPU lever |
| 恢复默认 | — | Drops this browser's choices, back to the profile row |

Every control writes straight into the shared config store, so the water behind
the panel moves while you drag, and the page never disagrees with the canvas.
Choices persist per browser under `dsh-ascii-ocean-bg:config`; the profile's
patch row stays the deployment default, which is why the page needs no host
restart and no namespace of its own.

### What it costs

Measured on the live GUI (1600×913, dark, CPU time from CDP `Performance`
`TaskDuration`/`ScriptDuration`, four alternating windows):

| State | Main thread | JS | Paints/s |
|---|---|---|---|
| 60 fps, 4 sharks | 60–72% of one core | 48–60% | 60 |
| 30 fps, 4 sharks | 18–38% | 12–24% | 30 |
| 15 fps, 4 sharks | 18–21% | 10–11% | 15 |
| background off | 4–5% | ~0.5% | 0 |

Whales are the expensive part of a big roster: one whale is roughly +2–3 ms per
frame on top of the four-shark baseline, because its bounding box covers a large
share of the grid. Two is the cap the settings page enforces.

Per frame the work is ~780 canvas calls (≈550 `fillText` + ~230 `fillRect` + one
full-canvas blit) over a 124×49 grid, and it scales with the roster: 1 shark
≈ 3.4 ms/frame, 2 ≈ 6.6 ms, 4 ≈ 8.0 ms, 6 ≈ 12.4 ms. Memory is two canvases
(main + cached grid) — 11 MB at DPR 1, 45 MB at DPR 2 — plus ~0.3 MB of field
arrays; the JS heap does not grow while animating. `prefers-reduced-motion`
paints one still frame and stops.

The nav row would otherwise wear the shell's generic gear — `settings.section`
projects only `id` / `order` / `label`, so a registrant cannot pass an icon. The
page therefore claims its own row by label and swaps in a fin mask
(`src/settings.tsx` → `installNavIcon`), the same workaround third-party
sections use today.

## Config

| Field | Type | Default | Meaning |
|---|---|---|---|
| `enabled` | boolean | `true` | Mount at all. `false` leaves the GUI untouched. |
| `opacity` | 0–1 | `0.78` | Canvas opacity over the frame. |
| `translucency` | 0–1 | `0.44` | How far the surface washes let the water through. `0` is an opaque GUI. |
| `palette` | `auto` \| `dark` \| `light` | `auto` | Follow the active theme, or pin the wash recipe. |
| `fpsCap` | `60` \| `30` \| `15` | `60` | Paint ceiling. The simulation keeps its fixed timestep, so movement speed is unchanged; only the number of paints drops. |
| `sharks` | list | hammerhead, tiger, thresher, mako | Species, biggest first. Each entry is a name or `{ kind, size }`. |
| `whales` | list | `[]` | Whales that share the water. Opt-in: an empty list keeps the shark-only hero. Each entry is a name or `{ kind, size }` (default size: `bluewhale` 1.9, `humpback` 1.35, `spermwhale` 1.55, relative to the biggest shark). |

Precedence is **profile patch row < saved browser choices**: the row is the
default a deployment ships, and anything the settings page or `__dshOcean`
changed wins from then on until 恢复默认.

Species: `classic` (`greatwhite`, `white`), `hammerhead` (`scalloped`,
`smooth`), `zebra` (`leopard`), `tiger` (`sandtiger`), `greathammer`, `mako`
(`porbeagle`), `thresher` (`fox`), `nurse` (`tawny`).
Whales: `bluewhale` (`blue`), `humpback` (`humpbackwhale`), `spermwhale`
(`sperm`). Whales are never predators here: schools only part around them, and
sharks steer clear.

Unknown species are skipped, out-of-range numbers clamp, and a bad `palette`
falls back to `auto` — all with a warning, never a failed import.

## Runtime controls

`window.__dshOcean` in the page console:

```js
__dshOcean.toggle()                                  // on/off, remembered
__dshOcean.setEnabled(false)
__dshOcean.configure({ sharks: ["greatwhite"], opacity: 0.9 })
__dshOcean.configure({ whales: ["humpback"] })       // add a whale
__dshOcean.configure({ whales: [] })                 // back to sharks only
__dshOcean.configure({ translucency: 0.2, palette: "light" })
__dshOcean.config                                    // resolved config
__dshOcean.refresh()                                 // re-read frame + palette
```

The toggle persists in `localStorage` under `dsh-ascii-ocean-bg:enabled`, so it
survives reloads and wins over the profile's `enabled` default.

The settings page and the console share one store, so either side sees the other
immediately and both persist: the console writes `dsh-ascii-ocean-bg:config`
(and the legacy `dsh-ascii-ocean-bg:enabled` switch key) exactly like 保存.

## Develop

```sh
node scripts/build.mjs            # bundle src/client.{ts,tsx} -> lib/client.js
node scripts/capture-gui.mjs out.png --scheme dark --settings --section 背景设置
```

`build.mjs` wraps the esbuild output in the module system's lazy-CJS envelope —
`window.__ModuleLoader__.load({ id, factory })` — because a plugin bundle must
execute as nothing but a factory registration. `react`, `react-dom`,
`react/jsx-runtime` and `@deepseek-ai/*` stay external: the shell seeds a frozen
module table, and bundling a second React would split the slot registry.

`capture-gui.mjs` drives a headless Chrome over CDP against the running GUI: it
mints the browser-session cookie from `~/.dsh/.credentials.yaml`, emulates a
color scheme, dismisses first-run dialogs, opens the settings panel
(`--settings`), clicks one section (`--section <label>`) and reports what the
page actually mounted.

`harness/index.html` is the offline check: it stands up the AppFrame grid with
the real token names and mounts the built bundle, so styling can be iterated
without booting the GUI.

## Debugging

| Symptom | Cause |
|---|---|
| Canvas missing, `__dshOcean` defined | Theme is light and `palette: dark`-ish path lost the frame — check `document.querySelector('[data-shell-overlay]')` exists. |
| `__dshOcean` undefined | Bundle never materialized: look for the package in `Settings → Plugins`, and check the boot graph in `view-source` for `__DSH_BOOT__`. |
| 背景设置 missing from 设置 | The `slots` / `locale` services never resolved (the plugin declares `inject`), or the bundle predates the build — rebuild and refresh the page. |
| 背景设置 still wears the gear | The nav-row claim matched no label: check the visible row text equals `t("title")` for the active locale. |
| Config ignored | The host half had not restarted; the client falls back to defaults until `__DSH_ASCII_OCEAN_CONFIG__` appears in the index. |
| Text unreadable | Raise `translucency` toward `0`, or lower `opacity`. |
| Changes revert after reload | `localStorage` is unavailable (private mode), so choices stay page-local. |
