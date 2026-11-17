/**
 * Hierholzer's algorithm untuk membentuk sirkuit/lintasan Euler.
 * Referensi: cp-algorithms "Finding the Eulerian path in O(M)" dan
 * formulasi stack linear-time di NetworkX (networkx.algorithms.euler).
 * Kompleksitas O(M) amortized — setiap edge dikonsumsi tepat satu kali
 * dan entri yang sudah terpakai di-pop secara lazy.
 */
export interface HierholzerEdge {
  source: string;
  target: string;
}

export function hierholzer(
  nodeIds: string[],
  edges: HierholzerEdge[],
  startNode: string,
): string[] | null {
  const adjacency = new Map<string, number[]>();
  for (const id of nodeIds) adjacency.set(id, []);
  for (const [index, edge] of edges.entries()) {
    const forward = adjacency.get(edge.source);
    const backward = adjacency.get(edge.target);
    if (!forward || !backward) return null;
    forward.push(index);
    backward.push(index);
  }

  const startList = adjacency.get(startNode);
  if (!startList || startList.length === 0) return null;

  const used = new Set<number>();
  const circuit: string[] = [];
  const stack: string[] = [startNode];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (current === undefined) break;
    const list = adjacency.get(current);
    if (!list) {
      stack.pop();
      continue;
    }

    let lastIndex = list.length - 1;
    while (lastIndex >= 0) {
      const candidate = list[lastIndex];
      if (candidate === undefined || used.has(candidate)) list.pop();
      else break;
      lastIndex = list.length - 1;
    }

    const nextEdge = list[list.length - 1];
    if (nextEdge === undefined) {
      circuit.push(current);
      stack.pop();
      continue;
    }

    const edge = edges[nextEdge];
    if (!edge) return null;
    used.add(nextEdge);
    stack.push(edge.source === current ? edge.target : edge.source);
  }

  if (used.size !== edges.length) return null;

  circuit.reverse();
  return circuit;
}
