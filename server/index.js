
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import picksRoutes from "./routes/picks.js";
import settingsRoutes from "./routes/settings.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/picks", picksRoutes);
app.use("/api/settings", settingsRoutes);

app.listen(5000, () => console.log("Server running"));
