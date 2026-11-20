<script lang="ts">
	import type { TransitGraph } from "@algorithms/types";
	import { calculateDegrees } from "@algorithms/degrees";
	import { routeById } from "@data/routes";

	let { graph }: { graph: TransitGraph } = $props();

	const rows = $derived.by(() => {
		const degrees = calculateDegrees(graph);
		return graph.nodes.map((node) => ({
			node,
			degree: degrees.get(node.id)?.degree ?? 0,
			isOdd: degrees.get(node.id)?.isOdd ?? false,
			routes: node.routeIds
				.map((id) => routeById.get(id)?.id ?? id)
				.join(", "),
		}));
	});

	const oddCount = $derived(rows.filter((r) => r.isOdd).length);
</script>

<div class="overflow-hidden rounded-lg border border-neutral-200">
	<table class="w-full text-left text-xs">
		<thead class="bg-neutral-50 text-neutral-500">
			<tr>
				<th class="px-3 py-2 font-medium">Halte</th>
				<th class="px-3 py-2 font-medium">Tipe</th>
				<th class="px-3 py-2 font-medium">Koridor</th>
				<th class="px-3 py-2 text-right font-medium">Derajat</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.node.id)}
				<tr class="border-t border-neutral-100 {row.isOdd ? 'bg-red-50' : ''}">
					<td class="px-3 py-1.5 font-medium text-neutral-800">
						{row.node.label}
						{#if row.isOdd}
							<span class="ml-1 rounded bg-red-600 px-1 py-0.5 text-[10px] font-semibold text-white"
								>GANJIL</span
							>
						{/if}
					</td>
					<td class="px-3 py-1.5 text-neutral-500">{row.node.type}</td>
					<td class="px-3 py-1.5 text-neutral-500">{row.routes}</td>
					<td class="px-3 py-1.5 text-right font-mono {row.isOdd ? 'text-red-700' : 'text-neutral-700'}">
						{row.degree}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p class="border-t border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
		{rows.length} halte · <span class="font-semibold text-red-700">{oddCount}</span> berderajat ganjil
	</p>
</div>
