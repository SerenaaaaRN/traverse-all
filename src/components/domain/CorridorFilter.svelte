<script lang="ts">
	import { routeLines } from "@data/routes";
	import type { RouteLine } from "@algorithms/types";
	import { graphState } from "@lib/graphState.svelte";

	const MODE_LABEL: Record<string, string> = {
		lrt: "LRT",
		brt: "BRT Transmusi",
		feeder: "Feeder Musi",
		kereta: "Kereta",
	};

	const groups = $derived.by(() => {
		const map = new Map<string, RouteLine[]>();
		for (const route of routeLines) {
			const list = map.get(route.mode) ?? [];
			if (list.length === 0) map.set(route.mode, list);
			list.push(route);
		}
		return Array.from(map.entries());
	});
</script>

<div class="space-y-3 text-sm">
	{#each groups as [mode, routes] (mode)}
		<div>
			<p class="mb-1.5 text-xs font-semibold text-neutral-500">
				{MODE_LABEL[mode] ?? mode}
			</p>
			<div class="flex flex-wrap gap-1.5">
				{#each routes as route (route.id)}
					<button
						type="button"
						onclick={() => graphState.toggleRoute(route.id)}
						aria-pressed={graphState.isRouteActive(route.id)}
						class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition active:scale-[0.98] {graphState
							.isRouteActive(route.id)
							? "border-transparent text-white"
							: "border-neutral-300 bg-white text-neutral-500"}"
						style={graphState.isRouteActive(route.id)
							? `background-color: ${route.color}`
							: ""}
					>
						<span class="font-medium">{route.id}</span>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>
