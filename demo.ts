import { OceanEngine, WHALE_KINDS, type SharkKind, type SharkSpec, type WhaleKind, type WhaleSpec } from "./src";

// ?sharks=thresher,hammerhead,mako,nurse — first is biggest, the rest step down. No param: four classics.
const params = new URLSearchParams(location.search);
const kinds = params.get("sharks")?.split(",").filter(Boolean) as SharkKind[] | undefined;
const sharks: SharkSpec[] | undefined = kinds?.map((kind, i) => ({ kind, size: 1 - i * 0.1 }));

// ?whales=humpback,bluewhale — sizes come from WHALE_CONFIG unless a spec overrides.
// Unknown names are dropped rather than crashing the page.
const whaleKinds = params
  .get("whales")
  ?.split(",")
  .filter((k): k is WhaleKind => (WHALE_KINDS as string[]).includes(k));
const whales: WhaleSpec[] | undefined = whaleKinds?.map((kind) => ({ kind }));

new OceanEngine(document.querySelector("canvas")!, sharks, whales);
