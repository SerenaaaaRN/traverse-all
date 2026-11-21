<script lang="ts">
  import { graphState } from "@lib/graph-state.svelte";
  import { viewState } from "@lib/view-state.svelte";

  let { title, listId }: { title: string; listId: string } = $props();
</script>

<div class="absolute right-3 top-3 z-[500] w-40 rounded-lg bg-white/95 p-3 text-xs shadow">
  <div class="mb-3">
    <p class="mb-1 font-semibold text-neutral-700">Titik awal</p>
    <div class="flex gap-1">
      <input
        type="text"
        value={viewState.startNode}
        onchange={(e) => viewState.commitStartNode(e.currentTarget.value)}
        list={listId}
        placeholder="P74"
        class="min-w-0 flex-1 rounded border border-neutral-300 px-1.5 py-1 text-xs"
      />
      <button
        type="button"
        onclick={() => viewState.resetStartNode()}
        class="rounded border border-neutral-300 px-1.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
      >Reset</button>
    </div>
    <datalist id={listId}>
      {#each graphState.nodes as node (node.id)}
        <option value={node.id}></option>
      {/each}
    </datalist>
    {#if !viewState.startNodeValid}
      <p class="mt-1 text-[10px] text-amber-700">Tidak ditemukan — pakai P74</p>
    {/if}
  </div>
  <p class="mb-2 font-semibold text-neutral-700">{title}</p>
  <label class="flex items-center gap-2 py-0.5 text-neutral-600">
    <input type="checkbox" bind:checked={viewState.showWeights} class="accent-blue-600" />
    Bobot (m)
  </label>
  <label class="flex items-center gap-2 py-0.5 text-neutral-600">
    <input type="checkbox" bind:checked={viewState.showOdd} class="accent-blue-600" />
    Simpul ganjil
  </label>
  <label class="flex items-center gap-2 py-0.5 text-neutral-600">
    <input type="checkbox" bind:checked={viewState.showTour} class="accent-blue-600" />
    Rute CPP
  </label>
  <label class="flex items-center gap-2 py-0.5 text-neutral-600">
    <input type="checkbox" bind:checked={viewState.showRoute} class="accent-blue-600" />
    Rute Dijkstra
  </label>
</div>
