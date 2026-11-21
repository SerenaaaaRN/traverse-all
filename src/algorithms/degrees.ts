import type { PatrolGraph, DegreeInfo } from "@algorithms/types";

/** Derajat simpul untuk graf undirected (setiap edge menyumbang ke dua ujung). */
export function calculateDegrees(graph: PatrolGraph): Map<string, DegreeInfo> {
  const counts = new Map<string, number>();
  for (const node of graph.nodes) counts.set(node.id, 0);

  for (const edge of graph.edges) {
    if (edge.source === edge.target) {
      counts.set(edge.source, (counts.get(edge.source) ?? 0) + 2);
      continue;
    }
    counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
    counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
  }

  const result = new Map<string, DegreeInfo>();
  for (const [id, degree] of counts) {
    result.set(id, { nodeId: id, degree, isOdd: degree % 2 !== 0 });
  }
  return result;
}

/** Mengembalikan daftar id simpul berderajat ganjil. */
export function findOddNodes(graph: PatrolGraph): string[] {
  const degrees = calculateDegrees(graph);
  return Array.from(degrees.values())
    .filter((d) => d.isOdd)
    .map((d) => d.nodeId);
}
