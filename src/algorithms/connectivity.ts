import type { TransitGraph } from "@algorithms/types";

/**
 * Mengecek apakah bagian non-terisolasi dari graf undirected bersifat
 * connected, node berderajat 0 diabaikan,
 * sisanya harus saling terjangkau. Kompleksitas O(V + M) via BFS.
 */
export function isConnected(graph: TransitGraph): boolean {
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) adjacency.set(node.id, []);
  for (const edge of graph.edges) {
    if (edge.source === edge.target) continue;
    adjacency.get(edge.source)?.push(edge.target);
    adjacency.get(edge.target)?.push(edge.source);
  }

  const nonIsolated = new Set<string>();
  for (const edge of graph.edges) {
    nonIsolated.add(edge.source);
    nonIsolated.add(edge.target);
  }
  if (nonIsolated.size === 0) return true;

  const start = graph.nodes.find((n) => nonIsolated.has(n.id))?.id;
  if (start === undefined) return false;

  const visited = new Set<string>([start]);
  const queue: string[] = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  for (const id of nonIsolated) {
    if (!visited.has(id)) return false;
  }
  return true;
}
