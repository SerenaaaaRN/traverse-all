<script lang="ts">
  import DegreeTable from "@components/degree-table.svelte";
  import { graphState } from "@lib/graph-state.svelte";
  import { viewState } from "@lib/view-state.svelte";
</script>

<h1 class="text-lg font-bold text-neutral-900">Derajat Simpul</h1>
<p class="mt-1 text-xs leading-relaxed text-neutral-500">
  Klik baris untuk memilih simpul; posisinya akan ditandai di peta.
</p>

<div class="mt-4">
  <DegreeTable
    graph={graphState.graph()}
    selectedId={viewState.selectedNode}
    onSelect={(id) => viewState.onNodeClick(id)}
  />
</div>
