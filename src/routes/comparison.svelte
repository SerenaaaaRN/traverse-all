<script lang="ts">
  import { solveCPP } from "@algorithms/cpp";
  import { graphState } from "@lib/graphState.svelte";

  const result = $derived(solveCPP(graphState.graph()));
  const baseline = $derived(2 * result.baseDistanceKm);
  const saving = $derived(
    ((baseline - result.totalInspectionDistanceKm) / baseline) * 100,
  );
  const extra = $derived(result.augmentedEdges.length);
</script>

<div class="h-full overflow-y-auto p-8">
  <div class="mx-auto max-w-3xl">
    <h1 class="text-xl font-bold text-neutral-900">Perbandingan Rute Patroli</h1>
    <p class="mt-1 text-sm text-neutral-500">
      Efisiensi rute CPP terhadap baseline duplikasi seluruh ruas jalan.
    </p>

    <div class="mt-6 overflow-hidden rounded-lg border border-neutral-200">
      <table class="w-full text-left text-sm">
        <thead class="bg-neutral-50 text-neutral-500">
          <tr>
            <th class="px-4 py-3 font-medium">Strategi</th>
            <th class="px-4 py-3 text-right font-medium">Augmentasi</th>
            <th class="px-4 py-3 text-right font-medium">Total tour</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-t border-neutral-100">
            <td class="px-4 py-3 text-neutral-600">Baseline — semua ruas 2×</td>
            <td class="px-4 py-3 text-right text-neutral-500">—</td>
            <td class="px-4 py-3 text-right font-mono text-neutral-700">{baseline.toFixed(3)} km</td>
          </tr>
          <tr class="border-t border-neutral-100 bg-blue-50">
            <td class="px-4 py-3 font-medium text-blue-900">CPP — pasangan terdekat</td>
            <td class="px-4 py-3 text-right font-mono text-blue-800">{result.augmentationCostKm.toFixed(3)} km</td>
            <td class="px-4 py-3 text-right font-mono font-bold text-blue-900">
              {result.totalInspectionDistanceKm.toFixed(3)} km
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 grid grid-cols-3 gap-3">
      <div class="rounded-lg border border-neutral-200 p-4">
        <p class="text-xs text-neutral-500">Penghematan</p>
        <p class="text-2xl font-bold text-green-700">{saving.toFixed(2)}%</p>
      </div>
      <div class="rounded-lg border border-neutral-200 p-4">
        <p class="text-xs text-neutral-500">Ruas diulang</p>
        <p class="text-2xl font-bold text-neutral-800">{extra}</p>
      </div>
      <div class="rounded-lg border border-neutral-200 p-4">
        <p class="text-xs text-neutral-500">Langkah tour</p>
        <p class="text-2xl font-bold text-neutral-800">{result.eulerCircuit?.length ?? 0}</p>
      </div>
    </div>

    <div class="mt-6 rounded-lg bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-600">
      <p>
        Baseline mengandaikan petugas menempuh setiap ruas dua kali (pergi dan
        pulang), sehingga totalnya {baseline.toFixed(3)} km. CPP hanya mengulang
        ruas yang diperlukan untuk membuat seluruh derajat simpul menjadi genap,
        yaitu sepanjang {result.augmentationCostKm.toFixed(3)} km.
      </p>
      <p class="mt-2">
        Aturan pasangan terdekat dipilih karena sederhana dan dapat dijelaskan:
        simpul ganjil diurutkan berdasarkan jarak terpendeknya, lalu dipasangkan
        satu per satu. Untuk 38 simpul ganjil pada jaringan ini, pendekatan
        brute force tidak lagi layak karena kompleksitasnya O(n!!).
      </p>
    </div>
  </div>
</div>
