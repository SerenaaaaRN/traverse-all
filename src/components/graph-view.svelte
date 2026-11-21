<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";
  import * as L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import type { PatrolNode } from "@algorithms/types";
  import { calculateDegrees } from "@algorithms/degrees";
  import { pairKey } from "@lib/pair-key";
  import { graphState } from "@lib/graph-state.svelte";
  import { GRAPH_COLORS } from "@lib/graph-colors";
  import { viewState } from "@lib/view-state.svelte";
  import GraphControls from "@components/graph-controls.svelte";
  import GraphLegend from "@components/graph-legend.svelte";

  let { visible = true }: { visible?: boolean } = $props();

  let container: HTMLDivElement | null = null;
  let map: L.Map | null = null;
  let networkLayer: L.LayerGroup | null = null;
  let augmentLayer: L.LayerGroup | null = null;
  let tourLayer: L.LayerGroup | null = null;
  let visitedLayer: L.LayerGroup | null = null;
  let routeLayer: L.LayerGroup | null = null;
  let byId = new Map<string, PatrolNode>();
  let weightLines: L.Polyline[] = [];
  let fitted = false;
  let resizeObserver: ResizeObserver | null = null;

  const startId = $derived(viewState.startNodeValid ? viewState.startNode : "P74");

  function latlng(id: string): L.LatLngExpression | null {
    const node = byId.get(id);
    return node ? [node.lat, node.lng] : null;
  }

  function syncWeightLabels(): void {
    for (const line of weightLines) {
      if (viewState.showWeights) line.openTooltip();
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
    const cpp = viewState.cpp;

    if (viewState.tourStep === null) {
      if (viewState.showTour && cpp?.eulerCircuit) {
        const path = cpp.eulerCircuit
          .map((id) => latlng(id))
          .filter((p): p is L.LatLngExpression => p !== null);
        if (path.length > 1) {
          L.polyline(path, {
            color: GRAPH_COLORS.tour,
            weight: 2,
            opacity: 0.4,
          }).addTo(tourLayer);
        }
      }
      return;
    }
    if (!cpp?.eulerCircuit) return;

    const circuit = cpp.eulerCircuit;
    const last = Math.min(Math.max(viewState.tourStep, 0), circuit.length - 1);
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
      const isLatest = i === last - 1;
      L.polyline([a, b], {
        color: isLatest ? GRAPH_COLORS.current : GRAPH_COLORS.visited,
        weight: isLatest ? 5 : 3,
        opacity: repeated ? 0.9 : 0.85,
        dashArray: repeated ? "6 6" : undefined,
      }).addTo(tourLayer);
    }

    for (let i = 0; i < last; i++) {
      const id = circuit[i];
      if (id === undefined) continue;
      const p = latlng(id);
      if (!p) continue;
      L.circleMarker(p, {
        radius: 5,
        color: "#14532d",
        weight: 1.5,
        fillColor: GRAPH_COLORS.visited,
        fillOpacity: 0.95,
      }).addTo(visitedLayer);
    }

    const activeId = circuit[last];
    const activePoint = activeId === undefined ? null : latlng(activeId);
    if (activeId !== undefined && activePoint) {
      L.marker(activePoint, {
        icon: L.divIcon({
          className: "",
          html:
            '<span class="relative flex h-6 w-6 items-center justify-center">' +
            '<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60"></span>' +
            '<span class="relative inline-flex h-5 w-5 rounded-full border-2 border-white bg-green-700"></span>' +
            "</span>",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .bindTooltip(`Sekarang: ${activeId} · langkah ${last + 1}`, {
          permanent: true,
          direction: "top",
          offset: [0, -14],
        })
        .addTo(visitedLayer);
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
    const cpp = viewState.cpp;

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
      const isStart = node.id === startId;
      const markOdd = isOdd && viewState.showOdd;
      const marker = L.circleMarker([node.lat, node.lng], {
        radius: isStart ? 8 : markOdd ? 6 : 4.5,
        color: isStart ? "#14532d" : markOdd ? "#7f1d1d" : "#1e40af",
        weight: 1.5,
        fillColor: isStart ? "#16a34a" : markOdd ? GRAPH_COLORS.odd : "#3b82f6",
        fillOpacity: 1,
      });
      marker.bindPopup(
        `<b>${node.id}</b>${node.label ? ` — ${node.label}` : ""}<br>` +
          `Derajat: ${degree} ${isOdd ? "(ganjil)" : "(genap)"}<br>` +
          `Lat: ${node.lat.toFixed(6)}, Lng: ${node.lng.toFixed(6)}`,
      );
      marker.bindTooltip(node.id, { permanent: true, direction: "top" });
      marker.on("click", () => viewState.onNodeClick(node.id));
      marker.addTo(networkLayer!);
    }

    if (cpp && viewState.showTour) {
      for (const edge of cpp.augmentedEdges) {
        const a = latlng(edge.source);
        const b = latlng(edge.target);
        if (!a || !b) continue;
        L.polyline([a, b], {
          color: GRAPH_COLORS.odd,
          weight: 3,
          opacity: 0.9,
          dashArray: "6 6",
        }).addTo(augmentLayer!);
      }
    }

    if (viewState.showRoute && viewState.route) {
      const path = viewState.route.path
        .map((id) => latlng(id))
        .filter((p): p is L.LatLngExpression => p !== null);
      if (path.length > 1) {
        L.polyline(path, {
          color: GRAPH_COLORS.route,
          weight: 5,
          opacity: 0.95,
        }).addTo(routeLayer!);
      }
      for (const id of viewState.route.stops) {
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

    if (!fitted) {
      const bounds = L.latLngBounds(graph.nodes.map((n) => [n.lat, n.lng] as L.LatLngTuple));
      map.fitBounds(bounds, { padding: [24, 24] });
      fitted = true;
    }
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
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize();
    });
    resizeObserver.observe(container);
  });

  $effect(() => {
    void graphState.nodes;
    void graphState.edges;
    void viewState.cpp;
    void viewState.startNode;
    void viewState.startNodeValid;
    void viewState.showOdd;
    void viewState.showTour;
    void viewState.showRoute;
    void viewState.route;
    if (map) draw();
  });

  $effect(() => {
    void viewState.tourStep;
    if (map) drawProgress();
  });

  $effect(() => {
    void viewState.showWeights;
    syncWeightLabels();
  });

  $effect(() => {
    if (visible && map) map.invalidateSize();
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    map?.remove();
    map = null;
  });
</script>

<div class="relative h-full w-full">
  <div bind:this={container} class="h-full w-full bg-slate-100"></div>

  <GraphControls title="Kontrol peta" listId="start-options-peta" />

  <GraphLegend />
</div>
