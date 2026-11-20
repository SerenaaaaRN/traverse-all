<script lang="ts">
	import type { CPPResult } from "@algorithms/types";
	import { solveCPP } from "@algorithms/cpp";
	import { isConnected } from "@algorithms/connectivity";
	import { routeById } from "@data/routes";
	import { graphState } from "@lib/graphState.svelte";
	import CorridorFilter from "../components/domain/CorridorFilter.svelte";
	import DegreeTable from "../components/domain/DegreeTable.svelte";

	const graph = $derived(graphState.filteredGraph());

	const connected = $derived(isConnected(graph));

	const cpp = $derived.by((): CPPResult | null => {
		if (graph.nodes.length === 0 || !connected) return null;
		try {
			return solveCPP(graph, "greedy");
		} catch {
			return null;
		}
	});

	const cppError = $derived(
		cpp === null
			? graph.nodes.length === 0
				? "Tidak ada halte dalam koridor yang dipilih."
				: "Graf tidak connected — CPP butuh semua ruas saling terjangkau."
			: null,
	);

	const totalKm = $derived(graph.edges.reduce((s, e) => s + e.weightKm, 0));
</script>

<div class="grid h-full grid-cols-[320px_1fr] gap-0">
	<aside class="flex h-full flex-col gap-4 overflow-y-auto border-r border-neutral-200 p-4">
		<CorridorFilter />
	</aside>

	<main class="overflow-y-auto p-6">
		{#if cppError}
			<p class="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{cppError}</p>
		{:else if cpp}
			<div class="grid grid-cols-4 gap-3">
				<div class="rounded-lg border border-neutral-200 p-3">
					<p class="text-xs text-neutral-500">Halte</p>
					<p class="text-xl font-semibold text-neutral-800">{graph.nodes.length}</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-3">
					<p class="text-xs text-neutral-500">Ruas</p>
					<p class="text-xl font-semibold text-neutral-800">{graph.edges.length}</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-3">
					<p class="text-xs text-neutral-500">Panjang jaringan</p>
					<p class="text-xl font-semibold text-neutral-800">{totalKm.toFixed(1)} km</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-3">
					<p class="text-xs text-neutral-500">Node ganjil</p>
					<p class="text-xl font-semibold {cpp.oddNodes.length > 0 ? 'text-red-700' : 'text-green-700'}">
						{cpp.oddNodes.length}
					</p>
				</div>
			</div>

			<h2 class="mt-6 mb-2 text-sm font-semibold text-neutral-700">Hasil Chinese Postman</h2>
			<div class="grid grid-cols-3 gap-3">
				<div class="rounded-lg border border-neutral-200 p-3">
					<p class="text-xs text-neutral-500">Rute dasar (semua ruas 1×)</p>
					<p class="text-lg font-semibold text-neutral-800">{cpp.baseDistanceKm.toFixed(1)} km</p>
				</div>
				<div class="rounded-lg border border-neutral-200 p-3">
					<p class="text-xs text-neutral-500">Biaya augmentasi (pengulangan)</p>
					<p class="text-lg font-semibold text-blue-700">{cpp.augmentationCostKm.toFixed(1)} km</p>
				</div>
				<div class="rounded-lg bg-blue-600 p-3 text-white">
					<p class="text-xs opacity-80">Total inspeksi</p>
					<p class="text-lg font-bold">{cpp.totalInspectionDistanceKm.toFixed(1)} km</p>
				</div>
			</div>

			{#if cpp.oddNodes.length > 0}
				<h3 class="mt-4 mb-2 text-xs font-semibold text-neutral-500">Node berderajat ganjil</h3>
				<div class="flex flex-wrap gap-1.5">
					{#each cpp.oddNodes as id (id)}
						<span class="rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-800">
							{graphState.nodeById(id)?.label ?? id}
						</span>
					{/each}
				</div>

				{#if cpp.augmentedEdges.length > 0}
					<h3 class="mt-4 mb-2 text-xs font-semibold text-neutral-500">
						Ruas yang diulang (augmented)
					</h3>
					<div class="flex flex-wrap gap-1.5">
						{#each cpp.augmentedEdges as aug, i (i)}
							<span class="rounded border border-dashed border-red-400 bg-red-50 px-2 py-1 text-xs text-red-700">
								{graphState.nodeById(aug.source)?.label ?? aug.source}
								→
								{graphState.nodeById(aug.target)?.label ?? aug.target}
								({aug.weightKm.toFixed(1)} km)
							</span>
						{/each}
					</div>
				{/if}
			{:else}
				<p class="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
					Semua derajat genap — graf punya sirkuit Euler, postman tidak perlu mengulang ruas manapun.
				</p>
			{/if}

			{#if cpp.eulerCircuit}
				<h3 class="mt-6 mb-2 text-sm font-semibold text-neutral-700">
					Rute postman ({cpp.eulerCircuit.length} langkah)
				</h3>
				<details class="rounded-lg border border-neutral-200 p-3 text-xs">
					<summary class="cursor-pointer font-medium text-blue-700">
						Lihat urutan lintasan lengkap
					</summary>
					<p class="mt-2 leading-relaxed text-neutral-600">
						{cpp.eulerCircuit.map((id) => graphState.nodeById(id)?.label ?? id).join(" → ")}
					</p>
				</details>
			{/if}

			<h2 class="mt-8 mb-2 text-sm font-semibold text-neutral-700">Tabel Derajat Halte</h2>
			<DegreeTable {graph} />
		{/if}
	</main>
</div>
