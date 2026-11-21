<script lang="ts">
  import { forceDirectedLayout, type Point } from "@algorithms/layout";
  import { calculateDegrees } from "@algorithms/degrees";
  import { graphState } from "@lib/graphState.svelte";
  import { viewState } from "@lib/viewState.svelte";

  let svgEl: SVGSVGElement | null = null;

  let positions = $state<Map<string, Point>>(new Map());
  let pan = $state({ x: 0, y: 0 });
  let scale = $state(1);

  let panning = false;
  let last = { x: 0, y: 0 };
  let layoutKey = "";

  const graph = $derived(graphState.graph());
  const degrees = $derived(calculateDegrees(graph));
  const cpp = $derived(viewState.cpp);
  const circuit = $derived(cpp?.eulerCircuit ?? []);
  const step = $derived(viewState.tourStep ?? 0);
  const currentId = $derived(circuit[step] ?? null);
  const previousId = $derived(circuit[Math.max(step - 1, 0)] ?? null);
  const visited = $derived(new Set(circuit.slice(0, step + 1)));
  const routePath = $derived(viewState.route?.path ?? []);
  const startId = $derived(viewState.startNodeValid ? viewState.startNode : "P74");

  function pairKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  const visitedEdges = $derived.by(() => {
    const keys = new Set<string>();
    if (!viewState.showTour || viewState.tourStep === null) return keys;
    const last = Math.min(viewState.tourStep, circuit.length - 1);
    for (let i = 0; i < last; i++) {
      const a = circuit[i];
      const b = circuit[i + 1];
      if (a !== undefined && b !== undefined) keys.add(pairKey(a, b));
    }
    return keys;
  });

  function relayout(): void {
    positions = forceDirectedLayout(graphState.graph(), { size: 1000 });
    pan = { x: 0, y: 0 };
    scale = 1;
  }

  $effect(() => {
    void graphState.nodes;
    void graphState.edges;
    const signature = graphState.nodes.map((n) => n.id).join("|");
    if (signature !== layoutKey) {
      layoutKey = signature;
      relayout();
    }
  });

  function toSvg(e: { clientX: number; clientY: number }): Point {
    const svg = svgEl;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const result = point.matrixTransform(ctm.inverse());
    return { x: result.x, y: result.y };
  }

  function onPanStart(e: PointerEvent): void {
    panning = true;
    last = { x: e.clientX, y: e.clientY };
    (e.currentTarget as SVGRectElement).setPointerCapture(e.pointerId);
  }

  function onPanMove(e: PointerEvent): void {
    if (!panning || !svgEl) return;
    const dx = (e.clientX - last.x) * (1000 / svgEl.clientWidth);
    const dy = (e.clientY - last.y) * (1000 / svgEl.clientHeight);
    pan = { x: pan.x + dx, y: pan.y + dy };
    last = { x: e.clientX, y: e.clientY };
  }

  function onPanEnd(e: PointerEvent): void {
    panning = false;
    const target = e.currentTarget as SVGRectElement;
    if (target.hasPointerCapture(e.pointerId)) target.releasePointerCapture(e.pointerId);
  }

  function onWheel(e: WheelEvent): void {
    e.preventDefault();
    const point = toSvg(e);
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const next = Math.min(6, Math.max(0.3, scale * factor));
    const cx = (point.x - pan.x) / scale;
    const cy = (point.y - pan.y) / scale;
    pan = { x: point.x - cx * next, y: point.y - cy * next };
    scale = next;
  }

  function isCurrentEdge(source: string, target: string): boolean {
    if (!viewState.showTour || viewState.tourStep === null) return false;
    if (currentId === null || previousId === null) return false;
    return (
      (source === previousId && target === currentId) ||
      (source === currentId && target === previousId)
    );
  }
</script>

<div class="relative h-full w-full bg-white">
  <svg bind:this={svgEl} viewBox="0 0 1000 1000" class="h-full w-full touch-none" onwheel={onWheel}>
    <rect
      width="1000"
      height="1000"
      fill="transparent"
      role="presentation"
      onpointerdown={onPanStart}
      onpointermove={onPanMove}
      onpointerup={onPanEnd}
      onpointercancel={onPanEnd}
    />
    <g transform="translate({pan.x} {pan.y}) scale({scale})">
      {#each graph.edges as edge, i (i)}
        {@const a = positions.get(edge.source)}
        {@const b = positions.get(edge.target)}
        {@const current = isCurrentEdge(edge.source, edge.target)}
        {@const visited = visitedEdges.has(pairKey(edge.source, edge.target))}
        {#if a && b}
          <line
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={current ? "#15803d" : visited ? "#4ade80" : "#94a3b8"}
            stroke-width={current ? 6 : visited ? 3 : 2}
          />
          {#if viewState.showWeights}
            <text
              x={(a.x + b.x) / 2}
              y={(a.y + b.y) / 2 - 4}
              text-anchor="middle"
              font-size="9"
              fill="#64748b"
              pointer-events="none"
            >{Math.round(edge.weightKm * 1000)} m</text>
          {/if}
        {/if}
      {/each}

      {#if viewState.showTour && viewState.tourStep === null}
        {#each circuit as id, i (i)}
          {@const nextId = circuit[i + 1]}
          {@const a = id === undefined ? undefined : positions.get(id)}
          {@const b = nextId === undefined ? undefined : positions.get(nextId)}
          {#if a && b}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1d4ed8" stroke-width="2" opacity="0.4" />
          {/if}
        {/each}
      {/if}

      {#if cpp && viewState.showTour}
        {#each cpp.augmentedEdges as edge, i (i)}
          {@const a = positions.get(edge.source)}
          {@const b = positions.get(edge.target)}
          {#if a && b}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#dc2626" stroke-width="3" stroke-dasharray="6 6" />
          {/if}
        {/each}
      {/if}

      {#if viewState.showRoute && viewState.route}
        {#each routePath as id, i (i)}
          {@const nextId = routePath[i + 1]}
          {@const a = id === undefined ? undefined : positions.get(id)}
          {@const b = nextId === undefined ? undefined : positions.get(nextId)}
          {#if a && b}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#0ea5e9" stroke-width="6" />
          {/if}
        {/each}
      {/if}

      {#each graph.nodes as node (node.id)}
        {@const p = positions.get(node.id)}
        {@const odd = (degrees.get(node.id)?.isOdd ?? false) && viewState.showOdd}
        {#if p}
          <circle
            cx={p.x}
            cy={p.y}
            r={node.id === startId ? 10 : odd ? 8 : 6}
            fill={node.id === startId || visited.has(node.id) ? "#15803d" : odd ? "#dc2626" : "#2563eb"}
            stroke="white"
            stroke-width="2"
            role="button"
            tabindex="0"
            onclick={() => viewState.onNodeClick(node.id)}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") viewState.onNodeClick(node.id);
            }}
            class="cursor-pointer"
          />
          <text x={p.x} y={p.y - 14} text-anchor="middle" font-size="11" pointer-events="none">{node.id}</text>
        {/if}
      {/each}
    </g>
  </svg>

  <div class="absolute bottom-3 left-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs shadow">
    <span class="inline-block h-2 w-4 rounded-sm bg-slate-400 align-middle"></span> ruas asli
    <span class="ml-3 inline-block h-0.5 w-4 border-t-2 border-dashed border-red-600 align-middle"></span> diulang
    <span class="ml-3 inline-block h-2 w-4 rounded-sm bg-blue-700 align-middle"></span> CPP
    <span class="ml-3 inline-block h-2 w-4 rounded-sm bg-green-700 align-middle"></span> dilalui
    <span class="ml-3 inline-block h-2 w-4 rounded-sm bg-sky-500 align-middle"></span> Dijkstra
  </div>

  <div class="absolute right-3 top-3 z-[500] w-40 rounded-lg bg-white/95 p-3 text-xs shadow">
    <div class="mb-3">
      <p class="mb-1 font-semibold text-neutral-700">Titik awal</p>
      <div class="flex gap-1">
        <input
          type="text"
          bind:value={viewState.startNodeDraft}
          onchange={() => viewState.commitStartNode()}
          list="start-options-graf"
          placeholder="P74"
          class="min-w-0 flex-1 rounded border border-neutral-300 px-1.5 py-1 text-xs"
        />
        <button
          type="button"
          onclick={() => viewState.resetStartNode()}
          class="rounded border border-neutral-300 px-1.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
        >Reset</button>
      </div>
      <datalist id="start-options-graf">
        {#each graphState.nodes as node (node.id)}
          <option value={node.id}></option>
        {/each}
      </datalist>
      {#if !viewState.startNodeValid}
        <p class="mt-1 text-[10px] text-amber-700">Tidak ditemukan — pakai P74</p>
      {/if}
    </div>
    <p class="mb-2 font-semibold text-neutral-700">Kontrol graf</p>
    <label class="flex items-center gap-2 py-0.5 text-neutral-600">
      <input type="checkbox" bind:checked={viewState.showWeights} class="accent-blue-600" />
      Bobot (m)
    </label>
    <label class="flex items-center gap-2 py-0.5 text-neutral-600">
      <input type="checkbox" bind:checked={viewState.showOdd} class="accent-blue-600" />
      Simpul ganjil
    </label>
    <label class="flex items-center gap-2 py-0.5 text-neutral-600">
      <input type="checkbox" bind:checked={viewState.showTour} class="accent-blue-600" />
      Rute CPP
    </label>
    <label class="flex items-center gap-2 py-0.5 text-neutral-600">
      <input type="checkbox" bind:checked={viewState.showRoute} class="accent-blue-600" />
      Rute Dijkstra
    </label>
  </div>

  <button
    type="button"
    onclick={relayout}
    class="absolute left-3 top-3 z-[500] rounded-lg bg-white/95 px-3 py-1.5 text-xs text-neutral-700 shadow transition hover:bg-white"
  >Reset layout</button>
</div>
