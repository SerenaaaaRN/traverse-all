/**
 * Runtime guard dataset — struktur, id unik, endpoint edge valid.
 * Melempar Error dengan pesan jelas jika data rusak, agar graf
 * tidak pernah masuk algoritma dalam kondisi tidak valid.
 */
import rawDataset from "./transmusi.json";
import type { TransitGraph, TransitNode, TransitEdge } from "@algorithms/types";

/**
 * Runtime guard dataset — struktur, id unik, endpoint edge valid.
 * Melempar Error dengan pesan jelas jika data rusak, agar graf
 * tidak pernah masuk algoritma dalam kondisi tidak valid.
 */
export function validateDataset(parsed: unknown): TransitGraph {
	if (typeof parsed !== "object" || parsed === null) {
		throw new Error("Dataset harus berupa object JSON.");
	}
	const data = parsed as Record<string, unknown>;

	const nodes = Array.isArray(data.nodes) ? (data.nodes as TransitNode[]) : [];
	const edges = Array.isArray(data.edges) ? (data.edges as TransitEdge[]) : [];

	const seen = new Set<string>();
	for (const node of nodes) {
		if (typeof node.id !== "string" || node.id.length === 0) {
			throw new Error("Ada node tanpa id yang valid.");
		}
		if (seen.has(node.id)) {
			throw new Error(`Node id duplikat: ${node.id}`);
		}
		seen.add(node.id);
		if (typeof node.x !== "number" || typeof node.y !== "number") {
			throw new Error(`Node ${node.id} memiliki koordinat tidak valid.`);
		}
		if (!Array.isArray(node.routeIds)) {
			throw new Error(`Node ${node.id} tidak memiliki routeIds.`);
		}
	}

	for (const edge of edges) {
		if (!seen.has(edge.source) || !seen.has(edge.target)) {
			throw new Error(
				`Edge ${edge.source} → ${edge.target} menghubungkan node yang tidak ada.`,
			);
		}
		if (typeof edge.weightKm !== "number" || edge.weightKm < 0) {
			throw new Error(`Edge ${edge.source} → ${edge.target} tanpa bobot km valid.`);
		}
	}

	return { nodes, edges };
}

export function validateGraph(parsed: unknown): TransitGraph {
	return validateDataset(parsed);
}

export const transmusiFullNetwork: TransitGraph = validateGraph(rawDataset);
