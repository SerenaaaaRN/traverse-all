# LAPORAN STUDI KASUS

## ANALISIS LINTASAN EULER DAN OPTIMASI RUTE PATROLI KEAMANAN KILANG PERTAMINA PLAJU MENGGUNAKAN CHINESE POSTMAN PROBLEM

2026

---

## BAB 1 Pendahuluan

### 1.1 Latar Belakang

Kilang Pertamina Plaju merupakan salah satu fasilitas pengolahan minyak yang
memiliki area operasi terbatas, banyak ruas jalan internal, serta sejumlah
titik penting yang perlu dipantau oleh petugas keamanan. Patroli keamanan
dilakukan secara berkala untuk memeriksa gerbang, pagar, area tangki, unit
proses, dan titik-titik rawan lainnya. Agar seluruh area terpantau, petugas
dituntut menempuh setiap ruas jalan internal yang telah ditentukan.

Permasalahan utama patroli manual adalah rute yang tidak terencana. Petugas
sering melewati ruas yang sama berulang kali, sementara ruas lain justru
terlewat. Tanpa perencanaan berbasis graf, jarak tempuh menjadi lebih panjang
dan waktu patroli tidak efisien. Studi kasus ini memanfaatkan teori graf
berbobot, khususnya analisis derajat simpul dan Chinese Postman Problem (CPP),
untuk membentuk rute patroli tertutup yang menempuh setiap ruas jalan minimal
satu kali dengan total jarak seminimal mungkin.

### 1.2 Rumusan Masalah

1. Bagaimana memodelkan jaringan jalan internal Kilang Pertamina Plaju sebagai
   graf berbobot terhubung dengan bobot berupa jarak aktual antar titik
   tracking?
2. Berapa jumlah simpul berderajat ganjil pada graf tersebut, dan apakah graf
   memenuhi syarat lintasan atau sirkuit Euler?
3. Bagaimana menentukan rute patroli keamanan tertutup yang menempuh setiap
   ruas jalan minimal satu kali dengan total jarak minimum menggunakan
   Chinese Postman Problem?
4. Bagaimana strategi memasangkan simpul ganjil yang sederhana (pasangan
   terdekat) dan seberapa besar efisiensinya terhadap baseline?

### 1.3 Tujuan

1. Mengekstraksi jaringan jalan internal Kilang Pertamina Plaju menjadi graf
   berbobot tak berarah.
2. Menghitung derajat setiap simpul dan mengidentifikasi status Eulerian graf.
3. Menyelesaikan CPP dengan memasangkan simpul ganjil dan augmentasi edge.
4. Mengukur efisiensi rute patroli terhadap baseline duplikasi seluruh edge.

### 1.4 Batasan

1. Graf dimodelkan sebagai graf tak berarah; edge satu arah tidak dibedakan.
2. Bobot edge adalah jarak geometris antar titik tracking, bukan panjang jalan
   sebenarnya.
3. Data mencakup jalan internal yang di-tracking, bukan seluruh aset kilang.
4. Edge paralel antara dua simpul diperbolehkan; bobot minimum yang dipakai.
5. Titik awal patroli adalah `P74`, yaitu gerbang utama kilang.

---

## BAB 2 Landasan dan Metodologi

### 2.1 Landasan Teori

#### 2.1.1 Graf Berbobot

Graf berbobot didefinisikan sebagai $G = (V, E, w)$, dengan $V$ himpunan
simpul, $E$ himpunan sisi, dan $w: E \rightarrow \mathbb{R}^+$ fungsi bobot.
Pada studi kasus ini, simpul merepresentasikan titik tracking jalan, sedangkan
sisi merepresentasikan ruas jalan yang menghubungkan dua titik.

#### 2.1.2 Derajat Simpul

Derajat simpul $d(v)$ adalah jumlah sisi yang insiden terhadap simpul $v$.
Untuk graf tak berarah berlaku:

$$
\sum_{v \in V} d(v) = 2|E|
$$

Simpul disebut **ganjil** jika $d(v)$ bernilai ganjil.

#### 2.1.3 Lintasan dan Sirkuit Euler

Lintasan Euler adalah lintasan yang menempuh setiap sisi graf tepat satu kali.
Konsep ini berawal dari permasalahan jembatan Königsberg yang dibahas Euler
(1736). Sirkuit Euler adalah lintasan Euler yang berawal dan berakhir pada
simpul yang sama. Graf terhubung memiliki:

- **sirkuit Euler** jika seluruh simpul berderajat genap;
- **lintasan Euler** jika tepat dua simpul berderajat ganjil;
- **bukan Eulerian** jika jumlah simpul ganjil lebih dari dua.

#### 2.1.4 Chinese Postman Problem

CPP mencari rute tertutup berbobot minimum yang menempuh setiap sisi minimal
satu kali. Permasalahan ini pertama kali dirumuskan oleh Kuan (1962); Edmonds
dan Johnson (1973) kemudian memberikan prosedur polinomial berbasis perfect
matching pada simpul ganjil. Jika graf memiliki simpul berderajat ganjil,
sebagian sisi harus dilewati lebih dari sekali. Prosedur umum:

1. Identifikasi himpunan simpul ganjil $V_{odd}$.
2. Hitung jarak terpendek antar semua pasangan simpul ganjil menggunakan
   Dijkstra.
3. Pasangkan seluruh simpul ganjil, misalnya dengan aturan pasangan terdekat.
4. Duplikasi edge sepanjang path pasangan tersebut (augmentasi).
5. Bentuk sirkuit Euler pada graf hasil augmentasi.

Biaya total CPP adalah:

$$
\text{Total} = \sum_{e \in E} w(e) + \text{biaya augmentasi}
$$

### 2.2 Identifikasi Kasus

Objek studi kasus adalah jaringan jalan internal Kilang Pertamina Plaju.
Data diperoleh melalui tracking titik pada Google Maps menggunakan editor peta
sederhana, kemudian disimpan sebagai objek TypeScript bertipe di
`src/data/nodes.ts` dan `src/data/edges.ts`.

Struktur data:

1. **Simpul (V):** 74 titik tracking, diberi kode `P01` sampai `P74`; `P74`
   adalah gerbang utama dan titik awal patroli.
2. **Sisi (E):** 115 ruas jalan yang menghubungkan dua titik.
3. **Bobot (w):** jarak geometris antar titik dalam meter, dikonversi menjadi
   kilometer pada perhitungan.

Karakteristik graf:

| Metrik | Nilai |
|---|---:|
| Simpul | 74 |
| Sisi | 115 |
| Total bobot | 19.339 km |
| Komponen terhubung | 1 |
| Cyclomatic number (`μ`) | 42 |
| Siklus dasar | 42 |
| Bridge | 2 |
| Simpul ganjil | 40 |
| Simpul derajat 1 | P12, P21 |
| Status Euler awal | Tidak Eulerian |

Karena `μ = 42 > 0`, graf bukan pohon dan memiliki banyak alternatif jalur.
Kondisi ini membuat CPP relevan untuk menghasilkan rute patroli yang efisien.

### 2.3 Pemodelan Matematis

Jaringan dimodelkan sebagai graf berbobot tak berarah
$G = (V, E, w)$ dengan:

- $V = \{P01, P02, \ldots, P74\}$;
- $E \subseteq \{\{u,v\} \mid u,v \in V, u \neq v\}$;
- $w(e)$ adalah jarak antar titik dalam kilometer.

Derajat simpul dihitung sebagai:

$$
d(v) = |\{e \in E \mid v \in e\}|
$$

Himpunan simpul ganjil:

$$
V_{odd} = \{v \in V \mid d(v) \bmod 2 = 1\}
$$

### 2.4 Algoritma

1. **Konstruksi graf:** membaca `src/data/nodes.ts` dan `src/data/edges.ts`,
   lalu merakit objek `PatrolGraph` dengan bobot dalam kilometer.
2. **Audit topologi:** memeriksa konektivitas, `μ`, siklus dasar, bridge, dan
   derajat simpul.
3. **Identifikasi odd node:** mengelompokkan simpul dengan derajat ganjil.
4. **Dijkstra:** menghitung jarak dan path terpendek antar semua pasangan odd
   node (Dijkstra, 1959).
5. **Pasangan simpul ganjil:** mengurutkan semua pasangan berdasarkan jarak
   Dijkstra, lalu memilih pasangan terdekat yang kedua ujungnya belum terpakai.
6. **Augmentasi:** menyalin setiap ruas path pasangan ke graf sebagai edge
   paralel.
7. **Sirkuit Euler:** membentuk urutan tour dengan algoritma Hierholzer
   (Hierholzer, 1873).
8. **Validasi biaya:** memastikan total traversal sama dengan bobot dasar
   ditambah biaya augmentasi.
9. **Visualisasi:** peta Leaflet berbasis OpenStreetMap dan tabel derajat pada
   antarmuka Svelte.

---

## BAB 3 Perhitungan, Penyelesaian Algoritma, Visualisasi, Implementasi Program, dan Pembahasan

### 3.1 Perhitungan Manual

Perhitungan manual dilakukan pada subgraf kecil di sekitar blok awal kilang,
yaitu simpul `P01–P12`, `P19`, `P20`, dan `P21`. Subgraf ini memiliki 15 simpul
dan 17 sisi dengan total bobot 2,599 km.

#### 3.1.1 Derajat Simpul Subgraf

| Simpul | Derajat | Status |
|---|---:|---|
| P01 | 2 | Genap |
| P02 | 3 | Ganjil |
| P03 | 3 | Ganjil |
| P04 | 3 | Ganjil |
| P05 | 3 | Ganjil |
| P06 | 4 | Genap |
| P07 | 3 | Ganjil |
| P08 | 1 | Ganjil |
| P09 | 2 | Genap |
| P10 | 2 | Genap |
| P11 | 2 | Genap |
| P12 | 1 | Ganjil |
| P19 | 2 | Genap |
| P20 | 2 | Genap |
| P21 | 1 | Ganjil |

Jumlah derajat = 34 = 2 × 17, sesuai dengan jumlah sisi subgraf. Terdapat
8 simpul ganjil, yaitu `P02`, `P03`, `P04`, `P05`, `P07`, `P08`, `P12`, dan
`P21`. Karena jumlah simpul ganjil lebih dari dua, subgraf tidak memiliki
lintasan Euler.

#### 3.1.2 Matching Manual Subgraf

Dengan Dijkstra pada subgraf, diperoleh pasangan simpul ganjil sebagai berikut:

| Pasangan | Path | Biaya (km) |
|---|---|---:|
| P02–P21 | P02 → P01 → P19 → P20 → P21 | 0,687 |
| P04–P12 | P04 → P12 | 0,293 |
| P05–P03 | P05 → P04 → P03 | 0,195 |
| P07–P08 | P07 → P08 | 0,108 |
| **Total** | | **1,283** |

Biaya CPP subgraf:

$$
2{,}599 + 1{,}283 = 3{,}882 \text{ km}
$$

Hasil ini menunjukkan pola yang sama dengan graf penuh: augmentasi diperlukan
untuk membuat seluruh derajat menjadi genap.

### 3.2 Penyelesaian Algoritma pada Graf Penuh

#### 3.2.1 Audit dan Derajat

Graf penuh memiliki 74 simpul dan 115 sisi. Distribusi derajat:

| Derajat | Jumlah simpul |
|---:|---:|
| 1 | 2 |
| 2 | 12 |
| 3 | 37 |
| 4 | 22 |
| 5 | 1 |

Simpul ganjil berjumlah 40:

```text
P02, P03, P04, P05, P07, P08, P10, P12, P14, P15, P17, P18, P19, P20,
P21, P22, P24, P25, P31, P33, P36, P39, P40, P42, P43, P45, P49, P51,
P52, P53, P57, P60, P64, P65, P67, P68, P70, P72, P73, P74
```

Karena jumlah simpul ganjil lebih dari dua, graf awal:

```ts
findOddNodes(graph).length  // 40 -> bukan Eulerian
```

#### 3.2.2 Pasangan Simpul Ganjil

Aturan pasangan terdekat menghasilkan 20 pasangan:

| u | v | Biaya (km) |
|---|---|---:|
| P19 | P20 | 0,051 |
| P18 | P22 | 0,054 |
| P45 | P51 | 0,058 |
| P64 | P67 | 0,071 |
| P08 | P24 | 0,080 |
| P02 | P07 | 0,091 |
| P04 | P05 | 0,094 |
| P40 | P43 | 0,096 |
| P39 | P42 | 0,098 |
| P70 | P72 | 0,121 |
| P49 | P74 | 0,140 |
| P15 | P25 | 0,156 |
| P31 | P33 | 0,183 |
| P10 | P17 | 0,185 |
| P03 | P14 | 0,304 |
| P65 | P68 | 0,324 |
| P57 | P60 | 0,394 |
| P36 | P73 | 0,473 |
| P52 | P53 | 0,586 |
| P12 | P21 | 1,270 |
| **Total** | | **4,829** |

Biaya augmentasi adalah **4,829 km**. Pasangan `P12–P21` paling mahal karena
keduanya adalah simpul berderajat 1 yang letaknya saling berjauhan, sehingga
baru dipasangkan setelah pasangan lain habis. Untuk edge paralel `P49–P74`,
bobot minimum (0,140 km) yang dipakai agar konsisten dengan Dijkstra.

#### 3.2.3 Augmentasi dan Sirkuit Euler

Setiap ruas path pasangan disalin ke graf sebagai edge paralel bertanda
`augmented`. Setelah augmentasi, seluruh derajat simpul menjadi genap sehingga
graf bersirkuit Euler. Sirkuit Euler kemudian dibentuk mulai dari `P74` (gerbang).

Total tour patroli:

$$
19{,}339 + 4{,}829 = 24{,}168 \text{ km}
$$

Jumlah edge traversal adalah 153 langkah, terdiri dari 115 edge asli dan 37
edge augmentasi.

### 3.3 Visualisasi

Visualisasi dapat ditampilkan dalam dua mode dari dataset yang sama:

- **Peta** — koordinat `lat/lng` asli hasil tracking pada peta Leaflet dengan
  tile OpenStreetMap, memberi konteks geografis jaringan jalan.
- **Graf** — layout otomatis Fruchterman–Reingold yang dihitung hanya dari
  simpul dan sisi; koordinat geografis tidak dipakai, sehingga fokusnya murni
  pada struktur/topologi graf.

Kedua mode memakai `PatrolGraph` dan hasil `solveCPP()` yang sama:

- Halaman **Peta Graf** — jaringan jalan, simpul ganjil, dan titik awal `P74`.
- Halaman **Analisis** — metrik, daftar simpul ganjil, ruas yang diulang,
  tabel derajat, dan urutan rute postman.
- Halaman **Perbandingan** — total tour patroli dibanding baseline.
- Halaman **Teori** — definisi derajat, Euler, dan CPP.

Simpul ganjil ditandai merah, titik awal hijau, dan ruas hasil augmentasi
ditandai merah putus-putus.

### 3.4 Implementasi Program

Implementasi menggunakan TypeScript dengan Vite dan Svelte 5:

- **TypeScript** untuk seluruh algoritma sebagai fungsi murni (derajat,
  konektivitas, Dijkstra, pasangan terdekat, Hierholzer, pipeline CPP).
  Formulasi Hierholzer mengikuti uraian cp-algorithms dan NetworkX.
- **Svelte 5** (runes) untuk antarmuka dan `sv-router` untuk navigasi.
- **Leaflet** + OpenStreetMap untuk peta jaringan.
- **Bun test** untuk pengujian otomatis.

Struktur utama:

```text
src/
├── algorithms/
│   ├── types.ts         # kontrak tipe PatrolGraph, CPPResult, dll.
│   ├── degrees.ts       # derajat dan simpul ganjil
│   ├── connectivity.ts  # BFS konektivitas
│   ├── dijkstra.ts      # jarak & path terpendek
│   ├── route.ts         # rute A→B lewat waypoint
│   ├── matching.ts      # pasangan simpul terdekat
│   ├── euler.ts         # Hierholzer
│   └── cpp.ts           # pipeline CPP
├── data/
│   ├── nodes.ts         # 74 simpul (typed)
│   └── edges.ts         # 115 ruas (typed)
├── lib/graph-state.svelte.ts
├── components/          # graph-view.svelte (Leaflet), degree-table.svelte
├── routes/              # index, analysis, comparison, theory
└── tests/               # bun test
```

Perintah utama:

```bash
bun install
bun run dev
bun test
bun run check
```

### 3.5 Pembahasan

#### 3.5.1 Hasil Pengujian

| Metrik | Nilai |
|---|---:|
| Bobot dasar | 19,339 km |
| Augmentasi (pasangan terdekat) | 4,829 km |
| Total tour | **24,168 km** |
| Jumlah langkah | 153 (115 asli + 37 augmentasi) |

Baseline jika semua edge dilewati dua kali:

$$
2 \times 19{,}339 = 38{,}678 \text{ km}
$$

Dengan CPP, total turun menjadi 24,168 km. Penghematan terhadap baseline:

$$
\frac{38{,}678 - 24{,}168}{38{,}678} \times 100\% = 37{,}51\%
$$

Rute hasil pasangan terdekat menghemat 14,510 km dibanding baseline. Strategi
ini tidak menjamin biaya minimum mutlak, tetapi mudah dijelaskan dan cukup
efektif untuk kasus ini.

Pengujian otomatis terdiri dari 63 test dalam 6 file:

1. Derajat simpul dan identifikasi simpul ganjil (`degrees.test.ts`).
2. Dijkstra dan matriks jarak terpendek (`dijkstra.test.ts`).
3. Hierholzer menghasilkan sirkuit Euler yang valid (`euler.test.ts`).
4. Pasangan terdekat: known-answer dan path Dijkstra (`matching.test.ts`).
5. Pipeline CPP: C4, dua simpul ganjil, augmentasi, graf terputus, dan
   validitas rute (`cpp.test.ts`).
6. Rute A→B lewat waypoint: gabungan segmen dan known-answer (`route.test.ts`).

#### 3.5.2 Analisis Kompleksitas

Jika $V$ adalah jumlah simpul, $E$ jumlah sisi, dan $k$ jumlah simpul ganjil:

- Audit konektivitas dan derajat: $O(V + E)$.
- Dijkstra dari setiap simpul ganjil: $O(k(E + V \log V))$.
- Pasangan terdekat: $O(k^2 \log k)$.
- Augmentasi path: $O(k \cdot V)$.
- Sirkuit Euler: $O(E)$.

Untuk $V = 74$, $E = 115$, dan $k = 40$, seluruh komputasi berjalan cepat.
Pendekatan ini sengaja dipilih karena dapat dijelaskan dengan sederhana dan
tidak memerlukan algoritma matching yang kompleks.

---

## BAB 4 Kesimpulan dan Saran

### 4.1 Kesimpulan

1. Jaringan jalan internal Kilang Pertamina Plaju berhasil dimodelkan sebagai
   graf berbobot tak berarah dengan 74 simpul, 115 sisi, dan total bobot
   19,339 km.
2. Graf terhubung dan memiliki 42 siklus dasar, sehingga CPP dapat diterapkan
   secara bermakna.
3. Terdapat 40 simpul berderajat ganjil. Graf awal tidak memiliki lintasan
   maupun sirkuit Euler.
4. Pasangan simpul ganjil dengan aturan terdekat menghasilkan biaya augmentasi
   4,829 km dan total tour patroli **24,168 km**.
5. Rute patroli menempuh 153 langkah, terdiri dari 115 ruas asli dan 37 ruas
   yang diulang.
6. Dibandingkan baseline duplikasi seluruh edge sebesar 38,678 km, rute CPP
   menghemat **37,51%** jarak tempuh.

### 4.2 Saran



---

## Daftar Pustaka

Dijkstra, E. W. (1959). A note on two problems in connexion with graphs.
*Numerische Mathematik, 1*(1), 269–271. https://doi.org/10.1007/BF01386390

Edmonds, J., & Johnson, E. L. (1973). Matching, Euler tours and the Chinese
postman. *Mathematical Programming, 5*(1), 88–124.
https://doi.org/10.1007/BF01580113

Euler, L. (1736). Solutio problematis ad geometriam situs pertinentis.
*Commentarii Academiae Scientiarum Imperialis Petropolitanae, 8*, 128–140.

Hierholzer, C. (1873). Ueber die Möglichkeit, einen Linienzug ohne Wiederholung
und ohne Unterbrechung zu umfahren. *Mathematische Annalen, 6*(1), 30–32.
https://doi.org/10.1007/BF01442866

Kuan, M.-K. (1962). Graphic programming using odd or even points. *Chinese
Mathematics, 1*, 273–277.

cp-algorithms. (n.d.). *Finding an Eulerian path in an undirected graph*.
https://cp-algorithms.com/graph/euler_path.html (diakses 21 November 2026)

NetworkX. (n.d.). *networkx.algorithms.euler*.
https://networkx.org/documentation/stable/reference/algorithms/euler.html
(diakses 21 November 2026)

OpenStreetMap contributors. (n.d.). *OpenStreetMap*. https://www.openstreetmap.org
(diakses 21 November 2026)

Leaflet. (n.d.). *Leaflet — an open-source JavaScript library for interactive
maps*. https://leafletjs.com (diakses 21 November 2026)

---

## Lampiran


