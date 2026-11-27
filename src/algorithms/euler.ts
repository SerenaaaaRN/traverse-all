/**
 * Hierholzer's algorithm untuk membentuk sirkuit/lintasan Euler.
 * Referensi: cp-algorithms "Finding the Eulerian path in O(M)" dan
 * formulasi stack linear-time di NetworkX (networkx.algorithms.euler).
 * Kompleksitas O(M) amortized — setiap edge dikonsumsi tepat satu kali
 * dan entri yang sudah terpakai di-pop secara lazy.
 */
import type { PatrolGraph } from "@algorithms/types";
import { calculateDegrees, findOddNodes } from "./degrees";
import { isConnected } from "./connectivity";

export interface HierholzerEdge {
  source: string;
  target: string;
}

/** Membentuk sirkuit/lintasan Euler dari seluruh ruas yang diberikan. */
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

/** Status Eulerian dari sebuah graf berdasarkan derajat simpulnya. */
export type EulerStatus = "circuit" | "path" | "none";

/** Hasil klasifikasi sirkuit/lintasan Euler pada sebuah graf. */
export interface EulerClassification {
  status: EulerStatus;
  connected: boolean;
  oddNodes: string[];
  reason: string;
}

/**
 * Menentukan apakah graf memiliki sirkuit Euler, lintasan Euler, atau tidak
 * keduanya. Graf harus terhubung, memiliki ruas, dan tidak mengandung simpul
 * terisolasi. Kompleksitas O(V + M).
 */
export function classifyEuler(graph: PatrolGraph): EulerClassification {
  const oddNodes = findOddNodes(graph);
  const connected = isConnected(graph);
  const base = { connected, oddNodes };

  if (graph.nodes.length === 0) {
    return { ...base, status: "none", reason: "Graf kosong: tidak ada simpul." };
  }
  if (graph.edges.length === 0) {
    return {
      ...base,
      status: "none",
      reason: "Tidak ada ruas untuk dibentuk lintasan.",
    };
  }
  if (!connected) {
    return {
      ...base,
      status: "none",
      reason: "Graf tidak terhubung: seluruh ruas tidak dapat ditempuh.",
    };
  }
  const isolated = [...calculateDegrees(graph).values()].some(
    (degree) => degree.degree === 0,
  );
  if (isolated) {
    return {
      ...base,
      status: "none",
      reason: "Ada simpul terisolasi di dalam subgraf.",
    };
  }
  if (oddNodes.length === 0) {
    return {
      ...base,
      status: "circuit",
      reason: "Semua simpul berderajat genap dan graf terhubung.",
    };
  }
  if (oddNodes.length === 2) {
    return {
      ...base,
      status: "path",
      reason: "Tepat dua simpul berderajat ganjil: lintasan Euler terbuka.",
    };
  }
  return {
    ...base,
    status: "none",
    reason: `${oddNodes.length} simpul ganjil; sirkuit butuh 0 dan lintasan butuh 2.`,
  };
}
