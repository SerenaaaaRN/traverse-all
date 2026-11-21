import type { PatrolGraph } from "@algorithms/types";
import { buildDistanceMatrix } from "@algorithms/dijkstra";
import type { DistanceMatrix } from "@algorithms/matching";

export function makeGraph(
  nodeIds: string[],
  edgeDefs: Array<[string, string, number]>,
): PatrolGraph {
  return {
    nodes: nodeIds.map((id, index) => ({
      id,
      label: id,
      lat: index,
      lng: 0,
    })),
    edges: edgeDefs.map(([source, target, weightKm]) => ({
      source,
      target,
      weightKm,
    })),
  };
}

export function matrixFromGraph(
  graph: PatrolGraph,
  nodeIds: string[],
): DistanceMatrix {
  return buildDistanceMatrix(graph, nodeIds);
}
