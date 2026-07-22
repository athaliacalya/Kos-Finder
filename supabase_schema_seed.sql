-- ============================================================
--  Platform Perbandingan Kos — Schema + Seed Data
--  Cara pakai: Buka Supabase Dashboard → SQL Editor → jalankan file ini
-- ============================================================

-- ─── 1. ENUM ─────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('pencari', 'pemilik', 'admin');

-- ─── 2. TABLES ───────────────────────────────────────────────────────────────

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  role       user_role NOT NULL DEFAULT 'pencari',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE kos (
  id               SERIAL PRIMARY KEY,
  owner_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nama             TEXT NOT NULL,
  alamat           TEXT NOT NULL,
  harga            INTEGER NOT NULL,           -- harga per bulan dalam Rupiah
  deskripsi        TEXT,
  jam_operasional  TEXT,                       -- e.g. "06:00-22:00"
  aturan           TEXT,
  lat              NUMERIC(10, 7),
  lng              NUMERIC(10, 7),
  no_wa            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fasilitas (
  id    SERIAL PRIMARY KEY,
  nama  TEXT NOT NULL,
  icon  TEXT NOT NULL
);

CREATE TABLE kos_fasilitas (
  kos_id       INTEGER NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
  fasilitas_id INTEGER NOT NULL REFERENCES fasilitas(id) ON DELETE CASCADE,
  PRIMARY KEY (kos_id, fasilitas_id)
);

CREATE TABLE reviews (
  id         SERIAL PRIMARY KEY,
  kos_id     INTEGER NOT NULL REFERENCES kos(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  komentar   TEXT,
  foto       TEXT,                             -- URL foto
  tanggal    DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indeks tambahan ─────────────────────────────────────────────────────────
CREATE INDEX idx_kos_owner_id     ON kos(owner_id);
CREATE INDEX idx_kos_harga        ON kos(harga);
CREATE INDEX idx_reviews_kos_id   ON reviews(kos_id);
CREATE INDEX idx_reviews_user_id  ON reviews(user_id);


-- ============================================================
--  SEED DATA
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────────────────────
INSERT INTO users (name, email, role) VALUES
  ('Admin Platform',   'admin@cariKos.id',            'admin'),
  ('Budi Santoso',     'budi.santoso@gmail.com',       'pemilik'),
  ('Dewi Rahayu',      'dewi.rahayu@gmail.com',        'pemilik'),
  ('Hendra Wijaya',    'hendra.wijaya@gmail.com',      'pemilik'),
  ('Siti Nuraini',     'siti.nuraini@gmail.com',       'pemilik'),
  ('Ahmad Fauzi',      'ahmad.fauzi@gmail.com',        'pemilik'),
  ('Rina Marlina',     'rina.marlina@gmail.com',       'pencari'),
  ('Doni Kusuma',      'doni.kusuma@gmail.com',        'pencari'),
  ('Putri Anggraini',  'putri.anggraini@gmail.com',    'pencari'),
  ('Rizky Pratama',    'rizky.pratama@gmail.com',      'pencari'),
  ('Maya Sari',        'maya.sari@gmail.com',          'pencari');

-- ─── Fasilitas ───────────────────────────────────────────────────────────────
INSERT INTO fasilitas (nama, icon) VALUES
  ('AC',                 'wind'),
  ('Wifi',               'wifi'),
  ('Kamar mandi dalam',  'bath'),
  ('Dapur',              'chef-hat'),
  ('Laundry',            'shirt'),
  ('Parkir',             'car'),
  ('CCTV',               'cctv'),
  ('Penjaga',            'shield-check');

-- ─── Kos (15 kos di area kampus berbeda) ─────────────────────────────────────
-- owner_id: 2=Budi, 3=Dewi, 4=Hendra, 5=Siti, 6=Ahmad

INSERT INTO kos (owner_id, nama, alamat, harga, deskripsi, jam_operasional, aturan, lat, lng, no_wa) VALUES

  -- === UI Depok ===
  (2, 'Kos Melati Depok',
      'Jl. Margonda Raya No. 45, Depok, Jawa Barat',
      1200000,
      'Kos nyaman dekat kampus UI, kamar luas dan bersih. Cocok untuk mahasiswa S1 maupun S2.',
      '06:00-23:00',
      'Dilarang membawa tamu menginap. Bayar sebelum tanggal 5. Jaga kebersihan bersama.',
      -6.3625, 106.8275, '6281234500001'),

  (3, 'Kos Anggrek Beji',
      'Jl. Beji Timur No. 12, Beji, Depok',
      950000,
      'Kos putri strategis 5 menit jalan kaki ke gerbang UI. Lingkungan tenang dan aman.',
      '06:00-22:00',
      'Khusus putri. Tamu hanya boleh di ruang tamu. Malam tutup jam 22.00.',
      -6.3589, 106.8302, '6281234500002'),

  (2, 'Wisma Mahasiswa Kukusan',
      'Jl. Kukusan Teknik No. 8, Kukusan, Depok',
      750000,
      'Pilihan ekonomis dekat Fasilkom UI. Kamar sederhana namun bersih, cocok untuk mahasiswa.',
      '05:00-24:00',
      'Bayar tepat waktu. Dilarang merokok di dalam kamar.',
      -6.3641, 106.8241, '6281234500003'),

  -- === ITB Bandung ===
  (4, 'Kos Dago Indah',
      'Jl. Dago No. 78, Coblong, Bandung',
      1500000,
      'Kos premium kawasan Dago, dekat ITB. Kamar modern dengan pemandangan kota Bandung.',
      '00:00-24:00',
      'Bayar 3 bulan di muka. Tamu dibatasi. Dilarang pelihara hewan.',
      -6.8837, 107.6109, '6282234500001'),

  (3, 'Kos Ganesa Bandung',
      'Jl. Ganesa No. 15, Lb. Siliwangi, Bandung',
      1800000,
      'Tepat di depan kampus ITB, kos eksklusif dengan fasilitas lengkap. Keamanan 24 jam.',
      '00:00-24:00',
      'Deposit 1 bulan. Parkir motor gratis. Tamu wajib lapor.',
      -6.8943, 107.6097, '6282234500002'),

  (5, 'Kos Sekeloa Murah',
      'Jl. Sekeloa Selatan No. 3, Sekeloa, Bandung',
      600000,
      'Kos ekonomis untuk mahasiswa ITB. Lingkungan kondusif untuk belajar, dekat warung makan.',
      '05:00-22:30',
      'Dilarang bising setelah jam 22.00. Sampah dibuang di tempat yang ditentukan.',
      -6.8991, 107.6134, '6282234500003'),

  -- === UGM Yogyakarta ===
  (4, 'Kos Bulaksumur Yogya',
      'Jl. Bulaksumur No. 22, Sleman, Yogyakarta',
      900000,
      'Kos dekat UGM di kawasan Bulaksumur. Suasana asri, akses mudah ke berbagai fasilitas kampus.',
      '06:00-22:00',
      'Jam malam 22.00. Tamu hanya sampai jam 20.00. Bayar setiap tanggal 1.',
      -7.7714, 110.3769, '6287634500001'),

  (6, 'Kos Pogung Baru',
      'Jl. Pogung Baru No. 5A, Sinduadi, Mlati, Sleman',
      700000,
      'Kos putra favorit mahasiswa UGM. Dekat Kopma UGM dan berbagai warung makan mahasiswa.',
      '05:00-23:00',
      'Khusus putra. Tamu wanita hanya di teras. Dilarang merokok.',
      -7.7649, 110.3703, '6287634500002'),

  (2, 'Kos Sagan Premium',
      'Jl. Sagan Baru No. 11, Gondokusuman, Yogyakarta',
      1350000,
      'Kos putri eksklusif area Sagan. Fasilitas lengkap, aman, dan nyaman. 10 menit ke UGM.',
      '06:00-22:00',
      'Khusus putri. Tamu hanya sampai jam 20.00. Deposit 1 bulan.',
      -7.7831, 110.3814, '6287634500003'),

  -- === ITS Surabaya ===
  (5, 'Kos Keputih Surabaya',
      'Jl. Keputih Timur No. 7, Keputih, Sukolilo, Surabaya',
      850000,
      'Kos nyaman dekat ITS Surabaya. Akses mudah ke kampus dan pusat perbelanjaan.',
      '05:30-23:00',
      'Bayar sebelum tanggal 5. Dilarang memasak di kamar. Jaga kebersihan.',
      -7.2753, 112.7957, '6281534500001'),

  (6, 'Kos Sutorejo ITS',
      'Jl. Sutorejo Utara No. 33, Mulyorejo, Surabaya',
      1100000,
      'Kos strategis dekat ITS dan Unair. Kamar ber-AC, internet cepat, parkir luas.',
      '00:00-24:00',
      'Tamu wajib isi buku tamu. Keamanan 24 jam.',
      -7.2694, 112.7888, '6281534500002'),

  (3, 'Kos Mulyosari Budget',
      'Jl. Mulyosari No. 101, Mulyorejo, Surabaya',
      550000,
      'Pilihan paling hemat dekat kampus ITS. Cocok untuk mahasiswa baru yang ingin menghemat biaya.',
      '05:00-22:00',
      'Jam malam 22.00. Listrik pakai token sendiri.',
      -7.2711, 112.7924, '6281534500003'),

  -- === Unpad Jatinangor ===
  (4, 'Kos Jatinangor Asri',
      'Jl. Raya Jatinangor No. 55, Jatinangor, Sumedang',
      800000,
      'Kos asri di kawasan kampus Unpad Jatinangor. Lingkungan hijau dan tenang, cocok untuk belajar.',
      '06:00-22:30',
      'Dilarang membawa kendaraan roda empat. Bayar tepat waktu.',
      -6.9318, 107.7698, '6282334500001'),

  (5, 'Kos Sayang Jatinangor',
      'Jl. Sayang No. 8, Hegarmanah, Jatinangor, Sumedang',
      2000000,
      'Kos mewah terbaru di Jatinangor. Studio mini full furnished, cocok untuk mahasiswa pascasarjana.',
      '00:00-24:00',
      'Kontrak minimal 6 bulan. Deposit 2 bulan. No party.',
      -6.9278, 107.7712, '6282334500002'),

  (6, 'Kos Ciseke Ekonomis',
      'Jl. Ciseke No. 3, Ciseke, Jatinangor, Sumedang',
      500000,
      'Kos paling terjangkau di Jatinangor. Cocok untuk mahasiswa semester awal dengan budget terbatas.',
      '05:00-22:00',
      'Jam malam 22.00. Dilarang merokok. Masak di dapur bersama.',
      -6.9352, 107.7673, '6282334500003');


-- ─── Kos-Fasilitas (fasilitas 1=AC,2=Wifi,3=KM Dalam,4=Dapur,5=Laundry,6=Parkir,7=CCTV,8=Penjaga)
-- Kos id: 1-15 sesuai urutan insert di atas

INSERT INTO kos_fasilitas (kos_id, fasilitas_id)
SELECT k.id, f.id
FROM
  (VALUES
    -- Kos Melati Depok (id=1): AC, Wifi, KM Dalam, Laundry, CCTV
    (1, 1),(1, 2),(1, 3),(1, 5),(1, 7),
    -- Kos Anggrek Beji (id=2): Wifi, KM Dalam, Parkir, CCTV, Penjaga
    (2, 2),(2, 3),(2, 6),(2, 7),(2, 8),
    -- Wisma Kukusan (id=3): Wifi, Dapur, Parkir
    (3, 2),(3, 4),(3, 6),
    -- Kos Dago Indah (id=4): AC, Wifi, KM Dalam, Laundry, Parkir, CCTV
    (4, 1),(4, 2),(4, 3),(4, 5),(4, 6),(4, 7),
    -- Kos Ganesa Bandung (id=5): AC, Wifi, KM Dalam, Laundry, Parkir, CCTV, Penjaga
    (5, 1),(5, 2),(5, 3),(5, 5),(5, 6),(5, 7),(5, 8),
    -- Kos Sekeloa Murah (id=6): Wifi, Dapur, Parkir
    (6, 2),(6, 4),(6, 6),
    -- Kos Bulaksumur (id=7): AC, Wifi, KM Dalam, Dapur
    (7, 1),(7, 2),(7, 3),(7, 4),
    -- Kos Pogung Baru (id=8): Wifi, Dapur, Parkir, Penjaga
    (8, 2),(8, 4),(8, 6),(8, 8),
    -- Kos Sagan Premium (id=9): AC, Wifi, KM Dalam, Laundry, CCTV, Penjaga
    (9, 1),(9, 2),(9, 3),(9, 5),(9, 7),(9, 8),
    -- Kos Keputih (id=10): Wifi, KM Dalam, Parkir, CCTV
    (10, 2),(10, 3),(10, 6),(10, 7),
    -- Kos Sutorejo ITS (id=11): AC, Wifi, KM Dalam, Parkir, CCTV
    (11, 1),(11, 2),(11, 3),(11, 6),(11, 7),
    -- Kos Mulyosari Budget (id=12): Wifi, Dapur
    (12, 2),(12, 4),
    -- Kos Jatinangor Asri (id=13): Wifi, KM Dalam, Dapur, Parkir
    (13, 2),(13, 3),(13, 4),(13, 6),
    -- Kos Sayang Jatinangor (id=14): AC, Wifi, KM Dalam, Laundry, Parkir, CCTV, Penjaga
    (14, 1),(14, 2),(14, 3),(14, 5),(14, 6),(14, 7),(14, 8),
    -- Kos Ciseke Ekonomis (id=15): Wifi, Dapur, Parkir
    (15, 2),(15, 4),(15, 6)
  ) AS v(kos_seq, fas_seq)
JOIN kos k ON k.id = (SELECT min(id) FROM kos) + kos_seq - 1
JOIN fasilitas f ON f.id = (SELECT min(id) FROM fasilitas) + fas_seq - 1;


-- ─── Reviews ─────────────────────────────────────────────────────────────────
-- user_id: 7=Rina, 8=Doni, 9=Putri, 10=Rizky, 11=Maya

INSERT INTO reviews (kos_id, user_id, rating, komentar, tanggal)
SELECT
  (SELECT min(id) FROM kos) + kos_seq - 1,
  (SELECT min(id) FROM users WHERE role='pencari') + user_seq - 1,
  rating, komentar, tanggal::date
FROM (VALUES
  -- Kos Melati Depok (kos_seq=1)
  (1, 1, 5, 'Kamarnya bersih dan luas, pemilik kos ramah. Wifi kencang banget, cocok buat belajar online. Sangat rekomendasikan!', '2025-03-15'),
  (1, 2, 4, 'Lokasinya strategis, dekat stasiun Pondok Cina. AC dingin tapi agak berisik. Overall bagus.',                        '2025-04-20'),
  (1, 3, 5, 'Sudah 2 tahun di sini, betah banget. Fasilitas lengkap dan selalu dirawat.',                                         '2025-06-01'),
  -- Kos Anggrek Beji (kos_seq=2)
  (2, 4, 4, 'Aman banget karena ada penjaga 24 jam. Kamar mandi dalam jadi privasi terjaga. Recommended buat putri.',             '2025-02-10'),
  (2, 5, 3, 'Jam malam agak ketat ya jam 22.00. Tapi wajar sih untuk kos putri. Kamarnya cukup nyaman.',                         '2025-05-05'),
  -- Kos Dago Indah (kos_seq=4)
  (4, 1, 5, 'Kos terbaik di kawasan Dago! Pemandangan dari jendela indah banget, bisa lihat kota Bandung. Harga sepadan.',       '2025-01-20'),
  (4, 2, 4, 'Fasilitasnya lengkap. Cuma parkirnya kadang penuh kalau weekend. Laundry gratis sangat membantu.',                   '2025-03-08'),
  -- Kos Ganesa Bandung (kos_seq=5)
  (5, 3, 5, 'Harga mahal tapi worth it! Langsung depan gerbang ITB, hemat ongkos transport. Keamanan top.',                      '2025-02-28'),
  (5, 4, 5, 'Kos idaman mahasiswa ITB. Bersih, aman, internet super cepat. Penjaga ramah dan responsif.',                        '2025-04-15'),
  -- Kos Bulaksumur (kos_seq=7)
  (7, 5, 4, 'Suasana asri dan tenang, cocok buat belajar. Dapur bersih dan tertata. Dekat kantin kampus.',                       '2025-03-22'),
  -- Kos Pogung Baru (kos_seq=8)
  (8, 1, 4, 'Pusat kos mahasiswa UGM. Banyak warung makan enak di sekitar. Penjaga baik, lingkungan aman.',                      '2025-01-15'),
  (8, 3, 3, 'Lumayan untuk harganya. Kamar agak kecil tapi cukup untuk 1 orang. Wifi stabil.',                                   '2025-04-30'),
  -- Kos Sagan Premium (kos_seq=9)
  (9, 2, 5, 'Kos putri paling nyaman di Yogya! Laundry gratis, CCTV di setiap sudut, penjaga 24 jam. Betah!',                   '2025-02-14'),
  -- Kos Sutorejo ITS (kos_seq=11)
  (11, 4, 4, 'AC-nya dingin, wifi kencang. Parkir luas, cocok yang bawa motor. Lokasi strategis antara ITS dan Unair.',          '2025-03-10'),
  (11, 5, 5, 'Terbaik di kawasan Surabaya Timur. Kamar mandi dalam bikin hidup lebih nyaman. Pemilik responsif.',                '2025-05-20'),
  -- Kos Sayang Jatinangor (kos_seq=14)
  (14, 1, 5, 'Studio mini yang mewah! Full furnished, AC dingin, keamanan ketat. Cocok untuk pascasarjana.',                     '2025-04-05'),
  (14, 3, 4, 'Memang mahal tapi fasilitas premium banget. Laundry, CCTV, penjaga semua ada. Worth the price.',                   '2025-06-10')
) AS v(kos_seq, user_seq, rating, komentar, tanggal);


-- ============================================================
--  Ringkasan data yang dimasukkan
-- ============================================================
SELECT 'users'         AS tabel, COUNT(*) AS jumlah FROM users
UNION ALL
SELECT 'fasilitas',    COUNT(*) FROM fasilitas
UNION ALL
SELECT 'kos',          COUNT(*) FROM kos
UNION ALL
SELECT 'kos_fasilitas',COUNT(*) FROM kos_fasilitas
UNION ALL
SELECT 'reviews',      COUNT(*) FROM reviews;
