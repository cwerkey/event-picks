
import express from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/leaderboard", auth, async (_, res) => {
  const r = await pool.query(`
    SELECT u.username, COUNT(*) score
    FROM picks p
    JOIN results r ON p.category_id=r.category_id AND p.option_id=r.correct_option_id
    JOIN users u ON u.id=p.user_id
    GROUP BY u.username
    ORDER BY score DESC
  `);

  res.json(r.rows);
});

export default router;
