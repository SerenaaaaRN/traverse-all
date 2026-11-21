<script lang="ts">
  import { graphState } from "@lib/graphState.svelte";
  import { viewState } from "@lib/viewState.svelte";

  const cpp = $derived(viewState.cpp);
  const baseline = $derived(
    cpp ? 2 * graphState.edges.reduce((s, e) => s + e.weightKm, 0) : 0,
  );
  const saving = $derived(
    cpp ? ((baseline - cpp.totalInspectionDistanceKm) / baseline) * 100 : 0,
  );
</script>

<h1 class="text-lg font-bold text-neutral-900">Perbandingan Rute</h1>
<p class="mt-1 text-xs text-neutral-500">Efisiensi CPP terhadap baseline duplikasi seluruh ruas.</p>

{#if cpp}
  <div class="mt-4 space-y-2">
    <div class="rounded-lg border border-neutral-200 p-3">
      <p class="text-xs font-medium text-neutral-600">Baseline — semua ruas 2×</p>
      <p class="mt-1 font-mono text-lg font-semibold text-neutral-700">{baseline.toFixed(3)} km</p>
      <p class="mt-1 text-[10px] text-neutral-400">Setiap ruas pergi dan pulang, tanpa optimasi.</p>
    </div>
    <div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <p class="text-xs font-medium text-blue-900">CPP — pasangan terdekat</p>
      <p class="mt-1 font-mono text-lg font-bold text-blue-900">
        {cpp.totalInspectionDistanceKm.toFixed(3)} km
      </p>
      <p class="mt-1 text-[10px] text-blue-700">
        Augmentasi {cpp.augmentationCostKm.toFixed(3)} km · {cpp.augmentedEdges.length} ruas diulang
      </p>
    </div>
  </div>

  <div class="mt-4 grid grid-cols-3 gap-2">
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Hemat</p>
      <p class="text-base font-bold text-green-700">{saving.toFixed(2)}%</p>
    </div>
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Diulang</p>
      <p class="text-base font-bold text-neutral-800">{cpp.augmentedEdges.length}</p>
    </div>
    <div class="rounded-lg border border-neutral-200 p-2.5">
      <p class="text-[10px] text-neutral-500">Langkah</p>
      <p class="text-base font-bold text-neutral-800">{cpp.eulerCircuit?.length ?? 0}</p>
    </div>
  </div>

  <div class="mt-5 rounded-lg bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">
    <p>
      Baseline mengandaikan petugas menempuh setiap ruas dua kali, sehingga totalnya
      {baseline.toFixed(3)} km. CPP hanya mengulang ruas yang diperlukan untuk membuat
      seluruh derajat simpul genap.
    </p>
    <p class="mt-2">
      Untuk {cpp.oddNodes.length} simpul ganjil, brute force tidak layak karena
      kompleksitasnya O(n!!). Aturan pasangan terdekat dipilih karena mudah dijelaskan.
    </p>
  </div>
{/if}
