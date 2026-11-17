export interface HierholzerEdge {
	source: string;
	target: string;
}

/**
 * Hierholzer algorithm — membentuk sirkuit/lintasan Euler dari graf
 * yang sudah Eulerian. Return null jika graf tidak memenuhi syarat
 * (ada node berderajat ganjil) atau tidak connected.
 */
export function hierholzer(
	nodeIds: string[],
	edges: HierholzerEdge[],
	startNode: string,
): string[] | null {
	const adjacency = new Map<string, Map<string, number[]>>();
	for (const id of nodeIds) adjacency.set(id, new Map());

	for (const [idx, edge] of edges.entries()) {
		const forward = adjacency.get(edge.source);
		if (!forward) return null;
		forward.set(edge.target, [...(forward.get(edge.target) ?? []), idx]);
		const backward = adjacency.get(edge.target);
		if (!backward) return null;
		backward.set(edge.source, [...(backward.get(edge.source) ?? []), idx]);
	}

	if (!adjacency.has(startNode)) return null;

	const startDegree = [...(adjacency.get(startNode)?.values() ?? [])].length;
	if (startDegree === 0) return null;

	const used = new Set<number>();
	const circuit: string[] = [];
	const stack: string[] = [startNode];

	while (stack.length > 0) {
		const current = stack[stack.length - 1];
		if (current === undefined) break;

		const neighbors = adjacency.get(current);
		let nextEdge: number | null = null;
		let nextNode: string | null = null;

		if (neighbors) {
			for (const [neighbor, edgeIdxs] of neighbors) {
				const available = edgeIdxs.find((e) => !used.has(e));
				if (available !== undefined) {
					nextEdge = available;
					nextNode = neighbor;
					break;
				}
			}
		}

		if (nextNode === null || nextEdge === null) {
			circuit.push(current);
			stack.pop();
		} else {
			used.add(nextEdge);
			stack.push(nextNode);
		}
	}

	if (used.size !== edges.length) return null;

	circuit.reverse();
	return circuit;
}
