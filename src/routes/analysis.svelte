<script lang="ts">
  import type { CPPResult } from "@algorithms/types";
  import { solveCPP } from "@algorithms/cpp";
  import { graphState } from "@lib/graphState.svelte";
  import GraphView from "@components/graph-view.svelte";
  import DegreeTable from "@components/degree-table.svelte";
  import TourPlayer from "@components/tour-player.svelte";

  let tourStep = $state(0);

  const graph = $derived(graphState.graph());

  const cpp = $derived.by((): CPPResult | null => {
    try {
      return solveCPP(graph);
    } catch {
      return null;
    }
  });

  const totalKm = $derived(graph.edges.reduce((s, e) => s + e.weightKm, 0));
  const baselineKm = $derived(2 * totalKm);
  const savingPct = $derived(
    cpp ? ((baselineKm - cpp.totalInspectionDistanceKm) / baselineKm) * 100 : 0,
  );
</script>

<div class="grid h-full grid-cols-[minmax(340px,420px)_1fr]">
  <aside class="h-full overflow-y-auto border-r border-neutral-200 p-5">
    {#if !cpp}
      <p class="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Graf tidak connected — CPP membutuhkan seluruh ruas saling terjangkau.
      </p>
    {:else}
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-lg border border-neutral-200 p-3">
          <p class="text-xs text-neutral-500">Simpul</p>
          <p class="text-xl font-semibold text-neutral-800">{graph.nodes.length}</p>
        </div>
        <div class="rounded-lg border border-neutral-200 p-3">
          <p class="text-xs text-neutral-500">Ruas</p>
          <p class="text-xl font-semibold text-neutral-800">{graph.edges.length}</p>
        </div>
        <div class="rounded-lg border border-neutral-200 p-3">
          <p class="text-xs text-neutral-500">Panjang jaringan</p>
          <p class="text-xl font-semibold text-neutral-800">{totalKm.toFixed(3)} km</p>
        </div>
        <div class="rounded-lg border border-neutral-200 p-3">
          <p class="text-xs text-neutral-500">Simpul ganjil</p>
          <p class="text-xl font-semibold text-red-700">{cpp.oddNodes.length}</p>
        </div>
      </div>

      <h2 class="mt-6 mb-2 text-sm font-semibold text-neutral-700">Hasil Chinese Postman</h2>
      <div class="grid grid-cols-1 gap-3">
        <div class="rounded-lg border border-neutral-200 p-3">
          <p class="text-xs text-neutral-500">Rute dasar (semua ruas 1×)</p>
          <p class="text-lg font-semibold text-neutral-800">{cpp.baseDistanceKm.toFixed(3)} km</p>
        </div>
        <div class="rounded-lg border border-neutral-200 p-3">
          <p class="text-xs text-neutral-500">Biaya augmentasi (pengulangan)</p>
          <p class="text-lg font-semibold text-blue-700">{cpp.augmentationCostKm.toFixed(3)} km</p>
        </div>
        <div class="rounded-lg bg-blue-600 p-3 text-white">
          <p class="text-xs opacity-80">Total inspeksi</p>
          <p class="text-lg font-bold">{cpp.totalInspectionDistanceKm.toFixed(3)} km</p>
        </div>
        <div class="rounded-lg bg-green-50 p-3 text-green-800">
          <p class="text-xs">Penghematan vs baseline {baselineKm.toFixed(3)} km</p>
          <p class="text-lg font-bold">{savingPct.toFixed(2)}%</p>
        </div>
      </div>

      <h3 class="mt-5 mb-2 text-xs font-semibold text-neutral-500">Simpul berderajat ganjil</h3>
      <div class="flex flex-wrap gap-1.5">
        {#each cpp.oddNodes as id (id)}
          <span class="rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-800">{id}</span>
        {/each}
      </div>

      <h3 class="mt-5 mb-2 text-xs font-semibold text-neutral-500">
        Ruas yang diulang ({cpp.augmentedEdges.length})
      </h3>
      <div class="flex flex-wrap gap-1.5">
        {#each cpp.augmentedEdges as aug, i (i)}
          <span class="rounded border border-dashed border-red-400 bg-red-50 px-2 py-1 text-xs text-red-700">
            {aug.source} → {aug.target}
          </span>
        {/each}
      </div>

      {#if cpp.eulerCircuit}
        <h3 class="mt-5 mb-2 text-sm font-semibold text-neutral-700">
          Rute postman ({cpp.eulerCircuit.length} langkah)
        </h3>
        <TourPlayer totalSteps={cpp.eulerCircuit.length} bind:step={tourStep} />
        <p class="mt-2 text-xs text-neutral-500">
          Simpul saat ini: <b class="text-green-700">{cpp.eulerCircuit[tourStep] ?? "-"}</b>
        </p>
        <details class="mt-3 rounded-lg border border-neutral-200 p-3 text-xs">
          <summary class="cursor-pointer font-medium text-blue-700">Lihat urutan lintasan</summary>
          <p class="mt-2 leading-relaxed text-neutral-600">
            {cpp.eulerCircuit.join(" → ")}
          </p>
        </details>
      {/if}

      <h2 class="mt-8 mb-2 text-sm font-semibold text-neutral-700">Tabel Derajat Simpul</h2>
      <DegreeTable {graph} />
    {/if}
  </aside>

  <main class="relative min-h-0">
    <GraphView {cpp} {tourStep} />
  </main>
</div>
