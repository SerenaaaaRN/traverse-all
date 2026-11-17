import { describe, expect, test } from "bun:test";
import type { TransitGraph } from "@algorithms/types";
import { calculateDegrees, findOddNodes } from "@algorithms/degrees";

function makeGraph(
	nodeIds: string[],
	edgeDefs: Array<[string, string, number]>,
): TransitGraph {
	return {
		nodes: nodeIds.map((id) => ({
			id,
			label: id,
			x: 0,
			y: 0,
			type: "stop" as const,
			routeIds: ["X"],
		})),
		edges: edgeDefs.map(([source, target, weightKm]) => ({
			source,
			target,
			weightKm,
			isOneWay: false,
			routeId: "X",
		})),
	};
}

describe("calculateDegrees", () => {
	test("graf kosong", () => {
		const graph = makeGraph([], []);
		const degrees = calculateDegrees(graph);
		expect(degrees.size).toBe(0);
	});

	test("node terisolasi berderajat 0", () => {
		const graph = makeGraph(["A", "B", "ISOLATED"], [["A", "B", 1]]);
		const degrees = calculateDegrees(graph);
		expect(degrees.get("ISOLATED")?.degree).toBe(0);
		expect(degrees.get("ISOLATED")?.isOdd).toBe(false);
	});

	test("derajat dasar", () => {
		const graph = makeGraph(["A", "B", "C"], [["A", "B", 1], ["B", "C", 1]]);
		const degrees = calculateDegrees(graph);
		expect(degrees.get("A")?.degree).toBe(1);
		expect(degrees.get("B")?.degree).toBe(2);
		expect(degrees.get("C")?.degree).toBe(1);
	});

	test("derajat berlaku untuk kedua arah edge", () => {
		const graph = makeGraph(["A", "B"], [["A", "B", 5]]);
		const degrees = calculateDegrees(graph);
		expect(degrees.get("A")?.degree).toBe(1);
		expect(degrees.get("B")?.degree).toBe(1);
	});

	test("self-loop menambah derajat 2", () => {
		const graph = makeGraph(["A", "B"], [["A", "A", 3], ["A", "B", 1]]);
		const degrees = calculateDegrees(graph);
		expect(degrees.get("A")?.degree).toBe(3);
		expect(degrees.get("A")?.isOdd).toBe(true);
	});

	test("multi-edge antara pasangan yang sama dihitung terpisah", () => {
		const graph = makeGraph(["A", "B"], [["A", "B", 1], ["A", "B", 2]]);
		const degrees = calculateDegrees(graph);
		expect(degrees.get("A")?.degree).toBe(2);
		expect(degrees.get("B")?.degree).toBe(2);
	});

	test("handshake lemma: jumlah total derajat = 2 kali jumlah edge", () => {
		const graph = makeGraph(
			["A", "B", "C", "D"],
			[["A", "B", 1], ["B", "C", 1], ["C", "D", 1], ["D", "A", 1], ["A", "C", 1]],
		);
		const degrees = calculateDegrees(graph);
		const totalDegree = Array.from(degrees.values()).reduce(
			(sum, d) => sum + d.degree,
			0,
		);
		expect(totalDegree).toBe(2 * graph.edges.length);
	});
});

describe("findOddNodes", () => {
	test("circuit genap tidak punya odd node", () => {
		const graph = makeGraph(
			["A", "B", "C", "D"],
			[["A", "B", 1], ["B", "C", 1], ["C", "D", 1], ["D", "A", 1]],
		);
		expect(findOddNodes(graph)).toEqual([]);
	});

	test("mengembalikan tepat dua odd node", () => {
		const graph = makeGraph(
			["A", "B", "C", "D"],
			[
				["A", "B", 1],
				["B", "C", 1],
				["C", "A", 1],
				["C", "D", 1],
				["D", "A", 1],
			],
		);
		const odd = findOddNodes(graph);
		expect(odd).toHaveLength(2);
		expect(odd).toContain("A");
		expect(odd).toContain("C");
	});

	test("graf edge tunggal punya dua odd node", () => {
		const graph = makeGraph(["A", "B"], [["A", "B", 1]]);
		expect(findOddNodes(graph)).toEqual(["A", "B"]);
	});

	test("jumlah odd node selalu genap", () => {
		const graph = makeGraph(
			["A", "B", "C", "D", "E"],
			[
				["A", "B", 1],
				["B", "C", 1],
				["C", "D", 1],
				["D", "E", 1],
				["E", "A", 1],
				["A", "C", 1],
				["B", "D", 1],
			],
		);
		const odd = findOddNodes(graph);
		expect(odd.length % 2).toBe(0);
	});
});
