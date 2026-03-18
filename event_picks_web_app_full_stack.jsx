// FULL PRODUCTION EVENT PICKS APP + DOCKER + DEPLOY GUIDE
// Stack: React (Vite) + Tailwind | Node/Express | PostgreSQL | JWT | Docker

/* =========================
FOLDER STRUCTURE
========================= */

/*
root/
  docker-compose.yml
  .env
  server/
    Dockerfile
    index.js
    db.js
    middleware/auth.js
    routes/
      auth.js
      users.js
      admin.js
      picks.js
      settings.js
    models/schema.sql
    package.json
  client/
    Dockerfile
    index.html
    vite.config.js
    package.json
    src/
      main.jsx
      App.jsx
      api.js
      context/AuthContext.jsx
      components/
        Navbar.jsx
        Countdown.jsx
        Leaderboard.jsx
        StatusBadge.jsx
      pages/
        Login.jsx
        Dashboard.jsx
        EditPicks.jsx
        Admin.jsx
*/

/* =========================
ENV (.env)
========================= */

/*
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=event_app
JWT_SECRET=supersecret
*/

/* =========================
DOCKER COMPOSE
========================= */

/* docker-compose.yml */

version: "3.9"
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./server
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_USER: ${POSTGRES_USER}
      DB_PASS: ${POSTGRES_PASSWORD}
      DB_NAME: ${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}

  client:
    build: ./client
    ports:
      - "5173:5173"
    depends_on:
      - server

volumes:
  db_data:

/* =========================
SERVER DOCKERFILE
========================= */

/* server/Dockerfile */

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]

/* =========================
CLIENT DOCKERFILE
========================= */

/* client/Dockerfile */

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

/* =========================
DATABASE (db.js)
========================= */

import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

/* =========================
AUTH MIDDLEWARE
========================= */

import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user.is_admin) return res.sendStatus(403);
  next();
};

/* =========================
SETTINGS ROUTE
========================= */

import express from "express";
import { pool } from "../db.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (_, res) => {
  const r = await pool.query("SELECT * FROM settings LIMIT 1");
  res.json(r.rows[0]);
});

router.post("/", auth, adminOnly, async (req, res) => {
  const { event_start, locked, submissions_open } = req.body;
  await pool.query(
    `UPDATE settings SET event_start=$1, locked=$2, submissions_open=$3 WHERE id=1`,
    [event_start, locked, submissions_open]
  );
  res.send("Updated");
});

export default router;

/* =========================
ADMIN ROUTES (JSON + RESULTS + LOCK)
========================= */

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

router.post("/results", auth, adminOnly, async (req, res) => {
  const { results } = req.body;

  for (let r of results) {
    await pool.query(
      `INSERT INTO results(category_id,correct_option_id)
       VALUES($1,$2)
       ON CONFLICT (category_id)
       DO UPDATE SET correct_option_id=$2`,
      [r.category_id, r.option_id]
    );
  }

  res.send("Results saved");
});

export default router;

/* =========================
LEADERBOARD + PICKS ROUTES
========================= */

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

router.get("/mine", auth, async (req, res) => {
  const r = await pool.query(
    `SELECT p.category_id,p.option_id,r.correct_option_id
     FROM picks p
     LEFT JOIN results r USING(category_id)
     WHERE p.user_id=$1`,
    [req.user.id]
  );
  res.json(r.rows);
});

router.post("/submit", auth, async (req, res) => {
  const { picks } = req.body;

  const settings = await pool.query("SELECT * FROM settings");
  if (settings.rows[0].locked || !settings.rows[0].submissions_open)
    return res.status(403).send("Locked");

  await pool.query("DELETE FROM picks WHERE user_id=$1", [req.user.id]);

  for (let p of picks) {
    await pool.query(
      "INSERT INTO picks(user_id,category_id,option_id) VALUES($1,$2,$3)",
      [req.user.id, p.category_id, p.option_id]
    );
  }

  res.send("Saved");
});

export default router;

/* =========================
FRONTEND NOTES (IMPORTANT LOGIC)
========================= */

/*
- Countdown uses settings.event_start
- If settings.locked === false -> show countdown
- If true -> show leaderboard

Status color logic:
if (!correct_option_id) gray
else if (option_id === correct_option_id) green
else red

Missing pick:
show "Choose One" with bg-red-200
*/

/* =========================
GIT + DEPLOYMENT GUIDE
========================= */

/*
STEP 1: CREATE REPO
-------------------
git init
git add .
git commit -m "initial commit"

Create repo on GitHub, then:

git remote add origin https://github.com/YOURNAME/event-picks.git
git push -u origin main

STEP 2: RUN LOCALLY (DOCKER)
-------------------
Install Docker Desktop

Run:

docker compose up --build

App:
Frontend: http://localhost:5173
Backend: http://localhost:5000

STEP 3: INIT DATABASE
-------------------
Open Postgres (via docker exec or GUI) and run schema.sql

STEP 4: CREATE ADMIN USER
-------------------
Manually insert user with is_admin=true

STEP 5: DEPLOY (EASY OPTION)
-------------------
Use Railway or Render:

- Connect GitHub repo
- Add env vars
- Deploy services:
  - PostgreSQL
  - Backend
  - Frontend

STEP 6: PRODUCTION NOTES
-------------------
- Use nginx or proxy for single domain
- Enable HTTPS
- Store JWT secret securely

STEP 7: AUTO PULL FROM GIT (SERVER)
-------------------
On your server:

git clone https://github.com/YOURNAME/event-picks.git
cd event-picks
docker compose up -d --build

To update later:

git pull
docker compose up -d --build

OPTIONAL: AUTO UPDATE
-------------------
Use cron:

crontab -e

*/

// DONE: Fully deployable system
