/**
 * Global state aplikasi (module rune). Sumber data adalah
 * src/data/transmusi.json yang diimport statis — data by code,
 * tanpa localStorage, tanpa form entry.
 */
import type { TransitEdge, TransitGraph, TransitNode } from "@algorithms/types";
import { routeLines } from "@data/routes";
import { transmusiFullNetwork } from "@data";

class GraphState {
	nodes = $state<TransitNode[]>(transmusiFullNetwork.nodes);
	edges = $state<TransitEdge[]>(transmusiFullNetwork.edges);
	activeRouteIds = $state<string[]>(routeLines.map((r) => r.id));

	toggleRoute(routeId: string): void {
		if (this.activeRouteIds.includes(routeId)) {
			this.activeRouteIds = this.activeRouteIds.filter((id) => id !== routeId);
		} else {
			this.activeRouteIds = [...this.activeRouteIds, routeId];
		}
	}

	isRouteActive(routeId: string): boolean {
		return this.activeRouteIds.includes(routeId);
	}

	filteredGraph(): TransitGraph {
		const active = new Set(this.activeRouteIds);
		return {
			nodes: this.nodes.filter((n) => n.routeIds.some((r) => active.has(r))),
			edges: this.edges.filter((e) => active.has(e.routeId)),
		};
	}

	nodeById(id: string): TransitNode | undefined {
		return this.nodes.find((n) => n.id === id);
	}

	nodeCount(routeId: string): number {
		return this.nodes.filter((n) => n.routeIds.includes(routeId)).length;
	}

	edgeCount(routeId: string): number {
		return this.edges.filter((e) => e.routeId === routeId).length;
	}

	toGraph(): TransitGraph {
		return { nodes: this.nodes, edges: this.edges };
	}
}

export const graphState = new GraphState();
