<script lang="ts">
  import { viewState } from "@lib/view-state.svelte";
  import TourPlayer from "@components/tour-player.svelte";

  const cpp = $derived(viewState.cpp);

  const circuit = $derived(cpp?.eulerCircuit ?? []);
  const step = $derived(viewState.tourStep ?? 0);
  const currentId = $derived(circuit[step]);
  const previousId = $derived(step > 0 ? circuit[step - 1] : undefined);
  const visitCount = $derived(
    currentId === undefined
      ? 0
      : circuit.slice(0, step + 1).filter((id) => id === currentId).length,
  );
</script>

<h1 class="text-lg font-bold text-neutral-900">Analisis CPP</h1>

{#if !cpp}
  <p class="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
    Graf tidak connected — CPP membutuhkan seluruh ruas saling terjangkau.
  </p>
{:else}
  <div class="mt-4 grid grid-cols-2 gap-2">
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Rute dasar</p>
      <p class="text-sm font-semibold text-neutral-800">{cpp.baseDistanceKm.toFixed(3)} km</p>
    </div>
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Augmentasi</p>
      <p class="text-sm font-semibold text-blue-700">{cpp.augmentationCostKm.toFixed(3)} km</p>
    </div>
    <div class="rounded-lg bg-blue-600 p-2.5 text-white">
      <p class="text-[10px] opacity-80">Total inspeksi</p>
      <p class="text-sm font-bold">{cpp.totalInspectionDistanceKm.toFixed(3)} km</p>
    </div>
    <div class="rounded-lg bg-green-50 p-2.5 text-green-800">
      <p class="text-[10px]">Hemat vs baseline</p>
      <p class="text-sm font-bold">{viewState.savingPct.toFixed(2)}%</p>
    </div>
  </div>

  <div class="mt-5">
    <TourPlayer />
    <div class="mt-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-900">
      <div class="flex items-center justify-between">
        <span>Simpul saat ini</span>
        <span class="font-mono font-bold text-green-700">{currentId ?? "-"}</span>
      </div>
      <p class="mt-1 text-[11px] text-green-800">
        {previousId ? `dari ${previousId} · ` : ""}kunjungan ke-{visitCount} · langkah {step + 1}/{circuit.length}
      </p>
    </div>
  </div>

  <h2 class="mt-5 mb-2 text-xs font-semibold text-neutral-500">
    Simpul ganjil ({cpp.oddNodes.length})
  </h2>
  <div class="flex flex-wrap gap-1.5">
    {#each cpp.oddNodes as id (id)}
      <span class="rounded-full bg-red-100 px-2 py-1 text-[10px] text-red-800">{id}</span>
    {/each}
  </div>

  <h2 class="mt-5 mb-2 text-xs font-semibold text-neutral-500">
    Ruas diulang ({cpp.augmentedEdges.length})
  </h2>
  <div class="flex flex-wrap gap-1.5">
    {#each cpp.augmentedEdges as aug, i (i)}
      <span class="rounded border border-dashed border-red-400 bg-red-50 px-1.5 py-1 text-[10px] text-red-700">
        {aug.source}–{aug.target}
      </span>
    {/each}
  </div>

  <details class="mt-5 rounded-lg border border-neutral-200 p-3 text-xs">
    <summary class="cursor-pointer font-medium text-blue-700">Urutan lintasan</summary>
    <p class="mt-2 leading-relaxed text-neutral-600">{cpp.eulerCircuit?.join(" → ")}</p>
  </details>
{/if}
