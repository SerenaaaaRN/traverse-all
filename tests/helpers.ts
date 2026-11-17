import type { TransitGraph } from "@algorithms/types";
import { buildDistanceMatrix } from "@algorithms/dijkstra";
import type { DistanceMatrix } from "@algorithms/matching";

export function makeGraph(
  nodeIds: string[],
  edgeDefs: Array<[string, string, number]>,
): TransitGraph {
  return {
    nodes: nodeIds.map((id) => ({
      id,
      label: id,
      x: 0,
      y: 0,
      type: "stop" as const,
      routeIds: ["X"],
    })),
    edges: edgeDefs.map(([source, target, weightKm]) => ({
      source,
      target,
      weightKm,
      isOneWay: false,
      routeId: "X",
    })),
  };
}

export function matrixFromGraph(
  graph: TransitGraph,
  nodeIds: string[],
): DistanceMatrix {
  return buildDistanceMatrix(graph, nodeIds);
}
