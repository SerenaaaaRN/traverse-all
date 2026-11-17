import type { MatchingStrategyResult } from "@algorithms/types";
import type { ShortestPath } from "./dijkstra";

export type DistanceMatrix = Map<string, Map<string, ShortestPath>>;

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
			if (u !== v && !matrix.get(u)?.get(v)) return emptyResult("brute-force", false);
		}
	}

	let bestCost = Infinity;
	let bestPairs: Array<{ u: string; v: string; costKm: number }> = [];
	let bestPaths: Map<string, string[]> = new Map();

	const permute = (remaining: string[], acc: Array<{ u: string; v: string; costKm: number }>, accCost: number, accPaths: Map<string, string[]>) => {
		if (accCost >= bestCost) return;
		if (remaining.length === 0) {
			bestCost = accCost;
			bestPairs = acc;
			bestPaths = accPaths;
			return;
		}
		const [first] = remaining;
		if (first === undefined) return;
		for (let i = 1; i < remaining.length; i++) {
			const partner = remaining[i];
			if (partner === undefined) continue;
			const sp = matrix.get(first)?.get(partner);
			if (!sp) continue;
			permute(
				remaining.filter((_, idx) => idx !== i && _ !== first),
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

export function findGreedyMatching(
	oddNodes: string[],
	matrix: DistanceMatrix,
): MatchingStrategyResult {
	if (oddNodes.length === 0) return emptyResult("greedy", true);
	if (oddNodes.length % 2 !== 0) return emptyResult("greedy", false);

	const candidates: Array<{ u: string; v: string; costKm: number; path: string[] }> = [];
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

	for (const c of candidates) {
		if (used.has(c.u) || used.has(c.v)) continue;
		used.add(c.u);
		used.add(c.v);
		pairs.push({ u: c.u, v: c.v, costKm: c.costKm });
		paths.set(pairKey(c.u, c.v), c.path);
		total += c.costKm;
		if (used.size === oddNodes.length) break;
	}

	return { strategy: "greedy", pairs, totalCostKm: total, executed: true, paths };
}
