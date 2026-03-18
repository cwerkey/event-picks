
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (_, res) => {
  const r = await pool.query("SELECT * FROM settings LIMIT 1");
  res.json(r.rows[0]);
});

export default router;
