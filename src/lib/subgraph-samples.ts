import type { PatrolGraph } from "@algorithms/types";
import { classifyEuler, type EulerStatus } from "@algorithms/euler";

interface SampleCache {
  signature: string;
  circuit: string[][];
  path: string[][];
  none: string[][];
}

const MAX_NODES = 6;
const lastPick: Partial<Record<EulerStatus, string>> = {};
let cache: SampleCache | null = null;

function keyOf(ids: string[]): string {
  return [...ids].sort().join("|");
}

function isValid(graph: PatrolGraph, ids: string[], status: EulerStatus): boolean {
  const selected = new Set(ids);
  const subgraph: PatrolGraph = {
    nodes: graph.nodes.filter((node) => selected.has(node.id)),
    edges: graph.edges.filter(
      (edge) => selected.has(edge.source) && selected.has(edge.target),
    ),
  };
  return classifyEuler(subgraph).status === status;
}

function buildCache(graph: PatrolGraph): SampleCache {
  const adjacency = new Map<string, Set<string>>();
  for (const node of graph.nodes) adjacency.set(node.id, new Set());
  for (const edge of graph.edges) {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  const circuits = new Map<string, string[]>();
  const paths = new Map<string, string[]>();

  function walk(start: string, current: string, seen: string[]): void {
    if (seen.length > MAX_NODES) return;
    for (const next of adjacency.get(current) ?? []) {
      if (next === start) {
        if (
          seen.length >= 3 &&
          !circuits.has(keyOf(seen)) &&
          isValid(graph, seen, "circuit")
        ) {
          circuits.set(keyOf(seen), [...seen]);
        }
        continue;
      }
      if (next < start || seen.includes(next)) continue;
      const candidate = [...seen, next];
      if (
        candidate.length >= 3 &&
        !paths.has(keyOf(candidate)) &&
        isValid(graph, candidate, "path")
      ) {
        paths.set(keyOf(candidate), candidate);
      }
      walk(start, next, candidate);
    }
  }

  for (const node of graph.nodes) walk(node.id, node.id, [node.id]);

  const none = new Map<string, string[]>();
  for (let attempt = 0; attempt < 200; attempt++) {
    const first = graph.nodes[Math.floor(Math.random() * graph.nodes.length)];
    if (!first) continue;
    const chosen = [first.id];
    const target = 4 + Math.floor(Math.random() * 9);
    while (chosen.length < target) {
      const frontier = new Set<string>();
      for (const id of chosen) {
        for (const neighbor of adjacency.get(id) ?? []) {
          if (!chosen.includes(neighbor)) frontier.add(neighbor);
        }
      }
      const options = [...frontier];
      if (options.length === 0) break;
      const next = options[Math.floor(Math.random() * options.length)];
      if (next === undefined) break;
      chosen.push(next);
    }
    if (isValid(graph, chosen, "none")) none.set(keyOf(chosen), chosen);
  }

  return {
    signature: `${graph.nodes.length}|${graph.edges.length}`,
    circuit: [...circuits.values()],
    path: [...paths.values()],
    none: [...none.values()],
  };
}

function pick(graph: PatrolGraph, status: EulerStatus): string[] {
  const signature = `${graph.nodes.length}|${graph.edges.length}`;
  if (cache?.signature !== signature) cache = buildCache(graph);
  const options = cache[status];
  if (options.length === 0) return FALLBACK[status];

  let chosen = options[Math.floor(Math.random() * options.length)]!;
  for (let attempt = 0; attempt < 10 && options.length > 1; attempt++) {
    if (keyOf(chosen) !== lastPick[status]) break;
    chosen = options[Math.floor(Math.random() * options.length)]!;
  }
  lastPick[status] = keyOf(chosen);
  return [...chosen];
}

const FALLBACK: Record<EulerStatus, string[]> = {
  circuit: ["P02", "P03", "P06", "P07"],
  path: ["P01", "P02", "P03"],
  none: Array.from({ length: 12 }, (_, i) => `P${String(i + 1).padStart(2, "0")}`).concat([
    "P19",
    "P20",
    "P21",
  ]),
};

/** Mengambil contoh subgraf bersirkuit Euler secara acak. */
export function randomCircuitSample(graph: PatrolGraph): string[] {
  return pick(graph, "circuit");
}

/** Mengambil contoh subgraf berlintasan Euler secara acak. */
export function randomPathSample(graph: PatrolGraph): string[] {
  return pick(graph, "path");
}

/** Mengambil contoh subgraf bukan Eulerian secara acak. */
export function randomNonEulerSample(graph: PatrolGraph): string[] {
  return pick(graph, "none");
}
