import { describe, expect, test } from "bun:test";
import { patrolNetwork } from "../src/data/index";
import { calculateDegrees } from "@algorithms/degrees";
import { isConnected } from "@algorithms/connectivity";
import { solveCPP } from "@algorithms/cpp";

describe("dataset jaringan kilang (nodes.json)", () => {
  test("metrik topologi sesuai laporan", () => {
    expect(patrolNetwork.nodes).toHaveLength(73);
    expect(patrolNetwork.edges).toHaveLength(112);
    expect(
      patrolNetwork.edges.reduce((sum, e) => sum + e.weightKm, 0),
    ).toBeCloseTo(18.645, 3);
    const degrees = calculateDegrees(patrolNetwork);
    expect([...degrees.values()].filter((d) => d.isOdd)).toHaveLength(38);
    expect(isConnected(patrolNetwork)).toBe(true);
    expect(patrolNetwork.edges.length - patrolNetwork.nodes.length + 1).toBe(40);
  });

  test("CPP dengan aturan pasangan terdekat sesuai laporan", () => {
    const result = solveCPP(patrolNetwork);
    expect(result.baseDistanceKm).toBeCloseTo(18.645, 3);
    expect(result.augmentationCostKm).toBeCloseTo(4.259, 3);
    expect(result.totalInspectionDistanceKm).toBeCloseTo(22.904, 3);
    expect(result.eulerCircuit).not.toBeNull();
    expect(result.augmentedEdges.every((e) => e.augmented)).toBe(true);
  });

  test("penghematan terhadap baseline duplikasi penuh", () => {
    const result = solveCPP(patrolNetwork);
    const baseline = 2 * result.baseDistanceKm;
    expect(baseline).toBeCloseTo(37.29, 2);
    const saving = ((baseline - result.totalInspectionDistanceKm) / baseline) * 100;
    expect(saving).toBeCloseTo(38.58, 1);
  });
});
