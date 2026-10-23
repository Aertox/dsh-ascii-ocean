/**
 * Build the client half into the lazy-CJS shape the DSH module system expects.
 *
 * The browser bundle must execute as nothing but a factory registration:
 * `window.__ModuleLoader__.load({ id, factory })`. Running the script registers
 * the factory; any module-body side effect runs later, at materialization. So we
 * bundle to CJS and wrap the output in that envelope, exactly like the shipped
 * plugin bundles do.
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");
const entry = resolve(pkgRoot, "src/client.ts");
const outfile = resolve(pkgRoot, "lib/client.js");

const pkg = JSON.parse(
  await (await import("node:fs/promises")).readFile(resolve(pkgRoot, "package.json"), "utf8"),
);

const result = await build({
  entryPoints: [entry],
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: ["chrome120", "safari17", "firefox121"],
  // The shell's frozen module table supplies React and every client package;
  // resolving them into the bundle would ship a second React and a second slot
  // registry, so they stay as `require` calls the loader answers.
  external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client", "@deepseek-ai/*"],
  write: false,
  legalComments: "inline",
  sourcemap: false,
  logLevel: "info",
});

const code = result.outputFiles[0].text;

const banner = `window.__ModuleLoader__.load({id:${JSON.stringify(pkg.name)},factory:(require)=>{const module={exports:{}};const exports=module.exports;\n`;
const footer = `\nreturn module.exports;}});\n`;

mkdirSync(dirname(outfile), { recursive: true });
writeFileSync(outfile, banner + code + footer);
console.log(`built ${outfile} (${(banner.length + code.length + footer.length) / 1024} KiB)`);
