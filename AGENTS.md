# AGENTS.md — Patroli Kilang Plaju: Euler & CPP

> **Status arsitektur:** *client-only static SPA*. Tidak ada backend, HTTP API, database,
> autentikasi, RBAC, environment variable, atau pipeline deploy di repository ini.
> Seluruh komputasi berjalan di browser dari dataset TypeScript statis.

## Panduan baca cepat

| Area kerja | Bagian wajib dibaca |
|---|---|
| Frontend / UI | Architecture Rules (frontend), Tech Stack, Data Fetching Pattern, Loading & Skeleton |
| Computation / algoritma | Computation Layer Conventions, Data Schema, Common Mistakes |
| Data & tipe | Project Structure, Database, Data Schema, Transition |
| Cross-cutting | Architecture Rules, Technical Decisions, Common Mistakes, Performance |

---

## Available Skills

Skill lokal ada di `.agents/skills/` (**gitignored**, tooling agent — bukan dependensi aplikasi).

| Skill | Kapan dipakai | Relevansi |
|---|---|---|
| `docx` | Ekspor laporan ke `.docx` | Opsional, di luar aplikasi |
| `nature-academic-search` | Cek sitasi/Referensi laporan | Opsional, untuk `docs/Laporan.md` |
| Agent-side: Svelte MCP / `svelte-code-writer` | Wajib saat menulis/ mengubah file `.svelte` | Sesuai instruksi environment |

---

## About the Project

**Produk:** aplikasi web client-side untuk studi kasus Struktur Diskrit 2 — menganalisis
jaringan jalan internal Kilang Pertamina Plaju dan menghitung rute patroli keamanan
menggunakan **Chinese Postman Problem (CPP)**.

**Alur data (faktual):**

```text
src/data/nodes.ts ── patrolNodes (73)
src/data/edges.ts ── patrolEdges (112)
        │ import statis, dirakit di graphState.svelte.ts
        ▼
PatrolGraph { nodes, edges }
        │
        ├─ calculateDegrees  → 38 simpul ganjil
        ├─ buildDistanceMatrix (Dijkstra)
        ├─ findGreedyMatching → 19 pasangan, 4,259 km
        ├─ augmentasi edge sepanjang path pasangan
        └─ hierholzer → 147 langkah, 22,904 km
        │
        ▼
$derived di routes → props ke graph-view.svelte / degree-table.svelte → Leaflet + OSM
```

**Aturan domain utama:**

- Graf **undirected**, satu edge unik per pasangan simpul.
- Bobot `weightKm` = jarak geometris meter ÷ 1000 (**bukan** panjang jalan aktual).
- Titik awal tour: `P01` (konstanta `START` di `graph-view.svelte`).
- CPP: setiap ruas ditempuh minimal 1×, rute tertutup, total minimum **menurut strategi greedy**.
- `hasEulerCircuit` / `hasEulerPath` di `CPPResult` menggambarkan **graf awal**, bukan graf hasil augmentasi.
- Tidak ada brute force / blossom: 38 simpul ganjil ⇒ 37!! kombinasi; strategi dipilih agar bisa dijelaskan di presentasi.

**Fitur sudah dibangun:** peta Leaflet + overlay tour, halaman analisis, perbandingan,
teori, tabel derajat, 44 test otomatis, dokumentasi (`README.md`, `GUIDE.md`, `docs/Laporan.md`).

**Belum dibangun:** backend/API, database, auth/RBAC, form, pagination, animasi tour
play/pause/step, export CSV/JSON, i18n, konfigurasi deploy.

**Peran & scope pengguna:** satu pengguna (mahasiswa/presenter), tanpa login. Semua halaman
terbuka; tidak ada pembedaan permission.

---

## Project Structure

```text
.
├── src/
│   ├── algorithms/            # computation layer — pure functions
│   │   ├── types.ts           # kontrak tunggal: PatrolNode, PatrolEdge, PatrolGraph, CPPResult
│   │   ├── degrees.ts         # calculateDegrees, findOddNodes
│   │   ├── connectivity.ts    # isConnected (BFS)
│   │   ├── dijkstra.ts        # dijkstraShortestPath, buildDistanceMatrix
│   │   ├── matching.ts        # findGreedyMatching (pasangan terdekat)
│   │   ├── euler.ts           # hierholzer
│   │   └── cpp.ts             # solveCPP (orkestrasi pipeline)
│   ├── data/
│   │   ├── nodes.ts           # 73 simpul, satisfies PatrolNode[]
│   │   └── edges.ts           # 112 ruas, satisfies PatrolEdge[]
│   ├── lib/
│   │   └── graphState.svelte.ts  # module rune: nodes, edges, graph(), nodeById()
│   ├── components/            # FLAT, kebab-case
│   │   ├── graph-view.svelte  # Leaflet + OSM (onMount/onDestroy, layer groups)
│   │   └── degree-table.svelte
│   ├── routes/                # file-based routing (sv-router)
│   │   ├── layout.svelte      # nav persist + {@render children()}
│   │   ├── index.svelte       # peta jaringan
│   │   ├── analysis.svelte    # metrik + tabel + peta dengan overlay
│   │   ├── comparison.svelte  # baseline vs CPP
│   │   └── theory.svelte      # definisi + contoh kecil
│   ├── app.css                # @import "tailwindcss"
│   ├── app.svelte             # <Router /> dari sv-router
│   └── main.ts                # mount(App, ...)
├── tests/                     # bun test
│   ├── helpers.ts             # makeGraph, matrixFromGraph
│   ├── cpp.test.ts / degrees.test.ts / dijkstra.test.ts
│   └── euler.test.ts / matching.test.ts
├── docs/Laporan.md            # laporan akademik (Bab 1–4)
├── .router/                   # GENERATED oleh sv-router (gitignored)
├── vite.config.ts             # plugin: svelte, tailwindcss, router; 5 alias
├── tsconfig.app.json          # strict + alias + resolveJsonModule (JSON tak dipakai)
└── tsconfig.json              # solution config + alias
```

**Pola modul:** satu file = satu tanggung jawab; tipe di `types.ts`; implementasi + test
berpasangan. **Pola endpoint/query:** tidak ada — satu fungsi `solveCPP(graph)` dipanggil
langsung dari `$derived` di halaman.

---

## Architecture Rules

### Frontend

- File `.svelte` **kebab-case**, komponen di `src/components/` (flat, tanpa subfolder `domain/`),
  halaman di `src/routes/`.
- Imports memakai alias: `@components/*`, `@algorithms/*`, `@data/*`, `@lib/*` (`@ui/*` ada tapi tidak dipakai).
- Svelte 5 runes: `$state` di module rune, `$props()`, `$derived` / `$derived.by()`, `$effect`.
- `graphState.svelte.ts` adalah satu-satunya state global; jangan props-drill graf antar route.
- Leaflet: inisialisasi di `onMount`, `map.remove()` di `onDestroy`. **Jangan** buat ulang
  instance map saat prop berubah — cukup `clearLayers()` + isi ulang layer group.
- Warna semantik: merah = simpul ganjil / ruas diulang, hijau = `P01`, biru = rute patroli, abu = ruas asli.
- Tailwind utilitas saja; `src/app.css` hanya `@import "tailwindcss"`.
- Navigasi via `p()` dari `sv-router/generated`; jalankan `bun run gen-routes` setelah menambah route.

### Computation / algoritma

- Semua fungsi di `src/algorithms/` **murni**: tanpa DOM, tanpa state, tanpa I/O.
- `src/algorithms/types.ts` adalah kontrak tunggal — jangan mendefinisikan tipe graf duplikat.
- Data statis di `src/data/*.ts` memakai `satisfies PatrolNode[]` / `satisfies PatrolEdge[]`.
- `solveCPP()` melempar `Error` untuk graf kosong / disconnected — UI wajib menangani (lihat `analysis.svelte`).
- Jangan menambah dependency algoritma (blossom, brute force, NetworkX) tanpa kebutuhan eksplisit.

### Konsistensi UI & data

- Angka di UI **selalu berasal dari `solveCPP()` / `calculateDegrees()`**, bukan literal hardcode.
- Satu sumber kebenaran data: `nodes.ts` + `edges.ts`. Tidak ada JSON, barrel, atau runtime validator.
- Urutan eksekusi fitur per layer:
  `data → types → algorithms → graphState → components → routes → tests → docs`.

---

## Tech Stack

| Kategori | Pilihan |
|---|---|
| Core | Bun 1.x, TypeScript ~6, Vite 8, Svelte 5 (runes) |
| Routing | `sv-router` 0.19 (file-based, generated `.router/`) |
| UI / styling | Tailwind CSS 4 via `@tailwindcss/vite`, `h-[100dvh]` layout |
| Peta | Leaflet 1.9 + tile OpenStreetMap (`preferCanvas: true`) |
| State | Module rune `$state` di `src/lib/graphState.svelte.ts` |
| Data | Objek TypeScript statis (`satisfies`), tanpa fetch |
| Test | `bun test` (44 test) |
| Sisa dependensi | `cytoscape` + `@types/cytoscape` masih terpasang tapi **tidak dipakai** |

### Technical Decisions

| Keputusan | Alasan singkat |
|---|---|
| Data TypeScript statis, bukan JSON + validator | Validasi saat compile, tanpa barrel / runtime guard |
| Tanpa brute force & blossom | 38 odd ⇒ 37!!; materi kuliah & presentasi lebih sederhana |
| Greedy "pasangan terdekat" | O(k² log k), mudah dijelaskan |
| Leaflet + OSM, bukan Cytoscape | Koordinat `lat/lng` asli, peta geografis nyata |
| Module rune, bukan props drilling | State persisten antar route |
| Algoritma pure function | Mudah diuji dengan known-answer test |
| Komponen flat + kebab-case + alias `@components` | Import konsisten, tanpa folder `domain/` |

---

## Backend API Conventions (Computation Layer)

Tidak ada HTTP API. Konvensi layer komputasi:

- **Struktur vertikal per modul:** tipe di `types.ts`, implementasi di `algorithms/*.ts`,
  pengujian di `tests/*.test.ts`.
- **Guard / precondition:** `solveCPP` menolak graf kosong dan disconnected;
  `findGreedyMatching` menolak jumlah odd ganjil.
- **Validasi:** compile-time (`satisfies PatrolNode[]` / `satisfies PatrolEdge[]`).
  Tidak ada runtime validator; metrik dataset tercatat di `docs/Laporan.md`.
- **Efek samping:** tidak ada di algoritma. Satu-satunya efek samping ada di UI (Leaflet DOM).
- **Envelope hasil:** seluruh keluaran CPP lewat `CPPResult` (bentuk tunggal).

**DO NOT:**

- Fetch / axios / API call di dalam `src/algorithms/`.
- Mutasi array `graph.nodes` / `graph.edges` milik caller.
- Hardcode angka metrik di komponen.
- Pakai `any` atau tipe graf selain `PatrolGraph`.
- Tambah auth, database, atau dependency berat tanpa requirement.
- Import dari modul lama (`transmusi`, `routes.ts`, `data/index.ts`) — sudah dihapus.

---

## Transition

Status migrasi yang sudah selesai (dapat dicek dari git log):

| Dari | Ke |
|---|---|
| Transportasi Palembang (pohon) | Jaringan jalan kilang (graf, μ = 40) |
| `transmusi.json` + `routes.ts` | `nodes.ts` + `edges.ts` |
| `nodes.json` + `index.ts` (validator ~120 baris) | data statis `satisfies` |
| `components/domain/*` | `components/*` flat, kebab-case |
| `TransitGraph` | `PatrolGraph` |
| Cytoscape canvas | Leaflet + OSM |
| Exact / blossom / brute force | Greedy pasangan terdekat |

**Pola koneksi sekarang:**

```ts
import { patrolNodes } from "@data/nodes";
import { patrolEdges } from "@data/edges";
import { solveCPP } from "@algorithms/cpp";

const network: PatrolGraph = { nodes: patrolNodes, edges: patrolEdges };
const result = solveCPP(network); // dipanggil dari $derived di route
```

**Konvensi tipe:** `PatrolNode { id, label, lat, lng }`, `PatrolEdge { source, target, weightKm }`,
`CPPResult` untuk hasil. `graphState.graph()` menyusun `PatrolGraph` untuk dipakai UI.

---

## Auth & Session

**Tidak ada autentikasi.** Tidak ada library auth (termasuk Better Auth), tidak ada
cookie, session, token, atau `localStorage` di codebase.

- Semua halaman bersifat publik di client.
- Jangan menambah login / guard / redirect tanpa requirement baru.
- Jika suatu hari diperlukan, tambahkan sebagai layer terpisah — **jangan** disisipkan ke algoritma atau data.

---

## RBAC — Permission Matrix

Tidak ada peran / permission check di kode.

| Peran | Scope | Halaman |
|---|---|---|
| Pengguna tunggal (mahasiswa / presenter) | Akses penuh, tanpa login | `/`, `/analysis`, `/comparison`, `/theory` |

Tidak ada `role`, `permission`, atau middleware otorisasi. Jangan mengasumsikan multi-user.

---

## Data Fetching Pattern

Tidak ada query/mutation library, tidak ada fetch, tidak ada pagination.

| Pola umum | Realisasi di repository ini |
|---|---|
| Query | `solveCPP(graph)` sinkron, dipanggil lewat `$derived` |
| Mutation | Tidak ada; `graphState.nodes` / `.edges` statis |
| Pagination / infinite scroll | Tidak ada (73 simpul, 112 ruas) |
| Cache `staleTime` / `gcTime` | Tidak ada; `$derived` menghitung ulang saat dependency berubah |
| Loading / error async | Tidak ada; satu-satunya error ialah guard `solveCPP` |
| Tabel / list | `degree-table.svelte`: `$derived.by()` + `{#each rows as row (row.node.id)}` |

Aturan: turunkan hasil komputasi sebagai props; jangan simpan hasil `solveCPP` di state global
kecuali dipakai lintas halaman.

---

## Database

**Tidak ada database.** Tidak ada koneksi, ORM, migrasi, atau query SQL. Data bersifat
statis dan ikut terbundle ke JavaScript produksi (~230 kB).

Ganti peran "database" dengan:
- `src/data/nodes.ts` + `edges.ts` → penyimpanan data.
- `graphState.svelte.ts` → akses data saat runtime.
- `tests/*.test.ts` → pengujian algoritma (known-answer).

---

## Database Schema (ERD)

```ts
// src/algorithms/types.ts — kontrak data
interface PatrolNode { id: string; label: string; lat: number; lng: number }
interface PatrolEdge { source: string; target: string; weightKm: number }
interface PatrolGraph { nodes: PatrolNode[]; edges: PatrolEdge[] }

interface DegreeInfo { nodeId: string; degree: number; isOdd: boolean }
interface AugmentedEdge { source: string; target: string; weightKm: number; augmented: boolean }
interface MatchingStrategyResult {
  strategy: "greedy";
  pairs: Array<{ u: string; v: string; costKm: number }>;
  totalCostKm: number;
  executed: boolean;
  paths: Map<string, string[]>;
}
interface CPPResult {
  hasEulerCircuit: boolean; hasEulerPath: boolean;
  oddNodes: string[]; augmentedEdges: AugmentedEdge[];
  eulerCircuit: string[] | null;
  totalInspectionDistanceKm: number; baseDistanceKm: number;
  augmentationCostKm: number; strategies: MatchingStrategyResult[];
}
```

Relasi: `PatrolEdge.source` / `.target` → `PatrolNode.id` (undirected).
Tidak ada foreign key fisik; validator dihapus, jadi **test yang menjaga** konsistensi endpoint.

---

## Environment Variables

Tidak ada file `.env` dan tidak ada variabel environment buatan aplikasi.

| Sisi | Variabel | Status |
|---|---|---|
| Client (Vite) | — | Tidak ada `import.meta.env.*` yang dipakai |
| Server / build | — | Tidak ada server; `vite.config.ts` hanya memakai `import.meta.dirname` |
| Secret | — | Tidak ada; jangan menyimpan secret di client |

Tile OSM dimuat dari URL publik tetap di `graph-view.svelte` (bukan env var).

---

## Common Mistakes to Avoid

**Data & tipe**
- [ ] Mengembalikan JSON / barrel `data/index.ts` / runtime validator yang sudah dihapus.
- [ ] Mengubah `weightKm` ke meter atau menjumlahkan `distance_m` (sudah tidak ada).
- [ ] Menambah field `metadata`, `status`, `routeId`, `type`, `isOneWay`.
- [ ] Memakai `TransitGraph`, `RouteLine`, atau `TransportMode`.

**Algoritma**
- [ ] Menambah brute force / blossom tanpa kebutuhan eksplisit.
- [ ] Mutasi input `graph` di dalam algoritma.
- [ ] Mengira `hasEulerCircuit = true` setelah augmentasi (field merujuk graf awal).
- [ ] Lupa guard `solveCPP` untuk graf kosong / disconnected.

**UI / Svelte**
- [ ] Import `@components/GraphView.svelte` (nama file sudah kebab-case).
- [ ] Membuat ulang `L.map()` setiap perubahan prop — cukup perbarui layer group.
- [ ] Lupa `map.remove()` di `onDestroy` (memory leak).
- [ ] Hardcode angka 73 / 112 / 22,904 di komponen; ambil dari hasil komputasi.
- [ ] Memakai API Svelte 4 (`on:click`, `$:`) alih-alih runes.

**Workflow**
- [ ] Lupa `bun run gen-routes` setelah menambah file route.
- [ ] Menjalankan `bun test` / `bun run check` / `bun run build` setelah mengubah data atau algoritma.

---

## Loading & Skeleton Strategy

- Tidak ada async data fetching ⇒ **tidak ada skeleton / spinner untuk data**.
- Komputasi CPP sinkron dan cepat (< 1 detik untuk 73 simpul).
- Peta: container `bg-slate-100` sebagai fallback saat tile OSM belum/ gagal dimuat;
  layer graf (polyline + circleMarker) tetap tampil tanpa koneksi internet.
- `map.fitBounds(bounds, { padding: [24, 24] })` dipanggil setelah layer digambar.
- Popup simpul menampilkan `id`, derajat, dan koordinat secara instan (tanpa request).

---

## Performance & Latency

- Dijkstra: implementasi array sederhana; cukup untuk 38 odd node (kompleksitas praktis O(k(E + V log V))).
- Greedy matching: O(k² log k); tidak ada brute force.
- Hindari `cy` / map re-inisialisasi; `$effect` hanya menggambar ulang layer.
- `$derived` di route mencegah komputasi ulang tanpa perubahan dependency.
- Jangan menambah cache buatan — dataset statis dan hasil komputasi deterministik.
- Satu-satunya latensi jaringan adalah tile OpenStreetMap; itu bukan bagian dari komputasi CPP.
- Bundle produksi ≈ 230 kB JS / 32 kB CSS (gzip ≈ 72 kB / 10 kB).
