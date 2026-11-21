<script lang="ts">
  import GraphView from "@components/graph-view.svelte";
  import { graphState } from "@lib/graphState.svelte";
  import { findRouteThroughStops, type RouteResult } from "@algorithms/route";

  const graph = $derived(graphState.graph());
  let stops = $state<string[]>([]);

  const validStops = $derived(stops.filter((id) => id !== ""));

  const result = $derived.by((): RouteResult | null => {
    if (validStops.length < 2) return null;
    return findRouteThroughStops(graph, validStops);
  });

  function addStop(id: string): void {
    if (stops.length < 2) stops.push(id);
    else stops.splice(stops.length - 1, 0, id);
  }

  function addWaypoint(): void {
    stops.splice(Math.max(stops.length - 1, 0), 0, "");
  }

  function setStop(index: number, id: string): void {
    stops[index] = id;
  }

  function removeStop(index: number): void {
    stops.splice(index, 1);
  }

  function reset(): void {
    stops = [];
  }
</script>

<div class="grid h-full grid-cols-[minmax(340px,420px)_1fr]">
  <aside class="h-full overflow-y-auto border-r border-neutral-200 p-5">
    <h2 class="text-sm font-semibold text-neutral-700">Rute terpendek — Dijkstra</h2>
    <p class="mt-1 text-xs leading-relaxed text-neutral-500">
      Klik node di peta untuk memilih asal, tujuan, lalu titik lewat. Atau pilih manual di bawah.
    </p>

    <div class="mt-4 space-y-2">
      {#each stops as stop, i (i)}
        <div class="flex items-center gap-2">
          <span class="w-14 shrink-0 text-xs text-neutral-500">
            {i === 0 ? "Asal" : i === stops.length - 1 ? "Tujuan" : "Lewat"}
          </span>
          <select
            value={stop}
            onchange={(e) => setStop(i, e.currentTarget.value)}
            class="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1.5 text-xs"
          >
            <option value="">— pilih simpul —</option>
            {#each graph.nodes as node (node.id)}
              <option value={node.id}>{node.id} — {node.label}</option>
            {/each}
          </select>
          <button
            type="button"
            onclick={() => removeStop(i)}
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
        onclick={addWaypoint}
        class="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
      >
        + Titik lewat
      </button>
      <button
        type="button"
        onclick={reset}
        class="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
      >
        Reset
      </button>
    </div>

    <div class="mt-6 border-t border-neutral-200 pt-4">
      {#if result}
        <p class="text-xs text-neutral-500">Total jarak</p>
        <p class="text-xl font-semibold text-sky-700">{result.totalDistanceKm.toFixed(3)} km</p>

        <h3 class="mt-4 mb-2 text-xs font-semibold text-neutral-500">Segmen</h3>
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

        <h3 class="mt-4 mb-2 text-xs font-semibold text-neutral-500">Urutan lintasan</h3>
        <p class="break-words text-xs leading-relaxed text-neutral-600">
          {result.path.join(" → ")}
        </p>
      {:else}
        <p class="rounded-lg bg-neutral-50 px-3 py-3 text-xs text-neutral-500">
          Pilih minimal dua simpul untuk menghitung rute.
        </p>
      {/if}
    </div>
  </aside>

  <main class="relative min-h-0">
    <GraphView route={result} onNodeClick={addStop} />
  </main>
</div>
