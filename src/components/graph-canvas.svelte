<script lang="ts">
  import { forceDirectedLayout, type Point } from "@lib/layout";
  import { calculateDegrees } from "@algorithms/degrees";
  import { pairKey } from "@lib/pair-key";
  import { graphState } from "@lib/graph-state.svelte";
  import { GRAPH_COLORS } from "@lib/graph-colors";
  import { viewState } from "@lib/view-state.svelte";
  import GraphControls from "@components/graph-controls.svelte";
  import GraphLegend from "@components/graph-legend.svelte";

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
            stroke={current ? GRAPH_COLORS.current : visited ? GRAPH_COLORS.visited : "#94a3b8"}
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
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={GRAPH_COLORS.tour} stroke-width="2" opacity="0.4" />
          {/if}
        {/each}
      {/if}

      {#if cpp && viewState.showTour}
        {#each cpp.augmentedEdges as edge, i (i)}
          {@const a = positions.get(edge.source)}
          {@const b = positions.get(edge.target)}
          {#if a && b}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={GRAPH_COLORS.odd} stroke-width="3" stroke-dasharray="6 6" />
          {/if}
        {/each}
      {/if}

      {#if viewState.showRoute && viewState.route}
        {#each routePath as id, i (i)}
          {@const nextId = routePath[i + 1]}
          {@const a = id === undefined ? undefined : positions.get(id)}
          {@const b = nextId === undefined ? undefined : positions.get(nextId)}
          {#if a && b}
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={GRAPH_COLORS.route} stroke-width="6" />
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
            fill={node.id === startId || visited.has(node.id) ? GRAPH_COLORS.current : odd ? GRAPH_COLORS.odd : "#2563eb"}
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

  <GraphLegend />

  <GraphControls title="Kontrol graf" listId="start-options-graf" />

  <button
    type="button"
    onclick={relayout}
    class="absolute left-3 top-3 z-[500] rounded-lg bg-white/95 px-3 py-1.5 text-xs text-neutral-700 shadow transition hover:bg-white"
  >Reset layout</button>
</div>
