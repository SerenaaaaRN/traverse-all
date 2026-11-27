<script lang="ts">
  import DegreeTable from "@components/degree-table.svelte";
  import { graphState } from "@lib/graph-state.svelte";
  import { viewState } from "@lib/view-state.svelte";
  import { randomCircuitSample, randomPathSample, randomNonEulerSample } from "@lib/subgraph-samples";
  import { calculateDegrees } from "@algorithms/degrees";
  import { classifyEuler, hierholzer, type EulerStatus } from "@algorithms/euler";

  const selectedIds = viewState.subgraphIds;

  const presets: Array<{ label: string; make: () => string[] }> = [
    { label: "Sirkuit acak", make: () => randomCircuitSample(graphState.graph()) },
    { label: "Lintasan acak", make: () => randomPathSample(graphState.graph()) },
    { label: "Bukan Eulerian acak", make: () => randomNonEulerSample(graphState.graph()) },
  ];

  const statusLabel: Record<EulerStatus, string> = {
    circuit: "Sirkuit Euler",
    path: "Lintasan Euler",
    none: "Bukan Eulerian",
  };

  const subgraph = $derived(viewState.subgraph);
  const subDegrees = $derived(calculateDegrees(subgraph));
  const classification = $derived(classifyEuler(subgraph));
  const totalKm = $derived(subgraph.edges.reduce((sum, e) => sum + e.weightKm, 0));

  const trail = $derived.by(() => {
    if (classification.status === "none") return null;
    const start =
      classification.status === "path"
        ? classification.oddNodes[0]
        : subgraph.nodes.find((node) =>
            subgraph.edges.some(
              (edge) => edge.source === node.id || edge.target === node.id,
            ),
          )?.id;
    if (!start) return null;
    return hierholzer(
      subgraph.nodes.map((node) => node.id),
      subgraph.edges,
      start,
    );
  });

  function toggle(id: string): void {
    viewState.toggleSubgraphNode(id);
  }

  function applyPreset(ids: string[]): void {
    viewState.setSubgraphIds(ids);
  }
</script>

<h1 class="text-lg font-bold text-neutral-900">Subgraf &amp; Status Euler</h1>
<p class="mt-1 text-xs leading-relaxed text-neutral-500">
  Klik baris untuk memasukkan atau mengeluarkan simpul dari subgraf. Derajat dihitung ulang dari
  ruas yang tersisa di dalam subgraf. Peta di sebelah kiri akan mengikuti seleksi ini.
</p>

<div class="mt-4 flex flex-wrap gap-2">
  {#each presets as preset (preset.label)}
    <button
      type="button"
      onclick={() => applyPreset(preset.make())}
      class="rounded border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
    >
      {preset.label}
    </button>
  {/each}
  <button
    type="button"
    onclick={() => applyPreset([])}
    class="rounded border border-neutral-300 px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-50"
  >
    Kosongkan
  </button>
</div>
<p class="mt-2 text-[10px] text-neutral-400">Klik berulang untuk mendapatkan contoh lain.</p>

{#if selectedIds.length === 0}
  <p class="mt-4 rounded-lg bg-neutral-50 px-3 py-3 text-xs text-neutral-500">
    Pilih simpul atau gunakan salah satu contoh untuk melihat status Euler subgraf.
  </p>
{:else}
  <div class="mt-4 rounded-lg border p-3 {classification.status === 'circuit' ? 'border-green-300 bg-green-50' : classification.status === 'path' ? 'border-blue-300 bg-blue-50' : 'border-red-300 bg-red-50'}">
    <p class="text-[10px] uppercase tracking-wide opacity-70">Status subgraf</p>
    <p class="mt-0.5 text-base font-bold {classification.status === 'circuit' ? 'text-green-800' : classification.status === 'path' ? 'text-blue-800' : 'text-red-800'}">
      {statusLabel[classification.status]}
    </p>
    <p class="mt-1 text-[11px] text-neutral-700">{classification.reason}</p>
  </div>

  <div class="mt-3 grid grid-cols-4 gap-2">
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Simpul</p>
      <p class="text-sm font-semibold text-neutral-800">{subgraph.nodes.length}</p>
    </div>
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Ruas</p>
      <p class="text-sm font-semibold text-neutral-800">{subgraph.edges.length}</p>
    </div>
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Ganjil</p>
      <p class="text-sm font-semibold text-red-700">{classification.oddNodes.length}</p>
    </div>
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Bobot</p>
      <p class="text-sm font-semibold text-neutral-800">{totalKm.toFixed(3)} km</p>
    </div>
  </div>

  {#if classification.oddNodes.length > 0}
    <h2 class="mt-4 mb-2 text-xs font-semibold text-neutral-500">Simpul ganjil dalam subgraf</h2>
    <div class="flex flex-wrap gap-1.5">
      {#each classification.oddNodes as id (id)}
        <span class="rounded-full bg-red-100 px-2 py-1 text-[10px] text-red-800">{id}</span>
      {/each}
    </div>
  {/if}

  <h2 class="mt-4 mb-2 text-xs font-semibold text-neutral-500">Derajat dalam subgraf</h2>
  <div class="flex flex-wrap gap-1.5">
    {#each subgraph.nodes as node (node.id)}
      <span class="rounded border border-neutral-200 px-2 py-1 text-[10px] text-neutral-700">
        {node.id} · {subDegrees.get(node.id)?.degree ?? 0}
      </span>
    {/each}
  </div>

  {#if trail}
    <details class="mt-4 rounded-lg border border-neutral-200 p-3 text-xs">
      <summary class="cursor-pointer font-medium text-blue-700">Urutan lintasan</summary>
      <p class="mt-2 leading-relaxed text-neutral-600">{trail.join(" → ")}</p>
    </details>
  {/if}
{/if}

<h2 class="mt-6 mb-2 text-xs font-semibold text-neutral-500">Pilih simpul</h2>
<DegreeTable
  graph={graphState.graph()}
  {selectedIds}
  onSelect={toggle}
/>
