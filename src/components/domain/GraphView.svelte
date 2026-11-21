<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import type { CPPResult } from "@algorithms/types";
  import { calculateDegrees } from "@algorithms/degrees";
  import { graphState } from "@lib/graphState.svelte";

  let {
    cpp = null,
    showTour = true,
  }: { cpp?: CPPResult | null; showTour?: boolean } = $props();

  let container: HTMLDivElement | null = null;
  let map: L.Map | null = null;
  let networkLayer: L.LayerGroup | null = null;
  let augmentLayer: L.LayerGroup | null = null;
  let tourLayer: L.LayerGroup | null = null;

  const START = "P01";

  function pairKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  function draw(): void {
    if (!map) return;
    networkLayer?.clearLayers();
    augmentLayer?.clearLayers();
    tourLayer?.clearLayers();

    const graph = graphState.graph();
    const degrees = calculateDegrees(graph);
    const byId = new Map(graph.nodes.map((n) => [n.id, n]));
    const latlng = (id: string): L.LatLngExpression | null => {
      const node = byId.get(id);
      return node ? [node.lat, node.lng] : null;
    };

    // Ruas dasar.
    for (const edge of graph.edges) {
      const a = latlng(edge.source);
      const b = latlng(edge.target);
      if (!a || !b) continue;
      L.polyline([a, b], {
        color: "#64748b",
        weight: 2,
        opacity: 0.65,
      }).addTo(networkLayer!);
    }

    // Simpul: ganjil merah, titik awal hijau, sisanya biru.
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
      marker.addTo(networkLayer!);
    }

    if (cpp) {
      // Ruas yang diulang (augmentasi) — merah putus-putus.
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

      // Rute patroli lengkap.
      if (showTour && cpp.eulerCircuit) {
        const path = cpp.eulerCircuit
          .map((id) => latlng(id))
          .filter((p): p is L.LatLngExpression => p !== null);
        if (path.length > 1) {
          L.polyline(path, {
            color: "#1d4ed8",
            weight: 2,
            opacity: 0.4,
          }).addTo(tourLayer!);
        }
      }
    }

    const bounds = L.latLngBounds(
      graph.nodes.map((n) => [n.lat, n.lng] as L.LatLngTuple),
    );
    map.fitBounds(bounds, { padding: [24, 24] });
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
    augmentLayer = L.layerGroup().addTo(map);
    tourLayer = L.layerGroup().addTo(map);
    draw();
  });

  $effect(() => {
    // Melacak perubahan prop agar peta ikut diperbarui.
    void cpp;
    void showTour;
    if (map) draw();
  });

  onDestroy(() => {
    map?.remove();
    map = null;
  });
</script>

<div class="relative h-full w-full">
  <div bind:this={container} class="h-full w-full bg-slate-100"></div>
  {#if cpp}
    <div class="absolute bottom-3 left-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs shadow">
      <span class="inline-block h-2 w-4 rounded-sm bg-slate-500 align-middle"></span> ruas asli
      <span class="ml-3 inline-block h-0.5 w-4 border-t-2 border-dashed border-red-600 align-middle"></span> ruas diulang
      <span class="ml-3 inline-block h-2 w-4 rounded-sm bg-blue-700 align-middle"></span> rute patroli
    </div>
  {/if}
</div>
