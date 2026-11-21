# 📘 GUIDE — Patroli Kilang Plaju: Euler & CPP

**Mata kuliah:** Struktur Diskrit 2  
**Objek:** Jaringan jalan internal Kilang Pertamina Plaju (hasil tracking Google Maps)  
**Target:** Graf berbobot (bukan pohon) → Chinese Postman Problem  
**Stack:** Bun · TypeScript · Svelte 5 · sv-router · Leaflet + OSM · Tailwind 4

---

## 1. Keputusan desain

| Aspek | Keputusan | Alasan |
|---|---|---|
| Objek | Jaringan jalan kilang, 73 simpul / 112 ruas | Graf nyata dengan μ = 40, bukan pohon → CPP bermakna |
| Sumber data | `src/data/nodes.ts` + `edges.ts` | Objek TypeScript bertipe, tanpa backend |
| Graf | Undirected, satu edge unik per pasangan | Sesuai konvensi dataset |
| Bobot | km (meter ÷ 1000, ditulis eksak) | Dari geometri titik tracking |
| Koordinat | `lat/lng` asli | Dipakai langsung oleh Leaflet, tanpa proyeksi buatan |
| Tampilan peta | Leaflet + tile OpenStreetMap | Peta geografis sesuai lokasi sebenarnya |
| Filter | Tidak ada — seluruh jaringan ditampilkan | Laporan menganalisis graf penuh |
| Strategi pasangan | Pasangan terdekat (greedy nearest neighbor) | Mudah dijelaskan; brute force O(n!!) tidak layak untuk 38 simpul |
| Matching kompleks | Tidak dipakai (tanpa blossom/exact) | Sesuai materi kuliah; laporan disesuaikan |

---

## 2. Status pengerjaan

| Fase | Status |
|---|---|
| Setup (Vite, Svelte 5, sv-router, Tailwind, Leaflet) | ✅ |
| Tipe data & dataset statis `nodes.ts` / `edges.ts` | ✅ |
| Algoritma: derajat, Dijkstra, konektivitas, Hierholzer, CPP | ✅ |
| Peta Leaflet & halaman analisis | ✅ |
| Halaman perbandingan & teori | ✅ |
| Laporan `docs/Laporan.md` (diselaraskan ke TypeScript & angka greedy) | ✅ |
| Testing (`bun test`: 44 test) & typecheck | ✅ |

---

## 3. Alur data

```text
src/data/nodes.ts  ── patrolNodes (73)
src/data/edges.ts  ── patrolEdges (112)
   │  (dirakit di graphState.svelte.ts)
   ▼
PatrolGraph { nodes, edges }
   │
   ├── calculateDegrees  → 38 simpul ganjil
   ├── buildDistanceMatrix (Dijkstra)
   ├── findGreedyMatching → 19 pasangan, 4,259 km
   ├── augmentasi edge sepanjang path pasangan
   └── hierholzer → 147 langkah, 22,904 km
```

Bentuk data di TypeScript:

| Field | Tipe |
|---|---|
| `id`, `label` | `string` |
| `lat`, `lng` | `number` (koordinat asli) |
| `source`, `target` | `string` |
| `weightKm` | `number` (kilometer) |

Validasi cukup dari `satisfies PatrolNode[]` / `satisfies PatrolEdge[]` saat
compile. Tidak ada runtime validator; integritas data bergantung pada konvensi
dan pengujian algoritma di `tests/*.test.ts`.

---

## 4. Metrik yang diharapkan

| Metrik | Nilai |
|---|---:|
| Simpul | 73 |
| Ruas | 112 |
| Total bobot | 18,645 km |
| μ = E − V + 1 | 40 |
| Simpul ganjil | 38 |
| Augmentasi | 4,259 km |
| Total tour | 22,904 km |
| Baseline 2× bobot | 37,290 km |
| Penghematan | 38,58% |

Angka di atas tercatat di `docs/Laporan.md` sebagai hasil komputasi CPP.

---

## 5. Halaman aplikasi

| Route | Isi |
|---|---|
| `/` | Peta Leaflet jaringan + legenda; klik simpul untuk derajat & koordinat |
| `/analysis` | Metrik, simpul ganjil, ruas diulang, urutan rute, tabel derajat, peta dengan overlay tour |
| `/comparison` | Tabel baseline vs CPP, penghematan, jumlah ruas diulang |
| `/theory` | Definisi graf, derajat, Euler, CPP, dan contoh kecil |

---

## 6. Perintah

```bash
bun install
bun run gen-routes   # regenerate sv-router bila menambah file route
bun run dev
bun test
bun run check
bun run build
```

---

## 7. Tips presentasi

- Tekankan kontras dengan tugas sebelumnya: transportasi berbentuk pohon,
  sedangkan jaringan kilang punya 40 siklus dasar sehingga CPP relevan.
- Urutan cerita: **derajat → 38 ganjil → bukan Euler → Dijkstra → pasangan
  terdekat → duplikasi ruas → sirkuit Euler**.
- Tunjukkan di peta: merah = simpul ganjil/ruas diulang, hijau = titik awal P01,
  biru = rute patroli.
- Jika ditanya soal optimalitas: jelaskan bahwa aturan terdekat bukan jaminan
  minimum mutlak, tetapi dipilih karena sederhana dan dapat dipertanggungjawabkan
  dengan data yang ada; perbandingan dengan baseline menunjukkan efektivitasnya.
- Sebut keterbatasan: bobot berupa jarak geometris, graf tak berarah, dan tile
  OSM memerlukan internet.
