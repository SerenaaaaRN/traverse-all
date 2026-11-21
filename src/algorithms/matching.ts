/**
 * Pasangan simpul ganjil dengan aturan "pasangan terdekat" (greedy nearest
 * neighbor): urutkan semua pasangan berdasarkan jarak Dijkstra, ambil yang
 * termurah dengan kedua ujung belum terpakai. Kompleksitas O(n² log n).
 */
import type { MatchingStrategyResult } from "@algorithms/types";
import type { ShortestPath } from "./dijkstra";
import { pairKey } from "@lib/pair-key";

/** Matriks jarak dan lintasan terpendek antar pasangan simpul ganjil. */
export type DistanceMatrix = Map<string, Map<string, ShortestPath>>;

/** Hasil matching kosong untuk jumlah simpul ganjil yang tidak valid. */
function emptyResult(executed: boolean): MatchingStrategyResult {
  return { strategy: "greedy", pairs: [], totalCostKm: 0, executed, paths: new Map() };
}

/** Memasangkan simpul ganjil dengan aturan pasangan terdekat. */
export function findGreedyMatching(
  oddNodes: string[],
  matrix: DistanceMatrix,
): MatchingStrategyResult {
  if (oddNodes.length === 0) return emptyResult(true);
  if (oddNodes.length % 2 !== 0) return emptyResult(false);

  const candidates: Array<{
    u: string;
    v: string;
    costKm: number;
    path: string[];
  }> = [];
  for (let i = 0; i < oddNodes.length; i++) {
    const u = oddNodes[i];
    if (u === undefined) continue;
    for (let j = i + 1; j < oddNodes.length; j++) {
      const v = oddNodes[j];
      if (v === undefined) continue;
      const sp = matrix.get(u)?.get(v);
      if (sp) candidates.push({ u, v, costKm: sp.distanceKm, path: sp.path });
    }
  }
  candidates.sort((a, b) => a.costKm - b.costKm);

  const used = new Set<string>();
  const pairs: Array<{ u: string; v: string; costKm: number }> = [];
  const paths = new Map<string, string[]>();
  let total = 0;

  for (const candidate of candidates) {
    if (used.has(candidate.u) || used.has(candidate.v)) continue;
    used.add(candidate.u);
    used.add(candidate.v);
    pairs.push({ u: candidate.u, v: candidate.v, costKm: candidate.costKm });
    paths.set(pairKey(candidate.u, candidate.v), candidate.path);
    total += candidate.costKm;
    if (used.size === oddNodes.length) break;
  }

  return { strategy: "greedy", pairs, totalCostKm: total, executed: true, paths };
}
