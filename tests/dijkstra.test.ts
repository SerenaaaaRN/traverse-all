import { describe, expect, test } from "bun:test";
import type { TransitGraph } from "@algorithms/types";
import {
  buildDistanceMatrix,
  dijkstraShortestPath,
} from "@algorithms/dijkstra";

function makeGraph(
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

describe("dijkstraShortestPath", () => {
  test("source sama dengan target", () => {
    const graph = makeGraph(["A", "B"], [["A", "B", 3]]);
    const sp = dijkstraShortestPath(graph, "A", "A");
    expect(sp?.distanceKm).toBe(0);
    expect(sp?.path).toEqual(["A"]);
  });

  test("jalur langsung lebih pendek", () => {
    const graph = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 2],
        ["B", "C", 2],
        ["A", "C", 3],
      ],
    );
    const sp = dijkstraShortestPath(graph, "A", "C");
    expect(sp?.distanceKm).toBe(3);
    expect(sp?.path).toEqual(["A", "C"]);
  });

  test("jalur tidak langsung lebih pendek dari jalur langsung", () => {
    const graph = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 1],
        ["B", "C", 1],
        ["A", "C", 5],
      ],
    );
    const sp = dijkstraShortestPath(graph, "A", "C");
    expect(sp?.distanceKm).toBe(2);
    expect(sp?.path).toEqual(["A", "B", "C"]);
  });

  test("simetris pada graf undirected", () => {
    const graph = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 1],
        ["B", "C", 4],
      ],
    );
    const ab = dijkstraShortestPath(graph, "A", "B");
    const ba = dijkstraShortestPath(graph, "B", "A");
    expect(ab?.distanceKm).toBe(ba?.distanceKm);
  });

  test("target tidak reachable mengembalikan null", () => {
    const graph = makeGraph(["A", "B", "C"], [["A", "B", 1]]);
    const sp = dijkstraShortestPath(graph, "A", "C");
    expect(sp).toBeNull();
  });

  test("graf segitiga memilih kombinasi sisi terkecil", () => {
    const graph = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 5],
        ["B", "C", 2],
        ["A", "C", 1],
      ],
    );
    const sp = dijkstraShortestPath(graph, "A", "B");
    expect(sp?.distanceKm).toBe(3);
    expect(sp?.path).toEqual(["A", "C", "B"]);
  });
});

describe("buildDistanceMatrix", () => {
  test("mengisi semua pasangan berbeda", () => {
    const graph = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 1],
        ["B", "C", 2],
      ],
    );
    const matrix = buildDistanceMatrix(graph, ["A", "B", "C"]);
    expect(matrix.get("A")?.get("B")?.distanceKm).toBe(1);
    expect(matrix.get("A")?.get("C")?.distanceKm).toBe(3);
    expect(matrix.get("B")?.get("A")?.distanceKm).toBe(1);
    expect(matrix.get("B")?.get("C")?.distanceKm).toBe(2);
    expect(matrix.get("A")?.has("A")).toBe(false);
  });

  test("pasangan tidak reachable dihilangkan dari matrix", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 1],
        ["C", "D", 1],
      ],
    );
    const matrix = buildDistanceMatrix(graph, ["A", "C"]);
    expect(matrix.get("A")?.has("C")).toBe(false);
    expect(matrix.get("C")?.has("A")).toBe(false);
  });
});
