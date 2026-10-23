# dsh-ascii-ocean

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

Fish, sharks and whales drawn as ASCII on a canvas. Zero dependencies.
Two things live here:

| Path | What |
|---|---|
| `src/`, `demo.ts`, `index.html` | the engine and its demo page — `npm install && npm run dev` |
| `plugin/` | `dsh-ascii-ocean-bg`: the DeepSeek Harness background built on the engine, with a settings page (设置 → 背景设置) |

```sh
npm install && npm run dev
```

```ts
import { OceanEngine } from "./src";

const engine = new OceanEngine(canvas, [{ kind: "hammerhead", size: 1 }]);
engine.setFrameCap(30); // optional paint ceiling; movement speed is unchanged
```

Whales are opt-in, so a whale-free hero stays exactly as composed. Kinds are
`bluewhale`, `humpback` and `spermwhale`; each one's size, cruise speed, yaw
agility and spine stiffness live in `WHALE_CONFIG` (`src/whale.ts`).

```ts
const engine = new OceanEngine(canvas, undefined, [{ kind: "humpback" }]);
```

In the demo, add `?whales=humpback` (or `?whales=bluewhale,spermwhale`) to the
URL. Open the page, look for the long dark back that never hurries.

## The DSH background plugin

`plugin/` packages the same engine as a live backdrop for the DeepSeek Harness
Web GUI: the ocean mounts behind the app frame, the frame's surface tokens turn
translucent, and 设置 → 背景设置 controls the roster (sharks and whales), the wash
strength, the palette and the frame cap. Its own README covers the design, the
config keys and the runtime controls: [plugin/README.md](plugin/README.md).

```sh
# point a DSH profile at the plugin folder
ln -s "$(pwd)/plugin" ~/.dsh/profiles/desktop/node_modules/dsh-ascii-ocean-bg
```

`lib/` ships prebuilt (`node plugin/scripts/build.mjs` after editing `plugin/src`).
The plugin package keeps the name `dsh-ascii-ocean-bg` — that is the id the
profile's patch row and the loader expect — while the repository is
`dsh-ascii-ocean`.
