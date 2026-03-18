
import express from "express";
import { pool } from "../db.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/upload-json", auth, adminOnly, async (req, res) => {
  const { categories } = req.body;

  await pool.query("TRUNCATE options, categories CASCADE");

  for (let cat of categories) {
    const c = await pool.query(
      "INSERT INTO categories(name) VALUES($1) RETURNING id",
      [cat.name]
    );

    for (let opt of cat.options) {
      await pool.query(
        "INSERT INTO options(category_id,name) VALUES($1,$2)",
        [c.rows[0].id, opt]
      );
    }
  }

  res.send("Reset complete");
});

export default router;
