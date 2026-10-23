/**
 * Drive a headless Chrome over CDP: set the DSH auth cookie, open the running
 * Web GUI, wait for the ocean canvas, then screenshot and report what it found.
 *
 * Usage: node scripts/capture-gui.mjs [outfile]
 */
import { spawn } from "node:child_process";
import { createHash, createHmac } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { WebSocket } from "/Users/xusen/.dsh/profiles/desktop/node_modules/undici/index.js";

const CHROME = "/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev";
const OUT = process.argv[2] ?? "/tmp/dsh-ocean-gui.png";
// `--scheme dark|light` picks the emulated palette; `--off` exercises the toggle.
const flags = process.argv.slice(3);
const schemeArg = (() => {
  const i = flags.indexOf("--scheme");
  return i === -1 ? "dark" : flags[i + 1];
})();
const turnOff = flags.includes("--off");
const PORT = 9344;
const PROFILE = "/tmp/dsh-capture-profile";

/** Mint the browser-session cookie the running host already trusts. */
function mintCookie(origin) {
  const yaml = readFileSync("/Users/xusen/.dsh/.credentials.yaml", "utf8");
  const secretB64 = yaml.match(/client-connection\/browser-session:[\s\S]*?secret:\s*(\S+)/)[1];
  const secret = Buffer.from(secretB64, "base64url");
  const authority = new URL(origin).host;
  const now = Date.now();
  const body = Buffer.from(
    JSON.stringify({ version: 1, authority, issuedAt: now, expiresAt: now + 864e5 }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest().toString("base64url");
  const name = "dsh-auth-" + createHash("sha256").update(authority).digest("base64url");
  return { name, value: `v1.${body}.${sig}`, url: origin };
}

const originArg = process.argv[3] && /^https?:\/\//.test(process.argv[3]) ? process.argv[3] : undefined;
const origin = (originArg ?? process.env.DSH_WEB_URL ?? "http://127.0.0.1:61541").replace(/\/$/, "");

rmSync(PROFILE, { recursive: true, force: true });
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--window-size=1600,1000`,
    `--user-data-dir=${PROFILE}`,
    `--remote-debugging-port=${PORT}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch {}
    await sleep(150);
  }
  throw new Error("chrome debugger did not come up");
}

const ws = new WebSocket(await wsUrl());
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
});

function send(method, params = {}, sessionId) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

// Attach to a fresh target so page-level domains are available.
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Network.enable", {}, sessionId);

const cookie = mintCookie(origin);
await send(
  "Network.setCookie",
  {
    name: cookie.name,
    value: cookie.value,
    url: cookie.url,
    path: "/",
    httpOnly: true,
    sameSite: "Strict",
  },
  sessionId,
);

// The profile's theme preference is `system`, so emulating a dark scheme is
// enough to exercise the dark path without touching the user's stored settings.
await send(
  "Emulation.setEmulatedMedia",
  { features: [{ name: "prefers-color-scheme", value: schemeArg }] },
  sessionId,
);

await send("Page.navigate", { url: `${origin}/` }, sessionId);
await sleep(6500);

/** Dismiss any first-run plugin consent dialog so the frame is visible. */
async function dismissDialogs(evaluate) {
  return evaluate(`(() => {
    const dialogs = [...document.querySelectorAll('[role=dialog]')];
    for (const dialog of dialogs) {
      const check = dialog.querySelector('input[type=checkbox]');
      if (check && !check.checked) check.click();
      const button = [...dialog.querySelectorAll('button')].find((b) => /已知晓|继续|Continue|OK|Agree/i.test(b.textContent || ''));
      if (button && !button.disabled) button.click();
    }
    return dialogs.length;
  })()`);
}

async function evaluate(expression) {
  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (exceptionDetails) throw new Error(JSON.stringify(exceptionDetails));
  return result.value;
}

// First-run dialogs can arrive in sequence (plugin consent, then the preview
// notice), so keep dismissing until none remains.
for (let i = 0; i < 5; i++) {
  await sleep(700);
  const seen = await dismissDialogs(evaluate);
  if (!seen) break;
}
await sleep(1200);
await dismissDialogs(evaluate);
await sleep(900);

// `--dialog` opens a modal so its surface can be checked for opacity.
if (flags.includes("--dialog")) {
  await evaluate(`(() => {
    // The settings entry is the account row at the sidebar foot.
    const row = [...document.querySelectorAll('button')]
      .filter((el) => /小木|Account|账户/.test(el.textContent || ''))
      .at(-1);
    if (row) row.click();
    return Boolean(row);
  })()`);
  await sleep(1200);
}

// `--settings` opens the settings panel — a real modal surface over the water.
// The entry lives in the account menu at the sidebar foot, not in the sidebar.
if (flags.includes("--settings")) {
  await evaluate(`(() => {
    document.querySelector('button[aria-label="账号菜单"]')?.click();
    return true;
  })()`);
  await sleep(500);
  await evaluate(`(() => {
    const entry = [...document.querySelectorAll('[role=menu] button,[role=menuitem]')]
      .find((el) => /^设置/.test((el.textContent || '').trim()));
    if (entry) entry.click();
    return Boolean(entry);
  })()`);
  await sleep(1500);
}

// `--section <label>` opens one settings section, so a page can be inspected.
const sectionArg = (() => {
  const i = flags.indexOf("--section");
  return i === -1 ? undefined : flags[i + 1];
})();
if (sectionArg) {
  await evaluate(`(() => {
    const cell = [...document.querySelectorAll('[role=dialog] button')]
      .find((b) => (b.textContent || '').trim() === ${JSON.stringify(sectionArg)});
    if (cell) cell.click();
    return Boolean(cell);
  })()`);
  await sleep(1400);
}

if (turnOff) {
  await evaluate(`window.__dshOcean.setEnabled(false)`);
  await sleep(900);
}

const report = await evaluate(`(() => {
  const canvas = document.querySelector('canvas[data-dsh-ocean-canvas]');
  const frame = document.querySelector('[data-dsh-ocean]');
  const box = canvas ? canvas.getBoundingClientRect() : null;
  const cs = canvas ? getComputedStyle(canvas) : null;
  const blocked = document.querySelector('[role=dialog]')?.textContent?.slice(0, 40) ?? null;
  return {
    dialog: blocked,
    dark: document.body.hasAttribute('data-ds-dark-theme'),
    liveAttr: document.documentElement.hasAttribute('data-dsh-ocean-live'),
    canvas: Boolean(canvas),
    canvasSize: box ? [Math.round(box.width), Math.round(box.height)] : null,
    canvasZ: cs ? cs.zIndex : null,
    canvasOpacity: cs ? cs.opacity : null,
    frameTag: frame ? frame.tagName + '.' + frame.className : null,
    bgBase: frame ? getComputedStyle(frame).getPropertyValue('--dsw-alias-bg-base').trim() : null,
    sidebarFill: frame ? getComputedStyle(frame).getPropertyValue('--dsw-specific-sidebar-fill').trim() : null,
    api: typeof window.__dshOcean,
    menuAudit: (() => {
      // Walk up from the visible menu label to the first ancestor that paints.
      const label = [...document.querySelectorAll('button,div,span,a')]
        .find((el) => (el.textContent || '').trim() === '退出登录');
      if (!label) return null;
      const chain = [];
      let node = label;
      for (let i = 0; i < 8 && node; i++) {
        const cs = getComputedStyle(node);
        chain.push({
          tag: node.tagName,
          cls: String(node.className || '').slice(0, 34),
          bg: cs.backgroundColor,
          blur: cs.backdropFilter,
          pos: cs.position,
          z: cs.zIndex,
          inFrame: Boolean(node.closest('[data-dsh-ocean]')),
          inOverlay: Boolean(node.closest('[data-shell-overlay]')),
        });
        node = node.parentElement;
      }
      return chain;
    })(),
    modalBg: (() => {
      const dialog = document.querySelector('[role=dialog]');
      if (!dialog) return null;
      const inner = dialog.querySelector('div') ?? dialog;
      return getComputedStyle(inner).backgroundColor;
    })(),
    settings: (() => {
      const dialog = document.querySelector('[role=dialog]');
      const section = dialog?.querySelector('.aob-section') ?? null;
      if (!dialog) return null;
      const mark = (el) => (el.getAttribute('aria-pressed') === 'true' ? '*' : '');
      return {
        nav: [...dialog.querySelectorAll('button')]
          .map((b) => (b.textContent || '').trim())
          .filter(Boolean),
        sectionMounted: Boolean(section),
        chips: section
          ? [...section.querySelectorAll('.aob-chip')].map((b) => (b.textContent || '').trim() + mark(b))
          : null,
        sliders: section
          ? [...section.querySelectorAll('input[type=range]')].map((i) => i.value)
          : null,
        switchOn: section?.querySelector('[role=switch]')?.getAttribute('aria-checked') ?? null,
        palette: section
          ? [...section.querySelectorAll('.aob-seg button')].map((b) => (b.textContent || '').trim() + mark(b))
          : null,
        footer: section ? (section.querySelector('.aob-notes')?.textContent || '').trim() : null,
        resetDisabled: section?.querySelector('.aob-reset')?.disabled ?? null,
      };
    })(),
    painted: canvas ? (() => {
      const g = canvas.getContext('2d');
      const d = g.getImageData(0, 0, canvas.width, canvas.height).data;
      let lit = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] + d[i+1] + d[i+2] > 24) lit++;
      return { litPixels: lit, totalPixels: d.length / 4 };
    })() : null,
  };
})()`);

const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
const { writeFileSync } = await import("node:fs");
writeFileSync(OUT, Buffer.from(shot.data, "base64"));
console.log(JSON.stringify(report, null, 2));
console.log("screenshot:", OUT);

ws.close();
chrome.kill();
