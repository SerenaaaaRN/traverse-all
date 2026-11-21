/**
 * Pipeline Chinese Postman Problem: cek precondition → odd nodes → matching
 * → duplikasi edge sepanjang path Dijkstra → Hierholzer untuk rute akhir.
 */
import type {
  CPPResult,
  MatchingStrategyResult,
  PatrolGraph,
  AugmentedEdge,
} from "@algorithms/types";
import { calculateDegrees } from "./degrees";
import { buildDistanceMatrix } from "./dijkstra";
import { findGreedyMatching } from "./matching";
import { hierholzer } from "./euler";
import { isConnected } from "./connectivity";

const TOUR_START = "P74";

function augmentedEdgesAlongPath(
  graph: PatrolGraph,
  path: string[],
): { edges: AugmentedEdge[]; pairs: Array<{ source: string; target: string }>; cost: number } {
  const edges: AugmentedEdge[] = [];
  const pairs: Array<{ source: string; target: string }> = [];
  let cost = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    if (from === undefined || to === undefined) continue;
    const weights = graph.edges
      .filter(
        (e) =>
          (e.source === from && e.target === to) ||
          (e.source === to && e.target === from),
      )
      .map((e) => e.weightKm);
    const weight = weights.length > 0 ? Math.min(...weights) : 0;
    edges.push({ source: from, target: to, weightKm: weight, augmented: true });
    pairs.push({ source: from, target: to });
    cost += weight;
  }

  return { edges, pairs, cost };
}

/**
 * Menyelesaikan CPP pada graf undirected. Melempar Error untuk graf kosong
 * atau disconnected — precondition yang sama dengan NetworkX.
 */
export function solveCPP(graph: PatrolGraph, startNode?: string): CPPResult {
  const tourStart =
    startNode ??
    (graph.nodes.some((n) => n.id === TOUR_START) ? TOUR_START : undefined);

  if (graph.nodes.length === 0) {
    throw new Error("Graf kosong: tidak ada simpul untuk dianalisis.");
  }
  if (!isConnected(graph)) {
    throw new Error(
      "Graf tidak connected: CPP membutuhkan seluruh ruas saling terjangkau.",
    );
  }

  const degrees = calculateDegrees(graph);
  const oddNodes = Array.from(degrees.values())
    .filter((d) => d.isOdd)
    .map((d) => d.nodeId);

  const baseWeight = graph.edges.reduce((sum, e) => sum + e.weightKm, 0);
  const strategies: MatchingStrategyResult[] = [];

  if (oddNodes.length === 0) {
    const circuit = hierholzer(
      graph.nodes.map((n) => n.id),
      graph.edges,
      tourStart ?? graph.nodes[0]?.id ?? "",
    );
    return {
      hasEulerCircuit: circuit !== null,
      hasEulerPath: circuit !== null,
      oddNodes: [],
      augmentedEdges: [],
      eulerCircuit: circuit,
      totalInspectionDistanceKm: baseWeight,
      baseDistanceKm: baseWeight,
      augmentationCostKm: 0,
      strategies,
    };
  }

  if (oddNodes.length === 2) {
    const circuit = hierholzer(
      graph.nodes.map((n) => n.id),
      graph.edges,
      oddNodes[0] ?? "",
    );
    return {
      hasEulerCircuit: false,
      hasEulerPath: circuit !== null,
      oddNodes,
      augmentedEdges: [],
      eulerCircuit: circuit,
      totalInspectionDistanceKm: baseWeight,
      baseDistanceKm: baseWeight,
      augmentationCostKm: 0,
      strategies,
    };
  }

  const matrix = buildDistanceMatrix(graph, oddNodes);
  const chosen = findGreedyMatching(oddNodes, matrix);
  strategies.push(chosen);
  if (chosen.pairs.length === 0) {
    return {
      hasEulerCircuit: false,
      hasEulerPath: false,
      oddNodes,
      augmentedEdges: [],
      eulerCircuit: null,
      totalInspectionDistanceKm: baseWeight,
      baseDistanceKm: baseWeight,
      augmentationCostKm: 0,
      strategies,
    };
  }

  const augmentedEdges: AugmentedEdge[] = [];
  const augmentedPairs: Array<{ source: string; target: string }> = [];
  let augmentationCost = 0;

  for (const pair of chosen.pairs) {
    const path = chosen.paths.get(
      pair.u < pair.v ? `${pair.u}|${pair.v}` : `${pair.v}|${pair.u}`,
    );
    if (!path) continue;
    const alongPath = augmentedEdgesAlongPath(graph, path);
    augmentedEdges.push(...alongPath.edges);
    augmentedPairs.push(...alongPath.pairs);
    augmentationCost += alongPath.cost;
  }

  const finalCircuit = hierholzer(
    graph.nodes.map((n) => n.id),
    [...graph.edges, ...augmentedPairs],
    tourStart ?? oddNodes[0] ?? graph.nodes[0]?.id ?? "",
  );

  return {
    hasEulerCircuit: false,
    hasEulerPath: false,
    oddNodes,
    augmentedEdges,
    eulerCircuit: finalCircuit,
    totalInspectionDistanceKm: baseWeight + augmentationCost,
    baseDistanceKm: baseWeight,
    augmentationCostKm: augmentationCost,
    strategies,
  };
}
