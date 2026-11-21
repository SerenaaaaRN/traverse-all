<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";
  import * as L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import type { CPPResult, PatrolNode } from "@algorithms/types";
  import type { RouteResult } from "@algorithms/route";
  import { calculateDegrees } from "@algorithms/degrees";
  import { graphState } from "@lib/graphState.svelte";

  let {
    cpp = null,
    showTour = true,
    tourStep = null,
    route = null,
    onNodeClick,
  }: {
    cpp?: CPPResult | null;
    showTour?: boolean;
    tourStep?: number | null;
    route?: RouteResult | null;
    onNodeClick?: (id: string) => void;
  } = $props();

  let container: HTMLDivElement | null = null;
  let map: L.Map | null = null;
  let networkLayer: L.LayerGroup | null = null;
  let augmentLayer: L.LayerGroup | null = null;
  let tourLayer: L.LayerGroup | null = null;
  let visitedLayer: L.LayerGroup | null = null;
  let routeLayer: L.LayerGroup | null = null;
  let byId = new Map<string, PatrolNode>();
  let weightLines: L.Polyline[] = [];
  let showWeights = $state(false);

  const START = "P74";

  function pairKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  function latlng(id: string): L.LatLngExpression | null {
    const node = byId.get(id);
    return node ? [node.lat, node.lng] : null;
  }

  function syncWeightLabels(): void {
    for (const line of weightLines) {
      if (showWeights) line.openTooltip();
      else line.closeTooltip();
    }
  }

  function drawProgress(): void {
    untrack(drawProgressImpl);
  }

  function drawProgressImpl(): void {
    if (!tourLayer || !visitedLayer) return;
    tourLayer.clearLayers();
    visitedLayer.clearLayers();

    if (tourStep === null) {
      if (showTour && cpp?.eulerCircuit) {
        const path = cpp.eulerCircuit
          .map((id) => latlng(id))
          .filter((p): p is L.LatLngExpression => p !== null);
        if (path.length > 1) {
          L.polyline(path, {
            color: "#1d4ed8",
            weight: 2,
            opacity: 0.4,
          }).addTo(tourLayer);
        }
      }
      return;
    }
    if (!cpp?.eulerCircuit) return;

    const circuit = cpp.eulerCircuit;
    const last = Math.min(Math.max(tourStep, 0), circuit.length - 1);
    const counts = new Map<string, number>();

    for (let i = 0; i < last; i++) {
      const from = circuit[i];
      const to = circuit[i + 1];
      if (from === undefined || to === undefined) continue;
      const a = latlng(from);
      const b = latlng(to);
      if (!a || !b) continue;
      const key = pairKey(from, to);
      const repeated = (counts.get(key) ?? 0) > 0;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      L.polyline([a, b], {
        color: "#4ade80",
        weight: 3,
        opacity: repeated ? 0.9 : 0.85,
        dashArray: repeated ? "6 6" : undefined,
      }).addTo(tourLayer);
    }

    for (let i = 0; i <= last; i++) {
      const id = circuit[i];
      if (id === undefined) continue;
      const p = latlng(id);
      if (!p) continue;
      L.circleMarker(p, {
        radius: 5,
        color: "#14532d",
        weight: 1.5,
        fillColor: "#4ade80",
        fillOpacity: 0.95,
      }).addTo(visitedLayer);
    }
  }

  function draw(): void {
    if (!map) return;
    networkLayer?.clearLayers();
    augmentLayer?.clearLayers();
    tourLayer?.clearLayers();
    visitedLayer?.clearLayers();
    routeLayer?.clearLayers();
    weightLines = [];

    const graph = graphState.graph();
    const degrees = calculateDegrees(graph);
    byId = new Map(graph.nodes.map((n) => [n.id, n]));

    for (const edge of graph.edges) {
      const a = latlng(edge.source);
      const b = latlng(edge.target);
      if (!a || !b) continue;
      const line = L.polyline([a, b], {
        color: "#64748b",
        weight: 2,
        opacity: 0.65,
      });
      line.bindTooltip(`${Math.round(edge.weightKm * 1000)} m`, {
        permanent: true,
        direction: "center",
      });
      line.addTo(networkLayer!);
      weightLines.push(line);
    }

    for (const node of graph.nodes) {
      const degree = degrees.get(node.id)?.degree ?? 0;
      const isOdd = degrees.get(node.id)?.isOdd ?? false;
      const isStart = node.id === START;
      const marker = L.circleMarker([node.lat, node.lng], {
        radius: isStart ? 8 : isOdd ? 6 : 4.5,
        color: isStart ? "#14532d" : isOdd ? "#7f1d1d" : "#1e40af",
        weight: 1.5,
        fillColor: isStart ? "#16a34a" : isOdd ? "#dc2626" : "#3b82f6",
        fillOpacity: 1,
      });
      marker.bindPopup(
        `<b>${node.id}</b>${node.label ? ` — ${node.label}` : ""}<br>` +
          `Derajat: ${degree} ${isOdd ? "(ganjil)" : "(genap)"}<br>` +
          `Lat: ${node.lat.toFixed(6)}, Lng: ${node.lng.toFixed(6)}`,
      );
      marker.bindTooltip(node.id, { permanent: true, direction: "top" });
      marker.on("click", () => onNodeClick?.(node.id));
      marker.addTo(networkLayer!);
    }

    if (cpp) {
      for (const edge of cpp.augmentedEdges) {
        const a = latlng(edge.source);
        const b = latlng(edge.target);
        if (!a || !b) continue;
        L.polyline([a, b], {
          color: "#dc2626",
          weight: 3,
          opacity: 0.9,
          dashArray: "6 6",
        }).addTo(augmentLayer!);
      }

    }

    if (route) {
      const path = route.path
        .map((id) => latlng(id))
        .filter((p): p is L.LatLngExpression => p !== null);
      if (path.length > 1) {
        L.polyline(path, {
          color: "#0ea5e9",
          weight: 5,
          opacity: 0.95,
        }).addTo(routeLayer!);
      }
      for (const id of route.stops) {
        const p = latlng(id);
        if (!p) continue;
        L.circleMarker(p, {
          radius: 9,
          color: "#0369a1",
          weight: 2,
          fillColor: "#38bdf8",
          fillOpacity: 1,
        }).addTo(routeLayer!);
      }
    }

    const bounds = L.latLngBounds(
      graph.nodes.map((n) => [n.lat, n.lng] as L.LatLngTuple),
    );
    map.fitBounds(bounds, { padding: [24, 24] });
    syncWeightLabels();
    drawProgress();
  }

  onMount(() => {
    if (!container) return;
    map = L.map(container, { zoomControl: true, preferCanvas: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    networkLayer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);
    augmentLayer = L.layerGroup().addTo(map);
    tourLayer = L.layerGroup().addTo(map);
    visitedLayer = L.layerGroup().addTo(map);
    draw();
  });

  $effect(() => {
    void cpp;
    void showTour;
    void route;
    if (map) draw();
  });

  $effect(() => {
    void tourStep;
    if (map) drawProgress();
  });

  $effect(() => {
    void showWeights;
    syncWeightLabels();
  });

  onDestroy(() => {
    map?.remove();
    map = null;
  });
</script>

<div class="relative h-full w-full">
  <div bind:this={container} class="h-full w-full bg-slate-100"></div>
  <button
    type="button"
    onclick={() => (showWeights = !showWeights)}
    class="absolute right-3 top-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs shadow transition hover:bg-white"
  >
    Bobot {showWeights ? "aktif" : "nonaktif"}
  </button>
  {#if cpp}
    <div class="absolute bottom-3 left-3 z-500 rounded-lg bg-white/95 px-3 py-2 text-xs shadow">
      <span class="inline-block h-2 w-4 rounded-sm bg-slate-500 align-middle"></span> ruas asli
      <span class="ml-3 inline-block h-0.5 w-4 border-t-2 border-dashed border-red-600 align-middle"></span> ruas diulang
      <span class="ml-3 inline-block h-2 w-4 rounded-sm bg-blue-700 align-middle"></span> rute patroli
      <span class="ml-3 inline-block h-2 w-4 rounded-sm bg-green-400 align-middle"></span> dilalui
    </div>
  {/if}
</div>
