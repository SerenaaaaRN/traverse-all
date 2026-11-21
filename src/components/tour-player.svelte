<script lang="ts">
  import { viewState } from "@lib/viewState.svelte";
</script>

<div class="rounded-lg border border-neutral-200 p-3">
  <div class="mb-2 flex items-center justify-between">
    <span class="text-xs font-semibold text-neutral-700">Demo lintasan</span>
    <span class="text-xs text-neutral-500">
      {viewState.totalSteps === 0
        ? "—"
        : `Langkah ${(viewState.tourStep ?? 0) + 1} / ${viewState.totalSteps}`}
    </span>
  </div>
  <div class="flex items-center gap-2">
    <button
      type="button"
      onclick={() => (viewState.tourPlaying ? viewState.pause() : viewState.play())}
      disabled={viewState.totalSteps < 2}
      class="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {viewState.tourPlaying ? "Jeda" : "Putar"}
    </button>
    <button
      type="button"
      onclick={() => viewState.stepForward()}
      disabled={viewState.totalSteps < 2}
      class="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Langkah
    </button>
    <button
      type="button"
      onclick={() => viewState.resetTour()}
      class="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 transition hover:bg-neutral-50"
    >
      Ulang
    </button>
  </div>
  <label class="mt-3 flex items-center gap-2 text-xs text-neutral-500">
    Kecepatan
    <input type="range" min="60" max="800" step="20" bind:value={viewState.speedMs} class="h-1 flex-1" />
  </label>
</div>
