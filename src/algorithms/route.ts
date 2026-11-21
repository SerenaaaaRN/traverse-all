import type { PatrolGraph } from "@algorithms/types";
import { dijkstraShortestPath, type ShortestPath } from "@algorithms/dijkstra";

/** Rute terpendek melalui seluruh waypoint beserta segmennya. */
export interface RouteResult {
  stops: string[];
  segments: ShortestPath[];
  path: string[];
  totalDistanceKm: number;
}

/** Merangkai Dijkstra antar waypoint menjadi satu rute utuh. */
export function findRouteThroughStops(
  graph: PatrolGraph,
  stops: string[],
): RouteResult | null {
  if (stops.length < 2) return null;

  const segments: ShortestPath[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    if (from === undefined || to === undefined) return null;
    const segment = dijkstraShortestPath(graph, from, to);
    if (segment === null) return null;
    segments.push(segment);
  }

  const path: string[] = [];
  for (const segment of segments) {
    for (const id of segment.path) {
      if (path.length === 0 || path[path.length - 1] !== id) path.push(id);
    }
  }

  return {
    stops: [...stops],
    segments,
    path,
    totalDistanceKm: segments.reduce((sum, s) => sum + s.distanceKm, 0),
  };
}
