import { describe, expect, test } from "bun:test";
import { hierholzer } from "@algorithms/euler";
import { isConnected } from "@algorithms/connectivity";
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
