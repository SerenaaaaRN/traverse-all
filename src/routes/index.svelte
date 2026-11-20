<script lang="ts">
	import GraphView from "../components/domain/GraphView.svelte";
	import { graphState } from "@lib/graphState.svelte";
</script>

<div class="relative h-full">
	<GraphView />
	<div class="absolute top-3 left-3 z-10 rounded-lg bg-white/95 px-3 py-2 text-xs shadow">
		<b>Transmusi Full Network</b>
		<p class="text-neutral-500">{graphState.nodes.length} halte · {graphState.edges.length} ruas</p>
	</div>
</div>
