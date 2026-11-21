import { describe, expect, test } from "bun:test";
import { solveCPP } from "@algorithms/cpp";
import { makeGraph } from "./helpers";

describe("solveCPP", () => {
  test("graf kosong melempar error", () => {
    expect(() => solveCPP(makeGraph([], []))).toThrow(/kosong/);
  });

  test("graf disconnected melempar error", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 1],
        ["C", "D", 1],
      ],
    );
    expect(() => solveCPP(graph)).toThrow(/connected/);
  });

  test("isolated vertex tetap valid", () => {
    const graph = makeGraph(
      ["A", "B", "ISOLATED"],
      [
        ["A", "B", 2],
        ["B", "A", 2],
      ],
    );
    const result = solveCPP(graph);
    expect(result.hasEulerCircuit).toBe(true);
  });

  test("circuit C4: semua genap, tanpa augmentasi", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 1],
        ["B", "C", 1],
        ["C", "D", 1],
        ["D", "A", 1],
      ],
    );
    const result = solveCPP(graph);
    expect(result.hasEulerCircuit).toBe(true);
    expect(result.oddNodes).toEqual([]);
    expect(result.augmentationCostKm).toBe(0);
    expect(result.totalInspectionDistanceKm).toBe(4);
    expect(result.eulerCircuit?.at(-1)).toBe(result.eulerCircuit?.[0]);
  });

  test("dua odd node: lintasan Euler, augmentasi 0", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 2],
        ["B", "C", 3],
        ["C", "A", 5],
        ["C", "D", 1],
        ["D", "A", 1],
      ],
    );
    const result = solveCPP(graph);
    expect(result.hasEulerCircuit).toBe(false);
    expect(result.hasEulerPath).toBe(true);
    expect(result.oddNodes).toEqual(["A", "C"]);
    expect(result.augmentedEdges).toEqual([]);
    expect(result.totalInspectionDistanceKm).toBe(12);
  });

  test("empat odd node: augmentasi sepanjang path Dijkstra", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E", "F", "G", "H"],
      [
        ["A", "E", 1],
        ["B", "E", 2],
        ["C", "F", 3],
        ["D", "F", 4],
        ["E", "F", 1],
        ["E", "G", 1],
        ["F", "H", 1],
        ["G", "H", 1],
      ],
    );
    const result = solveCPP(graph);
    expect(result.oddNodes).toEqual(["A", "B", "C", "D"]);
    expect(result.augmentationCostKm).toBeGreaterThan(0);
    expect(result.augmentedEdges.every((e) => e.augmented)).toBe(true);
    expect(result.totalInspectionDistanceKm).toBe(
      result.baseDistanceKm + result.augmentationCostKm,
    );
    expect(result.eulerCircuit).not.toBeNull();
    expect(result.eulerCircuit?.at(-1)).toBe(result.eulerCircuit?.[0]);
  });

  test("strategi pasangan terdekat tercatat di hasil", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E", "F", "G", "H"],
      [
        ["A", "E", 1],
        ["B", "E", 2],
        ["C", "F", 3],
        ["D", "F", 4],
        ["E", "F", 1],
        ["E", "G", 1],
        ["F", "H", 1],
        ["G", "H", 1],
      ],
    );
    const result = solveCPP(graph);
    const greedy = result.strategies.find((s) => s.strategy === "greedy");
    expect(greedy?.totalCostKm).toBe(result.augmentationCostKm);
  });

  test("rute akhir valid: setiap edge asli dipakai sesuai frekuensinya", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D", "E", "F", "G", "H"],
      [
        ["A", "E", 1],
        ["B", "E", 2],
        ["C", "F", 3],
        ["D", "F", 4],
        ["E", "F", 1],
        ["E", "G", 1],
        ["F", "H", 1],
        ["G", "H", 1],
      ],
    );
    const result = solveCPP(graph);
    const walk = result.eulerCircuit!;
    const traversed = new Map<string, number>();
    for (let i = 0; i < walk.length - 1; i++) {
      const key = [walk[i], walk[i + 1]].sort().join("|");
      traversed.set(key, (traversed.get(key) ?? 0) + 1);
    }
    const expected = new Map<string, number>();
    for (const e of graph.edges) {
      const key = [e.source, e.target].sort().join("|");
      expected.set(key, (expected.get(key) ?? 0) + 1);
    }
    for (const e of result.augmentedEdges) {
      const key = [e.source, e.target].sort().join("|");
      expected.set(key, (expected.get(key) ?? 0) + 1);
    }
    for (const [key, count] of expected) {
      expect(traversed.get(key)).toBe(count);
    }
  });
});
