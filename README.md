# Patroli Kilang Plaju — Euler & Chinese Postman Problem

Studi kasus **Struktur Diskrit 2** — analisis jaringan jalan internal Kilang
Pertamina Plaju dengan teori graf, derajat simpul, sirkuit Euler, dan Chinese
Postman Problem (CPP).

Aplikasi web client-side ini memvisualisasikan jaringan pada peta OpenStreetMap
serta menghitung rute patroli tertutup yang menempuh setiap ruas jalan minimal
satu kali dengan jarak serendah mungkin.

## Angka kunci

| Metrik | Nilai |
|---|---:|
| Simpul | 73 |
| Ruas | 112 |
| Total bobot | 18,645 km |
| Komponen terhubung | 1 |
| Cyclomatic number (μ) | 40 |
| Simpul berderajat ganjil | 38 |
| Biaya augmentasi | 4,259 km |
| Total tour patroli | **22,904 km** |
| Penghematan vs baseline | **38,58%** |

## Stack

- **TypeScript** — seluruh algoritma sebagai pure function
- **Svelte 5** (runes) + `sv-router` — antarmuka dan navigasi
- **Leaflet** + OpenStreetMap — peta jaringan
- **Vite** + **Tailwind CSS** — build dan styling
- **Bun** — package manager, test runner, dan dev server

## Menjalankan

```bash
bun install
bun run dev        # http://localhost:5173
bun run check      # svelte-check + tsc
bun test           # 47 test
bun run build      # produksi ke dist/
```

## Struktur

```text
src/
├── algorithms/
│   ├── types.ts         # PatrolGraph, CPPResult, dll.
│   ├── degrees.ts       # derajat & simpul ganjil
│   ├── connectivity.ts  # BFS konektivitas
│   ├── dijkstra.ts      # jarak & path terpendek
│   ├── matching.ts      # pasangan simpul terdekat
│   ├── euler.ts         # Hierholzer
│   └── cpp.ts           # pipeline CPP
├── data/
│   ├── nodes.json       # sumber data (73 simpul, 112 ruas)
│   └── index.ts         # loader + runtime guard
├── lib/graphState.svelte.ts
├── components/domain/   # GraphView (Leaflet), DegreeTable
└── routes/              # index, analysis, comparison, theory
```

## Data

`src/data/nodes.json` adalah satu-satunya sumber data. Formatnya:

```jsonc
{
  "metadata": { "name": "...", "source": "...", "weight_unit": "meter", ... },
  "nodes": [{ "name": "P01", "lat": -2.991494, "lng": 104.827243, "label": "" }],
  "edges": [{ "from": "P01", "to": "P02", "distance_m": 350, "status": "..." }]
}
```

`src/data/index.ts` mengonversi `name → id`, `from/to → source/target`, dan
`distance_m → weightKm` (meter → kilometer). Field `status` tidak dipakai.

## Algoritma

1. Hitung derajat → 38 simpul ganjil ⇒ graf bukan Eulerian.
2. Dijkstra dari setiap simpul ganjil → matriks jarak & path.
3. Pasangan terdekat: urutkan pasangan, ambil termurah dengan ujung belum terpakai.
4. Augmentasi: salin ruas pada path pasangan (edge paralel).
5. Hierholzer → sirkuit Euler mulai dari `P01`.

Brute force sengaja tidak dipakai: untuk 38 simpul ganjil kompleksitasnya
O(n!!). Aturan pasangan terdekat dipilih karena sederhana dan mudah dijelaskan,
meski tidak menjamin optimum mutlak.

## Catatan

- Graf dimodelkan tak berarah; bobot adalah jarak geometris antar titik
  tracking Google Maps, bukan panjang jalan sebenarnya.
- Tile peta OpenStreetMap memerlukan koneksi internet; layer graf tetap tampil
  walau tile gagal dimuat.
- Laporan lengkap ada di [`docs/Laporan.md`](docs/Laporan.md).
