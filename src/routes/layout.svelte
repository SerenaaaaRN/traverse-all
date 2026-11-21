<script lang="ts">
  import type { Snippet } from "svelte";
  import { p, route } from "sv-router/generated";
  import GraphView from "@components/graph-view.svelte";
  import { viewState } from "@lib/viewState.svelte";

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
  const panelClass = $derived(activePage?.panel === "reading" ? "w-full max-w-3xl mx-auto" : "w-[380px]");

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

<div class="flex h-[100dvh] overflow-hidden">
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
    <GraphView visible={showMap} />
  </main>

  <aside class="shrink-0 overflow-y-auto border-l border-neutral-200 bg-white {panelClass}">
    <div class="p-5">
      {@render children()}
    </div>
  </aside>
</div>
