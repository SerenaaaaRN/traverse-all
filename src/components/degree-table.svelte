<script lang="ts">
  import type { PatrolGraph } from "@algorithms/types";
  import { calculateDegrees } from "@algorithms/degrees";

  let {
    graph,
    selectedIds = [],
    onSelect,
  }: {
    graph: PatrolGraph;
    selectedIds?: string[];
    onSelect?: (id: string) => void;
  } = $props();

  const rows = $derived.by(() => {
    const degrees = calculateDegrees(graph);
    return graph.nodes.map((node) => ({
      node,
      degree: degrees.get(node.id)?.degree ?? 0,
      isOdd: degrees.get(node.id)?.isOdd ?? false,
    }));
  });

  const oddCount = $derived(rows.filter((r) => r.isOdd).length);
</script>

<div class="overflow-hidden rounded-lg border border-neutral-200">
  <table class="w-full text-left text-xs">
    <thead class="bg-neutral-50 text-neutral-500">
      <tr>
        <th class="px-3 py-2 font-medium">Simpul</th>
        <th class="px-3 py-2 font-medium">Koordinat (lat, lng)</th>
        <th class="px-3 py-2 text-right font-medium">Derajat</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.node.id)}
        {@const selected = selectedIds.includes(row.node.id)}
        <tr
          class="cursor-pointer border-t border-neutral-100 {selected
            ? 'bg-green-50'
            : row.isOdd
              ? 'bg-red-50'
              : ''}"
          onclick={() => onSelect?.(row.node.id)}
        >
          <td class="px-3 py-1.5 font-medium text-neutral-800">
            {row.node.id}
            {#if selected}<span class="ml-1 text-green-700">✓</span>{/if}
            {#if row.isOdd}
              <span class="ml-1 rounded bg-red-600 px-1 py-0.5 text-[10px] font-semibold text-white">GANJIL</span>
            {/if}
          </td>
          <td class="px-3 py-1.5 font-mono text-neutral-500">
            {row.node.lat.toFixed(6)}, {row.node.lng.toFixed(6)}
          </td>
          <td class="px-3 py-1.5 text-right font-mono {row.isOdd ? 'text-red-700' : 'text-neutral-700'}">
            {row.degree}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="border-t border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
    {rows.length} simpul · <span class="font-semibold text-red-700">{oddCount}</span> berderajat ganjil
  </p>
</div>
