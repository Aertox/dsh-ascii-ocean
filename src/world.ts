/**
 * Artificial-life sim for the hero: tiny fish schools and the sharks that hunt them.
 *
 * Fish: Reynolds boids (separation / alignment / cohesion) in Couzin-style
 * zones, with a blind spot behind each fish. Alarm spreads from fish to fish
 * through the school (a "wave of agitation"), so a whole school bolts even
 * when only its edge can see the shark. Fleeing fish break sideways around the
 * shark's path, which gives the fountain effect seen in real bait balls.
 *
 * Sharks: Reynolds steering (wander + pursuit + separation) on a
 * follow-the-leader spine. Hunger builds over time and drops when they eat.
 * They prefer fish in sparse spots, since dense schools confuse predators,
 * so stragglers get picked off. Eaten fish come back later as new schools
 * swimming in from the edges, which keeps the population steady.
 *
 * Whales: the same spine, driven by a much lazier steering pass — no hunger,
 * no hunt, just a wide patrol that turns like a supertanker. Fish give them a
 * gentle berth instead of bolting, and sharks dodge them. Opt-in per canvas
 * through WhaleSpec[] so the shark-only hero stays untouched.
 */
import { angleDiff, clamp, current, rand, randInt, TAU } from "./math";
import { pickSpecies, SPECIES } from "./species";
import { DEFAULT_WHALES, WHALE_CONFIG, whaleSize, type WhaleKind, type WhaleSpec } from "./whale";

export const SHARK_NODES = 20;

export type SharkKind = "classic" | "hammerhead" | "zebra" | "tiger" | "greathammer" | "mako" | "thresher" | "nurse";

/** Which sharks to put in the water; size is relative to the biggest. */
export type SharkSpec = { kind: SharkKind; size: number };

// The landing hero: four of the same shark at different depths.
const DEFAULT_SHARKS: SharkSpec[] = [
  { kind: "classic", size: 1 },
  { kind: "classic", size: 0.7 },
  { kind: "classic", size: 0.84 },
  { kind: "classic", size: 0.77 },
];

export interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  species: number;
  /** 0 calm → 1 panicking. Spreads to neighbours. */
  alarm: number;
  alive: boolean;
  respawnAt: number;
  /** Tail-beat phase. */
  phase: number;
  /** Smoothed angular velocity (rad/s); hard turns flash silver. */
  turn: number;
  /** 0.55 far → 1 near. */
  depth: number;
  /** Rotation sense shared by a school when it mills into a bait ball. */
  millDir: 1 | -1;
}

export interface Shark {
  id: number;
  kind: SharkKind;
  length: number;
  /** Spine positions, snout first: [x0, y0, x1, y1, ...]. */
  nodes: Float32Array;
  heading: number;
  speed: number;
  /** Tail-beat phase; drives the body wave in the renderer. */
  phase: number;
  /** Smoothed angular velocity (rad/s); the shark banks its fins into turns. */
  turn: number;
  hunger: number;
  wander: number;
  orbitDir: 1 | -1;
  orbitRadius: number;
  target: Fish | null;
  retargetAt: number;
  /** 0 far / dim → 1 near / bright. */
  depth: number;
}

/**
 * A whale. Same spine-driven swimming as a shark, but it never hunts: no
 * hunger, no target, no feeding. It is a slow moving landmark that happens to
 * be the biggest thing in the water.
 */
export interface Whale {
  id: number;
  kind: WhaleKind;
  length: number;
  /** Spine positions, snout first: [x0, y0, x1, y1, ...]. */
  nodes: Float32Array;
  heading: number;
  speed: number;
  /** Tail-beat phase; a whale's beats are slow and deep. */
  phase: number;
  /** Smoothed angular velocity (rad/s); the flukes swing against the turn. */
  turn: number;
  wander: number;
  orbitDir: 1 | -1;
  orbitRadius: number;
  /** 0 far / dim → 1 near / bright. */
  depth: number;
}

export interface WorldEvent {
  kind: "eat" | "splash";
  x: number;
  y: number;
}

const FISH_SEPARATION_K = 420;
const FISH_ALIGN_K = 1.4;
const FISH_COHESION_K = 1;
const FISH_FLEE_K = 1100;
const BLIND_COS = -0.6; // ~127° either side of the heading is visible

export class World {
  width = 0;
  height = 0;
  time = 0;
  fish: Fish[] = [];
  sharks: Shark[] = [];
  whales: Whale[] = [];
  events: WorldEvent[] = [];
  pointer = { x: 0, y: 0, active: false };

  /** Fish neighbourhood radius; the spatial hash bucket size matches it. */
  private perception = 60;
  /** Per-species personal space in px (x, y). */
  private sepX: number[] = [];
  private sepY: number[] = [];
  private foreignSep = 40;
  private bucketCols = 0;
  private bucketRows = 0;
  private bucketHead = new Int32Array(0);
  private bucketCount = new Uint16Array(0);
  private bucketNext = new Int32Array(0);
  private lastSpawn = 0;
  private tmp = { x: 0, y: 0 };
  /** Scratch for bodyFear(), so the fish loop allocates nothing. */
  private fearTmp = { x: 0, y: 0, fear: 0 };

  /** fishCount overrides the area-based population (the sidebar wants a single small school). */
  constructor(
    private sharkSpecs: SharkSpec[] = DEFAULT_SHARKS,
    private fishCount?: number,
    private whaleSpecs: WhaleSpec[] = DEFAULT_WHALES,
  ) {}

  resize(width: number, height: number, cellW: number, cellH: number) {
    const first = this.width === 0;
    this.width = width;
    this.height = height;
    // Spacing is set in grid cells so every fish lands in its own cell.
    this.sepX = SPECIES.map((sp) => sp.spacing[0] * cellW);
    this.sepY = SPECIES.map((sp) => sp.spacing[1] * cellH);
    this.perception = Math.max(cellH * 3, cellW * 5.5);
    this.foreignSep = cellW * 3;

    if (first || this.fish.length === 0) {
      this.seed();
      return;
    }
    for (const f of this.fish) {
      f.x = clamp(f.x, 0, width);
      f.y = clamp(f.y, 0, height);
    }
  }

  seed() {
    const { width: W, height: H } = this;
    const minSide = Math.min(W, H);
    const baseLength = clamp(minSide * 0.44, 170, 430);
    const sharkCount = this.sharkSpecs.length;

    this.sharks = [];
    for (let i = 0; i < sharkCount; i++) {
      const { kind, size } = this.sharkSpecs[i];
      const length = baseLength * size;
      const orbitRadius = minSide * rand(0.28, 0.4);
      const a = (i / sharkCount) * TAU + rand(-0.4, 0.4);
      const orbitDir: 1 | -1 = i % 2 === 0 ? 1 : -1;
      const x = W / 2 + Math.cos(a) * orbitRadius * (W / minSide) * 0.9;
      const y = H / 2 + Math.sin(a) * orbitRadius;
      const heading = a + (orbitDir * Math.PI) / 2;
      this.sharks.push({
        id: i + 1,
        kind,
        length,
        nodes: this.buildSpine(x, y, heading, length),
        heading,
        speed: 30,
        phase: rand(0, TAU),
        turn: 0,
        hunger: rand(0.25, 0.75),
        wander: 0,
        orbitDir,
        orbitRadius,
        target: null,
        retargetAt: 0,
        depth: size,
      });
    }
    // Smaller (farther) sharks draw first so the big one swims over them.
    this.sharks.sort((a, b) => a.length - b.length);

    // Whales get their own, wider circuit: they are too big to share the
    // sharks' laps without crowding the middle of the frame.
    this.whales = [];
    for (let i = 0; i < this.whaleSpecs.length; i++) {
      const spec = this.whaleSpecs[i];
      const cfg = WHALE_CONFIG[spec.kind];
      const length = baseLength * whaleSize(spec);
      const orbitRadius = minSide * rand(0.34, 0.48);
      const a = (i / this.whaleSpecs.length) * TAU + rand(-0.3, 0.3);
      const orbitDir: 1 | -1 = i % 2 === 0 ? 1 : -1;
      const x = W / 2 + Math.cos(a) * orbitRadius * (W / minSide) * 0.85;
      const y = H / 2 + Math.sin(a) * orbitRadius;
      const heading = a + (orbitDir * Math.PI) / 2;
      this.whales.push({
        id: 1000 + i,
        kind: spec.kind,
        length,
        nodes: this.buildSpine(x, y, heading, length),
        heading,
        speed: cfg.cruise,
        phase: rand(0, TAU),
        turn: 0,
        wander: 0,
        orbitDir,
        orbitRadius,
        depth: rand(0.6, 0.95),
      });
    }

    const total = this.fishCount ?? clamp(Math.round((W * H) / 4400), 85, 340);
    this.fish = [];
    while (this.fish.length < total) {
      const species = pickSpecies();
      const sp = SPECIES[species];
      const size = Math.min(randInt(sp.schoolSize[0], sp.schoolSize[1]), total - this.fish.length);
      const millDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const cx = rand(W * 0.06, W * 0.94);
      const cy = rand(H * 0.08, H * 0.92);
      // Mostly level headings: fish cruise sideways far more than up or down.
      const dir = (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.5, 0.5);
      for (let k = 0; k < size; k++) {
        this.fish.push({
          x: cx + rand(-1, 1) * this.sepX[species] * Math.sqrt(size),
          y: cy + rand(-1, 1) * this.sepY[species] * Math.sqrt(size) * 0.6,
          vx: Math.cos(dir) * sp.cruise,
          vy: Math.sin(dir) * sp.cruise,
          species,
          alarm: 0,
          alive: true,
          respawnAt: 0,
          phase: rand(0, TAU),
          turn: 0,
          depth: rand(0.55, 1),
          millDir,
        });
      }
    }
    this.bucketNext = new Int32Array(this.fish.length);
  }

  splash(x: number, y: number) {
    this.events.push({ kind: "splash", x, y });
    const r = 240;
    for (const f of this.fish) {
      if (!f.alive) continue;
      const dx = f.x - x;
      const dy = f.y - y;
      const d = Math.hypot(dx, dy);
      if (d > r || d < 1e-3) continue;
      // Flash expansion: everybody nearby bolts straight out.
      const k = (1 - d / r) * 260;
      f.vx += (dx / d) * k;
      f.vy += (dy / d) * k;
      f.alarm = 1;
    }
  }

  step(dt: number) {
    this.time += dt;
    this.rebuildHash();
    this.stepFish(dt);
    this.stepSharks(dt);
    this.stepWhales(dt);
    this.respawn();
  }

  /** Lay a straight spine out behind a snout position, snout first. */
  private buildSpine(x: number, y: number, heading: number, length: number) {
    const nodes = new Float32Array(SHARK_NODES * 2);
    const seg = length / (SHARK_NODES - 1);
    for (let n = 0; n < SHARK_NODES; n++) {
      nodes[n * 2] = x - Math.cos(heading) * seg * n;
      nodes[n * 2 + 1] = y - Math.sin(heading) * seg * n;
    }
    return nodes;
  }

  private rebuildHash() {
    const size = this.perception;
    const pad = 2;
    this.bucketCols = Math.ceil(this.width / size) + pad * 2;
    this.bucketRows = Math.ceil(this.height / size) + pad * 2;
    const n = this.bucketCols * this.bucketRows;
    if (this.bucketHead.length !== n) {
      this.bucketHead = new Int32Array(n);
      this.bucketCount = new Uint16Array(n);
    }
    this.bucketHead.fill(-1);
    this.bucketCount.fill(0);
    if (this.bucketNext.length !== this.fish.length) {
      this.bucketNext = new Int32Array(this.fish.length);
    }
    for (let i = 0; i < this.fish.length; i++) {
      const f = this.fish[i];
      if (!f.alive) continue;
      const b = this.bucketOf(f.x, f.y);
      this.bucketNext[i] = this.bucketHead[b];
      this.bucketHead[b] = i;
      this.bucketCount[b]++;
    }
  }

  private bucketOf(x: number, y: number) {
    const size = this.perception;
    const c = clamp(Math.floor(x / size) + 2, 0, this.bucketCols - 1);
    const r = clamp(Math.floor(y / size) + 2, 0, this.bucketRows - 1);
    return r * this.bucketCols + c;
  }

  private stepFish(dt: number) {
    const { fish, sharks, whales, pointer, width: W, height: H, time } = this;
    const R = this.perception;
    const R2 = R * R;
    const foreignSep = this.foreignSep;
    const size = this.perception;
    const cols = this.bucketCols;
    const rows = this.bucketRows;
    const head = this.bucketHead;
    const next = this.bucketNext;
    const cur = this.tmp;
    const calmDecay = Math.exp(-dt * 0.7);
    const contagion = Math.min(1, dt * 6);

    for (let i = 0; i < fish.length; i++) {
      const f = fish[i];
      if (!f.alive) continue;
      const sp = SPECIES[f.species];
      // Alarmed fish want more room: the school flashes apart around a
      // shark and closes back up once the threat fades.
      const spread = 1 + 1.8 * f.alarm;
      const sepX = this.sepX[f.species] * spread;
      const sepY = this.sepY[f.species] * spread;

      const speed = Math.hypot(f.vx, f.vy) || 1;
      const hx = f.vx / speed;
      const hy = f.vy / speed;

      let ax = 0;
      let ay = 0;
      let sx = 0;
      let sy = 0;
      let avx = 0;
      let avy = 0;
      let cx = 0;
      let cy = 0;
      let n = 0;
      let neighbourAlarm = 0;

      const bc = clamp(Math.floor(f.x / size) + 2, 0, cols - 1);
      const br = clamp(Math.floor(f.y / size) + 2, 0, rows - 1);
      for (let r = Math.max(0, br - 1); r <= Math.min(rows - 1, br + 1); r++) {
        for (let c = Math.max(0, bc - 1); c <= Math.min(cols - 1, bc + 1); c++) {
          let j = head[r * cols + c];
          while (j !== -1) {
            if (j !== i) {
              const o = fish[j];
              const dx = o.x - f.x;
              const dy = o.y - f.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < R2 && d2 > 1e-6) {
                const d = Math.sqrt(d2);
                // Blind zone directly behind the fish.
                if ((dx * hx + dy * hy) / d > BLIND_COS) {
                  // Elliptical personal space: wide along x, tight along y.
                  const qx = dx / sepX;
                  const qy = dy / sepY;
                  const q2 = qx * qx + qy * qy;
                  if (q2 < 1) {
                    const q = Math.sqrt(q2) || 1e-3;
                    const k = (1 - q) / q;
                    sx -= qx * k;
                    sy -= qy * k;
                  }
                  if (o.species === f.species) {
                    avx += o.vx;
                    avy += o.vy;
                    cx += dx;
                    cy += dy;
                    n++;
                  } else if (d < foreignSep) {
                    // Different species keep their own schools.
                    const k = ((1 - d / foreignSep) / d) * 0.6;
                    sx -= dx * k;
                    sy -= dy * k;
                  }
                  if (o.alarm > neighbourAlarm) neighbourAlarm = o.alarm;
                }
              }
            }
            j = next[j];
          }
        }
      }

      ax += sx * FISH_SEPARATION_K;
      ay += sy * FISH_SEPARATION_K;
      if (n > 0) {
        const alignK = FISH_ALIGN_K * sp.align;
        const cohesionK = FISH_COHESION_K * sp.cohesion * (1 - 0.8 * f.alarm);
        ax += (avx / n - f.vx) * alignK + (cx / n) * cohesionK;
        ay += (avy / n - f.vy) * alignK + (cy / n) * cohesionK;
        if (sp.mill > 0) {
          // Circle the local centre: the school spins into a bait ball.
          const cl = Math.hypot(cx, cy) || 1;
          ax += (-cy / cl) * f.millDir * sp.mill * (1 - f.alarm);
          ay += (cx / cl) * f.millDir * sp.mill * (1 - f.alarm);
        }
      }

      // Predators. Distance is measured to the nearest point along the front
      // half of the shark, so fish also give the flanks a wide berth.
      let fear = 0;
      for (const sh of sharks) {
        const push = this.bodyFear(f, sh.nodes, sh.heading, sh.length, 1);
        ax += push.x;
        ay += push.y;
        fear = Math.max(fear, push.fear);
      }
      // Whales: giants that eat nothing here. Schools do not bolt, they just
      // part a little as the wall of blubber slides past.
      for (const wh of whales) {
        const push = this.bodyFear(f, wh.nodes, wh.heading, wh.length, 0.45);
        ax += push.x;
        ay += push.y;
        fear = Math.max(fear, push.fear);
      }

      if (pointer.active) {
        const pr = 130;
        const dx = f.x - pointer.x;
        const dy = f.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < pr && d > 1e-3) {
          const w = (1 - d / pr) ** 2;
          ax += (dx / d) * FISH_FLEE_K * w;
          ay += (dy / d) * FISH_FLEE_K * w;
          fear = Math.max(fear, Math.sqrt(w) * 0.8);
        }
      }

      // Alarm: direct threat sets it, neighbours pass it along (slightly
      // weaker each hop), and it fades on its own.
      let alarm = Math.max(f.alarm * calmDecay, fear);
      const relayed = neighbourAlarm * 0.86;
      if (relayed > alarm) alarm += (relayed - alarm) * contagion;
      f.alarm = alarm;

      // Soft walls.
      const m = 36;
      if (f.x < m) ax += (m - f.x) * 7;
      else if (f.x > W - m) ax -= (f.x - (W - m)) * 7;
      if (f.y < m) ay += (m - f.y) * 7;
      else if (f.y > H - m) ay -= (f.y - (H - m)) * 7;

      // Ambient current and a little individual restlessness.
      current(f.x, f.y, time, cur);
      ax += cur.x * 0.5 + (Math.random() - 0.5) * sp.jitter;
      ay += cur.y * 0.5 + (Math.random() - 0.5) * sp.jitter;
      // Swim level, except when bolting from danger.
      ay -= f.vy * sp.verticalDrag * (1 - 0.7 * f.alarm);

      // Relax toward a preferred speed that rises with panic.
      const preferred = sp.cruise * (1 + 1.3 * f.alarm);
      ax += (preferred - speed) * hx * 1.6;
      ay += (preferred - speed) * hy * 1.6;

      const before = Math.atan2(f.vy, f.vx);
      f.vx += ax * dt;
      f.vy += ay * dt;
      const maxSpeed = sp.maxSpeed * (1 + 1.8 * f.alarm);
      const s = Math.hypot(f.vx, f.vy);
      if (s > maxSpeed) {
        f.vx *= maxSpeed / s;
        f.vy *= maxSpeed / s;
      } else if (s < sp.minSpeed && s > 1e-3) {
        f.vx *= sp.minSpeed / s;
        f.vy *= sp.minSpeed / s;
      }
      f.turn += (angleDiff(before, Math.atan2(f.vy, f.vx)) / dt - f.turn) * Math.min(1, dt * 8);
      f.phase += dt * (7 + Math.hypot(f.vx, f.vy) * 0.12);
      f.x = clamp(f.x + f.vx * dt, -60, W + 60);
      f.y = clamp(f.y + f.vy * dt, -60, H + 60);
    }
  }

  private stepSharks(dt: number) {
    const { sharks, whales, width: W, height: H, time } = this;
    const minSide = Math.min(W, H);
    const cxW = W / 2;
    const cyW = H / 2;

    for (const sh of sharks) {
      const L = sh.length;
      const nodes = sh.nodes;
      const hx = nodes[0];
      const hy = nodes[1];

      sh.hunger = Math.min(1, sh.hunger + dt * 0.03);

      // Momentum.
      let dx = Math.cos(sh.heading);
      let dy = Math.sin(sh.heading);

      // Wander: a slowly drifting offset on a circle ahead of the snout.
      sh.wander = clamp(sh.wander + (Math.random() - 0.5) * dt * 3.2, -1.1, 1.1);
      dx += Math.cos(sh.heading + sh.wander) * 0.45;
      dy += Math.sin(sh.heading + sh.wander) * 0.45;

      // Hunt.
      if (time >= sh.retargetAt) {
        sh.target = this.findPrey(sh);
        sh.retargetAt = time + 0.45;
      }
      const t = sh.target;
      let hunting = false;
      let closing = 0;
      if (t && t.alive && sh.hunger > 0.3) {
        // Pursuit: aim at where the fish is about to be.
        const tx = t.x + t.vx * 0.35 - hx;
        const ty = t.y + t.vy * 0.35 - hy;
        const d = Math.hypot(tx, ty) || 1;
        const w = 1.4 + 2.6 * sh.hunger;
        dx += (tx / d) * w;
        dy += (ty / d) * w;
        hunting = true;
        closing = clamp(1 - d / (L * 0.9), 0, 1);
      } else {
        // Patrol: a lazy circuit around the headline.
        const rx = (hx - cxW) / (W / minSide);
        const ry = hy - cyW;
        const r = Math.hypot(rx, ry) || 1;
        const radius = sh.orbitRadius * (1 + 0.15 * Math.sin(time * 0.05 + sh.id));
        const radial = clamp((radius - r) / radius, -1, 1);
        dx += ((-ry / r) * sh.orbitDir + (rx / r) * radial * 0.9) * 0.55;
        dy += ((rx / r) * sh.orbitDir + (ry / r) * radial * 0.9) * 0.55;
      }

      // Give other sharks room.
      for (const other of sharks) {
        if (other === sh) continue;
        for (let k = 0; k < SHARK_NODES; k += 4) {
          const ox = hx - other.nodes[k * 2];
          const oy = hy - other.nodes[k * 2 + 1];
          const d = Math.hypot(ox, oy);
          const range = (L + other.length) * 0.45;
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 3;
            dx += (ox / d) * w;
            dy += (oy / d) * w;
          }
        }
      }

      // And a lot of room to a whale: no shark wants to be inside that hide.
      for (const wh of whales) {
        for (let k = 0; k < SHARK_NODES; k += 2) {
          const ox = hx - wh.nodes[k * 2];
          const oy = hy - wh.nodes[k * 2 + 1];
          const d = Math.hypot(ox, oy);
          const range = L * 0.3 + wh.length * 0.2;
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 4;
            dx += (ox / d) * w;
            dy += (oy / d) * w;
          }
        }
      }

      // Keep the headline mostly clear: a soft elliptical no-swim zone.
      const ex = (hx - cxW) / (W * 0.3);
      const ey = (hy - cyW) / (H * 0.16);
      const e2 = ex * ex + ey * ey;
      if (e2 < 1) {
        const e = Math.sqrt(e2) || 1e-3;
        const w = (1 - e) * (hunting ? 1 : 2.5);
        dx += (ex / e) * w;
        dy += (ey / e) * w;
      }

      // Turn back once the snout leaves the frame, so bodies dip off-screen
      // now and then but the sharks never wander away for good.
      const over = Math.max(-hx, hx - W, -hy, hy - H);
      if (over > -L * 0.05) {
        const w = clamp((over + L * 0.05) / (L * 0.35), 0, 1) * 3.5;
        const toX = cxW - hx;
        const toY = cyW - hy;
        const d = Math.hypot(toX, toY) || 1;
        dx += (toX / d) * w;
        dy += (toY / d) * w;
      }

      const desired = Math.atan2(dy, dx);
      // Sharks can't pivot on the spot: the turning circle grows with speed.
      const agility = Math.min(hunting ? 1.7 + closing : 0.8, sh.speed / (L * 0.22));
      const maxTurn = agility * dt;
      const turned = clamp(angleDiff(sh.heading, desired), -maxTurn, maxTurn);
      sh.heading += turned;
      sh.turn += (turned / dt - sh.turn) * Math.min(1, dt * 3);

      const cruise = 30 + L * 0.04;
      const targetSpeed = hunting ? cruise * (1.45 + closing * 1.5) : cruise;
      sh.speed += (targetSpeed - sh.speed) * Math.min(1, dt * 1.1);
      sh.phase += dt * (2 + sh.speed / 24);

      // Follow-the-leader spine, with a stiffness limit per joint so the
      // body bends into a C at most and never folds back on itself.
      this.followSpine(nodes, sh.heading, sh.speed, dt, L, 0.16);

      // Feed.
      if (sh.hunger > 0.15) {
        const mouthR = L * 0.05 + 8;
        const mx = nodes[0];
        const my = nodes[1];
        for (const f of this.fish) {
          if (!f.alive) continue;
          if ((f.x - mx) ** 2 + (f.y - my) ** 2 < mouthR * mouthR) {
            f.alive = false;
            f.respawnAt = time + rand(3, 8);
            sh.hunger = Math.max(0, sh.hunger - 0.16);
            this.events.push({ kind: "eat", x: f.x, y: f.y });
          }
        }
      }
    }
  }

  /**
   * Whales steer like a supertanker: a wide, breathing circuit, a very slow
   * yaw, and a soft spine. No hunting, no feeding — the fish part around them
   * and the sharks get out of the way.
   */
  private stepWhales(dt: number) {
    const { whales, width: W, height: H, time } = this;
    const minSide = Math.min(W, H);
    const cxW = W / 2;
    const cyW = H / 2;

    for (const wh of whales) {
      const L = wh.length;
      const cfg = WHALE_CONFIG[wh.kind];
      const nodes = wh.nodes;
      const hx = nodes[0];
      const hy = nodes[1];

      let dx = Math.cos(wh.heading);
      let dy = Math.sin(wh.heading);

      // Barely any wander: a whale has a plan, and it is a slow one.
      wh.wander = clamp(wh.wander + (Math.random() - 0.5) * dt * 0.5, -0.45, 0.45);
      dx += Math.cos(wh.heading + wh.wander) * 0.5;
      dy += Math.sin(wh.heading + wh.wander) * 0.5;

      // Patrol: a long oval whose radius breathes, so it is never a plain circle.
      const rx = (hx - cxW) / (W / minSide);
      const ry = hy - cyW;
      const r = Math.hypot(rx, ry) || 1;
      const radius = wh.orbitRadius * (1 + 0.2 * Math.sin(time * 0.03 + wh.id));
      const radial = clamp((radius - r) / radius, -1, 1);
      dx += ((-ry / r) * wh.orbitDir + (rx / r) * radial * 0.6) * 0.24;
      dy += ((rx / r) * wh.orbitDir + (ry / r) * radial * 0.6) * 0.24;

      // Keep the headline clear: the whale is wide, so it starts pushing from
      // further out than a shark does.
      const ex = (hx - cxW) / (W * 0.34);
      const ey = (hy - cyW) / (H * 0.2);
      const e2 = ex * ex + ey * ey;
      if (e2 < 1) {
        const e = Math.sqrt(e2) || 1e-3;
        const w = (1 - e) * 0.9;
        dx += (ex / e) * w;
        dy += (ey / e) * w;
      }

      // Give other whales room.
      for (const other of whales) {
        if (other === wh) continue;
        for (let k = 0; k < SHARK_NODES; k += 4) {
          const ox = hx - other.nodes[k * 2];
          const oy = hy - other.nodes[k * 2 + 1];
          const d = Math.hypot(ox, oy);
          const range = (L + other.length) * 0.25;
          if (d < range && d > 1e-3) {
            const w = (1 - d / range) * 2.5;
            dx += (ox / d) * w;
            dy += (oy / d) * w;
          }
        }
      }

      // Soft walls, scaled to the animal: a whale starts its (very slow) turn
      // long before the snout reaches the edge, and any push is proportional
      // to how far out it has drifted, so it always comes back.
      const m = Math.min(L * 0.4, Math.min(W, H) * 0.3);
      if (hx < m) dx += ((m - hx) / m) * 4;
      else if (hx > W - m) dx -= ((hx - (W - m)) / m) * 4;
      if (hy < m) dy += ((m - hy) / m) * 4;
      else if (hy > H - m) dy -= ((hy - (H - m)) / m) * 4;

      const desired = Math.atan2(dy, dx);
      // A giant cannot pivot: the yaw rate is capped by its own length, so the
      // turning circle stays a good fraction of the body (as it does for sharks).
      const maxTurn = Math.min(cfg.agility, wh.speed / (L * 0.5)) * dt;
      const turned = clamp(angleDiff(wh.heading, desired), -maxTurn, maxTurn);
      wh.heading += turned;
      wh.turn += (turned / dt - wh.turn) * Math.min(1, dt * 2);

      wh.speed += (cfg.cruise - wh.speed) * Math.min(1, dt * 0.5);
      wh.phase += dt * (0.5 + wh.speed / 45);

      this.followSpine(nodes, wh.heading, wh.speed, dt, L, cfg.bend);
    }
  }

  /**
   * Move the snout forward and drag the rest of the spine behind it, with a
   * stiffness limit per joint so the body bends into a C at most and never
   * folds back on itself. Shared by sharks and whales.
   */
  private followSpine(
    nodes: Float32Array,
    heading: number,
    speed: number,
    dt: number,
    L: number,
    maxBend: number,
  ) {
    nodes[0] += Math.cos(heading) * speed * dt;
    nodes[1] += Math.sin(heading) * speed * dt;
    const seg = L / (SHARK_NODES - 1);
    let prevAngle = heading + Math.PI;
    for (let k = 1; k < SHARK_NODES; k++) {
      const px = nodes[(k - 1) * 2];
      const py = nodes[(k - 1) * 2 + 1];
      let angle = Math.atan2(nodes[k * 2 + 1] - py, nodes[k * 2] - px);
      angle = prevAngle + clamp(angleDiff(prevAngle, angle), -maxBend, maxBend);
      nodes[k * 2] = px + Math.cos(angle) * seg;
      nodes[k * 2 + 1] = py + Math.sin(angle) * seg;
      prevAngle = angle;
    }
  }

  /**
   * Push a fish away from one swimming body (shark or whale). Distance is
   * measured to the nearest point along the front half of the body, so fish
   * also give the flanks a wide berth. Returns a shared scratch pod — use it
   * before the next call.
   */
  private bodyFear(f: Fish, nodes: Float32Array, heading: number, length: number, gain: number) {
    const out = this.fearTmp;
    out.x = 0;
    out.y = 0;
    out.fear = 0;
    const fearR = length * 0.6 + 60;
    let best = Infinity;
    let bx = 0;
    let by = 0;
    for (let k = 0; k <= 12; k += 3) {
      const nx = nodes[k * 2];
      const ny = nodes[k * 2 + 1];
      const d2 = (f.x - nx) ** 2 + (f.y - ny) ** 2;
      if (d2 < best) {
        best = d2;
        bx = nx;
        by = ny;
      }
    }
    const d = Math.sqrt(best);
    if (d >= fearR || d < 1e-3) return out;
    let w = 1 - d / fearR;
    w *= w;
    const awayX = (f.x - bx) / d;
    const awayY = (f.y - by) / d;
    // Fountain effect: break to whichever side of the body's path you're on.
    const hx = Math.cos(heading);
    const hy = Math.sin(heading);
    const side = hx * (f.y - nodes[1]) - hy * (f.x - nodes[0]) >= 0 ? 1 : -1;
    out.x = (awayX * 0.7 - hy * side * 0.9) * FISH_FLEE_K * w * gain;
    out.y = (awayY * 0.7 + hx * side * 0.9) * FISH_FLEE_K * w * gain;
    out.fear = Math.sqrt(w) * gain;
    return out;
  }

  /**
   * Pick prey in the shark's forward cone, preferring close fish in sparse
   * buckets (stragglers) over fish buried in a dense school.
   */
  private findPrey(sh: Shark): Fish | null {
    const range = sh.length * 0.9 + 160;
    const hx = sh.nodes[0];
    const hy = sh.nodes[1];
    const fx = Math.cos(sh.heading);
    const fy = Math.sin(sh.heading);
    let best: Fish | null = null;
    let bestScore = Infinity;
    let currentScore = Infinity;

    for (const f of this.fish) {
      if (!f.alive) continue;
      const dx = f.x - hx;
      const dy = f.y - hy;
      const d = Math.hypot(dx, dy);
      if (d > range || d < 1e-3) continue;
      const cos = (dx * fx + dy * fy) / d;
      if (cos < 0.2) continue;
      const crowd = this.bucketCount[this.bucketOf(f.x, f.y)];
      const score = d * (1 + (1 - cos) * 0.8) * (1 + crowd * 0.07);
      if (score < bestScore) {
        bestScore = score;
        best = f;
      }
      if (f === sh.target) currentScore = score;
    }
    // Stick with the current target unless something is clearly better.
    if (sh.target && currentScore < bestScore * 1.3) return sh.target;
    return best;
  }

  private respawn() {
    const { time, width: W, height: H } = this;
    const due: Fish[] = [];
    for (const f of this.fish) if (!f.alive && f.respawnAt <= time) due.push(f);
    if (due.length === 0) return;
    if (due.length < 6 && time - this.lastSpawn < 9) return;
    this.lastSpawn = time;

    // A new school swims in from a random edge.
    const side = randInt(0, 3);
    const along = rand(0.15, 0.85);
    const x = side === 0 ? -20 : side === 1 ? W + 20 : along * W;
    const y = side === 2 ? -20 : side === 3 ? H + 20 : along * H;
    const inward = Math.atan2(H / 2 - y, W / 2 - x) + rand(-0.5, 0.5);
    const species = pickSpecies();
    const sp = SPECIES[species];
    const millDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    for (const f of due.slice(0, sp.schoolSize[1])) {
      f.alive = true;
      f.species = species;
      f.alarm = 0;
      f.turn = 0;
      f.millDir = millDir;
      f.x = x + rand(-1, 1) * this.perception;
      f.y = y + rand(-1, 1) * this.perception;
      f.vx = Math.cos(inward) * sp.cruise * 1.4;
      f.vy = Math.sin(inward) * sp.cruise * 1.4;
    }
  }
}
