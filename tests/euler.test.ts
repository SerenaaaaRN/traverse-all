import { describe, expect, test } from "bun:test";
import { classifyEuler, hierholzer } from "@algorithms/euler";
import { isConnected } from "@algorithms/connectivity";
import { patrolNodes } from "@data/nodes";
import { patrolEdges } from "@data/edges";
import {
  randomCircuitSample,
  randomNonEulerSample,
  randomPathSample,
} from "@lib/subgraph-samples";
import { makeGraph } from "./helpers";

describe("hierholzer", () => {
  test("sirkuit Euler pada graf cincin C4", () => {
    const edges = [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
      { source: "C", target: "D" },
      { source: "D", target: "A" },
    ];
    const circuit = hierholzer(["A", "B", "C", "D"], edges, "A");
    expect(circuit).not.toBeNull();
    expect(circuit?.[0]).toBe("A");
    expect(circuit?.at(-1)).toBe("A");
    expect(circuit?.length).toBe(5);
  });

  test("semua edge dipakai tepat satu kali", () => {
    const edges = [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
      { source: "C", target: "A" },
      { source: "C", target: "D" },
      { source: "D", target: "A" },
    ];
    const walk = hierholzer(["A", "B", "C", "D"], edges, "A");
    expect(walk).not.toBeNull();
    const traversed = new Set(
      walk!.slice(0, -1).map((node, i) => {
        const next = walk![i + 1];
        return [node, next].sort().join("|");
      }),
    );
    expect(traversed.size).toBe(edges.length);
  });

  test("lintasan Euler terbuka mulai dari node ganjil", () => {
    const edges = [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
      { source: "C", target: "A" },
      { source: "C", target: "D" },
      { source: "D", target: "A" },
    ];
    const walk = hierholzer(["A", "B", "C", "D"], edges, "A");
    expect(walk).not.toBeNull();
    expect(walk?.[0]).toBe("A");
    expect(walk?.at(-1)).toBe("C");
  });

  test("multigraph dengan edge paralel", () => {
    const edges = [
      { source: "A", target: "B" },
      { source: "A", target: "B" },
      { source: "B", target: "A" },
    ];
    const walk = hierholzer(["A", "B"], edges, "A");
    expect(walk).not.toBeNull();
    expect(walk?.length).toBe(4);
  });

  test("self-loop diperhitungkan", () => {
    const edges = [
      { source: "A", target: "B" },
      { source: "B", target: "B" },
      { source: "B", target: "A" },
    ];
    const walk = hierholzer(["A", "B"], edges, "A");
    expect(walk).not.toBeNull();
    expect(walk?.length).toBe(4);
  });

  test("start node tidak ada mengembalikan null", () => {
    const edges = [{ source: "A", target: "B" }];
    expect(hierholzer(["A", "B"], edges, "Z")).toBeNull();
  });

  test("graf disconnected mengembalikan null", () => {
    const edges = [
      { source: "A", target: "B" },
      { source: "C", target: "D" },
    ];
    expect(hierholzer(["A", "B", "C", "D"], edges, "A")).toBeNull();
  });

  test("node edge tidak dikenal mengembalikan null", () => {
    const edges = [{ source: "A", target: "X" }];
    expect(hierholzer(["A", "B"], edges, "A")).toBeNull();
  });
});

describe("isConnected", () => {
  test("graf terhubung", () => {
    const graph = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 1],
        ["B", "C", 1],
      ],
    );
    expect(isConnected(graph)).toBe(true);
  });

  test("graf terputus menjadi dua komponen", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 1],
        ["C", "D", 1],
      ],
    );
    expect(isConnected(graph)).toBe(false);
  });

  test("isolated vertex diabaikan sesuai konvensi NetworkX", () => {
    const graph = makeGraph(["A", "B", "ISOLATED"], [["A", "B", 1]]);
    expect(isConnected(graph)).toBe(true);
  });

  test("graf tanpa edge dianggap connected", () => {
    const graph = makeGraph(["A", "B"], []);
    expect(isConnected(graph)).toBe(true);
  });
});

describe("classifyEuler", () => {
  test("cincin C4 menghasilkan sirkuit Euler", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 1],
        ["B", "C", 1],
        ["C", "D", 1],
        ["D", "A", 1],
      ],
    );
    const result = classifyEuler(graph);
    expect(result.status).toBe("circuit");
    expect(result.oddNodes).toEqual([]);
    expect(result.connected).toBe(true);
  });

  test("lintasan A-B-C menghasilkan lintasan Euler", () => {
    const graph = makeGraph(
      ["A", "B", "C"],
      [
        ["A", "B", 1],
        ["B", "C", 1],
      ],
    );
    const result = classifyEuler(graph);
    expect(result.status).toBe("path");
    expect(result.oddNodes).toEqual(["A", "C"]);
  });

  test("bintang K1,3 dengan empat simpul ganjil bukan Eulerian", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 1],
        ["A", "C", 1],
        ["A", "D", 1],
      ],
    );
    const result = classifyEuler(graph);
    expect(result.status).toBe("none");
    expect(result.oddNodes.length).toBe(4);
  });

  test("graf terputus bukan Eulerian meski dua simpul ganjil", () => {
    const graph = makeGraph(
      ["A", "B", "C", "D"],
      [
        ["A", "B", 1],
        ["C", "D", 1],
      ],
    );
    const result = classifyEuler(graph);
    expect(result.status).toBe("none");
    expect(result.connected).toBe(false);
  });

  test("graf tanpa ruas dan graf dengan simpul terisolasi bukan Eulerian", () => {
    expect(classifyEuler(makeGraph(["A", "B"], [])).status).toBe("none");
    expect(
      classifyEuler(makeGraph(["A", "B", "ISO"], [["A", "B", 1]])).status,
    ).toBe("none");
  });

  test("graf kosong bukan Eulerian", () => {
    expect(classifyEuler(makeGraph([], [])).status).toBe("none");
  });

  test("jaringan patroli penuh memiliki 40 simpul ganjil", () => {
    const result = classifyEuler({ nodes: patrolNodes, edges: patrolEdges });
    expect(result.status).toBe("none");
    expect(result.oddNodes.length).toBe(40);
    expect(result.connected).toBe(true);
  });
});

describe("contoh subgraf acak", () => {
  const graph = { nodes: patrolNodes, edges: patrolEdges };

  function assertSample(ids: string[], status: "circuit" | "path" | "none"): void {
    const selected = new Set(ids);
    expect(selected.size).toBeGreaterThan(0);
    const subgraph = {
      nodes: graph.nodes.filter((node) => selected.has(node.id)),
      edges: graph.edges.filter(
        (edge) => selected.has(edge.source) && selected.has(edge.target),
      ),
    };
    expect(classifyEuler(subgraph).status).toBe(status);
  }

  test("contoh sirkuit selalu valid", () => {
    for (let i = 0; i < 20; i++) assertSample(randomCircuitSample(graph), "circuit");
  });

  test("contoh lintasan selalu valid", () => {
    for (let i = 0; i < 20; i++) assertSample(randomPathSample(graph), "path");
  });

  test("contoh bukan Eulerian selalu valid", () => {
    for (let i = 0; i < 20; i++) assertSample(randomNonEulerSample(graph), "none");
  });

  test("klik berulang menghasilkan lebih dari satu contoh", () => {
    const samples = new Set<string>();
    for (let i = 0; i < 20; i++) {
      samples.add(randomPathSample(graph).sort().join("|"));
    }
    expect(samples.size).toBeGreaterThan(1);
  });
});
