/**
 * Seed script untuk platform perbandingan kos
 * Jalankan: pnpm --filter @workspace/scripts run seed
 */
import { db } from "@workspace/db";
import {
  usersTable,
  kosTable,
  fasilitasTable,
  kosFasilitasTable,
  reviewsTable,
} from "@workspace/db";

async function seed() {
  console.log("🌱 Memulai seed database...");

  // ─── 1. Users ───────────────────────────────────────────────────────────────
  console.log("👤 Menyisipkan users...");
  const insertedUsers = await db
    .insert(usersTable)
    .values([
      { name: "Admin Platform", email: "admin@cariKos.id", role: "admin" },
      { name: "Budi Santoso", email: "budi.santoso@gmail.com", role: "pemilik" },
      { name: "Dewi Rahayu", email: "dewi.rahayu@gmail.com", role: "pemilik" },
      { name: "Hendra Wijaya", email: "hendra.wijaya@gmail.com", role: "pemilik" },
      { name: "Siti Nuraini", email: "siti.nuraini@gmail.com", role: "pemilik" },
      { name: "Ahmad Fauzi", email: "ahmad.fauzi@gmail.com", role: "pemilik" },
      { name: "Rina Marlina", email: "rina.marlina@gmail.com", role: "pencari" },
      { name: "Doni Kusuma", email: "doni.kusuma@gmail.com", role: "pencari" },
      { name: "Putri Anggraini", email: "putri.anggraini@gmail.com", role: "pencari" },
      { name: "Rizky Pratama", email: "rizky.pratama@gmail.com", role: "pencari" },
      { name: "Maya Sari", email: "maya.sari@gmail.com", role: "pencari" },
    ])
    .returning();

  const [, owner1, owner2, owner3, owner4, owner5] = insertedUsers;
  const [, , , , , , seeker1, seeker2, seeker3, seeker4, seeker5] =
    insertedUsers;

  // ─── 2. Fasilitas ────────────────────────────────────────────────────────────
  console.log("🏠 Menyisipkan fasilitas...");
  const insertedFasilitas = await db
    .insert(fasilitasTable)
    .values([
      { nama: "AC", icon: "wind" },
      { nama: "Wifi", icon: "wifi" },
      { nama: "Kamar mandi dalam", icon: "bath" },
      { nama: "Dapur", icon: "chef-hat" },
      { nama: "Laundry", icon: "shirt" },
      { nama: "Parkir", icon: "car" },
      { nama: "CCTV", icon: "cctv" },
      { nama: "Penjaga", icon: "shield-check" },
    ])
    .returning();

  const [fAC, fWifi, fKMDalam, fDapur, fLaundry, fParkir, fCCTV, fPenjaga] =
    insertedFasilitas;

  // ─── 3. Kos (15 kos fiktif) ──────────────────────────────────────────────────
  console.log("🏡 Menyisipkan 15 kos...");
  const insertedKos = await db
    .insert(kosTable)
    .values([
      // === UI Depok area ===
      {
        ownerId: owner1.id,
        nama: "Kos Melati Depok",
        alamat: "Jl. Margonda Raya No. 45, Depok, Jawa Barat",
        harga: 1200000,
        deskripsi:
          "Kos nyaman dekat kampus UI, kamar luas dan bersih. Cocok untuk mahasiswa S1 maupun S2.",
        jamOperasional: "06:00-23:00",
        aturan:
          "Dilarang membawa tamu menginap. Bayar sebelum tanggal 5. Jaga kebersihan bersama.",
        lat: "-6.3625",
        lng: "106.8275",
        noWa: "6281234500001",
      },
      {
        ownerId: owner2.id,
        nama: "Kos Anggrek Beji",
        alamat: "Jl. Beji Timur No. 12, Beji, Depok",
        harga: 950000,
        deskripsi:
          "Kos putri strategis 5 menit jalan kaki ke gerbang UI. Lingkungan tenang dan aman.",
        jamOperasional: "06:00-22:00",
        aturan: "Khusus putri. Tamu hanya boleh di ruang tamu. Malam tutup jam 22.00.",
        lat: "-6.3589",
        lng: "106.8302",
        noWa: "6281234500002",
      },
      {
        ownerId: owner1.id,
        nama: "Wisma Mahasiswa Kukusan",
        alamat: "Jl. Kukusan Teknik No. 8, Kukusan, Depok",
        harga: 750000,
        deskripsi:
          "Pilihan ekonomis dekat Fasilkom UI. Kamar sederhana namun bersih, cocok untuk mahasiswa.",
        jamOperasional: "05:00-24:00",
        aturan: "Bayar tepat waktu. Dilarang merokok di dalam kamar.",
        lat: "-6.3641",
        lng: "106.8241",
        noWa: "6281234500003",
      },

      // === ITB Bandung area ===
      {
        ownerId: owner3.id,
        nama: "Kos Dago Indah",
        alamat: "Jl. Dago No. 78, Coblong, Bandung",
        harga: 1500000,
        deskripsi:
          "Kos premium kawasan Dago, dekat ITB. Kamar modern dengan pemandangan kota Bandung.",
        jamOperasional: "00:00-24:00",
        aturan: "Bayar 3 bulan di muka. Tamu dibatasi. Dilarang pelihara hewan.",
        lat: "-6.8837",
        lng: "107.6109",
        noWa: "6282234500001",
      },
      {
        ownerId: owner2.id,
        nama: "Kos Ganesa Bandung",
        alamat: "Jl. Ganesa No. 15, Lb. Siliwangi, Bandung",
        harga: 1800000,
        deskripsi:
          "Tepat di depan kampus ITB, kos eksklusif dengan fasilitas lengkap. Keamanan 24 jam.",
        jamOperasional: "00:00-24:00",
        aturan: "Deposit 1 bulan. Parkir motor gratis. Tamu wajib lapor.",
        lat: "-6.8943",
        lng: "107.6097",
        noWa: "6282234500002",
      },
      {
        ownerId: owner4.id,
        nama: "Kos Sekeloa Murah",
        alamat: "Jl. Sekeloa Selatan No. 3, Sekeloa, Bandung",
        harga: 600000,
        deskripsi:
          "Kos ekonomis untuk mahasiswa ITB. Lingkungan kondusif untuk belajar, dekat warung makan.",
        jamOperasional: "05:00-22:30",
        aturan: "Dilarang bising setelah jam 22.00. Sampah dibuang di tempat yang ditentukan.",
        lat: "-6.8991",
        lng: "107.6134",
        noWa: "6282234500003",
      },

      // === UGM Yogyakarta area ===
      {
        ownerId: owner3.id,
        nama: "Kos Bulaksumur Yogya",
        alamat: "Jl. Bulaksumur No. 22, Sleman, Yogyakarta",
        harga: 900000,
        deskripsi:
          "Kos dekat UGM di kawasan Bulaksumur. Suasana asri, akses mudah ke berbagai fasilitas kampus.",
        jamOperasional: "06:00-22:00",
        aturan: "Jam malam 22.00. Tamu hanya sampai jam 20.00. Bayar setiap tanggal 1.",
        lat: "-7.7714",
        lng: "110.3769",
        noWa: "6287634500001",
      },
      {
        ownerId: owner5.id,
        nama: "Kos Pogung Baru",
        alamat: "Jl. Pogung Baru No. 5A, Sinduadi, Mlati, Sleman",
        harga: 700000,
        deskripsi:
          "Kos putra favorit mahasiswa UGM. Dekat Kopma UGM dan berbagai warung makan mahasiswa.",
        jamOperasional: "05:00-23:00",
        aturan: "Khusus putra. Tamu wanita hanya di teras. Dilarang merokok.",
        lat: "-7.7649",
        lng: "110.3703",
        noWa: "6287634500002",
      },
      {
        ownerId: owner1.id,
        nama: "Kos Sagan Premium",
        alamat: "Jl. Sagan Baru No. 11, Gondokusuman, Yogyakarta",
        harga: 1350000,
        deskripsi:
          "Kos putri eksklusif area Sagan. Fasilitas lengkap, aman, dan nyaman. 10 menit ke UGM.",
        jamOperasional: "06:00-22:00",
        aturan: "Khusus putri. Tamu hanya sampai jam 20.00. Deposit 1 bulan.",
        lat: "-7.7831",
        lng: "110.3814",
        noWa: "6287634500003",
      },

      // === ITS Surabaya area ===
      {
        ownerId: owner4.id,
        nama: "Kos Keputih Surabaya",
        alamat: "Jl. Keputih Timur No. 7, Keputih, Sukolilo, Surabaya",
        harga: 850000,
        deskripsi:
          "Kos nyaman dekat ITS Surabaya. Akses mudah ke kampus dan pusat perbelanjaan.",
        jamOperasional: "05:30-23:00",
        aturan: "Bayar sebelum tanggal 5. Dilarang memasak di kamar. Jaga kebersihan.",
        lat: "-7.2753",
        lng: "112.7957",
        noWa: "6281534500001",
      },
      {
        ownerId: owner5.id,
        nama: "Kos Sutorejo ITS",
        alamat: "Jl. Sutorejo Utara No. 33, Mulyorejo, Surabaya",
        harga: 1100000,
        deskripsi:
          "Kos strategis dekat ITS dan Unair. Kamar ber-AC, internet cepat, parkir luas.",
        jamOperasional: "00:00-24:00",
        aturan: "Tamu wajib isi buku tamu. Keamanan 24 jam.",
        lat: "-7.2694",
        lng: "112.7888",
        noWa: "6281534500002",
      },
      {
        ownerId: owner2.id,
        nama: "Kos Mulyosari Budget",
        alamat: "Jl. Mulyosari No. 101, Mulyorejo, Surabaya",
        harga: 550000,
        deskripsi:
          "Pilihan paling hemat dekat kampus ITS. Cocok untuk mahasiswa baru yang ingin menghemat biaya.",
        jamOperasional: "05:00-22:00",
        aturan: "Jam malam 22.00. Listrik pakai token sendiri.",
        lat: "-7.2711",
        lng: "112.7924",
        noWa: "6281534500003",
      },

      // === Unpad Jatinangor area ===
      {
        ownerId: owner3.id,
        nama: "Kos Jatinangor Asri",
        alamat: "Jl. Raya Jatinangor No. 55, Jatinangor, Sumedang",
        harga: 800000,
        deskripsi:
          "Kos asri di kawasan kampus Unpad Jatinangor. Lingkungan hijau dan tenang, cocok untuk belajar.",
        jamOperasional: "06:00-22:30",
        aturan: "Dilarang membawa kendaraan roda empat. Bayar tepat waktu.",
        lat: "-6.9318",
        lng: "107.7698",
        noWa: "6282334500001",
      },
      {
        ownerId: owner4.id,
        nama: "Kos Sayang Jatinangor",
        alamat: "Jl. Sayang No. 8, Hegarmanah, Jatinangor, Sumedang",
        harga: 2000000,
        deskripsi:
          "Kos mewah terbaru di Jatinangor. Studio mini full furnished, cocok untuk mahasiswa pascasarjana.",
        jamOperasional: "00:00-24:00",
        aturan: "Kontrak minimal 6 bulan. Deposit 2 bulan. No party.",
        lat: "-6.9278",
        lng: "107.7712",
        noWa: "6282334500002",
      },
      {
        ownerId: owner5.id,
        nama: "Kos Ciseke Ekonomis",
        alamat: "Jl. Ciseke No. 3, Ciseke, Jatinangor, Sumedang",
        harga: 500000,
        deskripsi:
          "Kos paling terjangkau di Jatinangor. Cocok untuk mahasiswa semester awal dengan budget terbatas.",
        jamOperasional: "05:00-22:00",
        aturan: "Jam malam 22.00. Dilarang merokok. Masak di dapur bersama.",
        lat: "-6.9352",
        lng: "107.7673",
        noWa: "6282334500003",
      },
    ])
    .returning();

  // ─── 4. Kos-Fasilitas ─────────────────────────────────────────────────────
  console.log("🔧 Menyisipkan kos_fasilitas...");

  // Mapping: kos index → fasilitas ids
  const kosFasilitasData: { kosId: number; fasilitasId: number }[] = [
    // Kos 0: Melati Depok — AC, Wifi, KM Dalam, Laundry, CCTV
    { kosId: insertedKos[0].id, fasilitasId: fAC.id },
    { kosId: insertedKos[0].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[0].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[0].id, fasilitasId: fLaundry.id },
    { kosId: insertedKos[0].id, fasilitasId: fCCTV.id },

    // Kos 1: Anggrek Beji — Wifi, KM Dalam, Parkir, CCTV, Penjaga
    { kosId: insertedKos[1].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[1].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[1].id, fasilitasId: fParkir.id },
    { kosId: insertedKos[1].id, fasilitasId: fCCTV.id },
    { kosId: insertedKos[1].id, fasilitasId: fPenjaga.id },

    // Kos 2: Wisma Kukusan — Wifi, Dapur, Parkir
    { kosId: insertedKos[2].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[2].id, fasilitasId: fDapur.id },
    { kosId: insertedKos[2].id, fasilitasId: fParkir.id },

    // Kos 3: Dago Indah — AC, Wifi, KM Dalam, Laundry, Parkir, CCTV
    { kosId: insertedKos[3].id, fasilitasId: fAC.id },
    { kosId: insertedKos[3].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[3].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[3].id, fasilitasId: fLaundry.id },
    { kosId: insertedKos[3].id, fasilitasId: fParkir.id },
    { kosId: insertedKos[3].id, fasilitasId: fCCTV.id },

    // Kos 4: Ganesa Bandung — AC, Wifi, KM Dalam, Laundry, Parkir, CCTV, Penjaga
    { kosId: insertedKos[4].id, fasilitasId: fAC.id },
    { kosId: insertedKos[4].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[4].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[4].id, fasilitasId: fLaundry.id },
    { kosId: insertedKos[4].id, fasilitasId: fParkir.id },
    { kosId: insertedKos[4].id, fasilitasId: fCCTV.id },
    { kosId: insertedKos[4].id, fasilitasId: fPenjaga.id },

    // Kos 5: Sekeloa Murah — Wifi, Dapur, Parkir
    { kosId: insertedKos[5].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[5].id, fasilitasId: fDapur.id },
    { kosId: insertedKos[5].id, fasilitasId: fParkir.id },

    // Kos 6: Bulaksumur — AC, Wifi, KM Dalam, Dapur
    { kosId: insertedKos[6].id, fasilitasId: fAC.id },
    { kosId: insertedKos[6].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[6].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[6].id, fasilitasId: fDapur.id },

    // Kos 7: Pogung Baru — Wifi, Dapur, Parkir, Penjaga
    { kosId: insertedKos[7].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[7].id, fasilitasId: fDapur.id },
    { kosId: insertedKos[7].id, fasilitasId: fParkir.id },
    { kosId: insertedKos[7].id, fasilitasId: fPenjaga.id },

    // Kos 8: Sagan Premium — AC, Wifi, KM Dalam, Laundry, CCTV, Penjaga
    { kosId: insertedKos[8].id, fasilitasId: fAC.id },
    { kosId: insertedKos[8].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[8].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[8].id, fasilitasId: fLaundry.id },
    { kosId: insertedKos[8].id, fasilitasId: fCCTV.id },
    { kosId: insertedKos[8].id, fasilitasId: fPenjaga.id },

    // Kos 9: Keputih Surabaya — Wifi, KM Dalam, Parkir, CCTV
    { kosId: insertedKos[9].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[9].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[9].id, fasilitasId: fParkir.id },
    { kosId: insertedKos[9].id, fasilitasId: fCCTV.id },

    // Kos 10: Sutorejo ITS — AC, Wifi, KM Dalam, Parkir, CCTV
    { kosId: insertedKos[10].id, fasilitasId: fAC.id },
    { kosId: insertedKos[10].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[10].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[10].id, fasilitasId: fParkir.id },
    { kosId: insertedKos[10].id, fasilitasId: fCCTV.id },

    // Kos 11: Mulyosari Budget — Wifi, Dapur
    { kosId: insertedKos[11].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[11].id, fasilitasId: fDapur.id },

    // Kos 12: Jatinangor Asri — Wifi, KM Dalam, Dapur, Parkir
    { kosId: insertedKos[12].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[12].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[12].id, fasilitasId: fDapur.id },
    { kosId: insertedKos[12].id, fasilitasId: fParkir.id },

    // Kos 13: Sayang Jatinangor — AC, Wifi, KM Dalam, Laundry, Parkir, CCTV, Penjaga
    { kosId: insertedKos[13].id, fasilitasId: fAC.id },
    { kosId: insertedKos[13].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[13].id, fasilitasId: fKMDalam.id },
    { kosId: insertedKos[13].id, fasilitasId: fLaundry.id },
    { kosId: insertedKos[13].id, fasilitasId: fParkir.id },
    { kosId: insertedKos[13].id, fasilitasId: fCCTV.id },
    { kosId: insertedKos[13].id, fasilitasId: fPenjaga.id },

    // Kos 14: Ciseke Ekonomis — Wifi, Dapur, Parkir
    { kosId: insertedKos[14].id, fasilitasId: fWifi.id },
    { kosId: insertedKos[14].id, fasilitasId: fDapur.id },
    { kosId: insertedKos[14].id, fasilitasId: fParkir.id },
  ];

  await db.insert(kosFasilitasTable).values(kosFasilitasData);

  // ─── 5. Reviews ──────────────────────────────────────────────────────────────
  console.log("⭐ Menyisipkan reviews...");
  await db.insert(reviewsTable).values([
    // Kos Melati Depok
    {
      kosId: insertedKos[0].id,
      userId: seeker1.id,
      rating: 5,
      komentar: "Kamarnya bersih dan luas, pemilik kos ramah. Wifi kencang banget, cocok buat belajar online. Sangat rekomendasikan!",
      tanggal: "2025-03-15",
    },
    {
      kosId: insertedKos[0].id,
      userId: seeker2.id,
      rating: 4,
      komentar: "Lokasinya strategis, dekat stasiun Pondok Cina. AC dingin tapi agak berisik. Overall bagus.",
      tanggal: "2025-04-20",
    },
    {
      kosId: insertedKos[0].id,
      userId: seeker3.id,
      rating: 5,
      komentar: "Sudah 2 tahun di sini, betah banget. Fasilitas lengkap dan selalu dirawat.",
      tanggal: "2025-06-01",
    },

    // Kos Anggrek Beji
    {
      kosId: insertedKos[1].id,
      userId: seeker4.id,
      rating: 4,
      komentar: "Aman banget karena ada penjaga 24 jam. Kamar mandi dalam jadi privasi terjaga. Recommended buat putri.",
      tanggal: "2025-02-10",
    },
    {
      kosId: insertedKos[1].id,
      userId: seeker5.id,
      rating: 3,
      komentar: "Jam malam agak ketat ya jam 22.00. Tapi wajar sih untuk kos putri. Kamarnya cukup nyaman.",
      tanggal: "2025-05-05",
    },

    // Kos Dago Indah
    {
      kosId: insertedKos[3].id,
      userId: seeker1.id,
      rating: 5,
      komentar: "Kos terbaik di kawasan Dago! Pemandangan dari jendela indah banget, bisa lihat kota Bandung. Harga sepadan dengan fasilitas.",
      tanggal: "2025-01-20",
    },
    {
      kosId: insertedKos[3].id,
      userId: seeker2.id,
      rating: 4,
      komentar: "Fasilitasnya lengkap. Cuma parkirnya kadang penuh kalau weekend. Laundry gratis sangat membantu.",
      tanggal: "2025-03-08",
    },

    // Kos Ganesa Bandung
    {
      kosId: insertedKos[4].id,
      userId: seeker3.id,
      rating: 5,
      komentar: "Harga mahal tapi worth it! Langsung depan gerbang ITB, hemat ongkos transport. Keamanan top.",
      tanggal: "2025-02-28",
    },
    {
      kosId: insertedKos[4].id,
      userId: seeker4.id,
      rating: 5,
      komentar: "Kos idaman mahasiswa ITB. Bersih, aman, internet super cepat. Penjaga ramah dan responsif.",
      tanggal: "2025-04-15",
    },

    // Kos Bulaksumur
    {
      kosId: insertedKos[6].id,
      userId: seeker5.id,
      rating: 4,
      komentar: "Suasana asri dan tenang, cocok buat belajar. Dapur bersih dan tertata. Dekat kantin kampus.",
      tanggal: "2025-03-22",
    },

    // Kos Pogung Baru
    {
      kosId: insertedKos[7].id,
      userId: seeker1.id,
      rating: 4,
      komentar: "Pusat kos mahasiswa UGM. Banyak warung makan enak di sekitar. Penjaga baik, lingkungan aman.",
      tanggal: "2025-01-15",
    },
    {
      kosId: insertedKos[7].id,
      userId: seeker3.id,
      rating: 3,
      komentar: "Lumayan untuk harganya. Kamar agak kecil tapi cukup untuk 1 orang. Wifi stabil.",
      tanggal: "2025-04-30",
    },

    // Kos Sagan Premium
    {
      kosId: insertedKos[8].id,
      userId: seeker2.id,
      rating: 5,
      komentar: "Kos putri paling nyaman di Yogya! Laundry gratis, CCTV di setiap sudut, penjaga 24 jam. Betah!",
      tanggal: "2025-02-14",
    },

    // Kos Sutorejo ITS
    {
      kosId: insertedKos[10].id,
      userId: seeker4.id,
      rating: 4,
      komentar: "AC-nya dingin, wifi kencang. Parkir luas, cocok yang bawa motor. Lokasi strategis antara ITS dan Unair.",
      tanggal: "2025-03-10",
    },
    {
      kosId: insertedKos[10].id,
      userId: seeker5.id,
      rating: 5,
      komentar: "Terbaik di kawasan Surabaya Timur. Kamar mandi dalam bikin hidup lebih nyaman. Pemilik responsif.",
      tanggal: "2025-05-20",
    },

    // Kos Sayang Jatinangor
    {
      kosId: insertedKos[13].id,
      userId: seeker1.id,
      rating: 5,
      komentar: "Studio mini yang mewah! Full furnished, AC dingin, keamanan ketat. Cocok untuk pascasarjana.",
      tanggal: "2025-04-05",
    },
    {
      kosId: insertedKos[13].id,
      userId: seeker3.id,
      rating: 4,
      komentar: "Memang mahal tapi fasilitas premium banget. Laundry, CCTV, penjaga semua ada. Worth the price.",
      tanggal: "2025-06-10",
    },
  ]);

  console.log("✅ Seed selesai! Database telah diisi dengan:");
  console.log(`   - ${insertedUsers.length} users`);
  console.log(`   - ${insertedFasilitas.length} fasilitas`);
  console.log(`   - ${insertedKos.length} kos`);
  console.log(`   - ${kosFasilitasData.length} relasi kos-fasilitas`);
  console.log("   - 17 reviews");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
