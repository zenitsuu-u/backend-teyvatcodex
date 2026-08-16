import express from "express";
import multer from "multer";
import path from "path";

import { auth } from "../../middleware/auth.js";
import { isAdmin } from "../../middleware/isAdmin.js";

import {
  createBuild,
  updateBuild,
  deleteBuild,
  getBuild,
  getAllBuilds
} from "../../controllers/admin/builds.controller.js";

const router = express.Router();

const uploadPath = "src/uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Admin Builds
 *   description: Gestion des builds (admin)
 */

/**
 * @swagger
 * /admin/builds:
 *   get:
 *     summary: Récupère tous les builds
 *     tags: [Admin Builds]
 *   post:
 *     summary: Crée un build
 *     tags: [Admin Builds]
 */

/**
 * @swagger
 * /admin/builds/{id}:
 *   get:
 *     summary: Récupère un build par ID
 *     tags: [Admin Builds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *   put:
 *     summary: Met à jour un build
 *     tags: [Admin Builds]
 *   delete:
 *     summary: Supprime un build
 *     tags: [Admin Builds]
 */

router.get("/", auth, isAdmin, getAllBuilds);

router.get("/:id", auth, isAdmin, getBuild);

router.post("/", auth, isAdmin, upload.single("image"), createBuild);

router.put("/:id", auth, isAdmin, upload.single("image"), updateBuild);

router.delete("/:id", auth, isAdmin, deleteBuild);

router.get("/public/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM builds WHERE character_slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Build introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getBuildBySlug:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;