/**
 * Minimum weight matching antar odd nodes — dua strategi dengan interface
 * yang sama. Referensi pendekatan matching-in-eulerize: NetworkX
 * (networkx.algorithms.euler.eulerize, paper Edmonds & Johnson 1973).
 */
import type { MatchingStrategyResult } from "@algorithms/types";
import type { ShortestPath } from "./dijkstra";

export type DistanceMatrix = Map<string, Map<string, ShortestPath>>;

/** Batas jumlah odd nodes untuk brute force — di atas ini wajib greedy. */
export const BRUTE_FORCE_MAX_NODES = 10;

function pairKey(u: string, v: string): string {
  return u < v ? `${u}|${v}` : `${v}|${u}`;
}

function emptyResult(
  strategy: MatchingStrategyResult["strategy"],
  executed: boolean,
): MatchingStrategyResult {
  return { strategy, pairs: [], totalCostKm: 0, executed, paths: new Map() };
}

/**
 * Exact minimum weight perfect matching via rekursi pairing.
 * Kompleksitas O(n!!) — dijalankan hanya jika n <= 10; selain itu
 * result.executed bernilai false dan pemanggil harus fallback ke greedy.
 * Dilengkapi pruning: cabang dengan biaya >= kandidat terbaik dipangkas.
 */
export function findBruteForceMatching(
  oddNodes: string[],
  matrix: DistanceMatrix,
): MatchingStrategyResult {
  if (oddNodes.length === 0) return emptyResult("brute-force", true);
  if (oddNodes.length % 2 !== 0 || oddNodes.length > BRUTE_FORCE_MAX_NODES) {
    return emptyResult("brute-force", false);
  }

  for (const u of oddNodes) {
    for (const v of oddNodes) {
      if (u !== v && !matrix.get(u)?.get(v))
        return emptyResult("brute-force", false);
    }
  }

  let bestCost = Infinity;
  let bestPairs: Array<{ u: string; v: string; costKm: number }> = [];
  let bestPaths: Map<string, string[]> = new Map();

  const permute = (
    remaining: string[],
    acc: Array<{ u: string; v: string; costKm: number }>,
    accCost: number,
    accPaths: Map<string, string[]>,
  ) => {
    if (accCost >= bestCost) return;
    if (remaining.length === 0) {
      bestCost = accCost;
      bestPairs = acc;
      bestPaths = accPaths;
      return;
    }
    const first = remaining[0];
    if (first === undefined) return;
    for (let i = 1; i < remaining.length; i++) {
      const partner = remaining[i];
      if (partner === undefined) continue;
      const sp = matrix.get(first)?.get(partner);
      if (!sp) continue;
      permute(
        remaining.filter((node, idx) => idx !== i && node !== first),
        [...acc, { u: first, v: partner, costKm: sp.distanceKm }],
        accCost + sp.distanceKm,
        new Map(accPaths).set(pairKey(first, partner), sp.path),
      );
    }
  };

  permute(oddNodes, [], 0, new Map());
  return {
    strategy: "brute-force",
    pairs: bestPairs,
    totalCostKm: bestCost,
    executed: true,
    paths: bestPaths,
  };
}

/**
 * Greedy Nearest Neighbor matching: urutkan semua pasangan berdasarkan
 * cost, ambil termurah yang kedua ujungnya belum terpakai. Kompleksitas
 * O(n² log n). Bukan optimal — selisih vs brute force ditampilkan di
 * halaman /comparison.
 */
export function findGreedyMatching(
  oddNodes: string[],
  matrix: DistanceMatrix,
): MatchingStrategyResult {
  if (oddNodes.length === 0) return emptyResult("greedy", true);
  if (oddNodes.length % 2 !== 0) return emptyResult("greedy", false);

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

  return {
    strategy: "greedy",
    pairs,
    totalCostKm: total,
    executed: true,
    paths,
  };
}
