import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import {
  ListKosQueryParams,
  ListKosResponse,
  ListKosTrendingQueryParams,
  ListKosTrendingResponse,
  ListKosBestValueQueryParams,
  ListKosBestValueResponse,
  ListKosBudgetFriendlyQueryParams,
  ListKosBudgetFriendlyResponse,
  ListKosHighestRatedQueryParams,
  ListKosHighestRatedResponse,
  ListKosNewestQueryParams,
  ListKosNewestResponse,
  GetKosParams,
  GetKosResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ─── Base aggregation query builder ──────────────────────────────────────────
// Returns kos rows with avgRating, reviewCount, and fasilitas array
const BASE_KOS_SELECT = `
  SELECT
    k.id,
    k.owner_id       AS "ownerId",
    k.nama,
    k.alamat,
    k.harga,
    k.deskripsi,
    k.jam_operasional AS "jamOperasional",
    k.aturan,
    k.lat::text      AS lat,
    k.lng::text      AS lng,
    k.no_wa          AS "noWa",
    k.created_at::text AS "createdAt",
    ROUND(AVG(r.rating)::numeric, 1)::float AS "avgRating",
    COUNT(DISTINCT r.id)::int               AS "reviewCount",
    COALESCE(
      JSON_AGG(
        DISTINCT jsonb_build_object('id', f.id, 'nama', f.nama, 'icon', f.icon)
      ) FILTER (WHERE f.id IS NOT NULL),
      '[]'::json
    ) AS fasilitas
  FROM kos k
  LEFT JOIN reviews r      ON r.kos_id   = k.id
  LEFT JOIN kos_fasilitas kf ON kf.kos_id = k.id
  LEFT JOIN fasilitas f    ON f.id        = kf.fasilitas_id
`;

const GROUP_BY = `GROUP BY k.id`;

// ─── GET /kos ─────────────────────────────────────────────────────────────────
router.get("/kos", async (req, res): Promise<void> => {
  const parsed = ListKosQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { kota, universitas, budget_min, budget_max, limit = 20 } = parsed.data;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (kota) {
    conditions.push(`k.alamat ILIKE $${idx++}`);
    params.push(`%${kota}%`);
  }
  if (universitas) {
    conditions.push(`k.alamat ILIKE $${idx++}`);
    params.push(`%${universitas}%`);
  }
  if (budget_min != null) {
    conditions.push(`k.harga >= $${idx++}`);
    params.push(budget_min);
  }
  if (budget_max != null) {
    conditions.push(`k.harga <= $${idx++}`);
    params.push(budget_max);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit);

  const query = `
    ${BASE_KOS_SELECT}
    ${where}
    ${GROUP_BY}
    ORDER BY k.created_at DESC
    LIMIT $${idx}
  `;

  const result = await pool.query(query, params);
  res.json(ListKosResponse.parse(result.rows));
});

// ─── GET /kos/trending ────────────────────────────────────────────────────────
router.get("/kos/trending", async (req, res): Promise<void> => {
  const parsed = ListKosTrendingQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit = 6 } = parsed.data;

  const query = `
    ${BASE_KOS_SELECT}
    ${GROUP_BY}
    ORDER BY COUNT(DISTINCT r.id) DESC, k.created_at DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  res.json(ListKosTrendingResponse.parse(result.rows));
});

// ─── GET /kos/best-value ──────────────────────────────────────────────────────
// Score = (avgRating * 1_000_000) / harga — high rating AND low price wins
router.get("/kos/best-value", async (req, res): Promise<void> => {
  const parsed = ListKosBestValueQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit = 6 } = parsed.data;

  const query = `
    SELECT * FROM (
      ${BASE_KOS_SELECT}
      ${GROUP_BY}
      HAVING COUNT(DISTINCT r.id) > 0
    ) sub
    ORDER BY (sub."avgRating" * 1000000.0 / sub.harga) DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  res.json(ListKosBestValueResponse.parse(result.rows));
});

// ─── GET /kos/budget-friendly ─────────────────────────────────────────────────
router.get("/kos/budget-friendly", async (req, res): Promise<void> => {
  const parsed = ListKosBudgetFriendlyQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit = 6 } = parsed.data;

  const query = `
    ${BASE_KOS_SELECT}
    ${GROUP_BY}
    ORDER BY k.harga ASC, k.created_at DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  res.json(ListKosBudgetFriendlyResponse.parse(result.rows));
});

// ─── GET /kos/highest-rated ───────────────────────────────────────────────────
router.get("/kos/highest-rated", async (req, res): Promise<void> => {
  const parsed = ListKosHighestRatedQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit = 6 } = parsed.data;

  const query = `
    SELECT * FROM (
      ${BASE_KOS_SELECT}
      ${GROUP_BY}
      HAVING COUNT(DISTINCT r.id) > 0
    ) sub
    ORDER BY sub."avgRating" DESC, sub."reviewCount" DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  res.json(ListKosHighestRatedResponse.parse(result.rows));
});

// ─── GET /kos/newest ──────────────────────────────────────────────────────────
router.get("/kos/newest", async (req, res): Promise<void> => {
  const parsed = ListKosNewestQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit = 6 } = parsed.data;

  const query = `
    ${BASE_KOS_SELECT}
    ${GROUP_BY}
    ORDER BY k.created_at DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  res.json(ListKosNewestResponse.parse(result.rows));
});

// ─── Campus coordinates for lokasi scoring ───────────────────────────────────
const CAMPUSES = [
  { nama: "Universitas Indonesia", lat: -6.3613, lng: 106.8297 },
  { nama: "Institut Teknologi Bandung", lat: -6.8914, lng: 107.6107 },
  { nama: "Universitas Gadjah Mada", lat: -7.7703, lng: 110.3774 },
  { nama: "ITS Surabaya", lat: -7.2756, lng: 112.7953 },
  { nama: "Universitas Padjadjaran", lat: -6.9240, lng: 107.7691 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clamp(val: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, val)));
}

// ─── GET /kos/:id/worth-it-score ─────────────────────────────────────────────
router.get("/kos/:id/worth-it-score", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  // ── Fetch this kos ──────────────────────────────────────────────────────────
  const kosResult = await pool.query<{
    id: number; nama: string; harga: number; alamat: string;
    lat: number; lng: number; avgRating: number | null; reviewCount: number;
    fasilitas: Array<{ id: number; nama: string; icon: string }>;
  }>(`
    SELECT
      k.id, k.nama, k.harga, k.alamat, k.lat::float, k.lng::float,
      ROUND(AVG(r.rating)::numeric, 1)::float AS "avgRating",
      COUNT(DISTINCT r.id)::int               AS "reviewCount",
      COALESCE(
        JSON_AGG(DISTINCT jsonb_build_object('id', f.id, 'nama', f.nama, 'icon', f.icon))
          FILTER (WHERE f.id IS NOT NULL),
        '[]'::json
      ) AS fasilitas
    FROM kos k
    LEFT JOIN reviews r      ON r.kos_id = k.id
    LEFT JOIN kos_fasilitas kf ON kf.kos_id = k.id
    LEFT JOIN fasilitas f    ON f.id = kf.fasilitas_id
    WHERE k.id = $1
    GROUP BY k.id
  `, [id]);

  if (kosResult.rows.length === 0) {
    res.status(404).json({ error: "Kos tidak ditemukan" });
    return;
  }
  const kos = kosResult.rows[0];

  // ── Fetch city peers (bbox ±0.3° ≈ ±33 km) ─────────────────────────────────
  const BBOX = 0.3;
  const peersResult = await pool.query<{
    id: number; harga: number; avgRating: number | null; fasilitasCount: number;
  }>(`
    SELECT
      k.id, k.harga,
      ROUND(AVG(r.rating)::numeric, 1)::float AS "avgRating",
      COUNT(DISTINCT kf.fasilitas_id)::int    AS "fasilitasCount"
    FROM kos k
    LEFT JOIN reviews r      ON r.kos_id = k.id
    LEFT JOIN kos_fasilitas kf ON kf.kos_id = k.id
    WHERE k.id != $1
      AND k.lat BETWEEN ($2::numeric - $4::numeric) AND ($2::numeric + $4::numeric)
      AND k.lng BETWEEN ($3::numeric - $4::numeric) AND ($3::numeric + $4::numeric)
    GROUP BY k.id
  `, [id, kos.lat, kos.lng, BBOX]);

  const peers = peersResult.rows;

  // ── Nearest campus ──────────────────────────────────────────────────────────
  let nearestDist = Infinity;
  let nearestCampus = CAMPUSES[0];
  for (const c of CAMPUSES) {
    const d = haversineKm(kos.lat, kos.lng, c.lat, c.lng);
    if (d < nearestDist) { nearestDist = d; nearestCampus = c; }
  }

  // ── Score: Harga (30%) ──────────────────────────────────────────────────────
  const avgHarga = peers.length
    ? peers.reduce((s, p) => s + p.harga, 0) / peers.length
    : kos.harga;
  const hargaRatio = kos.harga / avgHarga;           // <1 cheaper, >1 pricier
  const hargaScore = clamp(Math.round(70 * (avgHarga / kos.harga)), 20, 100);
  const hargaDiff = Math.round(Math.abs(hargaRatio - 1) * 100);
  const hargaExplanation = peers.length === 0
    ? "Belum cukup data kos lain di area ini untuk perbandingan harga."
    : hargaRatio < 1
    ? `Harga ${hargaDiff}% lebih murah dari rata-rata kos di area ini (Rp ${Math.round(avgHarga).toLocaleString("id-ID")}/bln).`
    : hargaRatio > 1
    ? `Harga ${hargaDiff}% lebih mahal dari rata-rata kos di area ini (Rp ${Math.round(avgHarga).toLocaleString("id-ID")}/bln).`
    : `Harga setara dengan rata-rata kos di area ini (Rp ${Math.round(avgHarga).toLocaleString("id-ID")}/bln).`;

  // ── Score: Fasilitas (25%) ──────────────────────────────────────────────────
  const TOTAL_FASILITAS = 8;
  const thisCount = kos.fasilitas.length;
  const avgPeerCount = peers.length
    ? peers.reduce((s, p) => s + p.fasilitasCount, 0) / peers.length
    : thisCount;
  const fasilitasBase = (thisCount / TOTAL_FASILITAS) * 100;
  const fasilitasBonus = (thisCount - avgPeerCount) / TOTAL_FASILITAS * 15;
  const fasilitasScore = clamp(fasilitasBase + fasilitasBonus, 10, 100);
  const fasilitasExplanation = `Memiliki ${thisCount} dari ${TOTAL_FASILITAS} fasilitas yang tersedia`
    + (peers.length ? ` (rata-rata ${avgPeerCount.toFixed(1)} fasilitas di area ini).` : ".");

  // ── Score: Lokasi (20%) ─────────────────────────────────────────────────────
  const lokasiScore = clamp(100 - nearestDist * 8, 5, 100);
  const lokasiLabel = nearestDist < 1 ? "sangat dekat" : nearestDist < 3 ? "dekat" : nearestDist < 7 ? "cukup dekat" : "cukup jauh";
  const lokasiExplanation = `Berjarak ${nearestDist.toFixed(1)} km dari ${nearestCampus.nama} — termasuk ${lokasiLabel} dari kampus.`;

  // ── Score: Keamanan (15%) ───────────────────────────────────────────────────
  const hasCCTV    = kos.fasilitas.some(f => f.icon === "cctv"         || f.nama.toLowerCase().includes("cctv"));
  const hasPenjaga = kos.fasilitas.some(f => f.icon === "shield-check" || f.nama.toLowerCase().includes("penjaga"));
  const keamananScore = hasCCTV && hasPenjaga ? 100 : hasCCTV || hasPenjaga ? 60 : 15;
  const keamananExplanation = hasCCTV && hasPenjaga
    ? "Dilengkapi CCTV dan penjaga keamanan 24 jam."
    : hasCCTV
    ? "Dilengkapi CCTV, namun tidak ada penjaga keamanan."
    : hasPenjaga
    ? "Ada penjaga keamanan, namun belum dilengkapi CCTV."
    : "Tidak ada informasi CCTV maupun penjaga keamanan di kos ini.";

  // ── Score: Rating (10%) ─────────────────────────────────────────────────────
  const ratingScore = kos.avgRating != null
    ? clamp(Math.round((kos.avgRating / 5.0) * 100), 10, 100)
    : 50;
  const ratingExplanation = kos.avgRating != null
    ? `Rating ${kos.avgRating.toFixed(1)}/5 berdasarkan ${kos.reviewCount} ulasan penghuni.`
    : "Belum ada ulasan dari penghuni. Skor netral diberikan.";

  // ── Total ────────────────────────────────────────────────────────────────────
  const total = Math.round(
    hargaScore   * 0.30 +
    fasilitasScore * 0.25 +
    lokasiScore  * 0.20 +
    keamananScore * 0.15 +
    ratingScore  * 0.10,
  );

  const grade =
    total >= 90 ? "A+" :
    total >= 80 ? "A"  :
    total >= 70 ? "B+" :
    total >= 60 ? "B"  :
    total >= 50 ? "C"  : "D";

  res.json({
    total,
    grade,
    factors: {
      harga:     { score: hargaScore,    weight: 0.30, label: "Harga",          explanation: hargaExplanation    },
      fasilitas: { score: fasilitasScore, weight: 0.25, label: "Fasilitas",      explanation: fasilitasExplanation },
      lokasi:    { score: lokasiScore,   weight: 0.20, label: "Lokasi",          explanation: lokasiExplanation   },
      keamanan:  { score: keamananScore, weight: 0.15, label: "Keamanan",        explanation: keamananExplanation  },
      rating:    { score: ratingScore,   weight: 0.10, label: "Rating Penghuni", explanation: ratingExplanation   },
    },
    cityContext: {
      campusName: nearestCampus.nama,
      peerCount:  peers.length,
      avgHarga:   Math.round(avgHarga),
    },
  });
});

// ─── GET /kos/:id ─────────────────────────────────────────────────────────────
router.get("/kos/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetKosParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { id } = params.data;

  // Fetch kos with fasilitas + aggregated rating
  const kosQuery = `
    ${BASE_KOS_SELECT}
    WHERE k.id = $1
    ${GROUP_BY}
  `;
  const kosResult = await pool.query(kosQuery, [id]);
  if (kosResult.rows.length === 0) {
    res.status(404).json({ error: "Kos tidak ditemukan" });
    return;
  }

  // Fetch reviews separately
  const reviewsQuery = `
    SELECT
      id,
      kos_id    AS "kosId",
      user_id   AS "userId",
      rating,
      komentar,
      foto,
      tanggal::text AS tanggal,
      created_at::text AS "createdAt"
    FROM reviews
    WHERE kos_id = $1
    ORDER BY created_at DESC
  `;
  const reviewsResult = await pool.query(reviewsQuery, [id]);

  const kos = { ...kosResult.rows[0], reviews: reviewsResult.rows };
  res.json(GetKosResponse.parse(kos));
});

export default router;
