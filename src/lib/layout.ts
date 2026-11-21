import type { PatrolGraph } from "@algorithms/types";

export interface Point {
  x: number;
  y: number;
}

export type GraphLayout = Map<string, Point>;

export interface LayoutOptions {
  size?: number;
  iterations?: number;
  seed?: number;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function forceDirectedLayout(
  graph: PatrolGraph,
  options: LayoutOptions = {},
): GraphLayout {
  const size = options.size ?? 1000;
  const iterations = options.iterations ?? 300;
  const random = mulberry32(options.seed ?? 42);
  const ids = graph.nodes.map((n) => n.id);
  const n = ids.length;

  const result: GraphLayout = new Map();
  if (n === 0) return result;

  const center = size / 2;
  const radius = size * 0.38;
  const positions = new Map<string, Point>(
    ids.map((id, i) => {
      const angle = (Math.PI * 2 * i) / n;
      const jitter = (random() - 0.5) * radius * 0.08;
      const r = radius + jitter;
      return [
        id,
        { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r },
      ];
    }),
  );

  const k = Math.sqrt((size * size) / n);
  const validEdges = graph.edges.filter(
    (e) => positions.has(e.source) && positions.has(e.target),
  );

  let temperature = size * 0.1;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const displacement = new Map<string, Point>(
      ids.map((id) => [id, { x: 0, y: 0 }]),
    );

    for (let i = 0; i < n; i++) {
      const a = positions.get(ids[i]!)!;
      for (let j = i + 1; j < n; j++) {
        const b = positions.get(ids[j]!)!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy) || 0.01;
        const force = (k * k) / distance;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        displacement.get(ids[i]!)!.x += fx;
        displacement.get(ids[i]!)!.y += fy;
        displacement.get(ids[j]!)!.x -= fx;
        displacement.get(ids[j]!)!.y -= fy;
      }
    }

    for (const edge of validEdges) {
      const a = positions.get(edge.source)!;
      const b = positions.get(edge.target)!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy) || 0.01;
      const force = (distance * distance) / k;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      displacement.get(edge.source)!.x -= fx;
      displacement.get(edge.source)!.y -= fy;
      displacement.get(edge.target)!.x += fx;
      displacement.get(edge.target)!.y += fy;
    }

    for (const id of ids) {
      const point = positions.get(id)!;
      const disp = displacement.get(id)!;
      const length = Math.hypot(disp.x, disp.y);
      if (length > 0) {
        const limit = Math.min(length, temperature);
        point.x += (disp.x / length) * limit;
        point.y += (disp.y / length) * limit;
      }
      result.set(id, { x: point.x, y: point.y });
    }

    temperature *= 0.97;
  }

  const xs = ids.map((id) => result.get(id)!.x);
  const ys = ids.map((id) => result.get(id)!.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const pad = size * 0.04;
  const usable = size - pad * 2;

  for (const id of ids) {
    const point = result.get(id)!;
    result.set(id, {
      x: pad + ((point.x - minX) / spanX) * usable,
      y: pad + ((point.y - minY) / spanY) * usable,
    });
  }

  return result;
}
