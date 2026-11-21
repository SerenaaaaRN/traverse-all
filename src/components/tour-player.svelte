<script lang="ts">
  import { untrack } from "svelte";

  let {
    totalSteps = 0,
    step = $bindable(0),
  }: { totalSteps?: number; step?: number } = $props();

  let playing = $state(false);
  let speedMs = $state(220);

  $effect(() => {
    void totalSteps;
    playing = false;
    step = 0;
  });

  $effect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      untrack(() => {
        if (step < totalSteps - 1) step += 1;
        else playing = false;
      });
    }, speedMs);
    return () => clearInterval(id);
  });

  function reset(): void {
    playing = false;
    step = 0;
  }
</script>

<div class="rounded-lg border border-neutral-200 p-3">
  <div class="mb-2 flex items-center justify-between">
    <span class="text-xs font-semibold text-neutral-700">Demo lintasan</span>
    <span class="text-xs text-neutral-500">
      {totalSteps === 0 ? "—" : `Langkah ${step + 1} / ${totalSteps}`}
    </span>
  </div>
  <div class="flex items-center gap-2">
    <button
      type="button"
      onclick={() => (playing = !playing)}
      disabled={totalSteps < 2}
      class="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {playing ? "Jeda" : "Putar"}
    </button>
    <button
      type="button"
      onclick={() => (step = Math.min(step + 1, totalSteps - 1))}
      disabled={totalSteps < 2 || step >= totalSteps - 1}
      class="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Langkah
    </button>
    <button
      type="button"
      onclick={reset}
      class="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 transition hover:bg-neutral-50"
    >
      Ulang
    </button>
  </div>
  <label class="mt-3 flex items-center gap-2 text-xs text-neutral-500">
    Kecepatan
    <input type="range" min="60" max="800" step="20" bind:value={speedMs} class="h-1 flex-1" />
  </label>
</div>
