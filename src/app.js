import express from "express";
import cors from "cors";
import characterRoutes from "./routes/characters.js";
import authRoutes from "./routes/auth.js";
import weaponsRouter from "./routes/weapons.js";
import weaponDetailsRouter from "./routes/weaponDetails.js";
import dotenv from "dotenv";
import favoritesRoutes from "./routes/favorites.js";
import adminCharacterRoutes from "./routes/admin/characters.routes.js";
import adminWeaponRoutes from "./routes/admin/weapons.routes.js";
import adminUploadRoutes from "./routes/admin/uploads.routes.js";
import adminStatsRoutes from "./routes/admin/stats.routes.js";
import buildsRoutes from "./routes/admin/builds.routes.js";
import { swaggerSpec, swaggerUiMiddleware } from "./swagger.js";
import publicBuildRoutes from "./routes/public/builds.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/characters", characterRoutes);
app.use("/weapons", weaponsRouter);
app.use("/weapon", weaponDetailsRouter);
app.use("/auth", authRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/builds", publicBuildRoutes);
app.use("/admin/characters", adminCharacterRoutes);
app.use("/admin/weapons", adminWeaponRoutes);
app.use("/admin/uploads", adminUploadRoutes);
app.use("/admin/stats", adminStatsRoutes);
app.use("/admin/builds", buildsRoutes)
app.use("/docs", swaggerUiMiddleware.serve, swaggerUiMiddleware.setup(swaggerSpec));

export default app;
