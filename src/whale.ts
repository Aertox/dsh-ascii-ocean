/**
 * Whales: the slow giants that share the water with the sharks.
 *
 * The silhouette itself lives next door in `renderer.ts` (WHALE_SHAPES), in the
 * same style as the shark shapes it has to sit beside. This module is only the
 * configuration: which kinds exist, how long each one runs, how lazily it turns
 * and how soft its spine is, plus the spawn spec the World consumes.
 */

export type WhaleKind = "bluewhale" | "humpback" | "spermwhale";

export interface WhaleConfig {
  /** Display name, e.g. for a caption or legend. */
  label: string;
  /**
   * Body length as a multiple of the world's base length. The base is the
   * biggest shark in DEFAULT_SHARKS, so a whale at 1.6 is 60% longer than the
   * largest shark on screen — the point being that a whale should read as a
   * completely different order of animal.
   */
  size: number;
  /** Cruise speed in px/s. Whales move far slower than sharks. */
  cruise: number;
  /** Yaw agility, rad/s. The bigger the animal, the lazier the turn. */
  agility: number;
  /** Maximum spine bend per joint, in radians; larger is looser. */
  bend: number;
  /** Relative odds when a random whale is picked. */
  weight: number;
}

export const WHALE_CONFIG: Record<WhaleKind, WhaleConfig> = {
  // The longest animal that has ever lived: a long, even taper, a dorsal fin
  // no bigger than a thumbnail set right at the tail, mottled slate-blue skin.
  bluewhale: {
    label: "blue whale · 蓝鲸",
    size: 1.9,
    cruise: 26,
    agility: 0.42,
    bend: 0.03,
    weight: 1,
  },
  // Stocky and knobbly: tubercles on the rostrum, scythe pectorals a third of
  // the body, a stubby dorsal hump ahead of a row of knuckles.
  humpback: {
    label: "humpback · 座头鲸",
    size: 1.35,
    cruise: 32,
    agility: 0.62,
    bend: 0.04,
    weight: 2,
  },
  // A third of the body is a blunt, squared head; no dorsal fin, just a hump,
  // and loose wrinkled skin over the whole front half.
  spermwhale: {
    label: "sperm whale · 抹香鲸",
    size: 1.55,
    cruise: 29,
    agility: 0.5,
    bend: 0.035,
    weight: 1,
  },
};

export const WHALE_KINDS = Object.keys(WHALE_CONFIG) as WhaleKind[];

/** Which whales to put in the water. `size` overrides the kind's configured size. */
export interface WhaleSpec {
  kind: WhaleKind;
  size?: number;
}

/** No whales by default: the four-shark hero stays exactly as it was composed. */
export const DEFAULT_WHALES: WhaleSpec[] = [];

/** Resolved length multiplier for a spec, falling back to the kind's config. */
export function whaleSize(spec: WhaleSpec) {
  return spec.size ?? WHALE_CONFIG[spec.kind].size;
}
