import type { TransitGraph, DegreeInfo } from "@algorithms/types";

export function calculateDegrees(graph: TransitGraph): Map<string, DegreeInfo> {
	const counts = new Map<string, number>();
	for (const node of graph.nodes) counts.set(node.id, 0);

	for (const edge of graph.edges) {
		counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
		if (edge.source !== edge.target) {
			counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
		}
	}

	const result = new Map<string, DegreeInfo>();
	for (const [id, degree] of counts) {
		result.set(id, { nodeId: id, degree, isOdd: degree % 2 !== 0 });
	}
	return result;
}

export function findOddNodes(graph: TransitGraph): string[] {
	const degrees = calculateDegrees(graph);
	return Array.from(degrees.values())
		.filter((d) => d.isOdd)
		.map((d) => d.nodeId);
}
