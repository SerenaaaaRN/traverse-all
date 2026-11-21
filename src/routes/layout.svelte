<script lang="ts">
  import type { Snippet } from "svelte";
  import { p, route } from "sv-router/generated";
  import GraphView from "@components/graph-view.svelte";
  import GraphCanvas from "@components/graph-canvas.svelte";
  import { viewState } from "@lib/view-state.svelte";

  let { children }: { children: Snippet } = $props();

  type Page = {
    href: string;
    key: string;
    label: string;
    withMap: boolean;
    panel: "compact" | "reading";
  };

  const pages: Page[] = [
    { href: p("/"), key: "peta", label: "Peta", withMap: true, panel: "compact" },
    { href: p("/analysis"), key: "analisis", label: "Analisis", withMap: true, panel: "compact" },
    { href: p("/route"), key: "rute", label: "Rute", withMap: true, panel: "compact" },
    { href: p("/comparison"), key: "banding", label: "Banding", withMap: true, panel: "compact" },
    { href: p("/nodes"), key: "simpul", label: "Simpul", withMap: true, panel: "compact" },
    { href: p("/theory"), key: "teori", label: "Teori", withMap: false, panel: "reading" },
  ];

  const activePage = $derived(pages.find((page) => page.href === route.pathname));
  const showMap = $derived(activePage?.withMap ?? true);
  let panelOpen = $state(true);
  const isReading = $derived((activePage?.panel ?? "compact") === "reading");
  const panelWidth = $derived(isReading ? "w-full max-w-3xl mx-auto" : panelOpen ? "w-[420px]" : "w-10");

  $effect(() => {
    if (!viewState.tourPlaying) return;
    const id = setInterval(() => {
      const total = viewState.totalSteps;
      if (viewState.tourStep === null) viewState.tourStep = 0;
      else if (viewState.tourStep < total - 1) viewState.tourStep += 1;
      else viewState.tourPlaying = false;
    }, viewState.speedMs);
    return () => clearInterval(id);
  });
</script>

<div class="relative flex h-[100dvh] overflow-hidden">
  <aside class="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-neutral-200 bg-white py-3">
    <div class="mb-3 text-lg font-black text-blue-700">K</div>
    {#each pages as item (item.href)}
      <a
        href={item.href}
        class="group flex w-14 flex-col items-center gap-1 rounded-lg px-1 py-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          {#if item.key === "peta"}
            <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" />
          {:else if item.key === "analisis"}
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          {:else if item.key === "rute"}
            <circle cx="5" cy="18" r="2" /><circle cx="19" cy="6" r="2" /><path d="M7 18h5a3 3 0 003-3V8" />
          {:else if item.key === "banding"}
            <path d="M4 4h7v16H4zM13 4h7v16h-7z" />
          {:else if item.key === "simpul"}
            <path d="M3 5h18v14H3zM3 10h18M9 5v14" />
          {:else}
            <path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2zM19 3h1v18h-1" />
          {/if}
        </svg>
        <span class="text-[10px] leading-none">{item.label}</span>
      </a>
    {/each}
  </aside>

  <main class={showMap ? "relative min-w-0 flex-1" : "hidden"}>
    {#if viewState.viewMode === "graf"}
      <GraphCanvas />
    {:else}
      <GraphView visible={showMap} />
    {/if}
    {#if showMap}
      <div class="absolute left-1/2 top-3 z-[9999] flex -translate-x-1/2 gap-1 rounded-lg bg-white/95 p-1 text-xs shadow">
        <button
          type="button"
          onclick={() => (viewState.viewMode = "peta")}
          class="rounded px-2.5 py-1 transition {viewState.viewMode === 'peta' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}"
        >Peta</button>
        <button
          type="button"
          onclick={() => (viewState.viewMode = "graf")}
          class="rounded px-2.5 py-1 transition {viewState.viewMode === 'graf' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}"
        >Graf</button>
      </div>
    {/if}
  </main>

  <aside
    class="shrink-0 border-l border-neutral-200 bg-white {isReading
      ? 'overflow-y-auto'
      : 'overflow-hidden transition-[width] duration-200 ease-out'} {panelWidth}"
  >
    {#if isReading}
      <div class="p-5">
        {@render children()}
      </div>
    {:else if !panelOpen}
      <button
        class="flex h-full w-full flex-col items-center gap-3 bg-white pt-4 text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-700"
        aria-label="Buka panel"
        title="Buka panel"
        onclick={() => (panelOpen = true)}
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span class="text-[10px] tracking-[0.2em] [writing-mode:vertical-rl]">PANEL</span>
      </button>
    {:else}
      <div class="h-full overflow-y-auto">
        <div class="flex justify-end px-2 pt-2">
          <button
            class="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Tutup panel"
            title="Tutup panel"
            onclick={() => (panelOpen = false)}
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <div class="p-5 pt-1">
          {@render children()}
        </div>
      </div>
    {/if}
  </aside>
</div>
