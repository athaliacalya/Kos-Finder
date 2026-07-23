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
