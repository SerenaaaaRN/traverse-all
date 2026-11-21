import { describe, expect, test } from "bun:test";
import { forceDirectedLayout } from "@lib/layout";
import type { PatrolGraph } from "@algorithms/types";
import { patrolEdges } from "@data/edges";
import { patrolNodes } from "@data/nodes";
import { makeGraph } from "./helpers";

const realGraph: PatrolGraph = { nodes: patrolNodes, edges: patrolEdges };

describe("forceDirectedLayout", () => {
  test("deterministik untuk seed yang sama", () => {
    const a = forceDirectedLayout(realGraph, { seed: 7, iterations: 40 });
    const b = forceDirectedLayout(realGraph, { seed: 7, iterations: 40 });
    expect(a).toEqual(b);
  });

  test("seed berbeda menghasilkan posisi berbeda", () => {
    const a = forceDirectedLayout(realGraph, { seed: 1, iterations: 40 });
    const b = forceDirectedLayout(realGraph, { seed: 2, iterations: 40 });
    expect(a).not.toEqual(b);
  });

  test("setiap simpul asli mendapat posisi finite di dalam kotak", () => {
    const layout = forceDirectedLayout(realGraph, { size: 1000, iterations: 60 });
    expect(layout.size).toBe(realGraph.nodes.length);

    for (const point of layout.values()) {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(1000);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(1000);
    }
  });

  test("tidak ada dua simpul dengan posisi identik", () => {
    const layout = forceDirectedLayout(realGraph, { iterations: 80 });
    const keys = [...layout.values()].map((p) => `${p.x.toFixed(3)}|${p.y.toFixed(3)}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test("koordinat lat/lng tidak berpengaruh — hanya topologi yang dipakai", () => {
    const a = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 1],
        ["B", "C", 1],
      ],
    );
    const b: PatrolGraph = {
      nodes: a.nodes.map((node) => ({ ...node, lat: node.lat + 100, lng: node.lng - 50 })),
      edges: a.edges,
    };
    expect(forceDirectedLayout(a, { seed: 3 })).toEqual(forceDirectedLayout(b, { seed: 3 }));
  });

  test("graf kosong menghasilkan Map kosong", () => {
    expect(forceDirectedLayout(makeGraph([], []))).toEqual(new Map());
  });
});
