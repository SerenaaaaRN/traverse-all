<script lang="ts">
  import { graphState } from "@lib/graph-state.svelte";
  import { viewState } from "@lib/view-state.svelte";

  const graph = $derived(graphState.graph());
  const result = $derived(viewState.route);
</script>

<h1 class="text-lg font-bold text-neutral-900">Rute Terpendek</h1>
<p class="mt-1 text-xs leading-relaxed text-neutral-500">
  Klik node di peta untuk mengisi asal, tujuan, lalu titik lewat. Atau pilih manual di bawah.
</p>

<div class="mt-4 space-y-2">
  {#each viewState.stops as stop, i (i)}
    <div class="flex items-center gap-2">
      <span class="w-12 shrink-0 text-[10px] text-neutral-500">
        {i === 0 ? "Asal" : i === viewState.stops.length - 1 ? "Tujuan" : "Lewat"}
      </span>
      <select
        value={stop}
        onchange={(e) => viewState.setStop(i, e.currentTarget.value)}
        class="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1.5 text-xs"
      >
        <option value="">— pilih simpul —</option>
        {#each graph.nodes as node (node.id)}
          <option value={node.id}>{node.id} — {node.label}</option>
        {/each}
      </select>
      <button
        type="button"
        onclick={() => viewState.removeStop(i)}
        class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
      >
        ×
      </button>
    </div>
  {/each}
</div>

<div class="mt-3 flex gap-2">
  <button
    type="button"
    onclick={() => viewState.addWaypoint()}
    class="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
  >
    + Titik lewat
  </button>
  <button
    type="button"
    onclick={() => viewState.resetStops()}
    class="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
  >
    Reset
  </button>
</div>

<div class="mt-6 border-t border-neutral-200 pt-4">
  {#if result}
    <p class="text-[10px] text-neutral-500">Total jarak</p>
    <p class="text-xl font-semibold text-sky-700">{result.totalDistanceKm.toFixed(3)} km</p>

    <h2 class="mt-4 mb-2 text-xs font-semibold text-neutral-500">Segmen</h2>
    <div class="space-y-1.5">
      {#each result.segments as segment, i (i)}
        <div class="flex justify-between rounded border border-neutral-200 px-2 py-1.5 text-xs">
          <span class="text-neutral-700">
            {segment.path[0]} → {segment.path[segment.path.length - 1]}
          </span>
          <span class="font-medium text-sky-700">{segment.distanceKm.toFixed(3)} km</span>
        </div>
      {/each}
    </div>

    <h2 class="mt-4 mb-2 text-xs font-semibold text-neutral-500">Urutan lintasan</h2>
    <p class="break-words text-xs leading-relaxed text-neutral-600">{result.path.join(" → ")}</p>
  {:else}
    <p class="rounded-lg bg-neutral-50 px-3 py-3 text-xs text-neutral-500">
      Pilih minimal dua simpul untuk menghitung rute.
    </p>
  {/if}
</div>
