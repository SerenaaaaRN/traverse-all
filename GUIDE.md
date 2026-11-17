# 📘 MASTER GUIDEBOOK v2: Transmusi Euler & CPP

**Project:** Analisis Chinese Postman Problem pada Jaringan Transportasi Umum Massal Kota Palembang
**Stack:** Bun | Svelte 5 (Vite) | sv-router | TypeScript (Strict) | Leaflet (imageOverlay) | Cytoscape.js (opsional)
**Peta sumber:** `public/transportasi_palembang.webp` (FDTPLM, akurat per Jan 2024)

---

## 🔒 KEPUTUSAN DESAIN (LOCKED)

| Aspek | Keputusan | Konsekuensi |
|---|---|---|
| **Scope graf** | FULL NETWORK — LRT Sumatera Selatan + BRT Transmusi koridor 1–4 + Feeder ME (semua) + Kertoapati | Ratusan node/edge. Entry data = fase terberat. Filter koridor wajib di UI. |
| **Visualisasi peta** | Leaflet + `imageOverlay` webp + `CRS.Simple` (koordinat pixel) | `TransitNode.x/y` = pixel, konsisten dengan peta sumber |
| **Arah edge** | Undirected approximation. `isOneWay` tetap dicatat di data untuk visualisasi/disclaimer, tapi diabaikan dalam perhitungan derajat & CPP | Simpler & valid akademik dengan disclaimer tertulis |
| **Matching** | Brute force untuk ≤ 10 odd nodes, Greedy Nearest Neighbor untuk > 10. **Keduanya dijalankan & dibandingkan** di UI | Nilai akademik plus: perbandingan optimality gap |
| **Router** | `sv-router` (paket npm resmi, plugin `router()`, layout pakai snippet `children`, navigasi via `p()` dari `sv-router/generated`) | ⚠️ Guide v1 memakai API fiktif (`svRoutes()`, `+page.svelte`) — sudah dikoreksi |

---

## 🗺️ GAMBARAN BESAR (BIG PICTURE)

```text
Peta webp ──(klik & ukur di Data Entry Mode)──> transmusi.json (graf typed)
                                                        │
                          ┌─────────────────────────────┤
                          ▼                             ▼
                   ALGORITMA (pure TS)           VISUALISASI (Leaflet)
                   calculateDegrees              imageOverlay peta
                   euler check                   polyline per koridor
                   dijkstra                      marker halte
                   matching (brute/greedy)       augmented edges (dashed red)
                   augment graph                 DegreeTable + highlighting
                   hierholzer euler circuit      CPPStepVisualizer
                          │                             ▲
                          └───────── CPPResult ─────────┘
```

**Urutan pengerjaan yang disarankan (timeline kasar):**

1. FASE 0 — Setup (0.5 hari)
2. FASE 1 — Tipe data (0.5 hari)
3. **FASE 2 — Data entry tool + entry data full network (3–5 hari)** ⬅️ terberat, mulai SEKARANG setelah setup
4. FASE 3 — Algoritma (2–3 hari, bisa paralel dengan entry data)
5. FASE 5 — Visualisasi (2–3 hari)
6. FASE 4 — Routing & state (0.5 hari, trivial dengan sv-router)
7. FASE 5b — Fitur tambahan (1–2 hari, bisa bertahap sesuai sisa waktu)
8. FASE 6 — Testing & validasi (1–2 hari)
9. FASE 7 — Polish presentasi

---

## FASE 0: Setup Project dengan Bun & sv-router

### 1. Inisialisasi

```bash
bun create vite@latest transmusi-euler --template svelte-ts
cd transmusi-euler
bun install leaflet cytoscape @types/leaflet @types/cytoscape
bun install sv-router
```

> ⚠️ Nama paket adalah **`sv-router`** (bukan `sv-routes`). Dokumentasi resmi: https://sv-router.dev

### 2. Konfigurasi Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { router } from "sv-router/vite";
import path from "path";

export default defineConfig({
  plugins: [
    svelte(),
    router({
      // sv-router membaca file .svelte di folder ini sebagai route
      path: "src/routes",
    }),
  ],
  resolve: {
    alias: {
      "@algorithms": path.resolve(__dirname, "./src/algorithms"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@ui": path.resolve(__dirname, "./src/ui"),
    },
  },
});
```

### 3. TypeScript Strict

```jsonc
// tsconfig.json (bagian compilerOptions)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": {
      "@algorithms/*": ["src/algorithms/*"],
      "@data/*": ["src/data/*"],
      "@ui/*": ["src/ui/*"]
    }
  }
}
```

### 4. Struktur Folder Final

```text
transmusi-euler/
├── public/
│   └── transportasi_palembang.webp
├── src/
│   ├── algorithms/             # Pure Math Logic (no side effects)
│   │   ├── types.ts            # Base interfaces (kontrak tunggal)
│   │   ├── degrees.ts          # Hitung derajat simpul
│   │   ├── euler.ts            # Euler check + Hierholzer circuit
│   │   ├── dijkstra.ts         # Shortest path
│   │   ├── matching.ts         # Brute force + greedy matching
│   │   └── cpp.ts              # Pipeline CPP lengkap
│   ├── data/
│   │   ├── transmusi.json      # Dataset full network (dihasilkan Data Entry Mode)
│   │   └── routes.ts           # Metadata koridor (id, warna, mode, nama)
│   ├── components/
│   │   ├── ui/                 # SHADCN PRIMITIVES (zero domain logic)
│   │   └── domain/             # Transmusi/Euler/CPP specific
│   │       ├── MapView.svelte          # Leaflet + imageOverlay + graf overlay
│   │       ├── DegreeTable.svelte      # Tabel derajat + highlighting odd/even
│   │       ├── CPPStepVisualizer.svelte
│   │       ├── RouteAnimator.svelte    # + slider kecepatan & step manual
│   │       ├── EdgeWeightLegend.svelte
│   │       ├── CorridorFilter.svelte   # Toggle LRT / koridor / feeder
│   │       ├── NetworkStats.svelte     # Dashboard statistik jaringan
│   │       ├── TheoryInteractive.svelte # Mini-graf klikable di halaman teori
│   │       └── HalteSearch.svelte      # Search halte → zoom peta
│   ├── routes/                 # SV-ROUTER (file-based)
│   │   ├── layout.svelte       # Root layout: nav + PERSISTENT STATE
│   │   ├── index.svelte        # Peta + graf utama
│   │   ├── theory.svelte       # Halaman teori Euler & CPP
│   │   ├── analysis.svelte     # Analisis derajat, odd nodes, CPP result
│   │   ├── comparison.svelte   # Perbandingan brute vs greedy + baseline
│   │   └── data-entry.svelte   # ⭐ Tool entry data (klik node, drag edge)
│   ├── lib/
│   │   ├── graphState.svelte.ts  # Global state ($state rune module)
│   │   └── leafletImage.ts       # Kalibrasi skala & konversi pixel-km
│   ├── utils/
│   │   └── formatters.ts
│   └── main.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## FASE 1: Pemodelan Tipe Data Graf (TypeScript Strict)

File `src/algorithms/types.ts` — kontrak tunggal seluruh project.

```typescript
/** Mode transportasi (dipakai untuk warna & filter) */
export type TransportMode = "lrt" | "brt" | "feeder" | "kereta";

/**
 * Metadata satu koridor/jalur (LRT-1, koridor BRT 1..4, ME-1..9, dst)
 * Didefinisikan manual di src/data/routes.ts
 */
export interface RouteLine {
  id: string;          // "LRT-1" | "TM-1" | "ME-3" | "KR-1"
  name: string;        // "Terminal Alang-Alang Lebar - Ampera"
  mode: TransportMode;
  color: string;       // hex, ikut warna peta asli
}

export interface TransitNode {
  id: string;          // konvensi: <KORIS>_<NAMA>, mis "K1_ALANG_ALANG_LEBAR"
  label: string;       // nama halte asli di peta
  x: number;           // pixel X pada transportasi_palembang.webp
  y: number;           // pixel Y pada transportasi_palembang.webp
  type: "station" | "stop" | "terminal" | "transfer";
  routeIds: string[];  // koridor yang melayani halte ini (untuk filter)
}

export interface TransitEdge {
  source: string;
  target: string;
  weightKm: number;    // WAJIB number — error compile kalau lupa diisi
  isOneWay: boolean;   // dicatat untuk visualisasi; diabaikan di perhitungan (undirected)
  routeId: string;
}

export interface TransitGraph {
  nodes: TransitNode[];
  edges: TransitEdge[];
}

export interface DegreeInfo {
  nodeId: string;
  degree: number;
  isOdd: boolean;
}

/** Hasil satu strategi matching (brute / greedy) */
export interface MatchingStrategyResult {
  strategy: "brute-force" | "greedy";
  pairs: Array<{ u: string; v: string; costKm: number }>;
  totalCostKm: number;
  /** dijalankan atau tidak (greedy tetap dijalankan walau ≤10, brute skip jika >10) */
  executed: boolean;
}

export interface CPPResult {
  hasEulerCircuit: boolean;
  hasEulerPath: boolean;
  oddNodes: string[];
  augmentedEdges: Array<{ source: string; target: string; weightKm: number }>;
  eulerCircuit: string[] | null;   // urutan node dari Hierholzer (final route!)
  totalInspectionDistanceKm: number;
  baseDistanceKm: number;
  augmentationCostKm: number;
  strategies: MatchingStrategyResult[];  // untuk halaman comparison
}
```

> **Catatan:** `weightKm: number` tanpa `?` memaksa setiap edge punya jarak. `eulerCircuit` ditambahkan karena CPP tidak lengkap tanpa tahap akhir: membentuk rute aktual yang bisa dianimasikan.

---

## FASE 2: ⭐ Data Acquisition Protocol (FASE TERPENTING)

Full network ≈ ratusan halte. **Jangan entry manual dengan mengetik koordinat di file TS.** Strateginya: buat **Data Entry Mode** — sebuah route `/data-entry` yang menampilkan peta webp dan memungkinkan klik untuk membuat node, klik-antara-node untuk edge, lalu ekspor JSON.

### 2.1 Kalibrasi Skala (pixel → km)

1. Pilih dua halte dengan jarak real-world yang diketahui (mis. dua stasiun LRT yang jaraknya terdokumentasi, atau ukur di Google Maps "Measure Distance").
2. Keduanya diklik di peta → tool menampilkan jarak pixel (`hypot(Δx, Δy)`).
3. Hitung `kmPerPixel = jarakKmAsli / jarakPixel`. Simpan sebagai konstanta.
4. Semua bobot edge dihitung: `weightKm = pixelDistance(edge) * kmPerPixel`.
5. Simpan hasil kalibrasi (titik A, titik B, kmPerPixel) di `transmusi.json` agar reproducible.

> ⚠️ Peta transit tidak persis sejaras peta geografis (layout distorsi). Gunakan **satu rasio skala global** + verifikasi silang dengan 2–3 pasangan halte lain; toleransi ±10% masih dapat dibenarkan dengan disclaimer.

### 2.2 Konvensi Penamaan ID

```text
Prefix koridor: LRT_ | K1_..K4_ (BRT) | ME1_..ME9_ (feeder) | KR_ (kertoapati)
Contoh: LRT_BANDARA, K1_ALANG_ALANG_LEBAR, ME3_PUNTI_KAYU
Transfer node (halte dilayani ≥2 koridor): gunakan satu node bersama, bukan duplikat.
```

### 2.3 Spesifikasi Data Entry Mode (route `/data-entry`)

Fitur minimum tool:

- [ ] Load `transportasi_palembang.webp` full-res di Leaflet (`CRS.Simple`, `imageOverlay`)
- [ ] Mode "Add Node": klik peta → form mini (label, type, koridor) → node muncul sebagai marker
- [ ] Mode "Add Edge": klik node A → klik node B → dialog input `isOneWay` → weightKm dihitung otomatis dari kalibrasi
- [ ] Mode "Calibrate": klik 2 titik, input jarak km asli → set `kmPerPixel`
- [ ] List panel: semua node & edge yang sudah dibuat, bisa edit/delete
- [ ] **Export JSON** (download `transmusi.json`) dan **Import JSON** (untuk melanjutkan sesi lainnya)
- [ ] Auto-save ke `localStorage` tiap perubahan (antisipasi tab close)
- [ ] Validasi: node dengan degree 0, edge duplikat, edge menghubungkan node tak dikenal

### 2.4 Format Penyimpanan

Data disimpan sebagai **`src/data/transmusi.json`** (bukan `.ts`) supaya bisa di-export dari tool entry dan di-import dengan tipe:

```typescript
// src/data/index.ts
import raw from "./transmusi.json";
import type { TransitGraph } from "@algorithms/types";

export const transmusiFullNetwork: TransitGraph = validateGraph(raw);
// validateGraph(): runtime guard — cek struktur, node id unik, edge endpoints valid.
// Lempar error jelas jika data rusak, jangan biarkan graf rusak masuk algoritma.
```

### 2.5 Strategi Entry Supaya Tidak Overwhelm

- Entry **per koridor**, satu sesi satu koridor (LRT dulu → BRT 1..4 → feeder → Kertoapati).
- Setiap selesai satu koridor, export + commit ke git (`data: add koridor 2`).
- Halte transfer dibuat sekali saat koridor pertama melewati; koridor berikut tinggal referensi `routeIds.push(...)`.

---

## FASE 3: Implementasi Algoritma Diskrit (Pure TypeScript)

Semua fungsi murni, tanpa side effect, tanpa akses DOM/state.

### 3.1 Derajat Simpul (`src/algorithms/degrees.ts`)

```typescript
import type { TransitGraph, DegreeInfo } from "@algorithms/types";

/**
 * Derajat simpul untuk graf undirected.
 * Keputusan desain: isOneWay diabaikan (undirected approximation).
 * Self-loop (source === target) menambah derajat 2.
 */
export function calculateDegrees(graph: TransitGraph): Map<string, DegreeInfo> {
  const counts = new Map<string, number>();
  for (const node of graph.nodes) counts.set(node.id, 0);

  for (const edge of graph.edges) {
    counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
    if (edge.source !== edge.target) {
      counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
    }
  }

  const result = new Map<string, DegreeInfo>();
  for (const [id, deg] of counts) {
    result.set(id, { nodeId: id, degree: deg, isOdd: deg % 2 !== 0 });
  }
  return result;
}
```

### 3.2 Dijkstra (`src/algorithms/dijkstra.ts`)

Standard binary-heap atau simple array (graf ≤ 500 node — simple array cukup). Return **path + distance**, bukan hanya distance (dibutuhkan untuk augmented edges yang bisa dianimasikan).

```typescript
export interface ShortestPath {
  distanceKm: number;
  path: string[]; // node ids dari source ke target
}
export function dijkstraShortestPath(
  graph: TransitGraph,
  source: string,
  target: string,
): ShortestPath | null;
```

### 3.3 Matching (`src/algorithms/matching.ts`)

Dua strategi, interface sama:

```typescript
export type DistanceMatrix = Map<string, Map<string, ShortestPath>>;

/** Exact — hanya dijalankan jika oddNodes.length <= 10 (O(n!!) guard) */
export function findBruteForceMatching(
  oddNodes: string[],
  matrix: DistanceMatrix,
): MatchingStrategyResult;

/** Greedy Nearest Neighbor — selalu dijalankan, wajib untuk >10 odd nodes */
export function findGreedyMatching(
  oddNodes: string[],
  matrix: DistanceMatrix,
): MatchingStrategyResult;
```

Brute force: rekursi pairing semua kombinasi `(n-1)!!`. Greedy: urutkan semua pasangan berdasarkan cost, ambil terkecil yang kedua ujungnya belum dipakai. **Catatan akademik:** greedy bukan optimal, halaman `/comparison` menampilkan selisihnya.

### 3.4 Hierholzer — Pembentuk Rute Euler (`src/algorithms/euler.ts`)

```typescript
/**
 * Membentuk sirkuit/lintasan Euler dari graf yang sudah Eulerian
 * (setelah augmentasi). Return urutan node, atau null jika graf
 * ternyata tidak Eulerian (sanity check).
 */
export function hierholzer(
  nodeIds: string[],
  edges: Array<{ source: string; target: string }>,
  startNode: string,
): string[] | null;
```

### 3.5 Pipeline CPP (`src/algorithms/cpp.ts`)

```typescript
export function solveCPP(
  graph: TransitGraph,
  strategy: "auto" | "greedy" = "auto",
): CPPResult {
  // 1. calculateDegrees → oddNodes
  // 2. baseWeight = Σ weightKm
  // 3. Jika 0 odd  → Euler circuit langsung (Hierholzer), augmentasi 0
  // 4. Jika 2 odd  → Euler path dari odd pertama (Hierholzer), augmentasi 0
  // 5. Jika >2 odd →
  //    a. Dijkstra antar semua pasangan odd → distanceMatrix
  //    b. Jalankan KEDUA strategi matching (brute jika ≤10, greedy selalu)
  //    c. Pilih hasil strategy yang diminta (auto = terbaik yang dieksekusi)
  //    d. Untuk tiap pair matched: augmentasi = salin PATH Dijkstra
  //       (bukan 1 edge langsung!) → augmentedEdges per-ruas
  //    e. Graf teraugmentasi → Hierholzer → eulerCircuit
  // 6. Return CPPResult lengkap
}
```

> **Penting (perbaikan dari guide v1):** augmentasi bukan sekadar menambah edge virtual `{odd_u, odd_v}` — augmented edges harus **mengikuti path Dijkstra node-per-node**, karena graf augmented yang di-Hierholzer harus berisi ruas nyata agar rute akhir valid di peta.

> **Peringatan performa:** full network bisa punya >10 odd nodes → brute force akan di-skip otomatis (guard di `findBruteForceMatching`), greedy yang dipakai. Dokumentasikan kompleksitas di laporan: brute `O(n!!)`, greedy `O(n² log n)`.

---

## FASE 4: Routing & Persistent State dengan sv-router

### 4.1 Layout Root (`src/routes/layout.svelte`)

Layout **persist** saat navigasi antar route satu level — tempat yang benar untuk state graf.

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  import { p } from "sv-router/generated";
  import { graphState } from "@lib/graphState.svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div class="app-shell">
  <nav class="top-bar">
    <a href={p("/")}>Peta Graf</a>
    <a href={p("/analysis")}>Analisis Euler & CPP</a>
    <a href={p("/comparison")}>Perbandingan Rute</a>
    <a href={p("/theory")}>Teori</a>
    <a href={p("/data-entry")}>Data Entry</a>
  </nav>
  {@render children()}
</div>
```

### 4.2 Global State via Rune Module (`src/lib/graphState.svelte.ts`)

```typescript
import type { TransitGraph } from "@algorithms/types";
import { transmusiFullNetwork } from "@data";

export type Scenario = "lrt" | "koridor-1" | "koridor-2" | "koridor-3"
  | "koridor-4" | "full";

class GraphState {
  baseGraph: TransitGraph = transmusiFullNetwork;
  scenario = $state<Scenario>("full");
  activeRouteIds = $state<Set<string>>(new Set()); // filter koridor di UI

  /** Graf hasil filter koridor aktif — input ke semua algoritma */
  get activeGraph(): TransitGraph { /* filter nodes/edges by activeRouteIds */ }
}

export const graphState = new GraphState();
```

> **Kunci persistensi:** state graf TIDAK di-pass sebagai props antar halaman (pola SvelteKit lama itu salah). Ia hidup di module rune ini yang di-import semua route — dan layout root tidak pernah di-recreate selama navigasi.

---

## FASE 5: Visualisasi Leaflet

### 5.1 MapView (`src/components/domain/MapView.svelte`)

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import { graphState } from "@lib/graphState.svelte";

  const IMG_W = 1456; // sesuaikan dimensi asli webp
  const IMG_H = 2054;

  let map: L.Map | null = null;
  let mapEl: HTMLDivElement;
  let overlayLayer: L.LayerGroup | null = null;

  onMount(() => {
    map = L.map(mapEl, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 2,
    });
    const bounds: L.LatLngBoundsExpression = [[0, 0], [IMG_H, IMG_W]];
    L.imageOverlay("transportasi_palembang.webp", bounds).addTo(map);
    map.fitBounds(bounds);
    renderOverlay();
  });

  function renderOverlay() { /* polylines + markers dari graphState.activeGraph */ }
</script>

<div bind:this={mapEl} style="height: 80vh; background: #fdfdfd;"></div>
```

### 5.2 Aturan Render

| Elemen | Style |
|---|---|
| Edge koridor aktif | Polyline warna koridor (`RouteLine.color`), weight 4 |
| Edge dim/terfilter | Polyline abu-abu tipis (konteks tetap terlihat) |
| Odd node | CircleMarker merah, radius 7 |
| Even node | CircleMarker biru radius 5 |
| **Augmented edge** | Polyline **dashed red** (`dashArray: "8 6"`), weight 3 |
| Rute akhir (eulerCircuit) | Animasi polyline (RouteAnimator), marker postman bergerak |
| One-way | Chevron/arrowhead dekoratif di polyline |

`LATLNG HELPER`: node pixel `(x, y)` → Leaflet `latLng(IMG_H - y, x)` (ingat sumbu Y Leaflet CRS.Simple terbalik).

---

## FASE 5b: Fitur Tambahan (nilai demo tinggi, effort murah)

### 5b.1 Halaman Teori Interaktif (`/theory` + `TheoryInteractive.svelte`)

Bukan teks statis — mini-graf contoh yang bisa diklik:

- [ ] Graf kecil tetap (mis. 6–8 node) digambar via SVG/Cytoscape, bukan Leaflet
- [ ] Klik node → toggle "dianggap odd/even" → edge di-augmentasi live (dashed red)
- [ ] Tampilkan derajat tiap node inline
- [ ] Tombol "Jalankan CPP" → langkah demi langkah: cek derajat → matching → augmentasi → sirkuit Euler, dengan penjelasan teks per langkah
- [ ] Sertakan definisi formal (derajat, Euler circuit/path, syarat, CPP, matching) — ini bahan halaman laporan juga

### 5b.2 Dashboard Statistik Jaringan (`NetworkStats.svelte`, di `/index` atau `/analysis`)

- [ ] Jumlah node & edge per koridor (tabel kecil)
- [ ] Panjang total jaringan aktif (km) — update saat filter koridor berubah
- [ ] Histogram distribusi degree (berapa node berdegree 1, 2, 3, 4, ...)
- [ ] Top 5 halte dengan degree tertinggi ("simpul kritis jaringan")
- [ ] Jumlah odd nodes + estimasi biaya augmentasi sebelum algoritma dijalankan

### 5b.3 Route Animator Controls (`RouteAnimator.svelte`)

- [ ] Slider kecepatan animasi postman tour
- [ ] Tombol: play / pause / restart / **step-forward & step-back per edge**
- [ ] Panel kecil menampilkan posisi saat ini: "Edge 12/87 — koridor K2, 0.8 km"
- [ ] Saat animasi melewati augmented edge → marker postman berubah warna + label "repeat traversal" (visualisasi biaya augmentasi)
- [ ] Progress bar edge ke-x dari total

### 5b.4 Search Halte (`HalteSearch.svelte`)

- [ ] Input combobox ketik-nama-halte (filter fuzzy sederhana atas `activeGraph.nodes`)
- [ ] Pilih halte → map `flyTo` lokasi + popup (label, type, koridor, degree)
- [ ] Wajib ada karena full network = ratusan halte; demo tanpa ini menyulitkan navigasi

---

## FASE 6: Testing & Validasi Akademik

Wajib untuk presentasi — buktikan algoritma benar dengan **graf kecil known-answer**:

- [ ] Graf 4 node semuanya degree-2 (circuit C4) → `hasEulerCircuit: true`, total = Σ bobot
- [ ] Graf 2 odd nodes → Euler path, augmentasi 0
- [ ] Graf 4 odd nodes berbentuk "pasanganku tahu jawaban manualnya" → brute matching = nilai manual
- [ ] Graf 4 odd nodes di mana greedy < optimal → dokumen optimality gap
- [ ] Graf disconnected → error message yang jelas (bukan crash)
- [ ] Hierholzer di graf Eulerian sederhana → urutan valid (setiap edge dipakai tepat 1×)
- [ ] Sanity check real data: Σ degree = 2 × |edges|

Framework: `bun test` (built-in) — algoritma pure TS jadi trivially testable tanpa DOM.

---

## FASE 7: Checklist Validasi & Presentasi

- [ ] Semua interface typed eksplisit, zero `any`
- [ ] Algoritma = pure functions, teruji dengan known-answer tests (FASE 6)
- [ ] Data km berasal dari kalibrasi pixel→km terdokumentasi (bukan tebakan)
- [ ] Disclaimer undirected approximation ditulis di halaman teori
- [ ] Handling odd nodes > 10 (brute skip + greedy) terlihat di UI
- [ ] Augmented edges dashed red, tabel derajat highlighting odd/even
- [ ] Halaman `/comparison`: brute vs greedy + baseline (Σ bobot graf asli)
- [ ] Rute akhir (eulerCircuit) dianimasikan di peta — "postman tour" **dengan kontrol play/pause/step per edge (5b.3)**
- [ ] Halaman teori interaktif dengan mini-graf klikable (5b.1)
- [ ] Dashboard statistik jaringan: histogram degree, top-5 simpul kritis, total km (5b.2)
- [ ] Search halte dengan zoom ke lokasi (5b.4)
- [ ] State persisten antar route (module rune + layout persist)
- [ ] Screenshot/record demo untuk slide

---

## 📌 RISIKO UTAMA & MITIGASI

| Risiko | Mitigasi |
|---|---|
| Entry data full network melelahkan & mentok di tengah | Data Entry Mode + entry per koridor + commit per koridor (FASE 2.5) |
| Peta webp bukan geografis presisi → jarak km kurang akurat | Kalibrasi + verifikasi silang 2–3 pasangan titik + disclaimer ±10% |
| Brute force freeze browser (>10 odd) | Guard otomatis + comparison page menunjukkan gap greedy |
| sv-router API beda dari asumsi | Sudah diverifikasi dari sv-router.dev (layout children, `p()`, plugin `router()`) |
| Graf disconnected (feeder terisolasi) | CPP butuh graf connected — deteksi + pesan jelas; UI bisa filter koridor agar subsistem yang terhubung jadi satu |
