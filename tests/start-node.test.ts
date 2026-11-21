import { describe, expect, test } from "bun:test";
import { solveCPP } from "@algorithms/cpp";
import { patrolEdges } from "@data/edges";
import { patrolNodes } from "@data/nodes";

const graph = { nodes: patrolNodes, edges: patrolEdges };

describe("titik awal tour", () => {
  test("default tetap P74", () => {
    expect(solveCPP(graph).eulerCircuit?.at(0)).toBe("P74");
  });

  test("start kustom menggeser awal tour", () => {
    expect(solveCPP(graph, "P01").eulerCircuit?.at(0)).toBe("P01");
  });

  test("tour dengan start kustom tetap tertutup", () => {
    const result = solveCPP(graph, "P01");
    expect(result.eulerCircuit?.at(0)).toBe(result.eulerCircuit?.at(-1));
  });
});
