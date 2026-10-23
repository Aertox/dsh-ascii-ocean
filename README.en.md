# dsh-ascii-ocean

[简体中文](README.md) | **English**

An ASCII ocean with sharks, fish schools, whales, and wakes, built as a live background for the DeepSeek Harness (DSH) Web GUI. This repository includes both a standalone Canvas ocean engine and the DSH background plugin.

```
                            ;'
                             %%'
                              .t;.               .oooo
                               S;:S%              %8S8.
                                ;:tt%t '..        XX%%S
t'                            ''XSSS8SSX%XX8#.    %XSX%
 :;'               ;.''X8%8XX%%S%%S%SStt%tSX8S#X8't%ttt.
  ::%'       ''8XXXSSt%Stttttt%8@%%@%8@8%Sttt%%%%SSSSS%tt.
  'SXXtt%t%%%S%:;StS%ttSS%tSXSt88@@%8%@8%tStS%%X%SS%%S%;;t
 .@##88#@...'@@@@#@8@88X88#XXXSX8SX88SX8%SS%S%%S88St%t%%%.
  %;%t             :.    '.'##@###@X#888XX##8@@@#.X%XS%.
 .%t                            ;%%%#@@##@@@.     SXS%%
 t.                            .%;%%%.            %%XXS
                              '%t:t              .SXSS'
                             '::.                ooooo
                            .S'
                            .
```

## Features

- 8 shark species and 3 whale species. The plugin supports up to 6 sharks and 2 whales at once; whales are disabled by default.
- Adjust species, canvas opacity, interface translucency, and palette in the background settings section (「设置 → 背景设置」 in Chinese), with live updates.
- Automatic, dark, and light palettes, plus 60 / 30 / 15 FPS paint limits.
- Browser-local settings and support for reduced-motion and reduced-transparency preferences.
- A background canvas that does not intercept pointer events, preserving interface clicks and dragging.

## Local demo

Use Node.js 22 or newer and npm:

```sh
git clone https://github.com/Aertox/dsh-ascii-ocean.git
cd dsh-ascii-ocean
npm ci
npm run dev
```

Open the local URL printed in the terminal. To add whales to the demo, append `?whales=humpback` or `?whales=bluewhale,spermwhale` to the URL.

## Install in DSH

You need a working DeepSeek Harness Web GUI and its profile. The following uses a local symlink on macOS / Linux. The host must support the client module and settings extension interfaces used by this plugin.

The repository is named `dsh-ascii-ocean`; **the plugin package name must remain `dsh-ascii-ocean-bg`**. Prebuilt files are included in `plugin/lib/`, so you do not need to build the demo before installing the plugin.

1. Run these commands from the repository root. Replace `desktop` with the profile you actually start. If the destination link already exists, inspect its target before changing it.

```sh
dsh_profile=desktop
mkdir -p "$HOME/.dsh/profiles/$dsh_profile/node_modules"
ln -s "$PWD/plugin" "$HOME/.dsh/profiles/$dsh_profile/node_modules/dsh-ascii-ocean-bg"
```

2. Edit that profile's `cordis.patch.yml` and add this entry. If `ascii-ocean-bg` already exists, edit the existing entry instead of inserting a duplicate.

```yaml
- insert:
    - id: ascii-ocean-bg
      name: 'dsh-ascii-ocean-bg'
      config:
        enabled: true
        sharks: [hammerhead, tiger, thresher, mako]
        whales: []
        opacity: 0.78
        translucency: 0.44
        palette: auto
        fpsCap: 60
```

3. Restart the DSH host and refresh the Web GUI. Open the background settings section to customize the ocean. Changes made in the settings page do not require a host restart.

## Configuration

| Field | Default | Description |
|---|---|---|
| `enabled` | `true` | Show or hide the background |
| `sharks` | `hammerhead, tiger, thresher, mako` | Up to 6; each entry accepts a species name or `{ kind, size }` |
| `whales` | `[]` | Up to 2; each entry accepts a species name or `{ kind, size }` |
| `opacity` | `0.78` | Canvas opacity, from 0 to 1 |
| `translucency` | `0.44` | Interface surface transparency, from 0 to 1; 0 means opaque interface surfaces |
| `palette` | `auto` | `auto`, `dark`, or `light` |
| `fpsCap` | `60` | `60`, `30`, or `15`; limits painting without changing movement speed |

Sharks: `classic` (great white), `hammerhead`, `greathammer` (great hammerhead), `tiger`, `zebra`, `mako`, `thresher`, and `nurse`.

Whales: `bluewhale` (blue whale), `humpback`, and `spermwhale` (sperm whale).

Saved browser settings override profile defaults and are stored under `dsh-ascii-ocean-bg:config`. Resetting to defaults applies the currently loaded profile defaults. Settings do not automatically sync between browsers.

You can also use the browser console:

```js
window.__dshOcean.toggle();
window.__dshOcean.configure({ whales: ["humpback"], fpsCap: 30 });
window.__dshOcean.configure({ whales: [] });
window.__dshOcean.config;
```

## Development

Run from the repository root:

```sh
npm ci
npm run typecheck
npm run build
node plugin/scripts/build.mjs
```

`npm run build` builds the standalone demo into `dist/`. The last command builds the plugin client into `plugin/lib/client.js`. The plugin build script uses esbuild, provided by the currently locked Vite dependency tree. React and `@deepseek-ai/*` are supplied by the DSH host and are not bundled into the plugin.

Use the engine independently:

```ts
import { OceanEngine } from "./src";

const engine = new OceanEngine(
  canvas,
  [{ kind: "hammerhead", size: 1 }],
  [{ kind: "humpback" }],
);
engine.setFrameCap(30);

// Release resources when the page or component unmounts.
engine.destroy();
```

| Path | Contents |
|---|---|
| `src/` | Ocean engine, species, simulation, and rendering |
| `demo.ts`, `index.html` | Standalone demo entry points |
| `plugin/src/` | DSH client integration, shared configuration, and settings page |
| `plugin/lib/` | Plugin host entry and prebuilt client |
| `plugin/cordis.patch.yml` | Plugin loader entry |
| `plugin/harness/index.html` | Offline interface for styling checks |

See [plugin/README.md](plugin/README.md) for additional plugin internals.

## Troubleshooting

- **No background:** Check that the symlink belongs to the profile you actually start, the loader entry exists, and the host has restarted. Check for `window.__dshOcean` in the browser console.
- **Profile changes do not appear:** Restart the host, refresh the page, and reset the background settings to defaults so saved browser choices do not override the new defaults.
- **Text is hard to read:** Lower `opacity` or move `translucency` toward 0 to make interface surfaces more opaque.
- **Animation uses too much CPU:** Set the frame limit to 30 or 15 and reduce the number of sharks and whales. Actual cost depends on hardware, canvas dimensions, and the roster.
- **Settings disappear after refresh:** Check whether the browser allows `localStorage`. When storage is unavailable, changes only last for the current page.
