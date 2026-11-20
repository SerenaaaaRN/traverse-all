<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import cytoscape from "cytoscape";
	import type { TransitGraph, TransitNode } from "@algorithms/types";
	import { calculateDegrees } from "@algorithms/degrees";
	import { routeById } from "@data/routes";
	import { graphState } from "@lib/graphState.svelte";

	let cy: cytoscape.Core | null = null;
	let container: HTMLDivElement | null = null;
	let degreesMap = new Map<string, number>();

	let selectedNode = $state<{
		id: string;
		label: string;
		type: TransitNode["type"];
		degree: number;
		routeIds: string[];
	} | null>(null);

	function buildElements(graph: TransitGraph): cytoscape.ElementDefinition[] {
		const degrees = calculateDegrees(graph);
		degreesMap = new Map(
			Array.from(degrees.values()).map((d) => [d.nodeId, d.degree]),
		);
		const elements: cytoscape.ElementDefinition[] = [];

		for (const node of graph.nodes) {
			elements.push({
				group: "nodes",
				data: {
					id: node.id,
					label: node.label,
					degree: degrees.get(node.id)?.degree ?? 0,
					isOdd: degrees.get(node.id)?.isOdd ?? false,
					nodeType: node.type,
				},
				position: { x: node.x, y: node.y },
			});
		}

		for (const edge of graph.edges) {
			elements.push({
				group: "edges",
				data: {
					id: `${edge.source}|${edge.target}`,
					source: edge.source,
					target: edge.target,
					weightKm: edge.weightKm,
					routeId: edge.routeId,
				},
			});
		}

		return elements;
	}

	function buildStyle(): cytoscape.StylesheetJson {
		return [
			{
				selector: "node",
				style: {
					width: 14,
					height: 14,
					"background-color": "#60a5fa",
					"border-width": 2,
					"border-color": "#1e3a8a",
					label: "data(label)",
					"font-size": 9,
					color: "#374151",
					"text-valign": "bottom",
					"text-margin-y": 6,
				},
			},
			{
				selector: "node[isOdd]",
				style: {
					width: 18,
					height: 18,
					"background-color": "#ef4444",
					"border-color": "#991b1b",
				},
			},
			{
				selector: "node[nodeType = 'station'], node[nodeType = 'terminal']",
				style: {
					shape: "round-rectangle",
					width: 20,
					height: 16,
				},
			},
			{
				selector: "edge",
				style: {
					width: 4,
					"curve-style": "straight",
					"line-color": "#9ca3af",
					opacity: 0.85,
				},
			},
			{
				selector: "edge[routeId]",
				style: {
					"line-color": "#9ca3af",
				},
			},
		];
	}

	function colorEdges(): void {
		if (!cy) return;
		cy.edges().forEach((edge) => {
			const routeId = edge.data("routeId") as string;
			const color = routeById.get(routeId)?.color ?? "#9ca3af";
			edge.style({ "line-color": color });
		});
	}

	onMount(() => {
		if (!container) return;
		cy = cytoscape({
			container,
			elements: buildElements(graphState.filteredGraph()),
			style: buildStyle(),
			layout: { name: "preset", fit: true, padding: 40 },
			minZoom: 0.3,
			maxZoom: 3,
		});
		colorEdges();
		cy.on("tap", "node", (event) => {
			const id = event.target.id() as string;
			const node = graphState.nodeById(id);
			if (!node) return;
			selectedNode = {
				id,
				label: node.label,
				type: node.type,
				degree: degreesMap.get(id) ?? 0,
				routeIds: [...node.routeIds],
			};
		});
		cy.on("tap", (event) => {
			if (event.target === cy) selectedNode = null;
		});
	});

	$effect(() => {
		const graph = graphState.filteredGraph();
		const cyInstance = cy;
		if (!cyInstance) return;
		cyInstance.batch(() => {
			cyInstance.remove(cyInstance.elements());
			cyInstance.add(buildElements(graph));
		});
		colorEdges();
		cyInstance.fit(undefined, 40);
	});

	onDestroy(() => {
		cy?.destroy();
		cy = null;
	});
</script>

<div class="relative h-full w-full">
	<div bind:this={container} class="h-full w-full bg-white"></div>

{#if selectedNode}
	<div class="absolute top-3 right-3 z-10 w-56 rounded-lg bg-white/95 p-3 text-xs shadow">
		<div class="flex items-start justify-between">
			<b class="text-sm">{selectedNode.label}</b>
			<button
				type="button"
				class="text-neutral-400 hover:text-neutral-700"
				onclick={() => (selectedNode = null)}>×</button
			>
		</div>
		<p class="mt-1 text-neutral-600">
			{selectedNode.type} · derajat <b>{selectedNode.degree}</b>
			{selectedNode.degree % 2 !== 0 ? "(ganjil)" : "(genap)"}
		</p>
		<p class="mt-1 text-neutral-500">{selectedNode.routeIds.join(", ")}</p>
	</div>
{/if}
</div>
