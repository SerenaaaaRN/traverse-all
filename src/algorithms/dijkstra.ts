import type { TransitGraph } from "@algorithms/types";

export interface ShortestPath {
  distanceKm: number;
  path: string[];
}

interface QueueItem {
  id: string;
  dist: number;
}

export function dijkstraShortestPath(
  graph: TransitGraph,
  source: string,
  target: string,
): ShortestPath | null {
  if (source === target) return { distanceKm: 0, path: [source] };

  const adjacency = new Map<string, Map<string, number>>();
  for (const node of graph.nodes) adjacency.set(node.id, new Map());
  for (const edge of graph.edges) {
    const s = adjacency.get(edge.source);
    if (s)
      s.set(
        edge.target,
        Math.min(s.get(edge.target) ?? Infinity, edge.weightKm),
      );
    const t = adjacency.get(edge.target);
    if (t)
      t.set(
        edge.source,
        Math.min(t.get(edge.source) ?? Infinity, edge.weightKm),
      );
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  dist.set(source, 0);

  while (visited.size < adjacency.size) {
    let best: QueueItem | null = null;
    for (const [id, d] of dist) {
      if (visited.has(id)) continue;
      if (best === null || d < best.dist) best = { id, dist: d };
    }
    if (best === null) break;
    visited.add(best.id);
    if (best.id === target) break;

    for (const [neighbor, w] of adjacency.get(best.id) ?? []) {
      if (visited.has(neighbor)) continue;
      const newDist = best.dist + w;
      if (newDist < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, newDist);
        prev.set(neighbor, best.id);
      }
    }
  }

  const finalDist = dist.get(target);
  if (finalDist === undefined) return null;

  const path: string[] = [target];
  let current: string | undefined = target;
  while (current !== undefined && current !== source) {
    current = prev.get(current);
    if (current !== undefined) path.unshift(current);
  }

  return { distanceKm: finalDist, path };
}

export function buildDistanceMatrix(
  graph: TransitGraph,
  nodeIds: string[],
): Map<string, Map<string, ShortestPath>> {
  const matrix = new Map<string, Map<string, ShortestPath>>();
  for (const u of nodeIds) {
    const row = new Map<string, ShortestPath>();
    for (const v of nodeIds) {
      if (u === v) continue;
      const sp = dijkstraShortestPath(graph, u, v);
      if (sp !== null) row.set(v, sp);
    }
    matrix.set(u, row);
  }
  return matrix;
}
