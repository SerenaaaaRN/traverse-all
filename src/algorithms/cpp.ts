import type {
	CPPResult,
	MatchingStrategyResult,
	TransitGraph,
	AugmentedEdge,
} from "@algorithms/types";
import { calculateDegrees } from "./degrees";
import { buildDistanceMatrix } from "./dijkstra";
import { findBruteForceMatching, findGreedyMatching } from "./matching";
import { hierholzer } from "./euler";

function pickStrategy(
	strategies: MatchingStrategyResult[],
	strategy: "auto" | "greedy",
): MatchingStrategyResult | null {
	if (strategy === "greedy") {
		return strategies.find((s) => s.strategy === "greedy") ?? null;
	}
	return (
		strategies.find((s) => s.strategy === "brute-force" && s.executed) ??
		strategies.find((s) => s.strategy === "greedy") ??
		null
	);
}

export function solveCPP(
	graph: TransitGraph,
	strategy: "auto" | "greedy" = "auto",
): CPPResult {
	const degrees = calculateDegrees(graph);
	const oddNodes = Array.from(degrees.values())
		.filter((d) => d.isOdd)
		.map((d) => d.nodeId);

	const baseWeight = graph.edges.reduce((sum, e) => sum + e.weightKm, 0);
	const strategies: MatchingStrategyResult[] = [];

	if (oddNodes.length === 0) {
		const circuit = hierholzer(
			graph.nodes.map((n) => n.id),
			graph.edges,
			graph.nodes[0]?.id ?? "",
		);
		return {
			hasEulerCircuit: circuit !== null,
			hasEulerPath: circuit !== null,
			oddNodes: [],
			augmentedEdges: [],
			eulerCircuit: circuit,
			totalInspectionDistanceKm: baseWeight,
			baseDistanceKm: baseWeight,
			augmentationCostKm: 0,
			strategies,
		};
	}

	if (oddNodes.length === 2) {
		const circuit = hierholzer(
			graph.nodes.map((n) => n.id),
			graph.edges,
			oddNodes[0] ?? "",
		);
		return {
			hasEulerCircuit: false,
			hasEulerPath: circuit !== null,
			oddNodes,
			augmentedEdges: [],
			eulerCircuit: circuit,
			totalInspectionDistanceKm: baseWeight,
			baseDistanceKm: baseWeight,
			augmentationCostKm: 0,
			strategies,
		};
	}

	const matrix = buildDistanceMatrix(graph, oddNodes);
	const brute = findBruteForceMatching(oddNodes, matrix);
	const greedy = findGreedyMatching(oddNodes, matrix);
	strategies.push(brute, greedy);

	const chosen = pickStrategy(strategies, strategy);
	if (chosen === null || chosen.pairs.length === 0) {
		return {
			hasEulerCircuit: false,
			hasEulerPath: false,
			oddNodes,
			augmentedEdges: [],
			eulerCircuit: null,
			totalInspectionDistanceKm: baseWeight,
			baseDistanceKm: baseWeight,
			augmentationCostKm: 0,
			strategies,
		};
	}

	const augmentedEdges: AugmentedEdge[] = [];
	const augmentedEdgeList: Array<{ source: string; target: string }> = [];
	let augmentationCost = 0;

	for (const pair of chosen.pairs) {
		const path = chosen.paths.get(
			pair.u < pair.v ? `${pair.u}|${pair.v}` : `${pair.v}|${pair.u}`,
		);
		const dijkstraPath =
			path ??
			(Array.from(matrix.get(pair.u)?.keys() ?? []).includes(pair.v)
				? matrix.get(pair.u)?.get(pair.v)?.path
				: undefined);
		if (!dijkstraPath || dijkstraPath.length < 2) continue;

		for (let i = 0; i < dijkstraPath.length - 1; i++) {
			const from = dijkstraPath[i];
			const to = dijkstraPath[i + 1];
			if (from === undefined || to === undefined) continue;
			const weight =
				graph.edges.find(
					(e) =>
						(e.source === from && e.target === to) ||
						(e.source === to && e.target === from),
				)?.weightKm ?? 0;
			augmentedEdges.push({
				source: from,
				target: to,
				weightKm: weight,
				augmented: true,
				routeId: "AUGMENTED",
			});
			augmentedEdgeList.push({ source: from, target: to });
			augmentationCost += weight;
		}
	}

	const finalCircuit = hierholzer(
		graph.nodes.map((n) => n.id),
		[...graph.edges, ...augmentedEdgeList],
		oddNodes[0] ?? graph.nodes[0]?.id ?? "",
	);

	return {
		hasEulerCircuit: false,
		hasEulerPath: false,
		oddNodes,
		augmentedEdges,
		eulerCircuit: finalCircuit,
		totalInspectionDistanceKm: baseWeight + augmentationCost,
		baseDistanceKm: baseWeight,
		augmentationCostKm: augmentationCost,
		strategies,
	};
}
