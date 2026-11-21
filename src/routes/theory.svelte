<script lang="ts">
  import { graphState } from "@lib/graphState.svelte";
  import { calculateDegrees } from "@algorithms/degrees";

  const degrees = $derived(calculateDegrees(graphState.graph()));
  const odd = $derived([...degrees.values()].filter((d) => d.isOdd).length);
</script>

<div>
  <div class="space-y-6 text-xs leading-relaxed text-neutral-700">
    <header>
      <h1 class="text-xl font-bold text-neutral-900">Teori Graf &amp; Chinese Postman</h1>
      <p class="mt-1 text-neutral-500">Dasar yang dipakai dalam analisis patroli kilang.</p>
    </header>

    <section>
      <h2 class="mb-2 text-base font-semibold text-neutral-900">1. Graf Berbobot</h2>
      <p>
        Graf berbobot didefinisikan sebagai <code>G = (V, E, w)</code>, dengan
        <code>V</code> himpunan simpul, <code>E</code> himpunan sisi, dan
        <code>w : E → ℝ⁺</code> fungsi bobot. Pada kasus ini, simpul adalah titik
        tracking jalan internal kilang, sisi adalah ruas jalan, dan bobot adalah
        jarak antar titik dalam meter (dikonversi ke kilometer).
      </p>
    </section>

    <section>
      <h2 class="mb-2 text-base font-semibold text-neutral-900">2. Derajat Simpul</h2>
      <p>
        Derajat <code>d(v)</code> adalah banyaknya sisi yang menempel pada simpul
        <code>v</code>. Berlaku <code>Σ d(v) = 2|E|</code>. Simpul disebut
        <b>ganjil</b> jika derajatnya ganjil. Jaringan kilang memiliki
        <b class="text-red-700">{odd} simpul ganjil</b> dari {graphState.nodes.length} simpul.
      </p>
    </section>

    <section>
      <h2 class="mb-2 text-base font-semibold text-neutral-900">3. Lintasan &amp; Sirkuit Euler</h2>
      <ul class="list-disc space-y-1 pl-5">
        <li><b>Sirkuit Euler</b>: menempuh setiap sisi tepat satu kali dan kembali ke titik awal — terjadi bila semua simpul berderajat genap.</li>
        <li><b>Lintasan Euler</b>: menempuh setiap sisi tepat satu kali, awal dan akhir berbeda — terjadi bila tepat dua simpul ganjil.</li>
        <li>Jumlah simpul ganjil lebih dari dua ⇒ graf <b>bukan Eulerian</b>.</li>
      </ul>
      <p class="mt-2">
        Karena jaringan kilang punya {odd} simpul ganjil, petugas tidak mungkin
        menempuh setiap ruas tepat satu kali dalam satu rute tertutup.
      </p>
    </section>

    <section>
      <h2 class="mb-2 text-base font-semibold text-neutral-900">4. Chinese Postman Problem</h2>
      <p>
        CPP mencari rute tertutup berbobot minimum yang menempuh setiap sisi
        minimal satu kali. Langkahnya:
      </p>
      <ol class="mt-2 list-decimal space-y-1 pl-5">
        <li>Identifikasi simpul ganjil.</li>
        <li>Hitung jarak terpendek antar pasangan simpul ganjil dengan Dijkstra.</li>
        <li>Pasangkan simpul ganjil dengan aturan terdekat (ambil yang paling dekat, yang ujungnya belum terpakai).</li>
        <li>Duplikasi ruas sepanjang path pasangan tersebut (augmentasi) sampai semua derajat genap.</li>
        <li>Bentuk sirkuit Euler dengan algoritma Hierholzer.</li>
      </ol>
      <p class="mt-2">
        Total jarak = bobot semua ruas asli + biaya augmentasi.
      </p>
    </section>

    <section class="rounded-lg bg-neutral-50 p-4">
      <h2 class="mb-2 text-base font-semibold text-neutral-900">Contoh kecil</h2>
      <p>
        Empat simpul ganjil A, B, C, D dengan jarak A–B = 1, A–C = 2, B–D = 2,
        C–D = 10. Aturan terdekat memilih A–B (1) lalu memaksa C–D (10), total
        11. Jika pasangan yang dipilih A–C dan B–D, totalnya hanya 4. Ini
        menunjukkan bahwa aturan terdekat <b>mudah dijelaskan tetapi tidak selalu optimal</b>.
      </p>
    </section>

    <p class="text-xs text-neutral-400">
      Catatan: graf dimodelkan sebagai graf tak berarah. Bobot adalah jarak
      geometris antar titik tracking, bukan panjang jalan sebenarnya.
    </p>
  </div>
</div>
