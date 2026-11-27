<script lang="ts">
  import { graphState } from "@lib/graph-state.svelte";
  import { viewState } from "@lib/view-state.svelte";
  import { calculateDegrees, findOddNodes } from "@algorithms/degrees";

  const degrees = $derived(calculateDegrees(graphState.graph()));
  const oddCount = $derived(findOddNodes(graphState.graph()).length);
  const cpp = $derived(viewState.cpp);
  const selected = $derived(
    viewState.selectedNode ? graphState.nodeById(viewState.selectedNode) : undefined,
  );
</script>

<h1 class="text-lg font-bold text-neutral-900">Peta Jaringan</h1>
<p class="mt-1 text-xs leading-relaxed text-neutral-500">
  Jaringan jalan internal Kilang Pertamina Plaju. Klik simpul di peta untuk memilihnya.
</p>

<div class="mt-4 grid grid-cols-3 gap-2">
  <div class="rounded-lg border border-neutral-200 p-2.5">
    <p class="text-[10px] text-neutral-500">Simpul</p>
    <p class="text-lg font-semibold text-neutral-800">{graphState.nodes.length}</p>
  </div>
  <div class="rounded-lg border border-neutral-200 p-2.5">
    <p class="text-[10px] text-neutral-500">Ruas</p>
    <p class="text-lg font-semibold text-neutral-800">{graphState.edges.length}</p>
  </div>
  <div class="rounded-lg border border-neutral-200 p-2.5">
    <p class="text-[10px] text-neutral-500">Ganjil</p>
    <p class="text-lg font-semibold text-red-700">{oddCount}</p>
  </div>
</div>

{#if cpp}
  <div class="mt-2 rounded-lg border border-neutral-200 p-2.5">
    <p class="text-[10px] text-neutral-500">Efisiensi CPP</p>
    <div class="mt-1 flex items-baseline justify-between gap-2 text-xs text-neutral-600">
      <span>Baseline</span>
      <span class="font-mono">{viewState.baselineKm.toFixed(3)} km</span>
    </div>
    <div class="mt-0.5 flex items-baseline justify-between gap-2 text-xs text-neutral-600">
      <span>CPP</span>
      <span class="font-mono">{cpp.totalInspectionDistanceKm.toFixed(3)} km</span>
    </div>
    <div class="mt-0.5 flex items-baseline justify-between gap-2 text-xs">
      <span class="text-neutral-500">Penghematan</span>
      <span class="font-mono font-semibold text-green-700">{viewState.savingPct.toFixed(2)}%</span>
    </div>
  </div>
{/if}

<div class="mt-5 rounded-lg border border-neutral-200 p-3">
  <h2 class="text-xs font-semibold text-neutral-700">Simpul terpilih</h2>
  {#if selected}
    <p class="mt-2 font-mono text-sm font-semibold text-green-700">{selected.id}</p>
    <p class="mt-1 text-xs text-neutral-500">
      {selected.label || "Tanpa label"} · {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
    </p>
    <p class="mt-1 text-xs text-neutral-500">
      Derajat {degrees.get(selected.id)?.degree ?? 0}
      {degrees.get(selected.id)?.isOdd ? "(ganjil)" : "(genap)"}
    </p>
  {:else}
    <p class="mt-2 text-xs text-neutral-400">Belum ada simpul dipilih.</p>
  {/if}
</div>

<div class="mt-5 rounded-lg bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">
  <p class="font-semibold text-neutral-700">Mulai dari mana?</p>
  <p class="mt-1">
    Buka <b>Analisis</b> untuk melihat metrik CPP dan memutar demo lintasan, lalu
    <b>Rute</b> untuk mencari jalur terpendek antar dua simpul.
  </p>
</div>
