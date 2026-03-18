
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );

  if (!user.rows.length) return res.status(400).send("No user");

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(400).send("Bad password");

  const token = jwt.sign(user.rows[0], process.env.JWT_SECRET);
  res.json({ token, user: user.rows[0] });
});

export default router;
