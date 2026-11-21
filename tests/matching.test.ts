import { describe, expect, test } from "bun:test";
import { findGreedyMatching } from "@algorithms/matching";
import { makeGraph, matrixFromGraph } from "./helpers";

describe("findGreedyMatching (pasangan terdekat)", () => {
  test("odd nodes kosong", () => {
    const result = findGreedyMatching([], new Map());
    expect(result.executed).toBe(true);
    expect(result.pairs).toEqual([]);
  });

  test("jumlah odd ganjil tidak dieksekusi", () => {
    const result = findGreedyMatching(["A", "B", "C"], new Map());
    expect(result.executed).toBe(false);
  });

  test("menghasilkan pairing valid", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E"],
      [
        ["A", "E", 1],
        ["B", "E", 2],
        ["C", "E", 3],
        ["D", "E", 4],
      ],
    );
    const oddNodes = ["A", "B", "C", "D"];
    const result = findGreedyMatching(oddNodes, matrixFromGraph(graph, oddNodes));

    expect(result.pairs).toHaveLength(2);
    const used = new Set<string>();
    for (const p of result.pairs) {
      expect(used.has(p.u)).toBe(false);
      expect(used.has(p.v)).toBe(false);
      used.add(p.u);
      used.add(p.v);
    }
    expect(used.size).toBe(4);
  });

  test("memilih kandidat termurah lebih dulu (known answer)", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 1],
        ["C", "D", 1],
        ["A", "C", 10],
        ["B", "D", 10],
        ["A", "D", 2],
        ["B", "C", 2],
      ],
    );
    const oddNodes = ["A", "B", "C", "D"];
    const result = findGreedyMatching(oddNodes, matrixFromGraph(graph, oddNodes));
    expect(result.totalCostKm).toBe(2);
  });

  test("mengembalikan path Dijkstra untuk setiap pasangan", () => {
    const graph = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 1],
        ["B", "C", 1],
      ],
    );
    const result = findGreedyMatching(["A", "C"], matrixFromGraph(graph, ["A", "C"]));
    expect(result.paths.get("A|C")).toEqual(["A", "B", "C"]);
  });
});
