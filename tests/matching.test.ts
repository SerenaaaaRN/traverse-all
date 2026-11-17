import { describe, expect, test } from "bun:test";
import {
	BRUTE_FORCE_MAX_NODES,
	findBruteForceMatching,
	findGreedyMatching,
} from "@algorithms/matching";
import { buildDistanceMatrix } from "@algorithms/dijkstra";
import { makeGraph, matrixFromGraph } from "./helpers";

describe("findBruteForceMatching", () => {
	test("odd nodes kosong", () => {
		const result = findBruteForceMatching([], new Map());
		expect(result.executed).toBe(true);
		expect(result.totalCostKm).toBe(0);
	});

	test("jumlah odd ganjil tidak dieksekusi", () => {
		const result = findBruteForceMatching(["A", "B", "C"], new Map());
		expect(result.executed).toBe(false);
	});

	test("melebihi batas brute force tidak dieksekusi", () => {
		const many = Array.from(
			{ length: BRUTE_FORCE_MAX_NODES + 2 },
			(_, i) => `N${i}`,
		);
		const result = findBruteForceMatching(many, new Map());
		expect(result.executed).toBe(false);
	});

	test("matching optimal untuk 4 odd nodes", () => {
		const graph = makeGraph(
			["A", "B", "C", "D", "E", "F"],
			[
				["A", "C", 1],
				["A", "D", 4],
				["B", "C", 2],
				["B", "D", 5],
				["C", "D", 1],
				["C", "E", 2],
				["D", "F", 2],
				["E", "F", 1],
			],
		);
		const oddNodes = ["A", "B", "C", "D"];
		const matrix = matrixFromGraph(graph, oddNodes);
		const result = findBruteForceMatching(oddNodes, matrix);

		const costs = result.pairs.map((p) => p.costKm);
		const manualOptimal = 1 + 2;
		expect(result.totalCostKm).toBeLessThanOrEqual(manualOptimal + 1e-9);
		expect(costs).toHaveLength(2);
	});

	test("mengembalikan path Dijkstra untuk setiap pasangan", () => {
		const graph = makeGraph(
			["A", "B", "C"],
			[
				["A", "B", 1],
				["B", "C", 1],
			],
		);
		const matrix = matrixFromGraph(graph, ["A", "C"]);
		const result = findBruteForceMatching(["A", "C"], matrix);
		const path = result.paths.get("A|C");
		expect(path).toEqual(["A", "B", "C"]);
	});

	test("pasangan unreachable tidak dieksekusi", () => {
		const graph = makeGraph(
			["A", "B", "C", "D"],
			[
				["A", "B", 1],
				["C", "D", 1],
			],
		);
		const matrix = matrixFromGraph(graph, ["A", "B", "C", "D"]);
		const result = findBruteForceMatching(["A", "B", "C", "D"], matrix);
		expect(result.executed).toBe(false);
	});
});

describe("findGreedyMatching", () => {
	test("odd nodes kosong", () => {
		const result = findGreedyMatching([], new Map());
		expect(result.executed).toBe(true);
	});

	test("greedy selalu menghasilkan pairing valid", () => {
		const graph = makeGraph(
			["A", "B", "C", "D", "E", "F", "G", "H"],
			[
				["A", "E", 1],
				["B", "F", 2],
				["C", "G", 3],
				["D", "H", 4],
			],
		);
		const oddNodes = ["A", "B", "C", "D"];
		const matrix = matrixFromGraph(graph, oddNodes);
		const result = findGreedyMatching(oddNodes, matrix);

		expect(result.pairs).toHaveLength(2);
		const used = new Set<string>();
		for (const p of result.pairs) {
			expect(used.has(p.u)).toBe(false);
			expect(used.has(p.v)).toBe(false);
			used.add(p.u);
			used.add(p.v);
		}
	});

	test("greedy memilih kandidat termurah lebih dulu", () => {
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
		const matrix = matrixFromGraph(graph, oddNodes);
		const result = findGreedyMatching(oddNodes, matrix);
		expect(result.totalCostKm).toBe(2);
	});

	test("greedy bisa suboptimal dibanding brute force", () => {
		const graph = makeGraph(
			["A", "B", "C", "D"],
			[
				["A", "B", 1],
				["A", "C", 1],
				["A", "D", 1],
				["B", "C", 1],
				["B", "D", 1],
				["C", "D", 1],
			],
		);
		const oddNodes = ["A", "B", "C", "D"];
		const matrix = matrixFromGraph(graph, oddNodes);
		const brute = findBruteForceMatching(oddNodes, matrix);
		const greedy = findGreedyMatching(oddNodes, matrix);
		expect(greedy.totalCostKm).toBeGreaterThanOrEqual(brute.totalCostKm);
	});
});
