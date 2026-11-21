import { describe, expect, test } from "bun:test";
import { findRouteThroughStops } from "@algorithms/route";
import { makeGraph } from "./helpers";

const graph = makeGraph(
  ["A", "B", "C", "D", "E"],
  [
    ["A", "B", 1],
    ["B", "C", 1],
    ["C", "D", 1],
    ["A", "E", 4],
    ["E", "D", 4],
    ["B", "D", 10],
  ],
);

describe("findRouteThroughStops", () => {
  test("menolak kurang dari dua titik", () => {
    expect(findRouteThroughStops(graph, ["A"])).toBeNull();
    expect(findRouteThroughStops(graph, [])).toBeNull();
  });

  test("rute langsung A ke D memakai jalur terpendek", () => {
    const result = findRouteThroughStops(graph, ["A", "D"]);
    expect(result).not.toBeNull();
    expect(result?.path).toEqual(["A", "B", "C", "D"]);
    expect(result?.totalDistanceKm).toBe(3);
    expect(result?.segments.length).toBe(1);
  });

  test("rute lewat waypoint menggabungkan path tanpa node dobel", () => {
    const result = findRouteThroughStops(graph, ["A", "B", "D"]);
    expect(result).not.toBeNull();
    expect(result?.path).toEqual(["A", "B", "C", "D"]);
    expect(result?.totalDistanceKm).toBe(3);
    expect(result?.segments.length).toBe(2);
  });

  test("waypoint mengubah rute dibanding jalur langsung", () => {
    const direct = findRouteThroughStops(graph, ["A", "D"]);
    const viaE = findRouteThroughStops(graph, ["A", "E", "D"]);
    expect(viaE?.path).toEqual(["A", "E", "D"]);
    expect(viaE?.totalDistanceKm).toBe(8);
    expect(viaE?.totalDistanceKm).toBeGreaterThan(direct!.totalDistanceKm);
  });

  test("mengembalikan null untuk titik di luar graf", () => {
    expect(findRouteThroughStops(graph, ["A", "Z"])).toBeNull();
  });

  test("titik asal sama dengan tujuan menghasilkan path tunggal", () => {
    const result = findRouteThroughStops(graph, ["A", "A"]);
    expect(result?.path).toEqual(["A"]);
    expect(result?.totalDistanceKm).toBe(0);
  });
});
