# dsh-ascii-ocean

**简体中文** | [English](README.en.md)

用 ASCII 字符绘制鲨鱼、鱼群、鲸鱼和尾流，让海洋成为 DeepSeek Harness（DSH）Web GUI 的动态背景。本仓库同时包含可独立运行的 Canvas 海洋引擎和 DSH 背景插件。

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

## 功能

- 8 种鲨鱼、3 种鲸鱼；插件最多同时配置 6 条鲨鱼和 2 条鲸鱼，默认不启用鲸鱼。
- 在「设置 → 背景设置」中调整物种、不透明度、界面透明程度和配色，实时预览。
- 支持跟随主题、深色和浅色配色，以及 60 / 30 / 15 FPS 帧率上限。
- 设置保存在当前浏览器；支持减少动态效果和减少透明度的系统偏好。
- 背景画布不接收鼠标事件，保留界面的点击和拖动操作。

## 本地演示

准备 Node.js 22 或更高版本及 npm，然后运行：

```sh
git clone https://github.com/Aertox/dsh-ascii-ocean.git
cd dsh-ascii-ocean
npm ci
npm run dev
```

打开终端显示的本地地址。想在演示中加入鲸鱼，可在 URL 后添加 `?whales=humpback` 或 `?whales=bluewhale,spermwhale`。

## 安装到 DSH

需要已有可运行的 DeepSeek Harness Web GUI 和对应 profile。以下为 macOS / Linux 的本地软链接安装方式；宿主需要支持此插件使用的客户端模块与设置扩展接口。

仓库名是 `dsh-ascii-ocean`，**插件包名必须保留为 `dsh-ascii-ocean-bg`**。仓库已包含 `plugin/lib/` 预构建文件，使用插件不需要先构建演示页面。

1. 在仓库根目录执行以下命令。将 `desktop` 改为实际启动的 profile 名称；若目标链接已存在，先检查其指向再处理。

```sh
dsh_profile=desktop
mkdir -p "$HOME/.dsh/profiles/$dsh_profile/node_modules"
ln -s "$PWD/plugin" "$HOME/.dsh/profiles/$dsh_profile/node_modules/dsh-ascii-ocean-bg"
```

2. 编辑该 profile 的 `cordis.patch.yml`，加入以下条目。若已有 `ascii-ocean-bg`，修改现有条目，避免重复插入。

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

3. 重启 DSH 宿主并刷新 Web GUI，在「设置 → 背景设置」中调整背景。通过设置页修改时不需要重启宿主。

## 配置

| 字段 | 默认值 | 说明 |
|---|---|---|
| `enabled` | `true` | 是否显示背景 |
| `sharks` | `hammerhead, tiger, thresher, mako` | 最多 6 条；每项支持物种名或 `{ kind, size }` |
| `whales` | `[]` | 最多 2 条；每项支持物种名或 `{ kind, size }` |
| `opacity` | `0.78` | 画布不透明度，范围 0–1 |
| `translucency` | `0.44` | 界面表面的透明程度，范围 0–1；0 表示界面不透明 |
| `palette` | `auto` | `auto`、`dark` 或 `light` |
| `fpsCap` | `60` | `60`、`30` 或 `15`；降低绘制频率，不改变运动速度 |

鲨鱼：`classic`（大白鲨）、`hammerhead`（锤头鲨）、`greathammer`（巨型锤头）、`tiger`（虎鲨）、`zebra`（豹纹鲨）、`mako`（灰鲭鲨）、`thresher`（长尾鲨）、`nurse`（护士鲨）。

鲸鱼：`bluewhale`（蓝鲸）、`humpback`（座头鲸）、`spermwhale`（抹香鲸）。

当前浏览器保存的设置优先于 profile 中的默认配置，存储键为 `dsh-ascii-ocean-bg:config`。「恢复默认」会应用当前已加载的 profile 默认值。设置不会自动跨浏览器同步。

也可以在浏览器控制台中操作：

```js
window.__dshOcean.toggle();
window.__dshOcean.configure({ whales: ["humpback"], fpsCap: 30 });
window.__dshOcean.configure({ whales: [] });
window.__dshOcean.config;
```

## 开发

在仓库根目录运行：

```sh
npm ci
npm run typecheck
npm run build
node plugin/scripts/build.mjs
```

`npm run build` 构建独立演示到 `dist/`；最后一条命令构建插件客户端到 `plugin/lib/client.js`。插件构建脚本使用 esbuild，由当前锁定的 Vite 依赖树提供。React 和 `@deepseek-ai/*` 由 DSH 宿主提供，不打包进插件。

独立使用引擎：

```ts
import { OceanEngine } from "./src";

const engine = new OceanEngine(
  canvas,
  [{ kind: "hammerhead", size: 1 }],
  [{ kind: "humpback" }],
);
engine.setFrameCap(30);

// 页面或组件卸载时释放资源。
engine.destroy();
```

| 路径 | 内容 |
|---|---|
| `src/` | 海洋引擎、物种、模拟和渲染 |
| `demo.ts`、`index.html` | 独立演示入口 |
| `plugin/src/` | DSH 客户端集成、共享配置和设置页 |
| `plugin/lib/` | 插件宿主入口及预构建客户端 |
| `plugin/cordis.patch.yml` | 插件加载条目 |
| `plugin/harness/index.html` | 用于样式调试的离线界面 |

更详细的插件内部说明见 [plugin/README.md](plugin/README.md)（英文）。

## 常见问题

- **背景未出现**：检查软链接是否位于实际启动的 profile 下、加载条目是否存在，以及宿主是否已重启。浏览器控制台可检查 `window.__dshOcean` 是否存在。
- **修改 profile 后界面未变化**：重启宿主并刷新页面，再点击「恢复默认」，避免浏览器保存的设置覆盖新默认值。
- **文字不够清晰**：降低 `opacity`，或将 `translucency` 向 0 调整，让界面表面更不透明。
- **动画开销较高**：将帧率上限调整为 30 或 15，并减少鲨鱼、鲸鱼数量。实际开销取决于设备、画布尺寸及物种数量。
- **刷新后设置丢失**：检查浏览器是否允许 `localStorage`；无法写入时，设置只在当前页面生效。
