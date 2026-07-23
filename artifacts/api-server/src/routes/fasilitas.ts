import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { ListFasilitasResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/fasilitas", async (_req, res): Promise<void> => {
  const result = await pool.query(
    `SELECT id, nama, icon FROM fasilitas ORDER BY id ASC`
  );
  res.json(ListFasilitasResponse.parse(result.rows));
});

export default router;
